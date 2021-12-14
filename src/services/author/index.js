import express from "express";
import basicAuth from "../../auth/basic.js";

const authorRouter = express.Router();
authorRouter.use(basicAuth);

authorRouter
  .route("/")
  .get(async (req, res, next) => {
    try {
      res.send(req.user);
    } catch (error) {
      console.log(error);
      next(error);
    }
  })
  .put(async (req, res, next) => {
    try {
      // I need to add also some validation whenever user wants to update own information?
      // I guess Database will throw an error if extra field is tried to update or value(s) provided for fields are wrong etc.

      // Request body is an object
      // Iterate over the values of the object and update the value for req.user
      // Then save.

      const updateInfo = Object.entries(req.body);
      // Returns array nested with arrays, which contain key and value
      // Eg. [[key, value], [key, value]]

      updateInfo.forEach(([key,value]) => {
        req.user[key] = value;
      })
      
      await req.user.save();
      res.send(req.user);
    } catch (error) {
      console.log(error);
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      await req.user.delete();
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

  export default authorRouter;