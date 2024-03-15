const User = require("../models/User")

const sendFriendReqPost = async (req, res) => {
    try {
        const { from, fUsername, fFriTag } = req.body;

        const user = await User.findOne({
            username: fUsername,
            friCode: fFriTag,
            _id: { $ne: from },
        });

        const fromUser = await User.findById(from)

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.friends.includes(from)) {
            return res.status(400).json({ message: "User is already a friend" });
        }

        const existingRequest = user.notifications.find(notification => 
            notification.from.toString() === from && notification.typeOf === "fReq"
        );

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        user.notifications.push({ typeOf: "fReq", from });
        const io = require("../sockets/socketManager").getIo()
        io.to(String(user._id)).emit("notification", { typeOf: "fReq", from: {username: fromUser.username, _id: from}, time: new Date() });
        await user.save();

        return res.status(200).json({ message: "Friend request sent" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const handleFriendReqPost = async (req, res) => {
    try {

        const { uId1, uId2, accepted } = req.body;
        let user1 = await User.findById(uId1);
        if (accepted) {
            user1.friends.push(uId2); 
            user1.notifications = user1.notifications.filter(
                notification => String(notification.from) != String(uId2)
            )
            await user1.save();

            const user2 = await User.findById(uId2);
            user2.friends.push(uId1);            
            await user2.save();

            const io = require("../sockets/socketManager").getIo()
            const onlineUsers = require("../sockets/socketManager").onlineUsers

            const user1Friends = await User.findById(uId1).populate('friends', 'friCode username isOnline');
            const user2Friends = await User.findById(uId2).populate('friends', 'friCode username isOnline');
            
            const user1FriendsWO = []
            const user2FriendsWO = []

            user1Friends.friends.forEach((friend) => {
                user1FriendsWO.push({...friend._doc, isOnline: onlineUsers.has(String(friend._doc._id)) ? 1 : 0})
            })

            user2Friends.friends.forEach((friend) => {
                user2FriendsWO.push({...friend._doc, isOnline: onlineUsers.has(String(friend._doc._id)) ? 1 : 0})
            })

            io.to(uId1).emit("friendsUpdate", { friends: user1FriendsWO });
            io.to(uId2).emit("friendsUpdate", { friends: user2FriendsWO });
        } 

        return res.sendStatus(200)

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" });
    }
};


const removeFriendDelete = async (req, res) => {
    try {
        const { uId1, uId2 } = req.body;
        const user1 = await User.findById(uId1);
        const user2 = await User.findById(uId2);

        user1.friends = user1.friends.filter(friend => String(friend._id) !== String(uId2));
        user2.friends = user2.friends.filter(friend => String(friend._id) !== String(uId1));

        await user2.save();
        await user1.save();
        const io = require("../sockets/socketManager").getIo()
        const user1Friends = await User.findById(uId1).populate('friends', 'friCode username isOnline');
        io.to(uId1).emit("friendsUpdate", { friends: user1Friends.friends });
        return res.status(200).json({ message: "Friend deleted"})

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    sendFriendReqPost,
    handleFriendReqPost,
    removeFriendDelete,
}