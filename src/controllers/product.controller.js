'use strict';

const ProductService = require('../services/product.service');
const ProductServiceV2 = require('../services/product.service.xxx');
const { SuccessResponse } = require('../core/success.response');

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Product created successfully',
            metaData: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })

        }).send(res);
    }

    //query
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'get list draft products successfully',
            metaData: await ProductService.findAllDraftsForShop({
                product_shop: req.user.userId
            })

        }).send(res);
    }
    //end query

    //query
    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'get list published products successfully',
            metaData: await ProductService.findAllPublishForShop({
                product_shop: req.user.userId
            })

        }).send(res);
    }
    //end query

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'unpublished products successfully',
            metaData: await ProductService.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })

        }).send(res);
    }

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'published products successfully',
            metaData: await ProductService.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })

        }).send(res);
    }

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'get product search by key successfully',
            metaData: await ProductService.searchProducts(req.params)

        }).send(res);
    }

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'get all products successfully',
            metaData: await ProductService.findAllProducts(req.query)

        }).send(res);
    }

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'get product by id successfully',
            metaData: await ProductService.findProduct({
                product_id: req.params.product_id
            })
        }).send(res);
    }

    //update Product
    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'update product successfully',
            metaData: await ProductServiceV2.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res);
    }
}

module.exports = new ProductController();