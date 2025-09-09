import Joi from "joi";

export const createPostValidation = Joi.object({
  content: Joi.string().min(2).max(10000),
  files: Joi.array().items(Joi.string())
}).or("content", "files"); 

export const updatePostValidation = Joi.object({
  content: Joi.string().min(2).max(10000),
  files: Joi.array().items(Joi.any())
});
export const idParamValidation = Joi.object({
  id: Joi.string().hex().length(24).required() 
});

