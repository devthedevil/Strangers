const express = require('express');
const env = require('./config/environment');
const logger = require('morgan');

const cookieParser =require('cookie-parser');
const app = express();
require('./config/view-helpers')(app);
const port = 8000;
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
//used for session cookie 
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportJWT = require('./config/passport-jwt-strategy');
const passportGoogle = require('./config/passport-googlr-oauth2-strategy');
const MongoStore = require('connect-mongo');
const sassMiddleware = require('node-sass-middleware');
const flash = require('connect-flash');
const customWare = require('./config/middleware');


//setup the chat server to be used with socket.io
const chatServer = require('https').Server(app);
const chatSockets = require('./config/chat_sockets').chatSockets(chatServer);
chatServer.listen(5000);
console.log("chat server is listening on port 5000");
const path = require('path');



if(env.name == 'development')
{
    app.use(sassMiddleware({
        src:path.join(__dirname,env.asset_path,'scss'),
        dest:path.join(__dirname,env.asset_path,'css'),
        debug:true,
        outputStyle:'extended',
        prefix:'/css',
    
    }));
}


app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.use(express.static(env.asset_path));
//make the uploads path available to the browser
app.use('/uploads',express.static(__dirname+'/uploads'));

app.use(logger(env.morgan.mode,env.morgan.options));

app.use(expressLayouts);



//extract style and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);



//set up the view engine
app.set('view engine','ejs');
app.set('views','./views');

//mongo store is used to store the session cookie in the db

app.use(session({
    name:'codeial',
    //Todo change the secret before deployment in production mode
    secret:env.session_cookie_key,
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge:(1000*60*100)
    },
    store:new MongoStore(
        {
            mongooseConnection:db,
            autoRemove :'disabled',
            // mongoUrl:process.env.MONGODB_URI,
            mongoUrl: 'mongodb://localhost:27017/test-app',
        },
        function(err){
            console.log(err||'connect -mongo setup ok');
        }
    )
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customWare.setFlash);
//use express router
app.use('/',require('./routes/index'));

app.listen(port,function(err){
    if(err){
        // console.log('Error',err);
        console.log(`Error in running the server: ${err}`);
    }
    console.log(`Server is running on the port : ${port}`);
});
