'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const router = express.Router();

const { asyncHandler } = require('../../auth/authUtils');
const { authenticationV2 } = require('../../auth/authUtils');


router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct));
router.get('', asyncHandler(productController.findAllProducts));
router.get('/:product_id', asyncHandler(productController.findProduct));


//authentication
router.use(authenticationV2);

router.post('', asyncHandler(productController.createProduct));
router.post('/publish/:id', asyncHandler(productController.publishProductByShop));
router.get('/unpublish/:id', asyncHandler(productController.unPublishProductByShop));


//QUERY//
/**
 * @description get all draft products
 * @param {Number} limit
 * @param {Number} skip
 * @return {JSON}
 */

router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop));
router.get('/published/all', asyncHandler(productController.getAllPublishForShop));

//


module.exports = router;