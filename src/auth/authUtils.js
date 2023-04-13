'use strict';

const JWT = require('jsonwebtoken');
const { asyncHandler } = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADERS = {
    AUTHORIZATION: 'authorization',
    CLIENT_ID: 'x-client-id',
    REFRESHTOKEN: 'x-rtoken-id',
};

const createPairToken = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 days'
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '2 days'
        });



        JWT.verify(accessToken, publicKey, (err, result) => {

            if (err)
                console.log(`error verification::: ${err.message}`);
            else console.log(result);
        });

        return {
            accessToken,
            refreshToken
        }
    } catch (error) {

    }
};

const authentication = asyncHandler(async (req, res, next) => {
    /*
    1.check userId missing???
    2.get accessToken
    3.verify token
    4.check user in dbs
    5.check keyStore with this userId
    6.If ok all -> return next()
    */
    const userId = req.headers[HEADERS.CLIENT_ID];
    if (!userId) throw new AuthFailureError('Invalid request');

    //2 
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError('Not found keystore');

    //3
    const accessToken = req.headers[HEADERS.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError('Invalid request');

    //4
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) throw new AuthFailureError('userId is not valid');
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
    /*
    1.check userId missing???
    2.get accessToken
    3.verify token
    4.check user in dbs
    5.check keyStore with this userId
    6.If ok all -> return next()
    */
    const userId = req.headers[HEADERS.CLIENT_ID];
    if (!userId) throw new AuthFailureError('Invalid request');

    //2 
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError('Not found keystore');

    //3
    if (req.headers[HEADERS.REFRESHTOKEN]) {
        //4
        try {
            const refreshToken = req.headers[HEADERS.REFRESHTOKEN];
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
            if (userId !== decodeUser.userId) throw new AuthFailureError('userId is not valid');
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            return next();
        } catch (error) {
            throw error;
        }
    };
    const accessToken = req.headers[HEADERS.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError('Invalid request');

});

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret);
}

module.exports = {
    createPairToken,
    asyncHandler,
    authentication,
    verifyJWT,
    authenticationV2
};