import mongoose from "mongoose";

const comment = new mongoose.Schema({
  content: {
    type: String,
    minLength: 2,
    maxLength: 10000,
    trim: true,
    unique: true,
    required: function () {
      return this.attachments?.length ? false : true;
    },
  },
  attachments: [
    {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
   parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment", 
    default: null,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  isDeleted: { type: Boolean, default: false },
  postId:{type:mongoose.Schema.Types.ObjectId,ref:"Post",required:true}
}, { timestamps: true ,toJSON:{virtuals:true}, toObject:{virtuals:true}});
comment.virtual("replies", {
  ref: "comment",
  localField: "_id",
  foreignField: "parentCommentId"
});

const commentModel = mongoose.model("comment", comment);
export default commentModel;
