import express from 'express'
import { authenticate, authorize } from '../../middleware/authMidlleWare.js'
import { validateBody, validateParams } from '../../middleware/validationmiddleware.js'
import { createCommentValidation, freezeComeentValidation } from '../../validation/commentValidation.js'
import { upload } from '../../utils/multer.js'
import { createComment, freezeComeent, getallcomments, likeComment, replyToComment, unfreezeComment, unlike, UpdateComment } from './comment.controller.js'


const commentRouter=express.Router({
    mergeParams:true,
    strict:true,
    caseSensitive:true
})
commentRouter.get('/:commentId',authenticate(),authorize("user"),getallcomments)
commentRouter.post('/',authenticate(),authorize("user"),validateBody(createCommentValidation),upload.array('files',5),createComment)
commentRouter.patch('/:commentId',authenticate(),authorize("user"),validateBody(createCommentValidation),upload.array('files',5),UpdateComment)
commentRouter.delete('/:commentId',authenticate(),authorize("user","admin"),validateParams(freezeComeentValidation),freezeComeent)
commentRouter.patch('/:commentId/unfreeze',authenticate(),authorize("user","admin"),validateParams(freezeComeentValidation),unfreezeComment)
commentRouter.patch('/:commentId/like',authenticate(),authorize("user"),validateParams(freezeComeentValidation),likeComment)
commentRouter.patch('/:commentId/unlike',authenticate(),authorize("user"),validateParams(freezeComeentValidation),unlike)
commentRouter.post("/:commentId/reply", authenticate(), authorize("user"), replyToComment);
export default commentRouter