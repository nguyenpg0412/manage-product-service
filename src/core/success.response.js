'use strict';

const StatusCode = {
    OK: 200,
    CREATED: 201
}

const ReasonStatusCode = {
    OK: 'success',
    CREATED: 'created!'
}

class SuccessResponse {
    constructor({ message, statusCode = StatusCode.OK, reason = ReasonStatusCode.OK, metaData = {} }) {
        this.message = !message ? reason : message;
        this.status = statusCode;
        this.metaData = metaData;
    }

    send(res, headers = {}) {
        return res.status(this.status).json(this);
    }
}

class OK extends SuccessResponse {
    constructor({ message, metaData }) {
        super(message, metaData);
    }
}

class CREATED extends SuccessResponse {
    constructor({ options = {}, message, statusCode = StatusCode.CREATED, reason = ReasonStatusCode.CREATED, metaData }) {
        super({message, statusCode, reason, metaData});
        this.options = options;
    }
}

module.exports = {
    OK,
    CREATED,
    SuccessResponse
}