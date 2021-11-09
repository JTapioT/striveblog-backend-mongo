import express from 'express';
import listEndpoints from 'express-list-endpoints';
import cors from 'cors';
import authorsRouter from './services/authors/index.js';
import blogPostsRouter from './services/blogPosts/index.js';
import { badRequestHandler, notFoundHandler, genericErrorHandler } from './errorHandlers.js';
import mongoose from 'mongoose';

//import {join} from 'path';

// Public folder path - static files
//const authorImagesFolderPath = join(process.cwd(), "./public/img/authors");
//const blogImagesFolderPath = join(process.cwd(), "./public/img/blogPosts")


// Invoke function express() - Object returned with many methods to use.
const server = express();

// Global middleware
//server.use(express.static(publicFolderPath));
const whitelist = [process.env.FE_LOCAL_URL, process.env.REACT_APP_FE_PROD_URL]
const corsOptions = {
  origin: function (origin, callback) {
    //console.log("Current origin: ", origin);
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error({ status: 500, message: "CORS ERROR" }));
    }
  },
};
server.use(cors(corsOptions)); // Next week, deep dive to CORS!
server.use(express.json());

// Endpoints
server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);
// Woah, exceeding even my own expectations about what I can do by reading from inter-webs:
// Serve static files from endpoint /authorImages:
//server.use("/authorImages", express.static(authorImagesFolderPath));
// Serve static files from endpoint /blogImages:
//server.use("/blogImages", express.static(blogImagesFolderPath))

// Error handling middleware
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);



const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  server.listen(PORT, () => {
    console.table(listEndpoints(server));
    console.log("Server is running on port:", PORT);
  });
})


export default server;
