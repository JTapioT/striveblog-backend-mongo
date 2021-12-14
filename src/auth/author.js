import createHttpError from "http-errors";

export default function authorAuth(req, res, next) {
  console.log(req.user);
  if (req.user._id === req.params.) {
    // Author role is admin
    next();
  } else {
    //
    next(createHttpError(403, "Not permitted to access the resource."));
  }
}
