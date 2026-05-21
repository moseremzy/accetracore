const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session)
const dbConnection = require("./database");

const sessionStore = new MySQLStore({tableName: 'mysessions'}, dbConnection)

const sessionConfig = {
    store: sessionStore,
    secret: 'my_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false},
    maxAge: 5 * 60 * 1000 //expires in 5 minutes
}

module.exports = sessionConfig;