import express from "express";
import createHttpError from "http-errors";
import AuthorModel from "../../db/models/authors.model.js";
import { AuthenticateWithToken } from "../../auth/tools.js";
import passport from "passport";

// Router
const loginRouter = express.Router();

//TODO: Remember to include validation for basic registration.
// Now password is not required. Hence, always require with validation when login normal way.
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

// Requests are re-directed to Google Log-In.
loginRouter.get("/googleLogin", passport.authenticate("google", {
  // Scope: what information is supposed to be returned from the third-party provider, Google in this case after the login.
  scope: ["profile","email"]
}))

loginRouter.get("/googleRedirect", passport.authenticate("google"), async function handleRedirect(req,res,next) {
  try {
    // Due to use of passport serialize, the token(s) are now available within request
    // Redirect, attach with the redirect url as parameters the accessToken information
    //console.log(req.user.token);
    res.redirect(`${process.env.FE_URL}?accessToken=${req.user.token}`)
  } catch (error) {
    next(error);
  }
})

export default loginRouter;
