const user = require('../models/usersSchema');
const jwt = require('jsonwebtoken');
exports.registerUser = async (req,res)=>{
    try{
        console.log("inside user register")
        const {username, password} = req.body;
        const isExistingUser = await user.findOne({username:username});
        if(isExistingUser){
            return res.status(404).json("User already exists")
        }
        const newUser = new user({
            username: username,
            password: password
        });
        await newUser.save();
        return res.status(201).json("User created successfully");
    }catch(err){
        console.log(err);
        return res.status(500).json("Internal Server Error");
    }
}

exports.loginUser = async(req,res)=>{
    try{
        console.log("inside user login")
        const { username, password } = req.body;
        const existingUser = await user.findOne({ username: username });
        if (!existingUser) {
          return res.status(404).json("user not found");
        }
        const isMatch = await existingUser.comparePassword(password);
        if (!isMatch) {
          return res.status(400).json("invalid password");
        }
        const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET);
        await user.updateOne({_id:existingUser._id}, {status:true})
        return res.status(200).json({ token:token, userId: existingUser._id });
    }catch(err){
        console.log(err);
        return res.status(500).json("Internal Server Error");
    }

}

exports.logoutUser = async(req, res)=>{
    try{
        const userId = req.payload;
        const currentUser = await user.findOne({_id:userId});
        if(!currentUser){
            return res.status(404).json("User not found");
        }
        await user.updateOne({_id:userId}, {status:false})
        return res.status(200).json("User logged out successfully");
    }catch(err){
        console.log(err);
        return res.status(500).json("Internal Server Error");
    }
}