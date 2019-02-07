//const bcrypt = require('bcrypt');

module.exports = class User {
    constructor(username, password, hashingRequired=false) {
        this.username = username;
        this.password = hashingRequired ? password : password;
    }
}