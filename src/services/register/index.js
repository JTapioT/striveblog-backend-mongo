import express from "express";
import sendRegistrationEmail from "./requestHandler";

// Router
const registerRouter = express.Router();

registerRouter.post("/register", async (req, res, next) => {
  try {
    const {email, firstName, lastName} = req.body;
    // Provide as argument the information from request body
    await sendRegistrationEmail(email, firstName, lastName);
    res.send({message: "success"});
  } catch (error) {
    next(error);
  }
});


// USE THIS MAYBE LATER - Even for author registration? Haven't implemented it yet as it seems.