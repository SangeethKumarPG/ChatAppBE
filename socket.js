const jwt = require('jsonwebtoken');
const user = require('./models/usersSchema');
const messages = require('./models/messageSchema');
let activeSockets = {};
module.exports = (io)=>{
    io.use((socket, next)=>{
        // console.log("Socket connection started");
        const token = socket.handshake.query.token;
        if(!token){
            // console.log("Token not present");
            return next(new Error('Authentication error'));
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
            if(err){
                console.log("Error in token verification",err);
                return next(new Error('Authentication error'));
            }

            socket.user = decoded.userId;
            // console.log("token verified", socket.user);
            next();
        })
    });
    io.on('connection',async (socket)=>{
        // console.log("Socket object ", socket)
        // console.log(`User ${socket.user} connected`);
        activeSockets[socket.user] = socket.id;
        // console.log("Active sockets:", activeSockets);
        try{
            const users = await user.find();
            const activeUsers = users.filter(user=>user.status === true);
            io.emit('activeUsers', activeUsers);
        }catch(err){
            console.log("Error in fetching active users",err);
        }
        socket.on('startChat', async (targetUserId)=>{
            try{
                // console.log("Starting chat with user", targetUserId);
                // console.log("Socket user ", socket.user);
                const previousMessages = await messages.find({
                    $or:[
                        {sender:socket.user, receiver:targetUserId},
                        {sender:targetUserId, receiver:socket.user}
                    ]
                }).sort({timestamp:1});
                // console.log("Previous messages", previousMessages);
                io.to(socket.id).emit('messages',previousMessages);
                io.to(activeSockets[targetUserId]).emit('messages',previousMessages);
            }catch(err){
                console.log("Error in starting chat",err);
 
            }
        })

        socket.on('sendMessage',async (messageData)=>{
            try{
                const {receiverId, message} = messageData;
                const username = await user.findById(socket.user).select('username');
                const newMessage = new messages({
                    sender:socket.user,
                    message:message,
                    timestamp: new Date(),
                    receiver:receiverId
                })
                await newMessage.save();
                const targetId = activeSockets[receiverId];
                // console.log("Target Id:", targetId)
                if(targetId){
                    io.to(targetId).emit('newMessage', newMessage);
                    // console.log(`Message sent to ${receiverId}`);
                    io.to(socket.id).emit('newMessage', newMessage);
                }
                
            }catch(err){
                console.log("Error in sending message",err);
            }
            
        });

        socket.on('disconnect', () => {
            console.log(`User ${socket.user.username} disconnected`);
        });

    })

}