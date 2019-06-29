RPi LCD
=======

This is a simple LCD1602 driver with HD44780 chip instructions, written in Node.js and based on `rpio`.
It works in 4-Pin mode and implements some basic command like init, clear, multiline, disable cursor and move cursor.
This driver just shows strings in an array on the LCD, and do not scroll them.
If you get strings that are more than LCD rows or string is longer than your LCD, this driver just cut them to fix the LCD.
And it works just like your computer screen: each time you call `display()`, it clears your LCD and redraw whole LCD.
So you can implements composition like scroll your self in a memory buffer and then pass it to `display()`.

# EXAMPLE

A file called `ip.js` can be found, you can give network interface names as arguments (use `ip address` to see what you have) and it will get their IPv4 address then display them.

# LICENSE

Apache-2.0
