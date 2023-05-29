'use strict';

const express = require('express');
const router = express.Router();


router.use('/v1/api/product', require('./product'));
router.use('/v1/api/discount', require('./discount'));
router.use('/v1/api', require('./access'));

module.exports = router