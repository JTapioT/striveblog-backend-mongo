import passport from "passport"
import GoogleStrategy from "passport-google-oauth20";
import AuthorModel from "../db/models/authors.model.js";
import { AuthenticateWithToken } from "./tools.js";

const googleCloudStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_OAUTH_ID,
    clientSecret: process.env.GOOGLE_OAUTH_SECRET,
    callbackURL: `${process.env.API_URL}/login/googleRedirect`,
  },
  async (accessToken, refreshToken, profile, passportNext) => {
    try {
      // author/user in same sense.
      const user = await AuthorModel.findOne({ googleId: profile.id });
      if (user) {
        // Returns access token:
        // TODO: Implement with refreshToken also
        const token = await AuthenticateWithToken(user);
        passportNext(null, { token });
      } else {
        const newUser = new AuthorModel({
          name: profile.name.givenName,
          surname: profile.name.familyName,
          email: profile.emails[0].value, 
          // Hmm, so there could be also linked gmail emails among the results? First one is the one which was used to authenticate?
          googleId: profile.id,
        });

        const savedNewUser = await newUser.save();
        const token = await AuthenticateWithToken(savedNewUser);

        passportNext(null, { token });
      }
    } catch (error) {
      passportNext(error);
    }
  }
);

passport.serializeUser(function (data, passportNext) {
  passportNext(null, data);
  // Provides within request now the information, eg. tokens.
  // Without it there would be no possibility to have access to token(s)
  // within next in the chain, eg. controller function
})

export default googleCloudStrategy;