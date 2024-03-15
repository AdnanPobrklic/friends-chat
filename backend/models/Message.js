const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    time: { 
        type: Date, 
        default: Date.now 
    },
    username: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isSeen: {
        type: Number,
        required: true
    },
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }]    
})

module.exports = mongoose.model("Message", messageSchema)
