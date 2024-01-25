/**
 * import modules
 */
var data = 123
var app = require('express')()
const cors = require('cors')
var http = require('http').createServer(app)
var io = require('socket.io')(http)
const STATIC_CHANNELS = [
  {
    name: 'Hip Hop',
    participants: 0,
    id: 101,
    sockets: [],
  },
  {
    name: 'EDM',
    participants: 0,
    id: 102,
    sockets: [],
  },
]
/**
 * app config
 */
const PORT = process.env.PORT || 8000

/**
 * middleware
 */
app.use(cors())

io.on('connection', (socket) => {
  /* socket object may be used to send specific messages to the new connected client */
  console.log('new client connected')
  socket.emit('connection', null)

  socket.on('join-room', (room) => {
    console.log('joined a room', room)
    socket.join(room)
    STATIC_CHANNELS.forEach((c) => {
      if (c.id === room) {
        if (c.sockets.indexOf(socket.id) == -1) {
          c.sockets.push(socket.id)
          c.participants++
          io.emit('channel', c)
        }
      } else {
        let index = c.sockets.indexOf(socket.id)
        if (index != -1) {
          c.sockets.splice(index, 1)
          c.participants--
          io.emit('channel', c)
        }
      }
    })
  })

  socket.on('leave-room', (room) => {
    console.log('leave a room', room)
    socket.leave(room)
    STATIC_CHANNELS.forEach((c) => {
      if (c.id === room) {
        let index = c.sockets.indexOf(socket.id)
        c.sockets.splice(index, 1)
        c.participants--
        io.emit('channel', c)
      }
    })
  })

  socket.on('voting', ({ room, votingData }) => {
    socket.to(room).emit('voting', {
      votingData,
    })
  })

  socket.on('channel-join', (id) => {
    console.log('channel join', id)
    STATIC_CHANNELS.forEach((c) => {
      if (c.id === id) {
        if (c.sockets.indexOf(socket.id) == -1) {
          c.sockets.push(socket.id)
          c.participants++
          io.emit('channel', c)
        }
      } else {
        let index = c.sockets.indexOf(socket.id)
        if (index != -1) {
          c.sockets.splice(index, 1)
          c.participants--
          io.emit('channel', c)
        }
      }
    })

    return id
  })

  socket.on('disconnect', () => {
    STATIC_CHANNELS.forEach((c) => {
      let index = c.sockets.indexOf(socket.id)
      if (index != -1) {
        c.sockets.splice(index, 1)
        c.participants--
        io.emit('channel', c)
      }
    })
  })
})

app.get('/', (req, res) => {
  res.send('Welcome to musicmood server !!!! ')
})

app.get('/getChannels', (req, res) => {
  res.json({
    channels: STATIC_CHANNELS,
  })
})

/**
 * listen to port
 */
http.listen(PORT, () => {
  console.log(`info: Our app is running on port ${PORT}`)
})
