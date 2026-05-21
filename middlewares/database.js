const mysql = require("mysql");
const host = process.env.HOST
const user = process.env.USER
const password = process.env.PASSWORD
const database = process.env.DATABASE


//create connection
const db = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
  })
  
  //connect database
  db.connect((err) => {
    if(err) {
        throw err
    }
    console.log("connected successfully")
  })

 module.exports = db
  