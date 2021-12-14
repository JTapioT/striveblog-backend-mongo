import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId, ref: "author"
  },
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
    required: true,
  },
  readTime: {
    type: Object,
    required: true,
    nested: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
      }
    }
  },
  content: {
    type: String,
    required: true,
  },
  comments: [
    {
      name: {type: String},
      comment: {type: String},
      commentDate: {type: Date}
    }
  ],
  likes: [{type: mongoose.Schema.Types.ObjectId, ref: "author"}]
}, {timestamps: true});


const BlogModel = mongoose.model('blogPost', blogPostSchema);
export default BlogModel;