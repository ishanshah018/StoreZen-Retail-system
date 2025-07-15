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
    }
}, {
    versionKey: false // This removes the __v field
});

const UserModel=mongoose.model('users',UserSchema);
module.exports=UserModel