import userModel from "../../models/userModel.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid"; 
import { asyncHandler } from "../../utils/asyncHandler.js";
import {sendEmail}  from "../../Email/sendEmail.js";
import jwt from "jsonwebtoken";
import * as dbservice from "../../DB/db.service.js"
import { deleteCloud, uploadCloud } from "../../utils/cloudinary.js";
import postModel from "../../models/postModel.js";
import { paginate } from "../../utils/Pagination.js";
export const signup = asyncHandler(async (req, res, next) => { 
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new Error("All fields are required", { cause: 400 }));
  }

  const exist = await dbservice.findOne({model: userModel, filter: { email }});
  if (exist) {
    return next(new Error("Email already exists", { cause: 400 }));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = nanoid(6);

  const emailResponse = await sendEmail(email, "Verify Your Account", otp);
  if (!emailResponse.success) {
    return next(new Error("Failed to send verification email", { cause: 500 }));
  }

  const user = await dbservice.create({model: userModel, data: {
    name,
    email,
    password: hashedPassword,
    confirmOTP: otp,
    confirmEmail: false,
  }});

  return res.status(201).json({
    success: true,
    message: "User registered successfully. Please check your email to verify your account.",
    userId: user._id,
  });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;

  const user = await dbservice.findOne({model: userModel, filter: { email, confirmOTP: code }});
  console.log("User found:", user);
  if (!user) return res.status(404).json({ message: "User not found or invalid code" });

  if (user.confirmEmail) {
    return res.status(400).json({ message: "Email already verified" });
  }

  user.confirmEmail = true;
  user.confirmOTP = null;  
  await user.save();

  return res.json({ success: true, message: "Email verified successfully" });
});
///////////////////////Login/////////////////////////////
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if(!email || !password) return next(new Error("All fields are required", {cause:400}));
  const user = await dbservice.findOne({model: userModel, filter: {email}});
  if(!user) return next(new Error("User not found", {cause:400}));
  if(!user.confirmEmail) return next(new Error("Please verify your email", {cause:400}));
    if (user.banUntil && user.banUntil > Date.now()) {
    return next(new Error("You are banned for 5 minutes due to many failed attempts", { cause: 403 }));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.banUntil = Date.now() + 5 * 60 * 1000; // ban 5 minutes
      user.loginAttempts = 0;
    }
    await user.save();
    return next(new Error("Invalid credentials", { cause: 400 }));
  }

  user.loginAttempts = 0;
  user.banUntil = null;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "4d" });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  return res.status(200).json({ success: true, token, refreshToken });
});

