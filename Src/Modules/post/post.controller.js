import postModel from "../../models/postModel.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadCloud } from "../../utils/cloudinary.js";
import * as dbservice from '../../DB/db.service.js'
import { roles } from "../../models/userModel.js";
import { paginate } from "../../utils/Pagination.js";

export const getPosts=asyncHandler(async(req,res,next)=>{
  let {page,size}=req.query
  const posts=await paginate({model:postModel,filter:{isDeleted:false},page,size,
populate: [
    {
      path: "comments",
      match: { isDeleted: false, parentCommentId: null }, 
      populate: {
        path: "replies",
        match: { isDeleted: false }
      }
    }
  ]
});  
  return res.status(200).json({success:true,posts})
})
export const createPost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  if (!content && (!req.files || req.files.length === 0)) {
    return next(new Error("Post must have content or files", { cause: 400 }));
  }

  let attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const { secure_url, public_id } = await uploadCloud(
        file.path,
        `social-app/post/${req.user._id}`
      );
      attachments.push({ secure_url, public_id });
    }
  }

  const post = await postModel.create({
    content,
    attachments,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: post });
});

// 🟡 Update Post
export const updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

 
  if (!content && (!req.files || req.files.length === 0)) {
    return next(new Error("No update data provided", { cause: 400 }));
  }

  let updateData = {};


  if (content) {
    updateData.content = content;
  }

  if (req.files && req.files.length > 0) {
    let attachments = [];
    for (const file of req.files) {
      const { secure_url, public_id } = await uploadCloud(
        file.path,
        `social-app/post/${req.user._id}`
      );
      attachments.push({ secure_url, public_id });
    }
  
    updateData.attachments = attachments;
  }

  const updatedPost = await postModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  if (!updatedPost) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    message: "Post updated successfully",
    data: updatedPost,
  });
});

//freeze post
export const freezePost = asyncHandler(async (req, res, next) => {
  const owner = req.user.role === roles.admin ? {} : { createdBy: req.user._id };

  const post = await dbservice.findOneAndUpdate({
    model: postModel,
    filter: { _id: req.params.id, isDeleted: false, ...owner },
    data: {
      $set: {
        isDeleted: true,
        deletedBy: req.user._id,
        updatedBy: req.user._id
      }
    },
    options: { new: true }
  });

  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found or already frozen" });
  }

  return res.status(200).json({ success: true, message: "Post frozen successfully", data: post });
});

//restore post
export const restorePost = asyncHandler(async (req, res, next) => {
  const owner = req.user.role === roles.admin ? {} : { createdBy: req.user._id };

  const post = await dbservice.findOneAndUpdate({
    model: postModel,
    filter: { _id: req.params.id, isDeleted: true, ...owner },
    data: { 
      $set: { isDeleted: false, updatedBy: req.user._id },
      $unset: { deletedBy: "" }
    },
    options: { new: true }
  });

  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found or not deleted" });
  }

  return res.status(200).json({
    success: true,
    message: "Post restored successfully",
    data: post,
  });
});


//like post
export const likePost = asyncHandler(async (req, res, next) => {
  const post = await dbservice.findOneAndUpdate({model:postModel,filter:{_id:req.params.id,isDeleted:false},data:{$addToSet:{likes:req.user._id}},options:{new:true}})
  return res.status(200).json({success:true,message:"Post Liked",data:post})
})
//unlike post
export const unlikePost = asyncHandler(async (req, res, next) => {
  const post = await dbservice.findOneAndUpdate({model:postModel,filter:{_id:req.params.id,isDeleted:false},data:{$pull:{likes:req.user._id}},options:{new:true}})
  return res.status(200).json({success:true,message:"Post Unliked",data:post})
})