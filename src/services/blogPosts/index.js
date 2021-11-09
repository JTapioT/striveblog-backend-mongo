import express from "express";
import multer from "multer";
import { blogPostValidation } from "../../validation.js";
import { deletePostComment, getAllPosts, getPostById, getPostComments, addComment, updateBlogPost, uploadBlogPostCoverImg, deleteBlogPost, postBlogPost, downloadPDF } from "./requestHandlers.js";

/* 
import {CloudinaryStorage} from "multer-storage-cloudinary";
import {v2 as cloudinary} from "cloudinary";
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "strive-blog",
  },
});
*/

import { cloudinaryStorage } from "../../lib/fs-tools.js";

// Router
const blogPostsRouter = express.Router();

// GET /blogPosts
blogPostsRouter
  .route("/")
  .get(getAllPosts)
  .post(blogPostValidation, postBlogPost);

// GET /blogPosts/:id
blogPostsRouter.get("/:id", getPostById);

//GET /blogPosts/:id/downloadPDF
blogPostsRouter.get("/:id/downloadPDF", downloadPDF);

// GET /blogPosts/:id/comments
blogPostsRouter.get("/:id/comments", getPostComments)


// POST /blogPosts/:id/comments 
blogPostsRouter.post("/:id/comments", addComment)

// POST /blogPosts/:id/uploadCover
// TODO: Later.
blogPostsRouter.post("/:id/uploadCover", multer({storage: cloudinaryStorage}).single("coverPhoto"), uploadBlogPostCoverImg);

// PUT /blogPosts/:id
blogPostsRouter.put("/:id", updateBlogPost);

// DELETE /blogPosts/:id
blogPostsRouter.delete("/:id", deleteBlogPost);

// DELETE /blogPosts/:id/comments/:commentId
blogPostsRouter.delete("/:id/comments/:commentId", deletePostComment)

export default blogPostsRouter;