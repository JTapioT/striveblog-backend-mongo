import mongoose from "mongoose";

// I wonder if good idea to index emails. Or better to make query within express-validator for example with custom function??

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  avatar: {
    type: String,
  }
},
{timestamps: true}
);

const AuthorModel = mongoose.model("author", authorSchema);
export default AuthorModel;