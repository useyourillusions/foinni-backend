'use strict';

const { MONGO_USER, MONGO_PASSWORD, MONGO_DB_NAME, PORT = 5000 } = process.env;

const env = require('./environment.json');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const checkDbConnection = require('./helpers/check-db-connection');
const checkForAuthToken = require('./helpers/check-for-auth-token');
const wrongRouteHandler = require('./helpers/wrong-route');
const loginRequired = require('./helpers/login-required');

const signUpHandlerPost = require('./routes/users/sign-up/sign-up');
const signInHandlerPost = require('./routes/users/sig-in/sign-in');
// const userDataHandlerGet = require('./routes/get/user');

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
    err => console.log(`Database connection error: ${err.name}`)
);


app.use(cors());
app.use(express.static('_public'));
app.use(checkDbConnection);
app.use(bodyParser.json());
app.use(checkForAuthToken);


// Authentication routes
app.post('/api/sign-up', signUpHandlerPost);
app.post('/api/sign-in', signInHandlerPost);

// User data route
// app.get('/api/user', loginRequired, userDataHandlerGet);

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
app.listen(
    env[env.mode]['appPort'],
    () => console.log(`Server started at port ${env[env.mode]['appPort']}`)
);
