const User = require("../models/User")
const Message = require("../models/Message")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require('uuid');


const signUpPost = async (req, res) => {
    try{
        const {email, username, password} = req.body

        const existingEmail = await User.findOne({email})
        if(existingEmail) return res.status(400).json({message: "email already exists"})

        const existingUsername = await User.findOne({username})
        if(existingUsername) return res.status(400).json({message: "username already exists"})

        if(password.length < 8) return res.status(400).json({message: "password must be at least 8 characters"})
        if(username.length > 10) return res.status(400).json({message: "username cant be more than 10 characters"})
        
        const salt = bcrypt.genSaltSync()
        const hashedPassword = bcrypt.hashSync(password, salt)

        const user = new User({email, username, password: hashedPassword, friCode: uuidv4().substring(0, 4)})
        await user.save()
        
        return res.status(200).json({message: "User created"})
    }catch(err){
        return res.status(500).json({message: "Internal server error"});    
    }
}

const logInPost = async (req, res) => {
    try{
        const {email, password} = req.body

        const user = await User.findOne({email}).populate("notifications.from friends", "username friCode isOnline");


        if(!user) return res.status(400).json({message: "Invalid credentials"})

        const matchingPassword = bcrypt.compareSync(password, user.password)
        if(!matchingPassword) return res.status(400).json({message: "Invalid credentials"})
        req.session.user = user;
        return res.status(200).json({message: "success"})
    }catch(err){
        return res.status(500).json({message: "Internal server error"});    
    }
}


const logOutPost = async (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return res.status(500).json({message: "Internal server error"});
        }
        return res.status(200).json({message: "ok"});
    });
}

const checkIfAuthenticated = async (req, res) => {
    if (req.session && req.session.user) {
        const user = await User.findById(req.session.user._id).populate("notifications.from friends", "username friCode isOnline");
        return res.status(200).json({user: user}); 
    } else {
        return res.status(401).json('Unauthorized'); 
    }
};

module.exports = {
    signUpPost,
    logInPost,
    checkIfAuthenticated,
    logOutPost
}