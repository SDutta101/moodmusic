/**
 * import modules
 */
var app = require('express')();
const cors = require("cors");
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const STATIC_CHANNELS = [{
    name: 'Hip Hop',
    participants: 0,
    id: 1,
    sockets: []
}, {
    name: 'EDM',
    participants: 0,
    id: 2,
    sockets: []
}];
/**
 * app config
 */
const PORT = process.env.PORT || 8000;

/**
 * middleware
 */
app.use(cors());

io.on('connection', (socket) => { /* socket object may be used to send specific messages to the new connected client */
    console.log('new client connected');
    socket.emit('connection', null);
    socket.on('channel-join', id => {
        console.log('channel join', id);
        STATIC_CHANNELS.forEach(c => {
            if (c.id === id) {
                console.log(c)
                console.log(socket.id)
                if (c.sockets.indexOf(socket.id) == (-1)) {
                    c.sockets.push(socket.id);
                    c.participants++;
                    io.emit('channel', c);
                }
            } else {
                let index = c.sockets.indexOf(socket.id);
                if (index != (-1)) {
                    c.sockets.splice(index, 1);
                    c.participants--;
                    io.emit('channel', c);
                }
            }
        });
 
        return id;
    })

    socket.on('disconnect', () => {
        STATIC_CHANNELS.forEach(c => {
            let index = c.sockets.indexOf(socket.id);
            if (index != (-1)) {
                c.sockets.splice(index, 1);
                c.participants--;
                io.emit('channel', c);
            }
        });
    });
});

app.get("/", (req, res) => {
    res.send("Welcome to musicmood server !!!! ");
});

app.get('/getChannels', (req,res) => {
    res.json({
        channels: STATIC_CHANNELS
    })
})

/**
 * listen to port
 */
http.listen(PORT, () => {
    console.log(`info: Our app is running on port ${PORT}`);
});