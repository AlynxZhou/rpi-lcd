const os = require('os')
const {LCD} = require('./index')

const getipv4s = (ifnames) => {
  const ifaces = os.networkInterfaces()
  return ips = ifnames.flatMap((ifname) => {
    return ifaces[ifname]
  }).filter((iface) => {
    return iface['family'] === 'IPv4'
  }).map((iface) => {
    return iface['address']
  })
}

const lcd = new LCD()
lcd.open()
process.on('SIGINT', () => {
  lcd.close()
  process.exit()
})
let index = 0
let buffer = []
setInterval(() => {
  const ips = getipv4s(process.argv.slice(2))
  if (ips.length > rows) {
    index = index % ips.length
    buffer.push(ips[index++])
    buffer = buffer.slice(-2)
  } else {
    buffer = ips
  }
  lcd.display(buffer)
}, 1000)
