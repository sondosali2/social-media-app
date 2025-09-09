import commentModel from "../../models/CommentModel.js";
import postModel from "../../models/postModel.js";
import { roles } from "../../models/userModel.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadCloud } from "../../utils/cloudinary.js";
import * as dbservice from '../../DB/db.service.js'
import { paginate } from "../../utils/Pagination.js";
export const getallcomments=asyncHandler(async(req,res,next)=>{
  //const results=[]
  //mongoose streaming (child parent)
//     const cursor = postModel.find({}).cursor();

// for (let post = await cursor.next(); post != null; post = await cursor.next()) {
//   const comments=await commentModel.find({postId:post._id,isDeleted:false})
//   results.push({post,comments})}
const {page,size}=req.query
const comments=await paginate({model:commentModel,filter:{isDeleted:false},page,size,populate:[{path:"postId",match:{isDeleted:false}}]})
return res.status(200).json({success:true,comments})  
})
export const createComment=asyncHandler(async(req,res,next)=>{
    const{postId}=req.params
    const post=await postModel.findOne({_id:postId,isDeleted:false})
    if(!post){
        return next(new Error("Post not found", { cause: 404 }));
    }
    const {content}=req.body
    if(req.files?.length){
        const attachments=[]
        for (const file of req.files) {
            const {secure_url,public_id}=await uploadCloud(file.path,`social-app/user/${post.createdBy}/post/${postId}/comment`)
            attachments.push({secure_url,public_id})
        }
        req.body.attachments=attachments
    }
    const comment=await commentModel.create({...req.body,postId,createdBy:req.user._id})
    return res.status(201).json({success:true,data:comment})
})

export const UpdateComment=asyncHandler(async(req,res,next)=>{
    const{postId,commentId}=req.params
    const comment=await commentModel.findOne({_id:commentId,postId,isDeleted:false}).populate({path:"postId"})
    if(!comment||comment.createdBy.toString()!==req.user._id.toString()||comment.postId.isDeleted){
        return next(new Error("Comment not found", { cause: 404 }));
    }
    const {content}=req.body
    if(req.files?.length){
        const attachments=[]
        for (const file of req.files) {
            const {secure_url,public_id}=await uploadCloud(file.path,`social-app/user/${post.createdBy}/post/${postId}/comment`)
            attachments.push({secure_url,public_id})
        }
        req.body.attachments=attachments
    }
    const updated=await commentModel.findOneAndUpdate({_id:commentId},{...req.body},{new:true})
    return res.status(200).json({success:true,data:updated})
})

export const freezeComeent=asyncHandler(async(req,res,next)=>{
    const{postId,commentId}=req.params
    const comment=await commentModel.findOne({_id:commentId,postId,isDeleted:false}).populate({path:"postId"})
    if(!comment||(comment.createdBy.toString()!==req.user._id.toString()&&comment.postId.isDeleted&&comment.role!==roles.admin)){
        return next(new Error("Comment not found or no auth", { cause: 404 }));
    }
    const updated=await commentModel.findOneAndUpdate({_id:commentId},{isDeleted:true},{new:true})
    return res.status(200).json({success:true,data:updated})
})

export const unfreezeComment=asyncHandler(async(req,res,next)=>{
    const{postId,commentId}=req.params
    const comment=await commentModel.findOne({_id:commentId,postId,isDeleted:true}).populate({path:"postId"})
    if(!comment||(comment.createdBy.toString()!==req.user._id.toString()&&comment.postId.isDeleted&&comment.role!==roles.admin)){
        return next(new Error("Comment not found or no auth", { cause: 404 }));
    }
    const updated=await commentModel.findOneAndUpdate({_id:commentId},{isDeleted:false},{new:true})
    return res.status(200).json({success:true,data:updated})
})

export const likeComment=asyncHandler(async(req,res,next)=>{
    const{postId,commentId}=req.params
    const comment=await commentModel.findOne({_id:commentId,postId,isDeleted:false}).populate({path:"postId"})
    if(!comment||(comment.createdBy.toString()!==req.user._id.toString()&&comment.postId.isDeleted&&comment.role!==roles.admin)){
        return next(new Error("Comment not found or no auth", { cause: 404 }));
    }
    const updated=await commentModel.findOneAndUpdate({_id:commentId},{$addToSet:{likes:req.user._id}},{new:true})
    return res.status(200).json({success:true,data:updated})
})
export const unlike=asyncHandler(async(req,res,next)=>{
    const{postId,commentId}=req.params
    const comment=await commentModel.findOne({_id:commentId,postId,isDeleted:false}).populate({path:"postId"})
    if(!comment||(comment.createdBy.toString()!==req.user._id.toString()&&comment.postId.isDeleted&&comment.role!==roles.admin)){
        return next(new Error("Comment not found or no auth", { cause: 404 }));
    }
    const updated=await commentModel.findOneAndUpdate({_id:commentId},{$pull:{likes:req.user._id}},{new:true})
    return res.status(200).json({success:true,data:updated})
})
///////Reply on a comment
// replyToComment
export const replyToComment = asyncHandler(async (req, res, next) => {
  const { postId, commentId } = req.params;
  const parentComment = await commentModel.findOne({ _id: commentId, postId, isDeleted: false });
  if (!parentComment) {
    return next(new Error("Parent comment not found", { cause: 404 }));
  }

  const reply = await commentModel.create({
    content: req.body.content,
    postId,
    parentCommentId: commentId,
    createdBy: req.user._id
  });
  return res.status(201).json({ success: true, data: reply });
});
