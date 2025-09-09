

export const asyncHandler=(fn)=>{
    return (req,res,next)=>{
        return fn(req,res,next).catch(error=>{
            return next(error)
        })
    }
}
export const globalerror=(err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};