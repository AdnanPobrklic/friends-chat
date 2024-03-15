const sharedsession = require("express-socket.io-session");
const Message = require("../models/Message");
const User = require("../models/User");
const userRoom = new Map();
const onlineUsers = new Set()
let io;
let timeoutId
function initializeSocket(server, sessionMiddleware) {
    
    io = require('socket.io')(server, {
        cors: {
            origin: process.env.FRONTEND_DOMAIN,
            credentials: true
        }
    });

    io.use(sharedsession(sessionMiddleware, {
        autoSave: true
    }));

    io.use(function(socket, next) {
        const res = {};
        socket.handshake.url = '/';
        sessionMiddleware(socket.handshake, res, function(user){
            socket.session = socket.handshake.session;
            socket.session.id = socket.handshake.sessionID;
            next();
        });
    });
    
    io.on("connection", socket => {

        socket.on('ReloadSession', function(data){
            socket.session.reload(function(err){socket.session.user = data.user});
        });
        
        socket.on("onlineSetter", async data => {
            clearTimeout(timeoutId);
            onlineUsers.add(data.id)
            const user = await User.findById(data.id)
            user.isOnline = 1;
            await user.save()
            socket.join(data.id)
            const onlineFriends = data.friends
            .filter(friend => onlineUsers.has(friend._id))
            .map(friend => friend._id);
            data.friends.forEach(friend => {
                io.to(friend._id).emit("friendCN", {id: data.id});
            })
        })

        socket.on('joinChatRoom', async data => {
            socket.join(getRoomName(data.id1, data.id2));
            userRoom.set(data.id1, getRoomName(data.id1, data.id2));
            const unreadMessages = await Message.find({receiver: data.id1, isSeen: 0})
            unreadMessages.forEach(message => {
                message.isSeen = 1
                message.save()
            })
            socket.on("disconnect", () => {
                if(socket.session.user._id) userRoom.delete(socket.session.user._id)
            })
            io.to(getRoomName(data.id1, data.id2)).emit("userJoin", {id: data.id1});
        });

        socket.on("sedMessage", data => {
            const isSeen = userRoom.get(data.receiver) === getRoomName(data.sender, data.receiver) ? 1 : 0;
            const messageObject = { sender: data.sender, receiver: data.receiver, username: data.username, content: data.content, isSeen, time: data.time };
            const message = new Message(messageObject);
            message.save();
            io.to(getRoomName(data.sender, data.receiver)).emit("receiveMessage", messageObject);
            if(onlineUsers.has(data.receiver) && !isSeen) io.to(data.receiver).emit("messageNotification", {id: data.sender});
        });

        socket.on("disconnect", async () => {
            if(socket.session.user){
                timeoutId = setTimeout(async () => {
                    onlineUsers.delete(socket.session.user._id);
                    socket.session.user.friends.forEach(friend => {
                        io.to(friend._id).emit("friendDC", {id: socket.session.user._id});
                    })
                    const user = await User.findById(socket.session.user._id)
                    user.isOnline = 0;
                    await user.save()
                }, 15000); 
                userRoom.delete(socket.session.user._id)
            }
        })
    });
}

const getRoomName = (id1, id2) => {
    let arr = [id1, id2];
    arr = arr.sort();
    return `${arr[0]}-${arr[1]}`;
}

module.exports = {
    initializeSocket,
    getIo: () => io,
    onlineUsers
};
