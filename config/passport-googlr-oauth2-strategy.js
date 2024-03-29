const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User  = require('../models/user');
const env = require('./environment');

//tell passport to use a new strategy for google login
passport.use(new googleStrategy({
        clientID:env.google_client_id,
        clientSecret:env.google_client_secret,
        callbackURL:env.google_call_back_url,
        
    },
    async function(accessToken,refreshToken,profile,done){
        try{
            // console.log(accessToken,refreshToken);
            // console.log(profile);
            //find a user
            let user =  await User.findOne({email:profile.emails[0].value}).exec();
            
                
                if(user){
                    //if found, set this user as req.user
                    return done(null,user);
                }else{
                    //if not found, create the user and set it as req.user
                    User.create({
                        name:profile.displayName,
                        email:profile.emails[0].value,
                        password:crypto.randomBytes(20).toString('hex')
                    })
                    .then(user=>{
                        return done(null,user);
                    })
                    .catch(err=>{
                        console.log("Error in google strategy passport",err);
                        return;
                    });
                }

        }catch(err){
            console.log("Error in creating user google strategy passport",err);
            return;
        }
        
                 
        }));
        
module.exports = passport;
