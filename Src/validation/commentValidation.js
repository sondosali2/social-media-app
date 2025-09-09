import Joi from "joi";
export const createCommentValidation = Joi.object({
    postId: Joi.string().hex().length(24).required(),
  content: Joi.string().min(2).max(10000),
  files: Joi.array().items(Joi.string())
}).or("content", "files"); 

export const freezeComeentValidation = Joi.object({
    postId: Joi.string().hex().length(24).required(),
    commentId: Joi.string().hex().length(24).required(),
})
