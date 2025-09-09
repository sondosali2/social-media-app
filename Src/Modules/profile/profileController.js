import { asyncHandler } from "../../utils/asyncHandler.js";

import * as dbservice from '../../DB/db.service.js'
import userModel from "../../models/userModel.js";

export const profile=asyncHandler(async(req,res,next)=>{
    return res.status(200).json({success:true,data:req.user})
})

export const shareProfile = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;

  if (profileId === req.user._id.toString()) {
    return res.status(200).json({
      success: true,
      data: {
        name: req.user.name,
        email: req.user.email,
        image: req.user.image,
        viewers: req.user.viewers
      }
    });
  }

  const now = Date.now();
  const fiveDays = 5 * 24 * 60 * 60 * 1000;

//if already this viewer exists just update time
  let user = await userModel.findOneAndUpdate(
    {
      _id: profileId,
      "viewers.userId": req.user._id
    },
    {
      $set: { "viewers.$.time": now }
    },
    { new: true }
  ).populate("viewers.userId", "name email");

  // if it's not exists push new viewer
  if (!user) {
    user = await userModel.findByIdAndUpdate(
      profileId,
      {
        $push: { viewers: { userId: req.user._id, time: now,name:req.user.name } }
      },
      { new: true }
    )
  }

  if (!user) return next(new Error("User not found", { cause: 404 }));

  return res.json({
    success: true,
    data: {
      name: user.name,
      email: user.email,
      image: user.image,
      viewersCount: user.viewers.length,
      viewers: user.viewers
    }
  });
});


export const updateProfile=asyncHandler(async(req,res,next)=>{
    const user=await dbservice.findOneAndUpdate({model:userModel,
        filter:{_id:req.user._id},
        data:{name:req.body.name,phone:req.body.phone,location:req.body.location,about:req.body.about,birthday:req.body.birthday},
        options:{new:true}})
    return res.status(200).json({success:true,data:user})
})