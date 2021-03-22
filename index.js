const express = require('express');
const app = express();
const http = require("http").createServer(app)
const cors = require("cors")
const io = require("socket.io")(http, {
  cors: {
    origin: "https://nsitemschat.nyokosatouhsato.repl.co",
    methods: ["GET", "POST"]
  }
})
const he = require("he")
let users = {}
let typing = [];

app.use(express.static("./static"))

app.use(cors())

app.enable('trust proxy')

app.enable('case sensitive routing')

function validMsg(txt) {
  let boldText = /(\*\*?[^\*\*]+)/g;
	let urlRegex = /(https?:\/\/[^\s]+)/g;
	if (txt==""||txt.startsWith(" ")) {
		return "[Empty message]";
	} else {
		return he.decode(txt).replace(urlRegex, '<a href="$1">$1</a>').replace(boldText, '<b>$1</b>').replace(/(\*\*)/g, "");
	}
}

io.on("connection", socket => {
  let randNum = Math.round(Math.random() * 100000).toString()
  socket.on('user joined', msg => {
    // return;
    users[randNum] = he.encode(msg || "anonymous")
		typing[randNum] = false;
    io.emit('user joined', users[randNum] + " joined the NamItems discussion")
  })
  socket.on('update users', msg => {
    for (let [ key, value ] of Object.entries(users)) {
      io.emit('update users', value)
    }
  })
	socket.on('typing', user => {
		typing[randNum] = true;
		io.emit('typing', users[randNum])
	})
  socket.on('msg', msg => {
    // return;
		typing[randNum] = false;
    io.emit('msg', users[randNum] + ": " + validMsg(msg));
		console.log(msg)
  });
  socket.on('disconnect', reason => {
    io.emit('user left', users[randNum] + " left the NamItems discussion<br>Reason: " + reason);
    delete users[randNum]
    for (let [ key, value ] of Object.entries(users)) {
      io.emit('update users', value)
    }
  });
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html")
});

http.listen(process.env.PORT || 3000, () => {
  console.log('server started');
});