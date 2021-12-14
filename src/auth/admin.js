import createHttpError from "http-errors";


export default function adminAuth(req,res,next) {
  console.log(req.user);
  if(req.user.role === "Admin") {
    // Author role is admin
    next();
  } else {
    // HTTP 403 is returned when the client is not permitted access to the resource despite providing authentication such as insufficient permissions of the authenticated account.
    next(createHttpError(403, "Not permitted to access the resource."));
  }
}