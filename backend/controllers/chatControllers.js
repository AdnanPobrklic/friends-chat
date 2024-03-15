const Message = require("../models/Message")
const User = require("../models/User")
const mongoose = require('mongoose');

const chatGet = async (req, res) => {
    try{
        const {id1, id2} = req.query

        const objId1 = new mongoose.Types.ObjectId(id1);

        const messages = await Message.find({
            $or: [
                { sender: objId1, receiver: id2 },
                { sender: id2, receiver: objId1 }
            ],
            deletedFor: { $nin: [objId1] }
        });

        if(messages) return res.json({messages}).status(200)

    }catch(err){
        console.log(err)
        return res.status(500).json({message: "Internal server error"});    
    }
}


const unreadMessagesFromGet = async (req, res) => {
    try{
        const messages = await Message.find({receiver: req.session.user._id, isSeen: 0}).select("sender -_id").lean();
        if(messages.length < 1) return res.status(200).json({messagesUnread: []})
        const senderIds = messages.map(message => message.sender.toString());
        const messagesUnread = new Set(senderIds);
        return res.status(200).json({messagesUnread: Array.from(messagesUnread)})
    }catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" });
    }
}

const clearChatDelete = async (req, res) => {
    try{

        const {id1, id2} = req.query

        const messages = await Message.find({
            $or: [
                { sender: id1, receiver: id2 },
                { sender: id2, receiver: id1 }
            ]
        });

        messages.forEach(msg => {
            msg.deletedFor.push(id1)
            msg.save()
        })

        return res.sendStatus(200)

    }catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    chatGet,
    unreadMessagesFromGet,
    clearChatDelete,
}