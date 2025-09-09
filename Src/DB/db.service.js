export const create = async ({ model, data = {} } = {}) => {
  return await model.create(data);
};

export const find = async ({
  model,
  filter = {},
  select = "",
  populate = "",
  skip = 0,
  limit = 0,
  sort = {}
} = {}) => {
  return await model
    .find(filter)
    .select(select)
    .populate(populate)
    .skip(skip)
    .limit(limit)
    .sort(sort);
};
export const findByIdAndUpdate = async ({
  model,
  filter = {},
  data = {},
  options = { new: true },
  select = "",
  populate = ""
} = {}) => {
  try {
    return await model
      .findByIdAndUpdate(filter, data, options)
      .select(select)
      .populate(populate);
  } catch (error) {
    console.log(error);
  }
};

export const findOne = async ({
  model,
  filter = {},
  select = "",
  populate = ""
} = {}) => {
  return await model
    .findOne(filter)
    .select(select)
    .populate(populate);
};

export const findById = async ({
  model,
  id,
  select = "",
  populate = ""
} = {}) => {
  return await model
    .findById(id)
    .select(select)
    .populate(populate);
};

export const updateOne = async ({
  model,
  filter = {},
  data = {},
  options = {}
} = {}) => {
  return await model.updateOne(filter, data, options);
};

export const updateMany = async ({
  model,
  filter = {},
  data = {},
  options = {}
} = {}) => {
  return await model.updateMany(filter, data, options);
};

export const deleteOne = async ({ model, filter = {} } = {}) => {
  return await model.deleteOne(filter);
};

export const deleteMany = async ({ model, filter = {} } = {}) => {
  return await model.deleteMany(filter);
};

export const findOneAndUpdate = async ({
  model,
  filter = {},
  data = {},
  options = {},
  select = "",
  populate = ""
} = {}) => {
  return await model
    .findOneAndUpdate(filter, data, options)
    .select(select)
    .populate(populate);
};

export const findOneAndDelete = async ({ model, filter = {} } = {}) => {
  return await model.findOneAndDelete(filter);
};

export const countDocuments = async ({ model, filter = {} } = {}) => {
  return await model.countDocuments(filter);
};