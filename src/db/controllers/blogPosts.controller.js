import {validationResult} from "express-validator";
import createHttpError from "http-errors";
import { pipeline } from "stream";
import getPDFReadableStream from "../../lib/pdf-tools.js";
import axios from "axios";
import striptags from "striptags";
import sendAuthorEmail from "../../lib/email-tools.js";
import BlogModel from "../models/blogPosts.model.js";
import query2mongo from "query-to-mongo";




export async function getAllPosts(req,res,next) {
  try {
    // Implement some query options:
    // TODO: Read from the package documentation how to implement SQL LIKE style queries, "%something", "%something%", "something%"
    // Seems to work for category & title when exact match at the moment.
    console.log(query2mongo(req.query));
    const mongoQuery = query2mongo(req.query);
    const total = await BlogModel.countDocuments(mongoQuery.criteria);
    const results = await BlogModel.find(mongoQuery.criteria, {
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    })
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.offset)
      .sort(mongoQuery.options.sort)
      .populate({path: "author likes", select: "name surname"})

    if(results.length) {

      res.send({
        // If no limit within query, do not show links: null
        ...(mongoQuery.options.limit && {links: mongoQuery.links("/blogPosts", total)}),
        // Same thing with pageTotal:
        ...(mongoQuery.options.limit && {pageTotal: Math.ceil(total / mongoQuery.options.limit)}),
        total: total,
        results: results,
      });
    } else {
      res.send({message: "No results found."});
    }
    /* // Get all blog posts
    // Second argument for sort - exclude(?):
    const allPosts = await BlogModel.find({},{createdAt: 0, updatedAt: 0, __v: 0});
    // What if I filter by something and want to count then returned results?
    // Provide the same filters as an argument? 
    const count = await BlogModel.countDocuments();
    if(allPosts.length) {
      res.send({total: count, data: allPosts});
    } else {
      next(createHttpError(404, "No Posts found."))
    } */
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function getPostById(req,res,next) {
  try {
    const blogPost = await BlogModel.findById(req.params.id, {
      updatedAt: 0,
      __v: 0,
    })
    .populate({ path: "author likes", select: "name surname" });
    
    if (blogPost) {
      res.send({...blogPost.toObject(), totalLikes: blogPost.likes.length});
    } else {
      next(
        createHttpError(404, `No blog post found with an id: ${req.params.id}`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function downloadPDF(req,res,next) {
  try {
    res.setHeader("Content-Disposition", `attachment; filename=Blog_${req.params.id}.pdf`);

    // Fetch blog information
    const blogPost = BlogModel.findById(req.params.id);

    // From the homework solution:
    if(blogPost.cover) {
      // Example url from cloudinary:
      /* 
      https://res.cloudinary.com/dmhtbvfbg/image/upload/v123456789/strive-blog/loremipsumlorem.png 
      */

      // I guess with responseType - expect response in arraybuffer(?):
      const response = await axios.get(blogPost.cover, {
        
        responseType: "arraybuffer",
      })
      // Split url to parts, where "/" is found:
      const blogCoverURLParts = blogPost.cover.split("/");
      // From blogCoverURLParts array, 
      // the fileName would be loremipsumlorem.png:
      const fileName = blogCoverURLParts[blogCoverURLParts.length - 1];
      // Latter part gives the extension name:
      //const [id,extension] = fileName.split(".");
      // Just my own try with slice..
      const extension = fileName.slice(fileName.indexOf(".")+1);
      // Data(binary?) is transformed into string format and encoding is base64?
      const base64 = response.data.toString("base64");
      // Finally, base64 image contains: MIME-type;base64;base64 encoded string?
      const base64image = `data:image/${extension};base64,${base64}`;
      // Set as an object, as image needs to be included within object:
      blogPostImage = {image: base64image, width: 500};
    }

    // Provide for getPDFReadableStream the content to format into pdf:
    // TODO: find out later how to center text?
    const content = [
      blogPostImage,
      {text: blogPost.title, fontSize: 20, bold: true, margin: [0,0,0,40]},
      {text: striptags(blogPost.content), lineHeight: 4}, 
      {text: `Author - ${blogPost.author.name}`}, 
      {text: `Read time: ${blogPost.readTime.value} ${blogPost.readTime.unit}`},
      {text: `Date: ${blogPost.createdAt.slice(0,10)}`}
    ];

    const source = getPDFReadableStream(content);
    const destination = res;

    pipeline(source, destination, (error) => {
      if (error) {
        next(error);}
    });

  } catch (error) {
    next(error);
  }
}

export async function postBlogPost(req,res,next) {
  try {
    // Handle validationResult accordingly
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    }
    // Create new blog post:
    const newBlogPost = new BlogModel(req.body);
    const {_id} = await newBlogPost.save();

    // Send author an email:
    //sendAuthorEmail(req.body.email);
    // Find out later if email necessary when posting a blog post anymore.
    
    res.status(201).send({_id});
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function addLike(req,res,next) {
  try {
    const blogPost = await BlogModel.findByIdAndUpdate(
      { _id: req.params.id },
      // $addToSet seems to be here the magic operator,
      // to make sure that no duplicate likes come from authors
      // ...why would any author like more than once?
      // I could be wrong here with usage of $addToSet instead of $push here
      // https://stackoverflow.com/questions/15921700/mongoose-unique-values-in-nested-array-of-objects
      // TODO: check later information on $addToSet.

      { $addToSet: { likes: req.params.authorId } },
      { new: true }
    );

    // Should there be error implementation if trying to like twice? I guess not, just ignore the request on database level..(?)
    if(blogPost) {
      res.send(blogPost)
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function deleteLike(req,res,next) {
    // CLicks unlike - DELETE REQUEST..
    const blogPost = await BlogModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $pull: {likes: req.params.authorId} },
      {new: true}
    )
    if(blogPost) {
      res.send(blogPost);
    }
}


export async function getComments(req,res,next) {
  try {
    // Get blogPost document by id
    const blogPost = await BlogModel.findById(req.params.id);
    // If blogPost document found:
    if (blogPost) {
      // Send only comments, array:
      if(blogPost.comments.length) {
        res.send({total: blogPost.comments.length, comments: blogPost.comments});
      } else {
        res.send({message: "No comments available for blog post."});
      }
    } else {
      next(
        createHttpError(404, `No blog post found with an id:${req.params.id}`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  } 
}

export async function addComment(req,res,next) {
  try {
    // Handle validationResult accordingly
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    }

    // With projection, {_id:0} we do not return the blog _id.
    // This will helps to create unique comment id.
    // Otherwise the blog _id will be used as an _id for every comment.
    // Hence, this would make it possible to identify single comment for editing or deleting.
    const blogPost = await BlogModel.findById(req.params.id, { _id: 0 });
    if (blogPost) {
      // Create comment, add commentDate property.
      const commentToInsert = { ...req.body, commentDate: new Date() };
      // Update blogPost with .findByIdAndUpdate
      // $push will, well, push to the comments array this new comment.
      const updatedBlogPost = await BlogModel.findByIdAndUpdate(
        req.params.id,
        { $push: { comments: commentToInsert } },
        { new: true }
      );

      if (updatedBlogPost) {
        res.send(updatedBlogPost);
      } else {
        next(createHttpError(500));
      }
      res.send();
    } else {
      next(
        createHttpError(404, `No blog post found with an id:${req.params.id}`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function getComment(req,res,next) {
  try {
    // Find blogPost by id:
    const blogPost = await BlogModel.findById(req.params.id);

    if(blogPost) {
      // Find the comment with id:
      // Remember! blogPost is not a plain object and _id property is ObjectId
      // ObjectId - If I understand correctly, it is datatype of BSON:
      // https://www.mongodb.com/developer/quickstart/bson-data-types-objectid/

      // In order to find the comment, we need to use .toString() method.
      const comment = blogPost.comments.find(
        (comment) => comment._id.toString() === req.params.commentId
      );
      if (comment) {
        res.send(comment);
      } else {
        next(
          createHttpError(
            404,
            `No comment found with comment id: ${req.params.commentId}`
          )
        );
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function updateComment(req,res,next) {
  try {
    const blogPost = await BlogModel.findById(req.params.id);
    // Remember here again that returned document is not a plain object.
    // In order to compare _id (ObjectId), we need to use .toString() method.
    const index = blogPost.comments.findIndex(comment => comment._id.toString() === req.params.commentId);

    // Here we need to use .toObject() method to turn document into plain object(?)
    // TODO: read maybe later more about BSON datatypes.
    blogPost.comments[index] = {...blogPost.comments[index].toObject(), ...req.body};

    await blogPost.save();
    res.send(blogPost.comments[index]);
  } catch (error) {
    console.log(error);
    next(error);
  }
}


export async function deleteComment(req,res,next) {
  try {
    // $pull operator here operates on arrays
    // for $pull we provide the array, comments, in this case.
    // Provide also 'target', _id to match the comment id
    // If found, it is pulled off from the comments array of Blogpost document.
    const modifiedBlog = await BlogModel.findByIdAndUpdate(
      req.params.id,
      {$pull: {comments: {_id: req.params.commentId}}},
      {new: true} // I guess not needed since this is about deletion
    )
    if (modifiedBlog) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `No blog post found with an id:${req.params.id}`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  } 
}

export async function updateBlogCover(req,res,next) {
  try {
    const imageUrl = req.file.path;
    const editedBlogPost = await BlogModel.findByIdAndUpdate(
      req.params.id,
      {cover: imageUrl},
      {new: true}
    )
    if(editedBlogPost) {
      res.status(201).send({ status: "Blog post cover uploaded successfully."});
    } else {
      next(createHttpError(400, `Blog not found by id: ${req.params.id}`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function updateBlogPost(req,res,next) {
  try {
    const id = req.params.id;
    const informationToUpdate = req.body;
    const updatedUser = await BlogModel.findByIdAndUpdate(id, informationToUpdate, {new: true});

    if(updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `Blog post with id: ${id} not found.`));
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
}

export async function deleteBlogPost(req,res,next) {
  try {
    const deletedBlogPost = await BlogModel.findByIdAndDelete(req.params.id);
    if(deletedBlogPost) {
      res.status(204).send();
    } else {
      next(createHttpError(404, "Blog post not found."))
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

