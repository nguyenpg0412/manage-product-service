'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const router = express.Router();

const { asyncHandler } = require('../../auth/authUtils');
const { authenticationV2 } = require('../../auth/authUtils');


//signup
router.post('/shop/signup', asyncHandler(accessController.signup));
router.post('/shop/login', asyncHandler(accessController.login));

//authentication
router.use(authenticationV2);

//
router.post('/shop/logout', asyncHandler(accessController.logout));
router.post('/shop/handlerRefreshToken', asyncHandler(accessController.handlerRefreshToken));


module.exports = router;