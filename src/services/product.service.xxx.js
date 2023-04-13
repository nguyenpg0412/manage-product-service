'use strict';

const { product, clothing, electronic, furniture } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');
const { findAllDraftsForShop, publishProductByShop, findAllPublishForShop, unPublishProductByShop, searchProductByUser, findAllProducts, findProduct, updateProductById } = require('../models/repositories/product.repo');

class ProductFactory {

    static productRegistry = {} //key-class

    static registerProductType (type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {

        const productClass = ProductFactory.productRegistry[type];
        console.log(typeof type)
        if (!productClass) {
            throw new BadRequestError('invalid type'+ type);
        }
        return new productClass(payload).createProduct();
    }

    static async updateProduct({ type, payload }) {
        const productClass = ProductFactory.pr;
        return await findAllDraftsForShop({ query, limit, skip });
    }

    //query
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true };
        return await findAllDraftsForShop({ query, limit, skip });
    }
    //end query

    //PUT//
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id });
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id });
    }

    //end PUT//

    //query
    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true };
        return await findAllPublishForShop({ query, limit, skip });
    }
    //end query

    //search products
    static async searchProducts({ keySearch }) {
        return await searchProductByUser({ keySearch });
    }

    static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
        return await findAllProducts({
            limit, sort, page, filter,
            select: ['product_name', 'product_price', 'product_thumb']
        })
    }

    static async findProduct({ product_id }) {
        return await findProduct({ product_id, unSelect: ['__v'] })
    }

}

//define base product class
class Product {
    constructor({
        product_name,
        product_description,
        product_price,
        product_thumb,
        product_quantity,
        product_type,
        product_shop,
        product_attributes
    }) {
        this.product_name = product_name;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_thumb = product_thumb;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    //create new product
    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id });
    }

    async updateProduct(product_id, bodyUpdate) {
        return await updateProductById({ product_id, bodyUpdate, model: product })
    }
}

//define sub-class for different products types clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create(this.product_attributes);
        if (!newClothing) throw new BadRequestError('create new clothing error');

        const newProduct = await super.createProduct();
        if (!newProduct) throw new BadRequestError('create new clothing error');

        return newProduct;
    }

    async updateProduct(product_id) {
        //1.remove null undefined attributes
        const objectParam = this;
        //2.check where to update
        if (objectParam.product_attributes) {
            //update child
            await updateProductById({ product_id, objectParam, model: clothing })
        }
        const updatedProduct = await super.updateProduct(product_id, objectParam);
        return updatedProduct;
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newElectronic) throw new BadRequestError('create new clothing error');

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError('create new clothing error');

        return newProduct;
    }
}

class Furniture extends Product {
    async createProduct() {
        const newfurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newfurniture) throw new BadRequestError('create new furniture error');

        const newProduct = await super.createProduct(newfurniture._id);
        if (!newProduct) throw new BadRequestError('create new furniture error');

        return newProduct;
    }
}

//registry
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Furniture', Furniture);
module.exports = ProductFactory;