'use strict';

const { model, Schema, SchemaType } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Key';
const COLLECTION_NAME = 'Keys';

// Declare the Schema of the Mongo model
const keySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    },
    publicKey: {
        type: String,
        required: true,
    },
    privateKey: {
        type: String,
        required: true,
    },
    refreshTokensUsed: {
        type: Array,
        default: [], // used
    },
    refreshToken: {
        type: String,
        require: true,
    }
},
    {
        collection: COLLECTION_NAME,
        timestamps: true
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, keySchema);