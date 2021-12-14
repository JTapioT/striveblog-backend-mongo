import createHttpError from "http-errors";
import atob from "atob";
import AuthorModel from "../db/models/authors.model.js";

export default async function basicAuth(req,res,next) {
  // Within request headers, there should be authorization header
  // Authorization header value should be eg.
  // "Basic c3RlZmFub0BtaWNlbGkuY29tOnN0ZWZhbm8xMjM="
  // Remember, this is not a hash eventhough it looks like one
  // It is base64 encoded version of eg. email and password!

  //1. Check that authorization header is included within the request
  // If included:
  // Decode to string form the base64
  // Use static method of authors Model to check the credentials
  if(req.headers.authorization) {
    console.log("WENT HERE FOR AUTHORIZATION");
    // We want only the base64 encoded string from the overall authorization header value

    const base64Credentials = req.headers.authorization.split(" ")[1];
    //console.log(base64Credentials);
    // Decode to string form from base64
    const decodedCredentials = atob(base64Credentials)

    // After decoding the base64, the string looks like,
    // "email:password"
    // Hence, we need to split by the colon in order to get email & password
    const [email, password] = decodedCredentials.split(":");

    console.log("Password: ", password);

    // Use static method of Author model to check credentials:
    const author = await AuthorModel.checkCredentials(email, password);

    if(author) {
      // Author is found (author with email found) and also the credentials match (password matches the hashed one after running bcrypt.compare())
      // Attach new property to the request, which contains the information about the author/user logged in.
      req.user = author;
      next();
    } else {
      console.log("WENT HERE!!");
      // User was not either found or password does not match
      // 401 - Unauthorized
      // "indicates that the client request has not been completed because it lacks valid authentication credentials for the requested resource."
      next(createHttpError(401, "Credentials are wrong."));
    }
  } else {
    next(createHttpError(401, "Please, log in."));
  }
}