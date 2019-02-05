const uuid = require('uuid/v1');
//const mongodb = require('mongodb');

module.exports = {
    home(req, res, next) {
        res.status(200).send("hello");
    },

    test(req, res, next) {
        
    },
};
