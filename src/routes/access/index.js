'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const router = express.Router();

const { asyncHandler } = require('../../auth/authUtils');
const { authentication, authenticationV2 } = require('../../auth/authUtils');


//admin route
// router.post('/admin/signup', asyncHandler(accessController.signupAdmin));
router.post('/admin/login', asyncHandler(accessController.login));

//signup
router.post('/shop/signup', asyncHandler(accessController.signup));
router.post('/shop/login', asyncHandler(accessController.login));

//authentication
router.use(authenticationV2);

//
router.post('/shop/logout', asyncHandler(accessController.logout));
router.post('/shop/handlerRefreshToken', asyncHandler(accessController.handlerRefreshToken));


module.exports = router;