export const unauthorizedHandler = (err, req,res, next) => {
  if(err.status === 401) {
    res.status(401).send({status: "error", message: err.message || "You are not logged in"})
  } else {
    next(err);
  }
}

export const forbiddenHandler = (err,req,res,next) => {
  if(err.status === 403) {
    res.status(403).send({status: "error", message: err.message || "Not permitted to access the resource."})
  } else {
    next(err);
  }
}

export const duplicateEmailHandler = (err, req,res,next) => {
  if(err.status === 409) {
    res.status(409).send({status: "error", message: err.message ||"Email already exists."})
  } else {
    next(err);
  }
}

export const badRequestHandler = (error, req, res, next) => {
  console.log(error.errorsList);
  if (error.status === 400) {
    res.status(400).send({ message: error.errorsList });
  } else {
    next(error);
  }
};

export const notFoundHandler = (error, req, res, next) => {
  if (error.status === 404) {
    res
      .status(404)
      .send({ message: error.message || "Resource not found!"});
  } else {
    next(error);
  }
};

export const genericErrorHandler = (error, req, res, next) => {
  console.log("Generic server error: ", error);
  res.status(500).send({ message: "Generic Server Error" });
};


// After routes we have error handlers
// Four parameters, error-first
// Authentication - check credentials 
// Authorization - check if allowed to proceed with request to CRUD resource

