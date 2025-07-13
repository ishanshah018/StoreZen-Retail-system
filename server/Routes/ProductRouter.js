const ensureAuthenticated = require("../Middlewares/Auth");


const router=require("express").Router();


router.get('/',ensureAuthenticated,(req,res)=>{
    console.log("---logged in user detail ",req.user)
    res.status(200).json([
        {
        name:"Mobile",
        price:10000
    },
    {
        name:"TV",
        price:20000
    },
    {
        name:"AC",
        price:33000
    },
])
});

module.exports=router;