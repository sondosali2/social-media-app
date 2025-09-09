export const paginate = async ({
  page = 1,
  size = 5,
  model,
  filter = {},
  populate = [],
  select = "",
} = {}) => {
    page=parseInt(page<1?1:page)
    size=parseInt(size<1?1:size)
  const skip = (page - 1) * size;
  const limit = size;
  const docs = await model
    .find(filter)
    .select(select)
    .populate(populate)
    .skip(skip)
    .limit(limit);
  const totalDocs = await model.countDocuments(filter);

  return {
    data: docs,
    totalDocs,
    page,
    limit,
    totalPages: Math.ceil(totalDocs / limit)
  };
};
