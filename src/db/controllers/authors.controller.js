import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import pipeline from "stream";
import json2csv from "json2csv";
import AuthorModel from "../models/authors.model.js";
import { Readable } from "stream";
import { Buffer } from "buffer";


export async function getAuthors(req,res,next) {
    try {
      const authors = await AuthorModel.find();
      const count = await AuthorModel.countDocuments();
      if (authors.length) {
        res.send({total: count, data: authors});
      } else {
        next(createHttpError(404, "No authors to show."));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
}

export async function getAuthorsCSV(req,res,next) {
  try {
    // Set header and filename for csv file.
    res.setHeader("Content-Disposition", "attachment; filename=authors.csv");
    
    const transform = new json2csv.Transform({fields: ["name", "surname", "email"]});
    const destination = res;

    // MANY TRIES. NO LUCK. WILL RETURN ONLY THE FIRST.
    // I THINK I NEED HERE ITERATOR FUNCTION? YIELD NEXT CHUNK ASYNCHRONOUSLY OR SOMETHING.

    AuthorModel.find().cursor().on("data", function(doc) {
      let buffer = Buffer.from(JSON.stringify(doc));
      Readable.from(buffer).pipe(transform).pipe(destination);
    })
  
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function getAuthorById(req,res,next) {
  try {
    const author = await AuthorModel.findById(req.params.id);

    if (author) {
      res.send(author);
    } else {
      next(
        createHttpError(404, `No author found with an id: ${req.params.id}`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

// TODO: Later.
export async function getAuthorBlogPosts(req,res,next) {
  /*
  try {
     // Read authors.json
    const authors = await getAuthorsJSON();
  
    // Find author from authors by id which is provided with request params
    const author = authors.find(
      (author) => author.id === parseInt(req.params.id)
    );
  
    // Handle non-existing author by requested id
    if (!author) {
      next(createHttpError(404, `No author found with an id: ${req.params.id}`));
    } else {
      // Filter blogPosts by author name? 
      const blogPosts = await getBlogPostsJSON();
      const postsByAuthor = blogPosts.filter(blogPost => blogPost.author.name === author.name);
      res.send(postsByAuthor);
    }

  } catch(error) {
    next(error);
  } */
}

export async function newAuthor(req,res,next) {
  try {
    // Handle validationResult accordingly
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    }

    const createdAuthor = new AuthorModel(req.body);
    const { _id } = await createdAuthor.save();

    res.send({_id});
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function updateAuthorAvatar(req,res,next) {
  try {
    const imageUrl = req.file.path;
    const editedAuthor = await AuthorModel.findByIdAndUpdate(
      req.params.id,
      {avatar: imageUrl},
      {new: true}
    );
    if(editedAuthor) {
      res.send({status: "Author avatar image uploaded successfully."});
    } else {
    next(createHttpError(400, `Author not found by id: ${req.params.id}`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}


export async function editAuthor(req,res,next) {
  try {
    const editedAuthor = await AuthorModel.findByIdAndUpdate(
      req.params.id, // Author id
      req.body, // Request body - Information to update
      {new: true} // Return updated information about the author.
    );
    if(editedAuthor) {
      res.send(editedAuthor);
    } else {
      next(createHttpError(400, `Author not found by id: ${req.params.id}`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function deleteAuthor(req,res,next) {
  try {
    const deletedUser = await AuthorModel.findByIdAndRemove(req.params.id);
    if(deletedUser) {
      res.status(204).send();
    } else {
      next(createHttpError(400, `Author not found by id: ${req.params.id}`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}
