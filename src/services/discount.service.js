"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const { discount } = require("../models/discount.model");
const { convertToObjectMongoDB } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
  findAllDiscountCodesUnSelect,
  checkDiscountExist,
} = require("../models/repositories/discount.repo");

/**
 * Discount Services
 * 1-Generate Discount code [Shop/Admin]
 * 2-Get discount amonout [User]
 * 3-Get all discount code [User/Shop]
 * 4-Verify discount code [User]
 * Delete discount code [Admin/Shop]
 * Cancel discount code [user]
 */

class DiscountService {
  static async createDiscountCode(payload) {
    console.log("payload", payload);
    const {
      name,
      description,
      type,
      value,
      max_value,
      code,
      start_date,
      end_date,
      max_uses,
      uses_count,
      users_used,
      max_uses_per_user,
      min_order_value,
      is_active,
      applies_to,
      product_ids,
      shopId,
    } = payload;

    //check valid
    if (new Date(start_date) >= new Date(end_date))
      throw new BadRequestError("Start date must be before end date");

    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectMongoDB(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active)
      throw new BadRequestError("Discount existed");

    // create index for discount code
    const newDiscount = await discount.create({
      discount_name: name,
      discount_code: code,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_max_uses_per_users: max_uses_per_user,
      discount_users_used: users_used,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_shopId: shopId,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });
    return newDiscount;
  }

  static async updateDiscountCode() {}
  /*
    get all discount codes available with product
    */
  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectMongoDB(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active)
      throw new NotFoundError("Discount does not exist");

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products = null;
    if (discount_applies_to === "all") {
      //get all product
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectMongoDB(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      //get specific product
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    console.log('products:::', products);
    return products;
  }

  /**
   * get all discount code of shop
   */
  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectMongoDB(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shopId"],
      model: discount,
    });
    return discounts;
  }

  /**
   * Apply discount code
   * products = [{
   *    productId,
   *    shopId,
   *    quantiy,
   *    name,
   *    price
   * },
   * { productId,
   *    shopId,
   *    quantiy,
   *    name,
   *    price}
   * ]
   */
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExist({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectMongoDB(shopId),
      },
    });
    if (!foundDiscount) throw new NotFoundError("discount does not exist");
    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_users,
      discount_users_used,
      discount_type,
      discount_value,
    } = foundDiscount;
    if (!discount_is_active) throw new NotFoundError("discount is expired");
    if (!discount_max_uses) throw new NotFoundError("discount is out");

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    )
      throw new NotFoundError("discount expired");

    //check whether min order value or not
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      //get total price
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `discount requires a minimum order value of ${discount_min_order_value}`
        );
      }
    }
    if (discount_max_uses_per_users > 0) {
      const userUseDiscount = discount_users_used.find((user) => {
        user.userId === userId;
      });
      if (userUseDiscount) {
        //...
      }
    }

    //check if discount is fixed_amount or percentage
    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);
    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectMongoDB(shopId),
    });
    return deleted;
  }

  /*
    Cancel discount code
   */
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExist({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectMongoDB(shopId),
      },
    });
    if (!foundDiscount) throw new NotFoundError("discount not found");

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },

      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });
    return result;
  }
}

module.exports = DiscountService;