////////////////Refrest Token////////////////
export const refreshToken = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(new Error("No token provided", { cause: 400 }));
  }

  const [bearer, token] = authorization.split(" ");

  if (bearer.toLowerCase() !== "bearer" || !token) {
    return next(new Error("Invalid token format", { cause: 400 }));
  }

  let decoded;
 
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  if (!decoded) {
          return next(new Error("Invalid or expired refresh token", { cause: 401 }));

  }

  if (decoded.exp < Date.now() / 1000) {
    return next(new Error("Token expired", { cause: 401 }));
  }

  const user = await dbservice.findById({model:userModel,id:decoded.id});
  if (!user) return next(new Error("User not found", { cause: 404 }));

  const newAccessToken = jwt.sign(
    { id: user._id,role:user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const newRefreshToken = jwt.sign(
    { id: user._id ,role:user.role},
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

export const forgetpassword=asyncHandler(async(req,res,next)=>{
    const {email}=req.body;
    if(!email) return next(new Error("All fields are required", {cause:400}));
    const user=await dbservice.findOne({model:userModel,filter:{email}});
    if(!user) return next(new Error("User not found", {cause:400}));
    if(!user.confirmEmail) return next(new Error("Please verify your email", {cause:400}));
      if (user.resetRequests >= 5 && user.resetRequestTime > Date.now() - 60 * 60 * 1000) {
    return next(new Error("Too many reset requests. Try again later", { cause: 429 }));
  }

  
  if (!user.resetRequestTime || user.resetRequestTime < Date.now() - 60 * 60 * 1000) {
    user.resetRequests = 0;
  }

  const otp = nanoid(6); 
  user.otp = otp;
  user.otpExpires = Date.now() + 2 * 60 * 1000; // 2 minutes
  user.resetRequests += 1;
  user.resetRequestTime = Date.now();

  await user.save();

  await sendEmail(email, "Reset Your Password", otp);

  return res.status(200).json({ success: true, message: "OTP sent to email" });
});

    

export const resetpassword=asyncHandler(async(req,res,next)=>{
    const {email,otp,password}=req.body;
    if(!email || !otp || !password) return next(new Error("All fields are required", {cause:400}));
    const user=await dbservice.findOne({model:userModel,filter:{email}});
    if(!user) return next(new Error("User not found", {cause:400}));
    if(!user.confirmEmail) return next(new Error("Please verify your email", {cause:400}));
    if(user.changeCredentialTime+15*60*1000<Date.now()) return next(new Error("OTP Expired", {cause:400}));
    if(user.confirmOTP!==otp) return next(new Error("Invalid OTP", {cause:400}));
     if (Date.now() > user.otpExpires) {
    return next(new Error("OTP expired", { cause: 400 }));
  }

  user.password = await bcrypt.hash(password, 10);
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  return res.status(200).json({ success: true, message: "Password reset successfully" });
});


export const newEmailOtp = asyncHandler(async (req, res, next) => {
  const { tempEmail } = req.body;

  const oldEmail = req.user.email;

  if (!tempEmail) {
    return next(new Error("New email is required", { cause: 400 }));
  }

  
  const user = await dbservice.findOne({
    model: userModel,
    filter: { email: oldEmail }
  });

  if (!user) return next(new Error("User not found", { cause: 404 }));
  if (!user.confirmEmail)
    return next(new Error("Please verify your old email first", { cause: 400 }));

  
  const otp = nanoid(6);
  user.otp = otp;
  user.otpExpires = Date.now() + 2 * 60 * 1000; 
  user.tempEmail = tempEmail;
  await user.save();

  
  await sendEmail(oldEmail, "Verify Your Old Email", `Your OTP is: ${otp}`);
  await sendEmail(tempEmail, "Verify Your New Email", `Your OTP is: ${otp}`);

  return res.status(200).json({
    success: true,
    message: "OTP sent to both old and new emails"
  });
});



export const updateEmail = asyncHandler(async (req, res, next) => {
  const { oldOtp, newOtp } = req.body;

  if (!oldOtp || !newOtp) {
    return next(new Error("All fields are required", { cause: 400 }));
  }

  const user = await dbservice.findOne({
    model: userModel,
    filter: { email: req.user.email }
  });

  if (!user) return next(new Error("User not found", { cause: 400 }));
  if (!user.confirmEmail) return next(new Error("Please verify your email", { cause: 400 }));

  if ( Date.now() > user.otpExpires) {
    return next(new Error("OTP expired", { cause: 400 }));
  }

  if (oldOtp !== newOtp) {
    return next(new Error("OTPs do not match", { cause: 400 }));
  }
  user.email = user.tempEmail;
  user.tempEmail = null;
  user.otp = null;
  user.otpExpires = null;
  user.confirmEmail = false; 
  await user.save();

  return res.status(200).json({ success: true, message: "Email updated successfully" });
});


export const uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error("No image uploaded", { cause: 400 }));
  const {secure_url, public_id} = await uploadCloud(req.file.path, `social-app/user/${req.user._id}`);
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {image:{secure_url,public_id}},
    { new: false }
  );
  if(user.image?.public_id){
    await deleteCloud(user.image.public_id);
  }
  return res.status(200).json({ success: true, message: "Profile image updated successfully", data: user });
});



export const uploadCoverImage = asyncHandler(async (req, res, next) => {
  if (!req.files||req.files.length===0) return next(new Error("No image uploaded", { cause: 400 }));
  
  let images=[]
for (const file of req.files) {
    const {secure_url, public_id} = await uploadCloud(file.path, `social-app/user/cover/${req.user._id}`);
    images.push({secure_url,public_id})
}
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {cover:images},
    { new: true }
  );

  return res.status(200).json({ success: true, message: "cover image updated successfully", data: user });
});

export const gaetallpostsandusers=asyncHandler(async(req,res,next)=>{
  const result=await Promise.allSettled([
    dbservice.find({model:postModel,filter:{isDeleted:false}}),
    dbservice.find({model:userModel,filter:{isDeleted:false}})])
  return res.status(200).json({success:true,data:result})
})

export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;
  const requester = req.user;
  if (requester.role === "user") {
    return res.status(403).json({ success: false, message: "Users cannot change roles" });
  }
  if (requester.role === "admin" && (role === "admin" || role === "superadmin")) {
    return res.status(403).json({ success: false, message: "Admins cannot assign admin or superadmin role" });
  }

  if (requester.role !== "superadmin" && role === "superadmin") {
    return res.status(403).json({ success: false, message: "Only superadmin can assign superadmin role" });
  }
  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({ success: true, data: updatedUser });
});

export const getAllUsers=asyncHandler(async(req,res,next)=>{
const {page,size}=req.query
const users=await paginate({model:userModel,filter:{isDeleted:false},page,size})
return res.status(200).json({success:true,data:users})
})

export const logout=asyncHandler(async(req,res,next)=>{
  res.cookie("token",null,{expires:new Date(Date.now()),httpOnly:true})
  return res.status(200).json({success:true,message:"Logged out successfully"})
})