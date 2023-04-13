'use strict';

const mongoose = require('mongoose');
const { db: { host, name, port } } = require('../configs/config.mongodb');
const { countConnect } = require('../helpers/check.connect');
const connectionString = `mongodb://${host}:${port}/${name}`;

class Database {
    constructor() {
        this.connect();
    }

    //connect
    connect() {

        if (1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true });
        }
        mongoose.connect(connectionString).then(_ => {
            console.log('connected to mongoose', countConnect());

        })
            .catch(err => console.error(err));
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();

        }
        return Database.instance;
    }
}

const instanceMongoDB = Database.getInstance();

module.exports = instanceMongoDB;