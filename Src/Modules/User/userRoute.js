import express from 'express'
import { forgetpassword, gaetallpostsandusers, getAllUsers, login, logout, newEmailOtp, refreshToken, resetpassword, signup, updateEmail, updateUserRole, uploadCoverImage, uploadProfileImage, verifyEmail } from './userController.js'
import { validateBody } from '../../middleware/validationmiddleware.js'
import { forgetpasswordValidation, resetEmailValidation, resetpasswordValidation, signinValidation, signupValidation, verifyEmailValidation } from '../../validation/userValidation.js'
import { authenticate, authorize } from '../../middleware/authMidlleWare.js'
import { upload } from '../../utils/multer.js'
const router = express.Router()
router.patch(
  "/:userId/role",
  authenticate(),
  authorize("superadmin", "admin"), 
  updateUserRole
);
router.get("/all",authenticate(),authorize("superadmin"),getAllUsers)
router.get("/",gaetallpostsandusers)
router.post("/signup",validateBody(signupValidation),signup)
router.post("/verify",validateBody(verifyEmailValidation),verifyEmail);
router.post("/login",validateBody(signinValidation),login)
router.post("/logout",authenticate(),logout)

router.get("/:refreshtoken",refreshToken)
router.patch("/forget-password",validateBody(forgetpasswordValidation),forgetpassword)
router.patch("/reset-password",validateBody(resetpasswordValidation),resetpassword)
router.patch("/reset-email",validateBody(resetEmailValidation),authenticate(),newEmailOtp)
router.patch("/reset-otp",authenticate(),updateEmail)
router.patch("/profileImage",authenticate(),
upload.single("image"),uploadProfileImage)
router.patch('/coverImage',authenticate(),upload.array('image',5),uploadCoverImage)
export default router