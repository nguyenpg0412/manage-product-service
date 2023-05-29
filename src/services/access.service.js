'use strict';
const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const KeyTokenService = require('../services/keyToken.service');
const { createPairToken, verifyJWT } = require('../auth/authUtils');
const { getInforData } = require('../utils');
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response');
const { findByEmail } = require('./shop.service');
const keyTokenModel = require('../models/keyToken.model');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
};

class AccessService {

    static signup = async ({ name, email, password }) => {
        try {
            //step1: check email is existing

            const holderShop = await shopModel.findOne({
                email
            }).lean(); //lean return the js object

            if (holderShop) {
                throw new BadRequestError('error: Shop already exists!');
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const newShop = await shopModel.create({
                name,
                email,
                password: passwordHash,
                roles: [RoleShop.SHOP]
            });

            if (newShop) {
                //created privatekey, publickey
                // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // });
                // console.log(privateKey, publicKey);

                const privateKey = crypto.randomBytes(64).toString('hex');
                const publicKey = crypto.randomBytes(64).toString('hex');

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                }); // -> save publickey to db

                if (!keyStore) {
                    return {
                        code: 'xxxx',
                        message: 'Something went wrong',
                        stautus: 'error'
                    }
                }

                const tokens = await createPairToken({
                    userId: newShop._id,
                    email
                }, publicKey, privateKey);

                return {
                    code: 201,
                    metaData: {
                        shop: getInforData({ fields: ['_id', 'name', 'email'], object: newShop }),
                        tokens
                    }
                }
            };

            return {
                code: 200,
                metaData: null
            }


        } catch (error) {
            return {
                code: '401',
                message: error.message,
                stautus: 'error'
            }
        }
    }

    static signupAdmin = async ({ name, email, password }) => {
        try {
            //step1: check email is existing && role is admin

            const admin = await shopModel.findOne({ email, roles: 'admin' }).lean();
            if (admin) {
                throw new BadRequestError('error: Shop already exists!');
            }
            const passwordHash = await bcrypt.hash(password, 10);

            const newShopAdmin = await shopModel.create({
                name,
                email,
                password: passwordHash,
                roles: [RoleShop.ADMIN]
            });

            if (newShopAdmin) {
                const privateKey = crypto.randomBytes(64).toString('hex');
                const publicKey = crypto.randomBytes(64).toString('hex');

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShopAdmin._id,
                    publicKey,
                    privateKey
                }); // -> save publickey to db

                if (!keyStore) {
                    return {
                        code: 'xxxx',
                        message: 'Something went wrong',
                        stautus: 'error'
                    }
                }

                const tokens = await createPairToken({
                    userId: newShopAdmin._id,
                    email
                }, publicKey, privateKey);

                return {
                    code: 201,
                    metaData: {
                        shop: getInforData({ fields: ['_id', 'name', 'email'], object: newShopAdmin }),
                        tokens
                    }
                }

            }

            return {
                code: 200,
                metaData: null
            }


        } catch (error) {
            return {
                code: '401',
                message: error.message,
                stautus: 'error'
            }
        }
    }

    /**
     * 
     * 1.check email in dbs
     * 2.match password
     * 3.create AT and RT and save in db
     * 4.generate token
     * 5.get data and return login
     */
    static login = async ({ email, password, refreshToken = null }) => {
        //1
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new BadRequestError('Shop is not available');
        //2
        const matchPassword = bcrypt.compare(password, foundShop.password);
        if (!matchPassword) throw new AuthFailureError('Authentication failed');
        //3
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');
        //4
        const { _id: userId } = foundShop;
        const tokens = await createPairToken({ userId, email }, publicKey, privateKey);

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey,
            userId
        });
        
        if (foundShop.roles.includes('ADMIN')) return {
            code: 200,
            metaData: 'hi admin'
        }

        return {
            shop: getInforData({ fields: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log(delKey);
        return delKey;
    }

    /**
     * check this token used?
     */
    static handlerRefreshToken = async (refreshToken) => {  
        //check xem token nay da duoc su dung chua?
        const foundToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if (foundToken) {
            //decode xem who are you?
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey);
            console.log({ userId, email });
            //delete
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError(`Access denied, please relogin`);
        }
        //khong thi ok
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) throw new AuthFailureError('shop not registered');

        //verify token
        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey);
        console.log({ userId, email });

        //check userid
        const foundShop = await findByEmail(email);
        if (!foundShop) throw new AuthFailureError('shop not registered');

        //crete 1 new pair token
        const tokens = await createPairToken({ userId, email }, holderToken.publicKey, holderToken.privateKey);

        //update token
        await holderToken.update({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken // da duoc su dung de lay token moi
            }
        });
        return {
            user: { userId, email },
            tokens
        }

    }

    static handlerRefreshTokenV2 = async ({
        keyStore, user, refreshToken
    }) => {
        // console.log(user);

        const { userId, email } = user;
        console.log(`keystore::::`, keyStore);
        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError(`Access denied, please relogin`);
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError('shop not registered');
        }
        const foundShop = await findByEmail({ email });

        if (!foundShop) throw new AuthFailureError('shop not registered');
        const tokens = await createPairToken({ userId, email }, keyStore.publicKey, keyStore.privateKey);
        const keyStoreId = keyStore._id;

        await keyTokenModel.updateOne(
            { _id: keyStoreId },
            {
                $set: {
                    refreshToken: tokens.refreshToken
                },
                $addToSet: {
                    refreshTokensUsed: refreshToken // da duoc su dung de lay token moi
                }
            }
        );
        return {
            user,
            tokens
        }
    }

}

module.exports = AccessService;