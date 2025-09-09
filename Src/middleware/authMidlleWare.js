import { asyncHandler } from "../utils/asyncHandler.js";
import * as dbservice from '../DB/db.service.js'
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const authenticate = ()=>{return asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await dbservice.findById({model:userModel,id:decoded.id,select:"-password"});
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  req.user = user;
  return next();
});}


export const authorize = (accessroles = []) => {    
    return (req,res,next)=>{
            console.log(req.user?.role);
        if(!accessroles.includes(req.user.role)){
            return res.status(403).json({success:false,message:"Unauthorized access"})
        }
        return next()
    }
}