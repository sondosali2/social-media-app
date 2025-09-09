import joi from "joi";

export const signupValidation=joi.object().keys({
    name:joi.string().min(3).max(20).required(),
    email:joi.string().email({tlds:{allow:["com","net"]}}).required(),
    password:joi.string().min(6).regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    //confirmPassword:joi.string().valid(joi.ref("password"))
}).required()

export const verifyEmailValidation=joi.object().keys({
    email:joi.string().email({tlds:{allow:["com","net"]}}).required(),
    code:joi.string().length(6).required()
}).required()

export const signinValidation=joi.object().keys({
    email:joi.string().email({tlds:{allow:["com","net"]}}).required(),
    password:joi.string().min(6).regex(/^[a-zA-Z0-9]{3,30}$/).required(),
}).required()

export const forgetpasswordValidation=joi.object().keys({
    email:joi.string().email({tlds:{allow:["com","net"]}}).required(),
}).required()

export const resetpasswordValidation=joi.object().keys({
    email:joi.string().email({tlds:{allow:["com","net"]}}).required(),
    otp:joi.string().length(6).required(),
    password:joi.string().min(6).regex(/^[a-zA-Z0-9]{3,30}$/).required(),
}).required()

export const resetEmailValidation=joi.object().keys({
    tempEmail:joi.string().email({tlds:{allow:["com","net"]}}).required(),
}).required()
