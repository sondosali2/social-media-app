export const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.validate(req.body, { abortEarly: false });
    if (result.error) {
      return res.json({
        message: "error",
        error: result.error.details[0].message,
      });
    }
    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    const result = schema.validate(req.params, { abortEarly: false });
    if (result.error) {
      return res.json({
        message: "error",
        error: result.error.details[0].message,
      });
    }
    next();
  };
};
