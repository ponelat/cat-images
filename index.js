const express = require('express')
const Jimp = require('jimp')
const fs = require('fs')
const path = require('path')
const PORT = process.env.NODE_PORT || 3000
const images = fs.readdirSync('./cat-images')
const fetch = require('node-fetch')

const getImageBuffer = (mime) => (image) => require('util').promisify(image.getBuffer.bind(image))(mime)
const fontProm = Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
const addMessageToImage = (msg, x=10, y=10) => (image) => fontProm.then(font => {
  return image.print(font, x, y, msg)
})

var serverDetails = '?'
fetch('http://ifconfig.io/host')
  .then(a => a.text())
  .then(ip => {
    serverDetails = ip
  }).catch(console.error)
const app = express()

app.get('/cat/:msg?', (req,res) => {
  const msg = req.params.msg || 'Meetup 05'
  const randomCatIndex = Math.floor(Math.random() * images.length)
  const randomCatImage = path.join(__dirname, './cat-images/' + images[randomCatIndex])
  Jimp.read(randomCatImage)
    .then(addMessageToImage(msg))
    .then(addMessageToImage(serverDetails, 10, 60))
    .then(getImageBuffer(Jimp.MIME_JPEG))
    .then( buf => {
      res.set('content-type', 'image/jpeg')
      res.send(buf)
    })
    .catch( err => {
      console.log("err", err)
      res.send(err+'')

    })
})

const server = app.listen(PORT, () => {
  const {address, port} = server.address()
  console.log(`Server listening on ${address}:${port}`)
})
