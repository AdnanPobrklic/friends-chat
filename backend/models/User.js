const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    friCode: {
        type: String,
        required: true
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    notifications: [{
        time: { 
            type: Date, 
            default: Date.now 
        },
        typeOf: {
            type: String,
            required: true
        },
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }],
    isOnline: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model("User", userSchema)
