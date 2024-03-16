const User = require("../models/User")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PW,
    }
});        

const updateUserInfoPatch = async (req, res) => {
    try{
        const {id, email, username, friCode, password} = req.body
        
        const user = await User.findById(id)

        user.email = email || user.email
        user.username = username || user.username
        user.friCode = friCode || user.friCode

        if(password){
            const salt = bcrypt.genSaltSync()
            const hashedPassword = bcrypt.hashSync(password, salt)
            user.password = hashedPassword
        }

        user.save()

        return res.json({message: "ok"}).status(200)

    }catch(err){
        return res.json({message: "internal server error"}).status(500)
    }
};

const resetPasswordPost = async (req, res) => {
    try {
        const {email} = req.body

        const user = await User.findOne({email})
        if(!user) return res.status(200).json({message: "No account with specified email found"})

        const newPwd = uuidv4().substring(0, 7)
        const salt = bcrypt.genSaltSync()
        const hashedNewPwd = bcrypt.hashSync(newPwd, salt)

        user.password = hashedNewPwd

        transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "friChat password reset",
            html: `<h2> 
                        Your new friChat password is ${newPwd}, if you want you can set a custom password once you log into your account.
                        If you did not send this request please ignore it.
                    </h2>`,
        }, async (error, info) => {
            console.log(info)
            if (error) {
                console.log(error)
                return res.status(500).json({message: "There was an error with our mail service provider, please try again later"})
            }
            await user.save()
            return res.status(200).json({message: "Password reset email sent"})
        });

    }catch(err){
        console.log(err)
        return res.json({message: "internal server error"}).status(500)
    }
}


module.exports = {
    updateUserInfoPatch,
    resetPasswordPost
}