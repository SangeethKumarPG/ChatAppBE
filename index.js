const express = require('express');
const app=express();
const cors = require('cors');
const socketio = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketio(server,{
    cors:{
        origin:'*',
        methods:['GET','POST'],
        allowedHeaders:['Content-Type','Authorization'],
        credentials:true
    }
});

require('dotenv').config();
require('./DB/connection');

const routes = require('./router/routes');
app.use(express.json());
app.use(cors());
app.use(routes);

require('./socket')(io);


const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// })
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.get('/',(req,res)=>{
    res.send("Welcome to chat app API");
})