import Joi from "joi";
export const withValidation = (schema) => (resolver) =>
  async (parent, args, context, info) => {
    const { error, value } = schema.validate(args);
    if (error) {
      throw new Error(error.details.map(d => d.message).join(", "));
    }
    return resolver(parent, value, context, info);
  };

  export const paginationSchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().default(2),
});

export const idSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
});

export const likePostSchema = Joi.object({
  postId: Joi.string().length(24).hex().required(),
});