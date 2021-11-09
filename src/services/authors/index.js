import express from 'express';
import { authorPostValidation } from '../../validation.js';
import multer from 'multer';
import { getAuthorsCSV, getAuthors, getAuthorById, uploadAvatarImage, checkForAlreadyExistingEmail, newAuthor, editAuthor, deleteAuthor, getAuthorBlogPosts } from './requestHandlers.js';

// Router
const authorsRouter = express.Router();

// Return list of all authors - GET
authorsRouter.get("/", getAuthors);

// Return csv of all authors - GET
authorsRouter.get("/authorsCSV", getAuthorsCSV);

// Return a single author by id - GET
authorsRouter.get("/:id", getAuthorById);

// Return blog posts by certain author - GET
authorsRouter.get("/:id/blogPosts", getAuthorBlogPosts);

// Create a new author - POST
authorsRouter.post("/", authorPostValidation, newAuthor)

// Upload author avatar image - POST
// TODO - CLOUDINARY! 
authorsRouter.post("/:id/uploadAvatar", multer().single("avatar"), uploadAvatarImage)

// Check that same e-mail does not exist already - POST
authorsRouter.post("/checkEmail", checkForAlreadyExistingEmail)

// Edit the author with the given id - PUT
authorsRouter.put("/:id", editAuthor)

// Delete the author by id - DELETE
authorsRouter.delete("/:id", deleteAuthor)


export default authorsRouter;