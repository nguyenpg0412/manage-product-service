'use strict';

const _ = require('lodash');

const getInforData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
};

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el,1]));
}

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el,0]));
}

const removeUndefinedObject = obj => { 
    Object.keys(obj).forEach(key => {
        if (obj[key] !== null) { 
            delete obj[key];
        }
    })
    return obj;
};

/**
const a = {
    c: {
        d:1,
        e:2
    }
}

db.collection.updateOne({
    `c.d`: 1,
    `c.e`: 2
})
 */

const updateNestedObjectParser = obj => {
    const final = {};
    Object.keys(obj).forEach(key => { 
        if(typeof obj[k] === 'object' && !Array.isArray(obj[key])) {
            const response = updateNestedObjectParser(obj[key]);
            Object.keys(response).forEach( a=> {
                final[`${k}.${a}`] = response[a];
            })
        } else {
            final[k] = obj[k];  
        }
    })
    return final;
}

module.exports = { getInforData, getSelectData, unGetSelectData, removeUndefinedObject, updateNestedObjectParser };
