import express from 'express';
import { authorPostValidation } from '../../validation.js';
import multer from 'multer';
import { getAuthorsCSV, getAuthors, getAuthorById, updateAuthorAvatar, newAuthor, editAuthor, deleteAuthor, getAuthorBlogPosts } from '../../db/controllers/authors.controller.js';
import {uploadAvatarImageToCloud} from '../../lib/image-tools.js';
//import basicAuth from '../../auth/basic.js';
import JWTAuth from '../../auth/token.js';
import adminAuth from '../../auth/admin.js';


// Router
const authorsRouter = express.Router();

authorsRouter.use(JWTAuth)
authorsRouter.use(adminAuth)


//GET, POST - authors/
authorsRouter.route("/")
  .get(getAuthors)
  .post(authorPostValidation, newAuthor);

//GET - /authors/authorsCSV - Return .csv of all authors.
authorsRouter.route("/authorsCSV")
.get(getAuthorsCSV);

//GET, PUT, DELETE - /authors/:id
authorsRouter.route("/:id")
  .get(getAuthorById)
  .put(editAuthor)
  .delete(deleteAuthor);

//GET - /authors/:id/blogPosts - Return blog posts by certain author
authorsRouter.get("/:id/blogPosts", getAuthorBlogPosts);

// Upload author avatar image - POST OR PUT?? CHANGE LATER ACCORDINGLY
authorsRouter.post("/:id/uploadAvatar", uploadAvatarImageToCloud, updateAuthorAvatar);



export default authorsRouter;