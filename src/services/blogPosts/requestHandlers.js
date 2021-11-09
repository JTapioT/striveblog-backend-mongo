import { getBlogPostsJSON, writeBlogPostsJSON, saveCoverImages } from "../../lib/fs-tools.js";
import {validationResult} from "express-validator";
import createHttpError from "http-errors";
import uniqid from "uniqid";
import { pipeline } from "stream";
import getPDFReadableStream from "../../lib/pdf-tools.js";
import axios from "axios";
import striptags from "striptags";
import sendAuthorEmail from "../../lib/email-tools.js";
import BlogModel from "../../db/models/blogPosts.model.js";

// MONGO IS FUN!

export async function getAllPosts(req,res,next) {
  try {
    // Get all blog posts
    const allPosts = await BlogModel.find({},{createdAt: 0, updatedAt: 0, __v: 0});
    const count = await BlogModel.countDocuments();
    if(allPosts.length) {
      res.send({total: count, data: allPosts});
    } else {
      next(createHttpError(404, "No Posts found."))
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function getPostById(req,res,next) {
  try {
    const blogPost = await BlogModel.findById(req.params.id, {
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    });
    if (blogPost) {
      res.send(blogPost);
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
    const blogPosts = await getBlogPostsJSON()
    const blogPost = blogPosts.find((blogPost) => blogPost._id === req.params.id);

    // From the homework solution:
    let blogPostImage;
    if(blogPost.cover) {
      // Example url from cloudinary:
      /* 
      https://res.cloudinary.com/dmhtbvfbg/image/upload/v123456789/strive-blog/loremipsumlorem.png 
      */

      // I guess with responseType - expect response in arraybuffer(?):
      const response = await axios.get(blogPost.cover, {
        // KOKEILE ILMAN
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

    res.status(201).send({_id});
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function getPostComments(req,res,next) {
  try {
    // Get all blog posts
    const blogPosts = await getBlogPostsJSON();
  
    // Blog post by id:
    const blogPost = blogPosts.find((blogPost) => blogPost._id === req.params.id);
  
    // If found by id, send response
    // If not, create an error with status 404, including message.
    if (blogPost) {
      res.send(blogPost.comments);
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
    // Get all blog posts
    const blogPosts = await getBlogPostsJSON();
  
    // Blog post by id:
    const blogPost = blogPosts.find((blogPost) => blogPost._id === req.params.id);
  
    if (blogPost) {
      // Edit comments array:
      let editedBlogPostComments = [
        ...blogPost.comments,
        { id: uniqid(), name: req.body.name, message: req.body.message },
      ];
      // Overwrite existing comments array of blog post:
      blogPost.comments = editedBlogPostComments;
  
      let index = blogPosts.findIndex(
        (blogPost) => blogPost._id === req.params.id
      );
      // Overwrite existing blogPost
      blogPosts[index] = blogPost;
      // Overwrite blogPosts.json
      await writeBlogPostsJSON(blogPosts);
  
      res.send({ status: "success", message: req.body.message });
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

export async function deletePostComment(req,res,next) {
  try {
    // Get all blog posts
    const blogPosts = await getBlogPostsJSON();
  
    // Blog post by id:
    const blogPost = blogPosts.find((blogPost) => blogPost._id === req.params.id);
  
    if (blogPost) {
      // Filter
      let currentComments = blogPost.comments.filter(
        (comment) => comment.id !== req.params.commentId
      );
  
      console.log(currentComments);
  
      // Overwrite existing comments array of blog post:
      blogPost.comments = currentComments;
  
      let index = blogPosts.findIndex(
        (blogPost) => blogPost._id === req.params.id
      );
      // Overwrite existing blogPost
      blogPosts[index] = blogPost;
      // Overwrite blogPosts.json
      await writeBlogPostsJSON(blogPosts);
  
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

export async function uploadBlogPostCoverImg(req,res,next) {
  try {
    //const fileExtension = extname(req.file.originalname);
    //const fileName = `${req.params.id}${fileExtension}`;
    //console.log(fileName);
  
    //await saveCoverImages(fileName, req.file.buffer);
    
    // Update blogPost cover accordingly:
    let blogPosts = await getBlogPostsJSON();
    let index = blogPosts.findIndex((blogPost) => blogPost._id === req.params.id);
    
    let editedBlogPost = {
      ...blogPosts[index],
      cover: req.file.path,
    };
    
    blogPosts[index] = editedBlogPost;
    await writeBlogPostsJSON(blogPosts);

    console.log("HERE IS THE FILE PATH")
    console.log(req.file.path);
    
    res.status(201).send({ status: "success" });
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

