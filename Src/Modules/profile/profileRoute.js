import express from "express"
import { authenticate } from "../../middleware/authMidlleWare.js"
import { profile, shareProfile, updateProfile } from "./profileController.js"
import { validateBody } from "../../middleware/validationmiddleware.js"
import { profileValidation } from "../../validation/profileValidation.js"



const profilerouter=express.Router()
profilerouter.get("/",authenticate(),profile)
profilerouter.get("/:profileId",validateBody(profileValidation),authenticate(),shareProfile)
profilerouter.patch("/",authenticate(),updateProfile)
export default profilerouter