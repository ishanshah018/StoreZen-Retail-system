const mongoose=require("mongoose")
const Schema=mongoose.Schema;

const UserSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    address:{
        street: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        },
        state: {
            type: String,
            default: ''
        },
        pincode: {
            type: String,
            default: ''
        }
    },
    contactNumber: {
        type: String,
        default: ''
    },
    notificationPreferences:{
        promotions: {
            type: Boolean,
            default: false
        }
    },
    // Smart Coins System
    smartCoins: {
        balance: {
            type: Number,
            default: 0
        },
        transactions: [{
            amount: {
                type: Number,
                required: true
            },
            type: {
                type: String,
                enum: ['earned', 'spent', 'expired'],
                required: true
            },
            description: {
                type: String,
                required: true
            },
            earnedDate: {
                type: Date,
                default: Date.now
            },
            expiryDate: {
                type: Date,
                required: function() {
                    return this.type === 'earned';
                }
            },
            isExpired: {
                type: Boolean,
                default: false
            }
        }]
    }
}, {
    versionKey: false // This removes the __v field
});

const UserModel=mongoose.model('users',UserSchema);
module.exports=UserModel