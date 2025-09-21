import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLEnumType } from "graphql";
import {imageType} from './imagetype.js'
import * as dbservice from '../../../DB/db.service.js'
import userModel from "../../../models/userModel.js";
import jwt from "jsonwebtoken";
export const getallpostsresponse=new GraphQLList(new GraphQLObjectType({
          name: "getAllPosts",
          fields: {
            _id: { type: GraphQLID },
            content: { type: GraphQLString },
            description: { type: GraphQLString },
            attachments:{type:new GraphQLList(new GraphQLObjectType({
                name:"attachments",
                fields:{
                    secure_url:{type:GraphQLString},
                    public_id:{type:GraphQLString}
                }
            }))},
            createdBy: { type: GraphQLString },
            updatedBy: { type: GraphQLString },
            deletedBy: { type: GraphQLBoolean },
            likes: { type: new GraphQLList(GraphQLString) },
            comments: { type: new GraphQLList(GraphQLString) }
          }
        }))



export const getonepostresponse=new GraphQLObjectType({
          name: "getOnePost",
          fields: {
            createdBy:{type:new GraphQLObjectType({
                name:"user",
                fields:{
                    _id:{type:GraphQLID},
                    name:{type:GraphQLString},
                    email:{type:GraphQLString},
                    image:{type:imageType},
                    gender:{type:new GraphQLEnumType({
                        name:"gender",
                        values:{male:{value:"male"},female:{value:"female"}}
                    })}
                }
            })},
            content: { type: GraphQLString },
            description: { type: GraphQLString },
            attachments:{type:new GraphQLList(new GraphQLObjectType({
                name:"images",
                fields:{
                    secure_url:{type:GraphQLString},
                    public_id:{type:GraphQLString}
                }
            }))},
            updatedBy: { type: GraphQLString },
            deletedBy: { type: GraphQLBoolean },
            likes: { type: new GraphQLList(GraphQLString) },
            comments: { type: new GraphQLList(GraphQLString) }
          }
        })
export const isAuthenticated= (roles)=>{
    return(resolver)=>{
    return async (parent,args,context) => {
const {authorization} = context;
console.log('Context authorization header:', context.authorization);

if(!authorization) throw new Error("No token provided",{cause:404})
  if (!authorization.startsWith("Bearer ")) {
throw new Error("Invalid token format", { cause: 400 });}

  const token = authorization.split(" ")[1];
let decoded;
  await jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) throw new Error(err.message);  
      decoded = payload;
    });    const user = await dbservice.findById({model:userModel,id:decoded.id,select:"-password"});
  if (!user) {
throw new Error("User not found", { cause: 404 });}
if(!roles.includes(user.role)&&roles?.length) throw new Error("Forbidden",{cause:403})
  context.user = user;
  return resolver(parent,args,context);
}}
}