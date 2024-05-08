// // // server.js
// // const express = require('express');
// // const app = express();

// // app.get("/api/data", (req, res) => {
// //     res.json({"users": ["userOne", "userTwo", "userThree"]});
// // });

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //     console.log(`Server started on port ${PORT}`);
// // });

// // // server.js
// // const express = require('express');
// // const app = express();

// // app.get("/api/data", (req, res) => {
// //     res.json({"users": ["userOne", "userTwo", "userThree"]});
// // });

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //     console.log(`Server started on port ${PORT}`);
// // });

// const express = require('express');
// const app = express();
// const http = require('http').createServer(app);

// const path = require('path');
// const io = require('socket.io')(http);
// app.use( express.static(path.join(__dirname, '/public')));

// const mongoose = require('mongoose');
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/chatApplication";
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("Mongodb connection achieved"))
//     .catch((err) => console.log(err));

// const MessageSchema = new mongoose.Schema({
//     author: String,
//     content: String,
//     image: String
// });

// const Message = mongoose.model('Message', MessageSchema);

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'chat.html'));
// });

// app.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });

// const connectedUsers = [];

// io.on('connection', (socket) => {
//     console.log("Connection achieved");

//     Message.find({})
//     .then((messages)=>
//     {
//         socket.emit("loaded messages",messages)
//     })

//     Message.distinct("author")
//     .then((authors) => {
//         socket.emit("all authors", authors);
//     })
//     .catch((err) => {
//         console.log("Error fetching authors:", err);
//     });

//     socket.on('username', (username) => {
//         console.log("The Logged in username " + username);
//         socket.username = username
//         io.emit("user joined",username)

//         io.emit("all users",connectedUsers)
//     });

//     socket.on('chat message',(msg)=>
//     {
//         const message = new Message({
//             author : msg.author,
//             content : msg.content,
//             image : msg.image
//         })
//         message
//         .save()
//         .then(()=>
//         {
//             io.emit("chat message",msg)
//         })
//         .catch((err)=>
//             console.log(err)
//         )
//     })

//     socket.on('success',(us)=>
//     {
//         if (us === "fail") {
//             socket.emit("login_failed");
//         } else {
//             socket.emit("login_success");
//         }
//     })

//     socket.on('disconnect',()=>
//     {
//         io.emit("user left",socket.username)
//     })
// });

// http.listen(5000, () => {
//     console.log("Server is running on 5000");
// });
const express = require('express');
const app = express();
const http = require('http').createServer(app);

const path = require('path');
const io = require('socket.io')(http);
app.use(express.static(path.join(__dirname, '/public')));

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/chatApplication";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Mongodb connection achieved"))
    .catch((err) => console.log(err));

const MessageSchema = new mongoose.Schema({
    author: String,
    content: String,
    image: String
});

const Message = mongoose.model('Message', MessageSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

 //Store all connected users
const connectedUsers = [];

io.on('connection', (socket) => {
    console.log("Connection achieved");

    Message.find({})
        .then((messages) => {
            socket.emit("loaded messages", messages);
        })
        .catch((err) => {
            console.log("Error fetching messages:", err);
        });

    Message.distinct("author")
        .then((authors) => {
            socket.emit("all authors", authors);
        })
        .catch((err) => {
            console.log("Error fetching authors:", err);
        });

    socket.on('username', (username) => {
        console.log("The Logged in username " + username);
        socket.username = username;
        if (!connectedUsers.includes(username)) {
            connectedUsers.push(username); // Add the new user's username to connectedUsers if not already present
            io.emit("user joined", username);
        }
        io.emit("all users", connectedUsers); // Emit updated list of connected users
    });

    socket.on('chat message', (msg) => {
        const message = new Message({
            author: msg.author,
            content: msg.content,
            image: msg.image
        });
        message.save()
            .then(() => {
                io.emit("chat message", msg);
            })
            .catch((err) => console.log(err));
    });

    socket.on('success', (us) => {
        if (us === "fail") {
            socket.emit("login_failed");
        } else {
            socket.emit("login_success");
        }
    });

    socket.on("call user", (author) => {
        // Broadcast the event to all connected clients
        socket.broadcast.emit("incoming call", author);
      });

    socket.on('disconnect', () => {
        io.emit("user left", socket.username);
        const index = connectedUsers.indexOf(socket.username);
        if (index !== -1) {
            connectedUsers.splice(index, 1); ////Remove the disconnected user's////
        }
        io.emit("all users", connectedUsers); /////Sends the final list of user////
    });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});