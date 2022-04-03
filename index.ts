'use strict';

const { MONGO_USER, MONGO_PASSWORD, MONGO_DB_NAME, PORT = 5000 } = process.env;

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import {
    checkDbConnection,
    parseAuthToken,
    getUserData,
    wrongRouteHandler,
    uncoughtErrorHandler,
} from './src/middlewares';
import {
    signUpHandlerPost,
    signInHandlerPost,
    refreshHandlerPost,
    signOutHandlerPost,
} from './src/routes/auth';
import {
    userDataHandlerGet,
    userDataHandlerPatch,
} from './src/routes/user';
import 'express-async-errors';

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


// --- PUBLIC ROUTES ---
app.get('/', (req, res) => res.send(`
    <center>
        <img src="https://coincompare.eu/wp-content/uploads/2020/08/Dogecoin-rise-due-to-TikTokkers-2020.gif" alt="Doge to the moon)))">
    </center>
`));

app.post('/api/v1/sign-up', signUpHandlerPost);
app.post('/api/v1/sign-in', signInHandlerPost);


// --- PRIVATE ROUTES ---
app.use(parseAuthToken);
app.post('/api/v1/refresh', refreshHandlerPost);
app.post('/api/v1/sign-out', signOutHandlerPost);
app.get('/api/v1/user', getUserData, userDataHandlerGet);
app.patch('/api/v1/user', getUserData, userDataHandlerPatch);


app.use(wrongRouteHandler);
app.use(uncoughtErrorHandler);

app.listen(PORT, () => console.log(`Server started at the port ${PORT}`));

