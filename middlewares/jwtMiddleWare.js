const jwt = require('jsonwebtoken');

const jwtMiddleWare = (req,res,next)=>{
    console.log("Inside jwt middleware");
    if(!req.headers['authorization']){
        res.status(401).json("authentication failed please login again");
    }
    const token = req.headers['authorization'].split(' ')[1];
    try{
        const jwtResponse = jwt.verify(token,process.env.JWT_SECRET);
        console.log(jwtResponse);
        req.payload = jwtResponse.userId;
        next();
    }catch(err){
        console.log(err);
        res.status(401).json("authentication failed please login again");
    }
}

module.exports = jwtMiddleWare;