const express = require('express');
const app = express();
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');


//init middleware
app.use(morgan('combined'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//init db
require('./src/dbs/init.mongodb');

//init routes

app.use('', require('./src/routes'));

//handle errors
app.use((req, res, next) => {
    const error = new Error('not found!');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: error.message || 'internal error',
    });
});


module.exports = app;