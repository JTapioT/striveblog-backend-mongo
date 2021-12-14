import express from "express";
import { blogPostValidation, commentValidation } from "../../validation.js";
import { getAllPosts, getPostById, getComments,getComment, updateComment, addComment, deleteComment , updateBlogPost, updateBlogCover, deleteBlogPost, postBlogPost, downloadPDF, addLike, deleteLike } from "../../db/controllers/blogPosts.controller.js";
import {uploadBlogImageToCloud} from "../../lib/image-tools.js";
import basicAuth from "../../auth/basic.js";
import adminAuth from "../../auth/admin.js";

// Router
const blogPostsRouter = express.Router();

//blogPostsRouter.use();

// GET /blogPosts
blogPostsRouter
  .route("/")
  .get(basicAuth, getAllPosts)
  .post(blogPostValidation, postBlogPost);

// GET, PUT, DELETE /blogPosts/:id
blogPostsRouter
  .route("/:id")
  .get(getPostById)
  .put(basicAuth, adminAuth, updateBlogPost)
  .delete(basicAuth, adminAuth, deleteBlogPost)

// GET, POST /blogPosts/:id/comments
blogPostsRouter
  .route("/:id/comments")
  .get(getComments)
  .post(commentValidation, addComment)

// SILLY GOOSE IDEA - /blogPosts/:id/like/:authorId
// Whenever there is a click on "like" button, there will be PUT request to route
// This might be against REST best practices when sending empty body?

// https://stackoverflow.com/questions/7323958/are-put-and-post-requests-required-expected-to-have-a-request-body
// Not so sure about the checkmarked answer.

// Url params already contain id of blog and author id.
// In the backend handle update of the blogPost likes array with new information (authorId)
// I guess one could just add author id within the body.
// Now just sending empty body.
blogPostsRouter.put("/:id/like/:authorId", addLike);
blogPostsRouter.delete("/:id/like/:authorId", deleteLike);

// DELETE /blogPosts/:id/comments/:commentId
blogPostsRouter
  .route("/:id/comments/:commentId")
  .get(getComment)
  .put(adminAuth, updateComment)
  .delete(adminAuth, deleteComment);

//GET /blogPosts/:id/downloadPDF
//TODO: CHECK LATER
blogPostsRouter.route("/:id/downloadPDF")
.get(downloadPDF);

// POST /blogPosts/:id/uploadCover
blogPostsRouter.route("/:id/uploadCover")
.post(adminAuth, uploadBlogImageToCloud, updateBlogCover);


export default blogPostsRouter;