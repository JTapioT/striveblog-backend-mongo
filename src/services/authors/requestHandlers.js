import {getAuthorsReadableStream, getAuthorsJSON, writeAuthorsJSON, saveAvatarImages, getBlogPostsJSON} from "../../lib/fs-tools.js";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import uniqid from "uniqid";
import { extname } from "path";
import { pipeline } from "stream";
import json2csv from "json2csv";

export async function getAuthors(req,res,next) {
    try {
      // Get authors, [{},{}..]
      const authors = await getAuthorsJSON();
      // Handle possible situation where we don't have any authors?
      if (!authors.length) {
        next(createHttpError(404, "No authors to show."));
      } else {
        res.send(authors);
      }
    } catch (error) {
      next(error);
    }
}

export async function getAuthorsCSV(req,res,next) {
  try {
    // Set header and filename for csv file.
    res.setHeader("Content-Disposition", "attachment; filename=authors.csv");
    // Create read stream for authors.json file
    const source = getAuthorsReadableStream();
    // Transform stream of data to csv. Include certain fields
    const transform = new json2csv.Transform({fields: ["name", "surname", "email"]});
    const destination = res;
    // Pipeline to handle the overall stream?
    pipeline(source, transform, destination, error => {if(error) {
    console.log("Error with json to csv: ", error); 
    next(error)}})
  } catch (error) {
    next(error);
  }
}

export async function getAuthorById(req,res,next) {
  try {
    // Read authors.json
    const authors = await getAuthorsJSON();

    // Find author from authors by id which is provided with request params
    const author = authors.find(
      (author) => author.id === parseInt(req.params.id)
    );

    // Handle non-existing author by requested id
    if (!author) {
      next(
        createHttpError(404, `No author found with an id: ${req.params.id}`)
      );
    } else {
      // Send response
      res.send(author);
    }
  } catch (error) {
    next(error);
  }
}

export async function getAuthorBlogPosts(req,res,next) {
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
  }
}

export async function newAuthor(req,res,next) {
  
  try {
    // Handle validationResult accordingly
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    }

    // Read authors.json
    const authors = await getAuthorsJSON();

    // Create new author - add random id
    let newAuthor = {
      ...req.body,
      id: uniqid(),
      createdAt: new Date(),
      updatedAt: null
    };

    // Push new author to existing authors array
    authors.push(newAuthor);

    // Overwrite existing authors.json
    await writeAuthorsJSON(authors);

    // Send response
    res.status(201).send({ id: newAuthor.id });
  } catch (error) {
    next(error);
  }
}

export async function uploadAvatarImage(req,res,next) {
  try {
    const fileExtension = extname(req.file.originalname);
    const fileName = `${req.params.id}${fileExtension}`;
    //console.log(fileName);

    await saveAvatarImages(fileName, req.file.buffer);
    res.status(201).send({ status: "success" });
    // Update the author avatar accordingly within author information:
    let authors = getAuthors();
    let index = authors.findIndex(
      (author) => author.id === parseInt(req.params.id)
    );

    let editedAuthor = {
      ...authors[index],
      avatar: `http://localhost:3001/authorImages/${fileName}`,
    };
    authors[index] = editedAuthor;

    await writeAuthorsJSON(authors);
  } catch (error) {
    next(error);
  }
}

export async function checkForAlreadyExistingEmail(req,res,next) {
  try {
    const authors = await getAuthors();
    let response =
      authors.findIndex(
        (author) => author.email.toLowerCase() === req.body.email.toLowerCase()
      ) === undefined
        ? false
        : true;
    
    res.status(200).send({ value: response });
  } catch (error) {
    next(error);
  }
}

export async function editAuthor(req,res,next) {
  try {
    // Read authors.json
    const authors = await getAuthorsJSON();

    // Find index of an author within authors:
    let index = authors.findIndex(
      (author) => author.id === parseInt(req.params.id)
    );

    if (index === -1) {
      next(
        createHttpError(404, `No author found with an id: ${req.params.id}`)
      );
    } else {
      // Modify the existing author
      let editedAuthor = { ...authors[index], ...req.body };
      authors[index] = editedAuthor;

      // Overwrite authors.json
      await writeAuthorsJSON(authors);

      // Send response
      res.status(200).send(editedAuthor);
    }
  } catch (error) {
    next(error);
  }
}

export async function deleteAuthor(req,res,next) {
  try {
    // Read authors.json
    const authors = await getAuthors();

    // Filter out the author from authors
    let currentAuthors = authors.filter(
      (author) => author.id !== parseInt(req.params.id)
    );

    // Overwrite existing authors.json
    await writeAuthors(currentAuthors);

    // Send response
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
