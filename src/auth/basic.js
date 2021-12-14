import createHttpError from "http-errors";
import atob from "atob";
import AuthorModel from "../db/models/authors.model.js";

export default async function basicAuth(req,res,next) {
  if(req.headers.authorization) {
    // We want only the base64 encoded string from the overall authorization header value
    const base64Credentials = req.headers.authorization.split(" ")[1];
    // Decode to string form from base64
    const decodedCredentials = atob(base64Credentials)

    // After decoding the base64, the string looks like,
    // "email:password"
    // Hence, we need to split by the colon in order to get email & password
    const [email, password] = decodedCredentials.split(":");


    // Use static method of Author model to check credentials:
    const author = await AuthorModel.checkCredentials(email, password);

    if(author) {
      req.user = author;
      next();
    } else {
      next(createHttpError(401, "Please, check credentials again."));
    }
  } else {
    next(createHttpError(401, "Please, log in."));
  }
}

/**
 * Overall flow
 * 1. basicAuth as middleware function, handles the authentication.
 * Check the credentials. Can request proceed or not?!
 * 
 * 2. Within middleware, we are expecting to receive authorization header.
 * Header should contain value, eg.
 * "Basic c3RlZmFub0BtaWNlbGkuY29tOnN0ZWZhbm8xMjM="
 * This is base64 encoded value from email and password together
 * 
 * If authorization header is found:
 * 
 * We decode the base64 to string and extract email and password from it
 * Values are separated by ":" after decoding the base64 value
 * 
 * Provided email is checked against database
 * If email is found, then the provided password is checked against the
 * password stored within the database.
 * 
 * Here we use compare method of bcrypt.
 * First argument is the provided password, which was decoded to string form.
 * Second argument is the database password in hash form.
 * 
 * IF password after hashing is same as the database password,
 * next() function is called. 
 * Request can move forward eg. to another middleware for handling or to controller function which might do some magic on the database level.
 * 
 * IF there is no authorization header
 * Create HTTP error:
 * Status code will be 401, Unauthorized
 * "indicates that the client request has not been completed because
 * it lacks valid authentication credentials for the requested resource."
 * 
 * IF authorization header exists
 * checkCredentials function will search for author/user from database
 * IF not found - return null.
 * 
 * IF author/user is found - check provided password against hashed password
 * found from the author/user document.
 * 
 * IF passwords do not match -  return null.
 * 
 * *****
 * In overall, if author/user not found with provided email
 * OR
 * password does not match with author/user password within database
 * 
 * Return null.
 * *****
 * 
 * It seems to be good practise to reveal as little as possible
 * Hence do not reveal if problem is with email or password
 * Always generic response, credentials are wrong etc.
 * 
 */