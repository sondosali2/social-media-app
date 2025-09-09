import express from 'express'
import { authenticate, authorize } from '../../middleware/authMidlleWare.js'
import { createPostValidation, idParamValidation } from '../../validation/postValidation.js'
import { createPost, freezePost, getPosts, likePost, restorePost, unlikePost, updatePost } from './post.controller.js'
import { validateBody, validateParams } from '../../middleware/validationmiddleware.js'
import { upload } from '../../utils/multer.js'
import { updatePostValidation } from "../../validation/postValidation.js";
import  commentRoute from '../comment/commentRoute.js'
const postRoute=express.Router()

postRoute.use('/:postId/comment',commentRoute)
postRoute.get('/',authenticate(),authorize("user"),getPosts)
postRoute.post(
  "/",
  authenticate(),
  authorize("user"),
  upload.array("files", 5),
  (req, res, next) => {
    if (req.files && req.files.length > 0) {
      req.body.files = req.files.map((f) => f.originalname); 
    }
    next();
  },
  validateBody(createPostValidation),
  createPost
);


postRoute.patch(
  "/:id",
  authenticate(),
  authorize("user"),
  upload.array("files", 5),
  validateParams(idParamValidation),
  validateBody(updatePostValidation),
  updatePost
);

postRoute.delete(
  "/:id",
  authenticate(),
  authorize("user", "admin"),
  validateBody(idParamValidation),
  freezePost
);
postRoute.patch(
  "/:id/post",
  authenticate(),
  authorize("user", "admin"),
  validateBody(idParamValidation),
  restorePost
);
postRoute.patch("/:id/like",authenticate(),authorize("user"),validateBody(idParamValidation),likePost)
postRoute.patch("/:id/unlike",authenticate(),authorize("user"),validateBody(idParamValidation),unlikePost)
export default postRoute