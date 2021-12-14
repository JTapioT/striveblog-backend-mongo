import createHttpError from "http-errors";


export default function adminAuth(req,res,next) {
  console.log(req.user);
  if(req.user.role === "Admin") {
    // Author role is admin
    next();
  } else {
    // 
    next(createHttpError(403, "Not permitted to access the resource."));
  }
}

/**
 * Overall flow
 * adminAuth middleware function is meant to handle authorization
 * Ok, we know that the request is authenticated but should we restrict
 * access to resources or possibility to edit resources.
 * What resources specifically?
 * Should request to resources mean that access is provided only to 
 * authenticated user's own resources. 
 * Also the CRUD operations only allowed to own resources?
 * 
 * With the use of this function, we check if user role is certain.
 * If the user role (found within request.user) is admin in this case:
 * We call next() function. 
 * Request is allowed to proceed to another middleware for processing or
 * maybe controller function where some magic might happen on the database level.
 * 
 * If authenticated user role is not admin in this case, we want to run next function and provide http error as the argument for the function.
 * Response status will be 403:
 * "HTTP 403 is returned when the client is not permitted access to the 
 * resource despite providing authentication such as insufficient permissions
 * of the authenticated account."
 */