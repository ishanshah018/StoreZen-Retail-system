const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");
const SmartCoinsController = require('./SmartCoinsController');


const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409)
                .json({ message: 'User is already exist, you can login', success: false });
        }
        const userModel = new UserModel({ 
            name, 
            email, 
            password,
            smartCoins: {
                balance: 50, // Welcome bonus
                transactions: [{
                    amount: 50,
                    type: 'earned',
                    description: 'Welcome Bonus - New User Reward',
                    earnedDate: new Date(),
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                }]
            }
        });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();

        res.status(201)
            .json({
                message: "Signup successfully",
                success: true
            })
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server errror",
                success: false
            })
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        
        if (!user) {
            return res.status(404)
                .json({ 
                    message: 'User does not exist. Please sign up first.', 
                    success: false,
                    redirect: 'signup'
                });
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(401)
                .json({ 
                    message: 'Incorrect password. Please try again.', 
                    success: false 
                });
        }
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.status(200)
            .json({
                message: "Login Success",
                success: true,
                jwtToken,
                email,
                name: user.name,
                userId: user._id
            })
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server errror",
                success: false
            })
    }
}

module.exports = {
    signup,
    login
}