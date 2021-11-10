import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const cloudinaryAvatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogAuthors",
  },
});

const cloudinaryBlogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogImages",
  },
});

/* 

I don't know exactly how multer works behind the scenes but apparently by running function multer.single(key) -> A function is being returned.

This returned function accepts the usual req,res, err as arguments.

if(err instance of multer.MulterError) - this part especially makes me go even more bald as I don't know how it works, but it works. Taken from documentation pages of multer.

*/

export function uploadAvatarImageToCloud(req, res, next) {
  const upload = multer({ storage: cloudinaryAvatarStorage }).single("avatar");
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      throw new Error(err);
    } else {
      next();
    }
  });
}

export function uploadBlogImageToCloud(req, res, next) {
  const upload = multer({ storage: cloudinaryBlogStorage }).single("cover");
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      throw new Error(err);
    } else {
      next();
    }
  });
}


