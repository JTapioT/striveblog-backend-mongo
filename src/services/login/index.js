import express from "express";
import createHttpError from "http-errors";
import AuthorModel from "../../db/models/authors.model.js";
import { AuthenticateWithToken } from "../../auth/tools.js";

// Router
const loginRouter = express.Router();

loginRouter.post("/", async (req,res,next) => {
  try {
    console.log(req.body);
    const {email, password} = req.body;
    const author = await AuthorModel.checkCredentials(email,password);

    if(author) {
      const accessToken = await AuthenticateWithToken(author);
      res.send({accessToken});
    } else {
      next(createHttpError(401, "Please check credentials again."))
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
})

export default loginRouter;
