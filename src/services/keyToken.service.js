'use strict';

// const { filter } = require('lodash');
const keyTokenModel = require('../models/keyToken.model');
const { Types } = require('mongoose');

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            //level 0
            // const tokens = await keyTokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey   
            // });

            // return tokens ? tokens.publicKey : null;

            //level xxx
            const filter = { user: userId }, update = {
                publicKey, privateKey, refreshTokensUsed: [], refreshToken
            }, options = { upsert: true, new: true };
            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options);

            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error
        }
    }

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({ user: new Types.ObjectId(userId) });
    }

    static removeKeyById = async (id) => {
        return await keyTokenModel.findOneAndRemove(id).lean()
    }

    static findByRefreshTokensUsed = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshTokensUsed: refreshToken }).lean();
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshToken });
    }

    static deleteKeyById = async (userId) => {
        return await keyTokenModel.deleteOne({
            user: new Types.ObjectId(userId)
        });
    }
}

module.exports = KeyTokenService;