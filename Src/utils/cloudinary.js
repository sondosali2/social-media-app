import { v2 as cloudinary } from "cloudinary";
import path from "node:path";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config({ path: path.resolve("./Src/.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


export const uploaded=multer()
export const uploadCloud = async (file, folder) => {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image", 
  });
  return result;
};

export const deleteCloud = async (id) => {
  const result = await cloudinary.uploader.destroy(id);
  return result;
};