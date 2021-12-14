import createHttpError from "http-errors";
import BlogModel from "../db/models/blogPosts.model.js";

export default async function authorAuth(req, res, next) {
  try {
    const blogPost = await BlogModel.findOne({author: req.user._id, _id: req.params.id});
    if(blogPost) {
      next()
    } else {
      next(createHttpError(403, "Not permitted to access the resource."));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}
