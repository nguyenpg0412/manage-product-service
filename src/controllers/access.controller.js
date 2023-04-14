'use strict';

const AccessService = require('../services/access.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class AccessController {
    signup = async (req, res, next) => {
        new CREATED({
            message: 'register created',
            metaData: await AccessService.signup(req.body),
            options: {
                limit: 10
            }
        }).send(res);
    }

    signupAdmin = async (req, res, next) => {
        new CREATED({
            message: 'register admin created',
            metaData: await AccessService.signupAdmin(req.body),
            options: {
                limit: 10
            }
        }).send(res);
    }



    login = async (req, res) => {
        new SuccessResponse({
            metaData: await AccessService.login(req.body)
        }).send(res);

    }

    logout = async (req, res) => {
        new SuccessResponse({
            message: 'logout successfully',
            metaData: await AccessService.logout(req.keyStore)
        }).send(res);
    }

    handlerRefreshToken = async (req, res, next) => {
        // new SuccessResponse({
        //     message: 'handler refresh token successfully',
        //     metaData: await AccessService.handlerRefreshToken(req.body.refreshToken)
        // }).send(res);

        //v2 (no need accessToken)
        new SuccessResponse({
            message: 'handler refresh token successfully',
            metaData: await AccessService.handlerRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
            })

        }).send(res);
    }
}

module.exports = new AccessController();