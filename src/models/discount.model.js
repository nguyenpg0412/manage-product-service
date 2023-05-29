"use strict";

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

// Declare the Schema of the Mongo model
const discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: "fixed_amount" }, // || percentage
    discount_value: { type: Number, required: true }, // 10.000, 10
    discount_code: { type: String, required: true }, // discount code
    discount_start_date: { type: Date, required: true }, // day start
    discount_end_date: { type: Date, required: true }, // day end
    discount_max_uses: { type: Number, required: true }, // amount discount applied
    discount_uses_count: { type: Number, required: true }, // discount used
    discount_users_used: { type: Array, default: [] }, // who used
    discount_max_uses_per_users: { type: Number, required: true }, // amount maximum discount applied for each user
    discount_min_order_value: { type: Number, required: true },
    discount_max_value: { type: Number, required: true },
    discount_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
    discount_is_active: { type: Boolean, default: true },
    discount_applies_to: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
    discount_product_ids: { type: Array, default: [] }, // amount product applied
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
module.exports = { discount: model(DOCUMENT_NAME, discountSchema) };
