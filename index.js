const rpio = require('rpio')
rpio.init({'mapping': 'gpio'})
const cols = 16
const rows = 2
const registerSelect = 2
const enable = 3
const datas = [4, 5, 6, 7]
const modes = {
  'COMMAND': rpio.LOW,
  'DATA': rpio.HIGH
}
const bin2hex = (str) => {
  return Number.parseInt(str, 2)
}
const commands = {
  'CLEAR': bin2hex('00000001'),
  'DISPLAYON': bin2hex('00001100'),
  'MULTILINE': bin2hex('00101000'),
  'CURSORPOS': bin2hex('10000000')
}
// Always assume 40 chars in a buffer line.
const rowOffset = 40

class LCD {
  constructor(config) {
    config = config || {}
    this.enable = config['enable'] || enable
    this.registerSelect = config['registerSelect'] || registerSelect
    this.datas = config['datas'] || datas
    this.cols = config['cols'] || cols
    this.rows = config['rows'] || rows
  }
  open() {
    for (const pin of [this.enable, this.registerSelect, ...this.datas]) {
      rpio.open(pin, rpio.OUTPUT, rpio.LOW)
    }
    // Sequence and delay matter!
    this._init()
    if (this.rows > 1) {
      this._command(commands['MULTILINE'])
    }
    this._command(commands['DISPLAYON'])
    this.clear()
  }
  close() {
    for (const pin of [this.enable, this.registerSelect, ...this.datas]) {
      rpio.close(pin)
    }
  }
  _init() {
    this._write(bin2hex('0011'))
    rpio.msleep(5)
    this._write(bin2hex('0011'))
    rpio.usleep(200)
    this._write(bin2hex('0011'))
    rpio.usleep(200)
    this._write(bin2hex('0010'))
    rpio.usleep(200)
  }
  _select(value) {
    rpio.write(this.registerSelect, value)
  }
  _write(value) {
    for (let i = 0; i < this.datas.length; ++i) {
      rpio.write(this.datas[i], (value >> i) & 1 ? rpio.HIGH : rpio.LOW)
    }
    rpio.write(this.enable, rpio.HIGH)
    rpio.usleep(2)
    rpio.write(this.enable, rpio.LOW)
  }
  _send(value, mode) {
    if (typeof value !== 'number' || value > 0xFF) {
      throw new TypeError('Needs a number that lower than 0xFF!')
    }
    if (modes[mode] == null) {
      throw new TypeError('Invalid mode!')
    }
    this._select(modes[mode])
    this._write(value >> 4)
    this._write(value)
  }
  _command(value) {
    this._send(value, 'COMMAND')
    rpio.usleep(40)
  }
  _data(value) {
    this._send(value, 'DATA')
    rpio.usleep(40)
  }
  clear() {
    this._command(commands['CLEAR'])
    rpio.msleep(2)
  }
  move(x, y) {
    y = Math.max(0, Math.min(this.rows, y))
    x = Math.max(0, Math.min(this.cols, x))
    this._command(commands['CURSORPOS'] + y * rowOffset + x)
  }
  putc(char) {
    this._data(char)
  }
  puts(str) {
    for (let i = 0; i < str.length; ++i) {
      this.putc(str.charCodeAt(i))
    }
  }
  display(array) {
    array = array.slice(0, this.rows).map((line) => {
      return line.toString().substring(0, this.cols)
    })
    this.clear()
    for (let i = 0; i < array.length; ++i) {
      this.move(0, i)
      this.puts(array[i])
    }
  }
}

module.exports = {
  'LCD': LCD
}

