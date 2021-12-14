import express from 'express';
import { authorPostValidation } from '../../validation.js';
import multer from 'multer';
import { getAuthorsCSV, getAuthors, getAuthorById, updateAuthorAvatar, newAuthor, editAuthor, deleteAuthor, getAuthorBlogPosts } from '../../db/controllers/authors.controller.js';
import {uploadAvatarImageToCloud} from '../../lib/image-tools.js';
import basicAuth from '../../auth/basic.js';
import adminAuth from '../../auth/admin.js';

// Router
const authorsRouter = express.Router();

authorsRouter.use(basicAuth);

//GET, POST - authors/
authorsRouter.route("/")
  .get(getAuthors)
  .post(adminAuth, authorPostValidation, newAuthor);

authorsRouter.route("/me")
  .get(async (req,res,next) => {
    try {
      res.send(req.user);
    } catch (error) {
      console.log(error);
      next(error);
    }
  })
  .put(async(req,res,next) => {
    try {
      // I need to add also some validation whenever user wants to update own information?
      // I guess Database will throw an error if extra field is tried to update or value(s) provided for fields are wrong etc.
      await req.user.save();
    } catch (error) {
      console.log(error);
      next(error);
    }
  })
  .delete()

//GET - /authors/authorsCSV - Return .csv of all authors.
authorsRouter.route("/authorsCSV")
.get(getAuthorsCSV);

//GET, PUT, DELETE - /authors/:id
authorsRouter.route("/:id")
  .get(adminAuth, getAuthorById)
  .put(adminAuth, editAuthor)
  .delete(adminAuth, deleteAuthor);

//GET - /authors/:id/blogPosts - Return blog posts by certain author
authorsRouter.get("/:id/blogPosts", getAuthorBlogPosts);

// Upload author avatar image - POST OR PUT?? CHANGE LATER ACCORDINGLY
authorsRouter.post("/:id/uploadAvatar",adminAuth, uploadAvatarImageToCloud, updateAuthorAvatar);



export default authorsRouter;