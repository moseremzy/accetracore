require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const port = process.env.PORT || 7000;
const routes = require("./routes/routes")
const app = express();
const path = require("path")
const ejs = require("ejs")




const fs = require('fs');
const util = require('util');
const log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});
const log_stdout = process.stdout;

console.log = (d, e, f, g) => {
  log_file.write(util.format('LOG: ', d?d:'', e?e:'', f?f:'', g?g:'') + '\n');
  log_stdout.write(util.format('LOG: ', d?d:'', e?e:'', f?f:'', g?g:'') + '\n');
}

console.error = (d, e, f, g) => {
  log_file.write(util.format('ERROR: ', d?d:'', e?e:'', f?f:'', g?g:'') + '\n');
  log_stdout.write(util.format('ERROR: ', d?d:'', e?e:'', f?f:'', g?g:'') + '\n');
}


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(routes);

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/uploads")));
app.use(express.static(path.join(__dirname, "/dashboard_assets")));
app.set('view engine', 'ejs');
 


app.listen(port, () => {

  console.log("server started...")

})
