'use strict';

const mongoose = require('mongoose');
const os = require('os');
const process = require('process');
const _SECONDS = 5000;

const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections: ${numConnection}`);
}

//check overload conenection

const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUseage = process.memoryUsage().rss;
        //example maximum number of connections based on number of cores
        const maxConnection = numCores * 5;
        console.log(`memory usage::: ${memoryUseage / 1024 / 1024} MB`);
        console.log(`Acctive connections: ${numConnection}`);
        if (numConnection > maxConnection) {
            console.log(`Connection overload detected!`);
        }
    }, _SECONDS); //monitor every 5 seconds
}

module.exports = {
    countConnect,
    checkOverload
};