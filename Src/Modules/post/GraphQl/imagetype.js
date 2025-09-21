import { GraphQLObjectType,GraphQLString } from "graphql";

export const imageType=new GraphQLObjectType({
    name:"image",
    fields: {
        secure_url:{type:GraphQLString},
        public_id:{type:GraphQLString}
    }
})