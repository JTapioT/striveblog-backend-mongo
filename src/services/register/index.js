import express from "express";
import createHttpError from "http-errors";
import AuthorModel from "../../db/models/authors.model.js";
import { authorPostValidation } from "../../validation.js";
import { validationResult } from "express-validator";
// This was used earlier within homework to send email to authors.
// Omit for now.
// import sendRegistrationEmail from "./requestHandler";


// Router
const registerRouter = express.Router();

registerRouter.post("/", authorPostValidation, async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    }
    const newAuthor = new AuthorModel(req.body);
    // .pre() hook for save now contains a function
    // the function will hash the plain text password to hashed one
    // hashed one will be saved to the database
    // What is returned from creation of new author/user is just the _id. 
    const {_id} = await newAuthor.save();
    res.send({_id});

    // From earlier homework when email was sent to the registered author/user.
    //const {email, firstName, lastName} = req.body;
    // Provide as argument the information from request body
    //await sendRegistrationEmail(email, firstName, lastName);
    //res.send({message: "success"});
  } catch (error) {
    console.log(error);
    // error code 11000 seems to be the error for duplicate value found within database for some unique field of a document.
    if(error.code === 11000) {
      next(createHttpError(409, "Email already exists."))
    } else {
      next(error);
    }
  }
});

export default registerRouter;