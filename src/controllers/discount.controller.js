"use strict";

const DiscountService = require("../services/discount.service");
const { CREATED, SuccessResponse } = require("../core/success.response");

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Create code success",
      metaData: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      })
    }).send(res);
  };

  getAllDiscountCodesByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Found code success",
      metaData: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId,
      })
    }).send(res);
  };

  getAllDiscountCodesWithProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Found code success",
      metaData: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query,
      }),
    }).send(res);
  };

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "Get discount amount success",
      metaData: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };
}

module.exports = new DiscountController();
