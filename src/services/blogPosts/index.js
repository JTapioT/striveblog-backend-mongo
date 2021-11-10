import express from "express";
import { blogPostValidation, commentValidation } from "../../validation.js";
import { getAllPosts, getPostById, getComments,getComment, updateComment, addComment, deleteComment , updateBlogPost, updateBlogCover, deleteBlogPost, postBlogPost, downloadPDF } from "../../db/controllers/blogPosts.controller.js";
import {uploadBlogImageToCloud} from "../../lib/image-tools.js";

// Router
const blogPostsRouter = express.Router();

// GET /blogPosts
blogPostsRouter
  .route("/")
  .get(getAllPosts)
  .post(blogPostValidation, postBlogPost);

// GET, PUT, DELETE /blogPosts/:id
blogPostsRouter
  .route("/:id")
  .get(getPostById)
  .put(updateBlogPost)
  .delete(deleteBlogPost)

// GET, POST /blogPosts/:id/comments
blogPostsRouter
  .route("/:id/comments")
  .get(getComments)
  .post(commentValidation, addComment)
  
// DELETE /blogPosts/:id/comments/:commentId
blogPostsRouter
  .route("/:id/comments/:commentId")
  .get(getComment)
  .put(updateComment)
  .delete(deleteComment);

//GET /blogPosts/:id/downloadPDF
//TODO: CHECK LATER
blogPostsRouter.route("/:id/downloadPDF")
.get(downloadPDF);

// POST /blogPosts/:id/uploadCover
blogPostsRouter.route("/:id/uploadCover")
.post(uploadBlogImageToCloud, updateBlogCover);


export default blogPostsRouter;