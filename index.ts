'use strict';

const { MONGO_USER, MONGO_PASSWORD, MONGO_DB_NAME, PORT = 5000 } = process.env;

const env = require('./environment.json');
const cors = require('cors');
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import checkDbConnection from './src/helpers/check-db-connection';
const checkForAuthToken = require('./src/helpers/check-for-auth-token');
const wrongRouteHandler = require('./src/helpers/wrong-route');
const loginRequired = require('./src/helpers/login-required');

const signUpHandlerPost = require('./src/routes/auth/sign-up/sign-up');
const signInHandlerPost = require('./src/routes/auth/sig-in/sign-in');

const userDataHandlerGet = require('./src/routes/user/get-data/get-data');

// const refreshHandlerPost = require('./routes/post/refresh');
// const logoutHandlerPost = require('./routes/post/logout');

const app = express();

mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_DB_NAME}.v5bgq.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
})
.then(
    () => console.log('Database connection established'),
    (err: { name: string }) => console.log(`Database connection error: ${err.name}`)
);


app.use(cors());
app.use(express.static('_public'));
app.use(checkDbConnection);
app.use(bodyParser.json());
app.use(checkForAuthToken);


// Empty route stub
app.get('/', (req, res) => res.send('Doge to the moon)))'));


// Authentication routes
app.post('/api/sign-up', signUpHandlerPost);
app.post('/api/sign-in', signInHandlerPost);


// User data routes
app.get('/api/user', loginRequired, userDataHandlerGet);


// Advertisement route
// app
//     .route('/api/ad')
//     .get(adHandlerGet)
//     .post(loginRequired, adHandlerPost)
//     .put(loginRequired, adHandlerPut);

// Comments route
// app
//     .route('/api/comments/:id?')
//     .post(loginRequired, commentsHandlerPost)
//     .put(loginRequired, commentsHandlerPut)
//     .delete(loginRequired, commentsHandlerDelete);

// Refresh token route
// app.post('/api/refresh', refreshHandlerPost);

// Logout route
// app.post('/api/logout', logoutHandlerPost);

app.use(wrongRouteHandler);
app.listen(PORT, () => console.log(`Server started at the port ${PORT}`)
);
