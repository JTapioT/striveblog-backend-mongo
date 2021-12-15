import jwt from "jsonwebtoken";

function generateJWToken(payload) {

  function signToken(resolve, reject) {
    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "15m"}, (error,token) =>{
    if(error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  }

  return new Promise(signToken);
}

export async function AuthenticateWithToken(user) {
  const accessToken = await generateJWToken({_id: user._id})
  return accessToken;
}

export function verifyJWToken(token) {
  function verifyToken(resolve, reject) {
    jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
      if(error) {
        reject(error);
      } else {
        resolve(decodedToken);
      }
    })
  }

  return new Promise(verifyToken);
}