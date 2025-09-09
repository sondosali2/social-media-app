import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
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
  description: {
    type: String,
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
}, { timestamps: true ,toJSON:{virtuals:true},toObject:{virtuals:true}});
postSchema.virtual("comments", {
  ref: "comment",
  localField: "_id",
  foreignField: "postId",
})
const postModel = mongoose.model("Post", postSchema);
export default postModel;
