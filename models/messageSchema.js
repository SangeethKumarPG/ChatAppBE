const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender:{ type:String, required:true },
    message: {type:String, required:true},
    timestamp: {type:Date, default:Date.now},
    receiver: {type:String, required:true}
})

const messages = mongoose.model('messages', messageSchema);
module.exports = messages;