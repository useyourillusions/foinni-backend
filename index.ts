'use strict';

const { MONGO_USER, MONGO_PASSWORD, MONGO_DB_NAME, PORT = 5000 } = process.env;

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import {
    checkDbConnection,
    parseAuthToken,
    wrongRouteHandler,
    getUserData
} from './src/middlewares';
import {
    signUpHandlerPost,
    signInHandlerPost,
    refreshHandlerPost,
    signOutHandlerPost
} from './src/routes/auth';
import { userDataHandlerGet } from './src/routes/user';

const app = express();

mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_DB_NAME}.v5bgq.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`)
    .then(
        () => console.log('Database connection established'),
        (err: { name: string }) => console.log(`Database connection error: ${err.name}`)
    );


app.use(cors());
app.use(express.static('_public'));
app.use(checkDbConnection);
app.use(bodyParser.json());
app.use(parseAuthToken);


// Empty route stub
app.get('/', (req, res) => res.send(`
    <center>
        <img src="https://coincompare.eu/wp-content/uploads/2020/08/Dogecoin-rise-due-to-TikTokkers-2020.gif" alt="Doge to the moon)))">
    </center>
`));


// Authentication routes
app.post('/api/v1/sign-up', signUpHandlerPost);
app.post('/api/v1/sign-in', signInHandlerPost);
app.post('/api/v1/refresh', refreshHandlerPost);
app.post('/api/v1/sign-out', signOutHandlerPost);


// User routes
app.get('/api/v1/user', getUserData, userDataHandlerGet);


app.use(wrongRouteHandler);
app.listen(PORT, () => console.log(`Server started at the port ${PORT}`));

