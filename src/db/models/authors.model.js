import mongoose from "mongoose";
import bcrypt from "bcrypt";


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
  },
  avatar: {
    type: String,
  },
  password: {
    type: String, 
  },
  googleId: {
    type: String
  },
  role: {
    type: String, default: "User", enum: ["User", "Admin"]
  }
},
{timestamps: true}
);


authorSchema.pre("save", async function (next) {
  const newAuthor = this;
  const authorPassword = newAuthor.password;

  // If on document level, the password field is modified of author
  // 
  if(newAuthor.isModified("password")) {
    // Generate hash from newly created author.
    // Before hashing, salt (random text?) is prepended to the actual password
    // Second argument of the hash function is the rounds (how many times/cycles the algorithm is run for this specific salt+password string?)
    // The higher the number, more CPU intensive process it is to do(? I guess so).
    // Hashing time grows exponentially as the number of rounds grows.
    // Hmm, is there at the moment some "sweet spot", recommendation on how many rounds to use? Maybe check later if so.
    const hash = await bcrypt.hash(authorPassword, 10);

    // Finally, password field of author document is updated with the hash value before the actual .save() method is used to save the document within Database.
    newAuthor.password = hash;
  }
})

// Some notes:
// It seems that Sequelize (v4) also has similar way to accomplish this
// User.prototype.toJSON = function() {}
// This method, in overall, allows us to be sure that from operations on database on author, password is not returned never within the response

authorSchema.methods.toJSON = function() {
  const authorDocument = this;
  const author = authorDocument.toObject();
  delete author.password;
  delete author.__v;

  return author;
}


authorSchema.statics.checkCredentials = async function checkCredentials(email, plainTextPassword) {
  const author = await this.findOne({ email });

  if(author) {
    const isPwdMatch = await bcrypt.compare(plainTextPassword, author.password);
    if(isPwdMatch) {
      return author;
    } else {
      // When we return null, within the request response we should not specify if the password or email is specifically wrong. Better to respond that in overall credentials provided are wrong.
      return null;
    }
  } else {
    // When we return null, within the request response we should not specify if the password or email is specifically wrong. Better to respond that in overall credentials provided are wrong.
    return null;
  }
}


const AuthorModel = mongoose.model("author", authorSchema);
export default AuthorModel;