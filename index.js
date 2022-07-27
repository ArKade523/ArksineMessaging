const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 80;
const mysql = require('mysql');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
let socket_sessions = [[], []];

let user = {
   name: '',
   id: 1
};
const login = require('./nodelogin/login')
const oneDay = 1000 * 60 * 60 * 24;

const connection = mysql.createConnection({
   host    : 'localhost',
   user    : 'root',
   password: '123',
   database: 'nodelogin'
});

const sessionMiddleware = session({
   secret: 'secret',
   resave: true,
   saveUninitialized: true,
   cookie: { maxAge: oneDay }
})

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

app.use(sessionMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)))

// This handles routing to the login page

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname + '/login.html'));
});

// app.get('*', (req, res) => {
//    res.sendFile(path.join(__dirname + '/login.html'))
// })

/*
This is the function that handles password authentication. It decrypts and compares the 
entered password to the password stored in the database.
*/

app.post('/auth', (req, res) => {login.auth(req, res, connection, user, bcrypt)})

/*
This is the registration code. Users are redirected here after using the 
registration page. It hashes the new password and stores the hash,
username, and email to the database. The database automatically gives 
the account a new sequential ID.
*/

app.post('/registration', (req, res) => {login.registration(req, res, connection, bcrypt)})

// This handles redirects to the home page. Checks whether the user is logged in

app.get('/home', (req, res) => {
   if(req.session.loggedin) {
      res.sendFile(path.join(__dirname + '/page.html'));
   } else {
      res.redirect('/');
   }
});

// This handles redirects to the registration page

app.get('/register', (req, res) => {login.register(req, res, path)})


/* ------------------------Websockets---------------------- */

io.use(wrap(sessionMiddleware))

// This is the first socket connection detection. It logs which user connected

io.on('connection', socket => {
   const socketID = socket.id;
   let username = 'Default User';
   let user_list = [[], []]
   connection.query('SELECT * FROM accounts', (error, results, field) => {
      for (let i = 0; i < results.length; i++) {
         user_list[0].push(results[i].id)
         user_list[1].push(results[i].username)
      }
   })

   if (user.id) {
      connection.query('SELECT username FROM accounts WHERE id = ?', 
         [user.id], (error, results, field) => {
            if (error) throw error;
            if (results[0]) {
               user.name = results[0].username;
               username = results[0].username;
               console.log(`${user.name} connected`)
               socket.emit('user connected', user);
            }
      })

      connection.query('SELECT * FROM messages WHERE conversation_id = ?',
         [1], (error, results, field) => {
            if (error) throw error;
            let conversation_messages = {
               text: [],
               user_id: [],
               username: []
            }
            for (let i = 0; i < results.length; i++) {
               conversation_messages.text.push(results[i].message);
               conversation_messages.user_id.push(results[i].user_id);
               for (let j = 0; j < user_list.length; j++) {
                  if (user_list[0][j] == results[i].user_id) {
                     conversation_messages.username.push(user_list[1][j]);
                  }
               }
            }

            io.to(socketID).emit('previous messages', conversation_messages);

         })
   } else {socket.emit('user connected', user)}


   socket.on('disconnect', () => {
      console.log(`${username} disconnected`);
   })
})

/* 
This is detecting when a message is sent.
It sends the contents of the message to everyone connected to the page other than 
the person who wrote it
*/

io.on('connection', socket => {
   socket.on('chat message', msg => {
      connection.query('SELECT username FROM accounts WHERE id = ?', 
      [msg.user.id], (error, results, field) => {
         if (error) throw error;
         username = results[0].username;
      })

      connection.query('INSERT INTO messages (message, conversation_id, user_id) VALUES (?, ?, ?)', 
      [msg.message, msg.conversation, msg.user.id], (error, results, field) => {
         if (error) throw error;
      })

      socket.broadcast.emit('chat message', msg);
      console.log(`${msg.user.name}: ${msg.message}`);
   })
})

/* ------------------------Server start---------------------- */

// This is kinda self explanatory

server.listen(port, () => {
   console.log(`listening on port *:${port}`);
})
