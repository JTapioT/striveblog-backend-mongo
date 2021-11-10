import express from 'express';
import listEndpoints from 'express-list-endpoints';
import cors from 'cors';
import authorsRouter from './services/authors/index.js';
import blogPostsRouter from './services/blogPosts/index.js';
import { badRequestHandler, notFoundHandler, genericErrorHandler } from './errorHandlers.js';
import mongoose from 'mongoose';


const server = express();


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

// Global middleware
server.use(cors(corsOptions));
server.use(express.json());

// Routes
server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);

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
