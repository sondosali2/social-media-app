import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLBoolean,
  GraphQLInt
} from "graphql";
import postModel from "../../../models/postModel.js";
import {
  getallpostsresponse,
  getonepostresponse,
  isAuthenticated
} from "./response.js";
import { idSchema, likePostSchema, paginationSchema, withValidation } from "./graphql.validation.js";

// ------------------ Query ------------------
const Query = new GraphQLObjectType({
  name: "Query",
  fields: {
    getAllPosts: {
      type: new GraphQLObjectType({
        name: "allposts",
        fields: {
          message: { type: GraphQLString },
          status: { type: GraphQLInt },
          data: { type: getallpostsresponse }
        }
      }),
       resolve:withValidation(paginationSchema)(async (parent, args) => {
        const { skip, limit } = args;
        const posts = await postModel
          .find({ isDeleted: false })
          .skip(skip)
          .limit(limit);
        return { message: "Done", status: 200, data: posts };
      }) 
      }
    },
    getOnePost: {
      type: new GraphQLObjectType({
        name: "onepost",
        fields: {
          message: { type: GraphQLString },
          status: { type: GraphQLInt },
          data: { type: getonepostresponse }
        }
      }),
      args: { id: { type: GraphQLID } },
      resolve: isAuthenticated(["admin", "user"])(withValidation(idSchema)(
        async (parent, args) => {
          const { id } = args;
          const post = await postModel
            .findById({ _id: id })
            .populate({ path: "createdBy" });
          return { message: "Done", status: 200, data: post };
        })
      )
    }
  }
)

// ------------------ Mutation ------------------
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    likePost: {
      type: getonepostresponse,   
      args: {
        postId: { type: GraphQLID }
      },
      resolve: isAuthenticated(["user", "admin"])(withValidation(likePostSchema)(
        async (parent, { postId }, context) => {
          const userId = context.user._id;
          const updatedPost = await postModel
            .findByIdAndUpdate(
              postId,
              { $addToSet: { likes: userId } },
              { new: true }
            )
            .populate({ path: "createdBy" });

          if (!updatedPost) throw new Error("Post not found");
          return updatedPost;
        })
      )
    }
  }
});

// ------------------ Final Schema ------------------
export const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});
