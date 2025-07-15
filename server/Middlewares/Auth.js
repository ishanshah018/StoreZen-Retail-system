const jwt = require("jsonwebtoken");            


const ensureAuthenticated=(req,res,next)=>{
    const auth=req.headers['authorization'];

    if(!auth)
    {
        return res.status(403).json({message:"Unauthorized, JWT Token is require"});
    }
    try{
        // Handle both "Bearer token" and "token" formats
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }
    catch(err)
    {
        return res.status(403).json({message:"Unauthorized, JWT Token wrong or expired"});
    }
}

module.exports=ensureAuthenticated;