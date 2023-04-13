'use strict';

const { model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Shop';
const COLLECTION_NAME = 'Shops';

// Declare the Schema of the Mongo model
const shopSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        maxLength: 150
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
    },
    password: {
        type: String,
        required: true,
    },
    verify: {
        type: Schema.Types.Boolean,
        default: false,
    },
    roles: {
        type: Array,
        default: [],
    }
},
    {
        collection: COLLECTION_NAME,
        timestamps: true
    });

//Export the model
module.exports = model(DOCUMENT_NAME, shopSchema);