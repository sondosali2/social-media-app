import Joi from "joi";
import { Types } from "mongoose";
const objectIdd=(value,helper)=>{
return Types.ObjectId.isValid(value)?true:helper.message("invalid id")
}
export const profileValidation = Joi.object().keys({
    profileId: Joi.string().custom(objectIdd).required(),
});