import mongoose, { Types } from "mongoose";
export const gendertype=({
    male:"male",
    female:"female"
})
export const roles=({
    user:"user",
    admin:"admin",
    superadmin:"superadmin"
})
const user=new mongoose.Schema({

    name:{type:String,required:true,minlength:3,maxlength:20,trim:true},
    email:{type:String,required:true,unique:true},
    tempEmail:{type:String},
    oldOtp:String,
    newOtp:String,
    password:{type:String,required:true},
    confirmPassword:{type:String},
    phone:String,
    address:{type:String},
    DOB:{type:Date},
    image:{secure_url:String,public_id:String},
    cover:[{secure_url:String,public_id:String}],
    gender:{type:String,enum:Object.values(gendertype)},
    role:{type:String,enum:Object.values(roles),default:"user"},
confirmEmail:{type:Boolean,default:false},
confirmOTP:String,
isDeleted:{type:Boolean,default:false},
changeCredentialTime:{type:Date},
otpExpires: Date,

  
  resetRequests: { type: Number, default: 0 },
  resetRequestTime: Date,

 
  loginAttempts: { type: Number, default: 0 },
  banUntil: Date,
  viewers:[{
    userId:{type:Types.ObjectId,ref:"user"},
    name:{type:String,ref:"user"},
    time:{type:Date}
  }]

},{timestamps:true})
const  userModel=mongoose.model("user",user)
export default userModel
