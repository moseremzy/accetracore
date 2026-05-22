const hbs = require('nodemailer-express-handlebars');
const nodemailer = require("nodemailer");
const { MulterError } = require("multer");
const multer = require("multer");
const fs = require("fs");
const { render } = require("express/lib/response");
const path = require("path")
const uniqid = require("uniqid");
const { v4: uuidv4 } = require('uuid');
const uniqNumberGenerator = require("unique-string-generator");
const db = require("../middlewares/database")
const MIDDLEWARES = require("../middlewares/middleware.js");
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const WEBSITE = process.env.WEBSITE
const LIVECHAT = process.env.LIVECHAT
module.exports = class API {
 

    //POST REQUESTS

    //register users
    static async register(req, res) {

        const data = req.body;

        try {

        const user_query = `SELECT * FROM user WHERE email='${data.email}'`

        const superUser_query = `SELECT * FROM admin WHERE email='${data.email}'`

        const user = await new Promise( (resolve, reject) => {

          db.query(user_query, (err, result) => {

            if (err) {

              reject(err)
            
            } else {

              resolve(result)

            }
  
          })

        })

        const superUser = await new Promise( (resolve, reject) => {

          db.query(superUser_query, (err, result) => {

            if (err) {

              reject(err)
            
            } else {

              resolve(result)

            }
  
          })

        })
 
        if (user.length > 0 || superUser.length > 0) {

          res.render("register", {message: "Email already exists"})
            
        } else {

         data.currencyCode = await MIDDLEWARES.get_currency_code(data.country)

         data.virtual_card = MIDDLEWARES.create_virtual_card(data); 

         data.profile_photo = req.file.filename;

         data.account_number = Math.floor(1000000000 + Math.random() * 9000000000).toString() //create account number

         data.non_resident_code = uniqNumberGenerator.UniqueNumber();

         data.imf_wbs_confirmation_code = uniqid();

         data.anti_terrorism_verification_code = uniqNumberGenerator.UniqueNumber().slice(1,8);

         data.four_digit_pin = uniqNumberGenerator.UniqueNumber().slice(1,5);

         data.confirmation_code = uuidv4()

         const user_query = 'INSERT INTO user SET ?'

         const user = await new Promise( (resolve, reject) => {

          db.query(user_query, data, (err, result) => {

            if (err) {

              reject(err)
            
            } else {

              resolve(result)

            }
  
          })

        })

        const response = await MIDDLEWARES.SendConfirmationMail(req, res, data.email, data.confirmation_code, data.firstname)
    
        if (response === 'error occurred') {
             
          return res.render("register", {message: "There was an error, try again"})          

        } 

        res.redirect(`/email_verification/${data.email}`);

      }
            
      } catch (error) {

        console.log(error.message)
            
        res.render("register", {message: "There was an error, try again"})          

      }

    }


     //login users
     static async login(req, res) {

        const data = req.body;

        let date = new Date();

        try {

        const user_query = `SELECT * FROM user WHERE email='${data.email}'`

        const user = await new Promise( (resolve, reject) => {

          db.query(user_query, (err, result) => {

            if (err) {

              reject(err)
            
            } else {

              resolve(result)

            }
  
          })

        })
        
        if (!user[0]) {

          res.render("login", {message: "Invalid Email or Password"})
  
        } else {
  
        if (user[0].user_status === "Active" && user[0].password === data.password) {
      
          date.setFullYear(date.getFullYear() + 1) //session expires in a year time

          req.session.cookie.expires = date;
  
          req.session.user_id = user[0].user_id; //set user id  
      
          res.redirect(`/account/dashboard`)
      
        } else if (user[0].user_status === "Pending" && user[0].password === data.password) { //IF ACCOUNT NOT VERIFIED YET. TRY VERIFY AGAIN
         
          const response = await MIDDLEWARES.SendConfirmationMail(req, res, user[0].email, user[0].confirmation_code, user[0].firstname)
    
          if (response === 'error occurred') {
            
            return res.render("email_confirmation", {message: "failed"})
  
          }
  
            return  res.redirect(`/email_verification/${user[0].email}`);

        } else {
      
            return res.render("login", {message: "Invalid Email or Password"})
      
        }
  
       }
            
        } catch (error) {
            
           return res.render("login", {message: error.message})          

        }

     }


     //request reset password link
    static async request_reset_pass_link(req, res) {
     
      const email = req.body.email;

      const reset_pass_id = uniqid();

      try {

        const user_query = `SELECT * FROM user WHERE email='${email}'`

        const user = await new Promise( (resolve, reject) => {

          db.query(user_query, (err, result) => {

            if (err) {

              reject(err)
            
            } else {

              resolve(result)

            }
  
          })

        })

      if (!user[0]) {
        
        return res.json({message: 'user not found'})

      }

      const user_update_query = `UPDATE user 
      SET reset_pass_id='${reset_pass_id}' 
      WHERE email='${email}'`

      db.query(user_update_query)

      await MIDDLEWARES.send_link(req, res, email, reset_pass_id)
        
      } catch (error) {

      return res.json({message: 'error occured'})
        
      }

    }


     
     //update users info
     static async update_profile (req, res) {

        const data = req.body

        try {
        
        const user_query = `SELECT * FROM user WHERE user_id=${req.session.user_id}`

        const user = await new Promise( (resolve, reject) => {

          db.query(user_query, (err, result) => {

            if (err) {

              reject(err)
          
            } else {
          
              resolve(result)
            
            }
          
          })

        })

        const user_update_query = `UPDATE user 
        SET firstname='${data.firstname}', 
        lastname='${data.lastname}', 
        gender='${data.gender}', 
        address='${data.address}',
        phone=${data.phone} 
        WHERE user_id='${req.session.user_id}'`

        db.query(user_update_query)

        return res.redirect("/account/profile")

        } catch (error) {

        return res.render("404")
            
        }

    }


  //update profile photo
  static async update_photo (req, res) {

    const user_email = req.body.email;
 
    try {

    if (req.fileValidationError) {
        
    return res.json({message: req.fileValidationError}) 

    } else {

      const user_query = `SELECT * FROM user WHERE user_id='${req.session.user_id}'`  
  
      const user = await new Promise( (resolve, reject) => {

        db.query(user_query, (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })

     if (fs.existsSync('../uploads/' + user[0].profile_photo)) { //if image exists
      
        fs.unlinkSync('../uploads/' + user[0].profile_photo) //delete am from folder

     }
    
      const photo_update_query = `UPDATE user 
      SET profile_photo='${req.file.filename}'
      WHERE user_id='${req.session.user_id}'`

      db.query(photo_update_query)

      return res.json({message: "Updated"})
       
    } 
 
   } catch (error) {
     
     return res.json({message: error.message})
 
   }
 
 }
 


// Complaint email controller
static async send_complaint_mail(req, res) {

  const data = req.body;

  // Step 1: Configure Zoho SMTP
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: 465,
    secure: true, // SSL
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS // Preferably use an app password
    }
  });

  // Step 2: Setup Handlebars template engine
  const handlebarOptions = {
    viewEngine: {
      extname: '.handlebars',
      partialsDir: path.resolve('./views/'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
    extName: '.handlebars',
  };

  transporter.use('compile', hbs(handlebarOptions));

  // Step 3: Compose mail options
  const mailOptions = {
    from: `${WEBSITE.toUpperCase()} Bank <${SMTP_USER}>`,
    to: SMTP_USER, // Or data.email if you want to send back to user too
    subject: 'User Complaint - Please Respond',
    template: 'handlebars/complaint_email',
    context: {
      topic: data.subject,
      name: data.name,
      email: data.email,
      message: data.message
    }
  };

  // Step 4: Send the email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to send complaint. Please try again later.', error: err.message });
    } else {
      return res.status(200).json({ message: 'Your message has been delivered. Please be patient, we will get back to you as soon as possible.' });
    }
  });
}


//Create new password
 static async create_new_password (req, res) {

  const data = req.body

  console.log(data)

  let message;

  try {

  const user_query = `SELECT * FROM user WHERE reset_pass_id='${data.reset_pass_id}'`

  const user = await new Promise( (resolve, reject) => {

    db.query(user_query, (err, result) => {

      if (err) {

        reject(err)
      
      } else {

        resolve(result)

      }

    })

  })


  if (user.length > 0) { //if the user dey

  const user_update_query = `UPDATE user 
  SET password='${data.password}', 
  confirm_password='${data.confirm_password}',
  reset_pass_id=''
  WHERE reset_pass_id='${data.reset_pass_id}'`

    db.query(user_update_query)

    message = "success"
    
  } else { //if the user no dey

    message = "invalid token"

  }
    
  } catch (error) { //if error occurs
    
    message = error.message

  }

    res.json({message: message})

 }



 
//TRANSFER FUNDS
static async transfer_money (req, res) {

  let message;

  const transfer_details = req.body

  try {

    const user_query = `SELECT * FROM user WHERE user_id='${req.session.user_id}'`

    const user = await new Promise( (resolve, reject) => {
  
      db.query(user_query, (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })

    transfer_details.sender = `${user[0].firstname} ${user[0].lastname}`
  
    transfer_details.account_balance = `${user[0].balance}`

    transfer_details.transaction_limit = `${user[0].transaction_limit}`

  //Confirm Account Status
    if (user[0].account_status === "Active") {

      message = "Active"
      
    } else {

      message = "Blocked"

    }
    
  } catch (error) {

      message = "bad request" //if there is error
    
  }

    res.json({message: message, transfer_details: transfer_details})

}




//Check Non Resident Code
static async check_non_resident_code (req, res) {

  const non_resident_code = req.body.non_resident_code

  try {

    const user_query = `SELECT * FROM user WHERE user_id='${req.session.user_id}'`

    const user = await new Promise( (resolve, reject) => {
  
      db.query(user_query, (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })


   if (user[0].non_resident_code === non_resident_code) {
     
    res.json({message: "valid non resident code", non_resident_code: user[0].non_resident_code})

   } else {

    res.json({message: "invalid non resident code"})

   }
    
  } catch (error) {
    
   res.json({message: "something went wrong, try again"})

  }
  
}



//Check anti terrorism verification code
static async check_anti_terrorism_verification_code (req, res) {

  const anti_terrorism_verification_code = req.body.anti_terrorism_verification_code

  try {

    const user_query = `SELECT * FROM user WHERE user_id='${req.session.user_id}'`

    const user = await new Promise( (resolve, reject) => {
  
      db.query(user_query, (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })


   if (user[0].anti_terrorism_verification_code === anti_terrorism_verification_code) {
     
    res.json({message: "valid Anti Terrorism Verification Code", anti_terrorism_verification_code: user[0].anti_terrorism_verification_code})

   } else {

    res.json({message: "invalid Anti Terrorism Verification Code"})

   }
    
  } catch (error) {
    
   res.json({message: "something went wrong, try again"})

  }
  
}




//Check imf_wbs_confirmation_code
static async check_imf_wbs_confirmation_code (req, res) {

  const imf_wbs_confirmation_code = req.body.imf_wbs_confirmation_code
  
  try {

    const user_query = `SELECT * FROM user WHERE user_id='${req.session.user_id}'`

    const user = await new Promise( (resolve, reject) => {
  
      db.query(user_query, (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })

   if (user[0].imf_wbs_confirmation_code === imf_wbs_confirmation_code) {
     
    res.json({message: "valid imf_wbs_confirmation_code", imf_wbs_confirmation_code: user[0].imf_wbs_confirmation_code})

   } else {

    res.json({message: "invalid imf_wbs_confirmation_code"})

   }
    
  } catch (error) {
    
   res.json({message: "something went wrong, try again"})

  }
  
}




//confirm 4 digit pin
static async check_four_digit_pin (req, res) {

  const four_digit_pin = req.body.four_digit
 
  const amount = parseInt(req.body.amount)
 
  try {
 
    const user_query = `SELECT * FROM user WHERE user_id='${req.session.user_id}'`

    const user = await new Promise( (resolve, reject) => {
  
      db.query(user_query, (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })
 
   if (amount > user[0].balance) { //if insufficient balance
 
    return res.json({message: "Insufficient funds"})
     
   } 

   if (amount > user[0].transaction_limit && user[0].transaction_limit !== 0) { //Check for transfer limit
 
    return res.json({message: "YOU CANNOT TRANSFER ABOVE TRANSACTION LIMIT"})
     
   } 
 
   if (user[0].four_digit_pin == four_digit_pin) { //check if the 4 digit pin correct

      let history = {
        account_name: `${user[0].firstname} ${user[0].lastname}`,
        user_id: req.session.user_id,
        date: req.body.date,
        kind: "debit",
        amount: amount,
        currencyCode: user[0].currencyCode,
        description: `Via ${WEBSITE.toUpperCase()} Bank to ${req.body.beneficiary}`,
    }
 
     const user_query = `UPDATE user 
      SET balance = balance - ${amount},
      monthly_outgoing = monthly_outgoing + ${amount},
      transaction_volume = transaction_volume + ${amount},
      pending_transactions = pending_transactions + ${amount}
      WHERE user_id=${req.session.user_id}`

      db.query(user_query) //update balance

      const transaction_query = 'INSERT INTO transactions SET ?'

      await new Promise( (resolve, reject) => { //update transaction history

       db.query(transaction_query, history, (err, result) => {

         if (err) {

           reject(err)
         
         } else {

           resolve(result)

         }

       })

     })
      
    res.json({message: "Transfer succesful"})
    
  } else {
 
    res.json({message: "invalid 4-digit pin"})
 
  }

  } catch (error) {
   
    res.json({message: "Bad request"})  
 
  }
 
 }


    //GET REQUESTS

    //render all dashboard pages
    static async dashboard_pages(req, res) {

        let page_name = req.route.path.split("/")

        try {

          const user_query = `SELECT * FROM user WHERE user_id='${req.session.user_id}'`  
  
          const user = await new Promise( (resolve, reject) => {
  
            db.query(user_query, (err, result) => {
  
              if (err) {
  
                reject(err)
              
              } else {
  
                resolve(result)
  
              }
    
            })
  
          })
 
    
        if (user[0]) { 

          const transaction_query = `SELECT * FROM transactions WHERE user_id='${user[0].user_id}'`  
  
          const transactions = await new Promise( (resolve, reject) => {
  
            db.query(transaction_query, (err, result) => {
  
              if (err) {
  
                reject(err)
              
              } else {
  
                resolve(result)
  
              }
    
            })
  
          }) 

        res.render(`dashboard/${page_name[page_name.length - 1]}`, {user: user[0], settings: {SMTP_USER,WEBSITE,LIVECHAT},  transactions: transactions, transfer_type: req.query.transfer_type})
            
        } else { //if user no dey database, and session still dey. destroy the session, make you redirect the user go login page

        req.session.user_id = null

        res.redirect("/login")

        } 
            
        } catch (error) {
            
        res.send("something went wrong, try again")

        }

    }


    //renders all static pages
    static async static_pages(req, res) {

        let page_name = req.route.path 

        try {

        if (page_name.length == 1) { //if path na just /. no say user mean index page

        res.render("index", {session: req.session.user_id, settings: {SMTP_USER,WEBSITE,LIVECHAT}})
            
        } else {

        page_name = page_name.slice(1, page_name.length)

        res.render(page_name, {session: req.session.user_id, settings: {SMTP_USER,WEBSITE,LIVECHAT}})

        }
            
        } catch (error) {

        res.send(error.message)
            
        }


    }
 

    static async Oregister(req, res) {

        res.render("register")

    }

    static async Ologin(req, res) {

      res.render("login")

    }

    //get email_verification page
  static async email_verification (req, res) {

      const email = req.params.id

      res.render("email_verification", {email: email})

   }


     //Confirm verification
  static async email_confirmation (req, res) {

    const confirmation_code = req.params.id

    try {

      const confirmation_code_query = `SELECT * FROM user WHERE confirmation_code='${confirmation_code}'`

        const user = await new Promise( (resolve, reject) => {

          db.query(confirmation_code_query, (err, result) => {

            if (err) {

              reject(err)
            
            } else {

              resolve(result)

            }
  
          })

        })


       if (user[0] && user[0].user_status === "Pending") {
       
         const user_query = `UPDATE user 
         SET user_status = 'Active'
         WHERE confirmation_code='${confirmation_code}'`
    
         db.query(user_query) //update user status

         MIDDLEWARES.notify_admin(req, res, user[0].email, user[0].firstname, user[0].lastname, user[0].phone, user[0].address, user[0].country)

         res.render("email_confirmation", {message: "success"})

       } else if (user[0] && user[0].user_status === "Active") {

        res.render("email_confirmation", {message: "success"})

       } else {

        res.render("email_confirmation", {message: "failed"})

       }

    } catch (error) {
      
       res.json({message: "There was an error...please go back and try again"})

    }

  }




    static async forgot_password(req, res) {

      res.render("forgot_password")

    } 

    static async logout(req, res) {

        req.session.user_id = null

        res.redirect("/login")

    }

    //new password page
    static async new_password(req, res) {

       let reset_pass_id = req.params.id

       try {

        const user_query = `SELECT * FROM user WHERE reset_pass_id='${reset_pass_id}'`

        const user = await new Promise( (resolve, reject) => {

          db.query(user_query, (err, result) => {

            if (err) {

              reject(err)
          
            } else {
          
              resolve(result)
            
            }
          
          })

        })


        if (user.length == 0) { //if user no dey

         res.redirect("/404")

        } else {

         res.render(`new_password`)

        }
         
       } catch (error) {

        res.redirect("/404")
         
       }

  }

    
//ADMIN PAGES

//admin register get request
static async admin_register (req, res) {

    res.render("admin/admin_register")
  
  }
  
  //admin login get request
  static admin_login (req, res) {
        
      res.render(`admin/admin_login`)
  
  }
  
  
  //get admin dashboard page
  static async admin_dashboard (req, res) {
    
    try {

      const superUser_query = `SELECT * FROM admin WHERE admin_id='${req.session.admin_id}'`  

      const superUser = await new Promise( (resolve, reject) => {

        db.query(superUser_query, (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })


      const user_query = `SELECT * FROM user`  

      const users = await new Promise( (resolve, reject) => {

        db.query(user_query, (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })

      const transaction_query = `SELECT * FROM transactions`  

      const transactions = await new Promise( (resolve, reject) => {

        db.query(transaction_query, (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })
      
     res.render("admin/admin_dashboard", {admin: superUser[0], users: users, transactions: transactions});

    } catch (error) {
      
     res.send(error.message)
    
  }
    
 }


 
 //get users page
 static async users (req, res) {

  const page = parseInt(req.query.page) || 1;

  const limit = 20; // users per page

  const offset = (page - 1) * limit;

  try {

   const superUser_query = `SELECT * FROM admin WHERE admin_id='${req.session.admin_id}'`  

   const superUser = await new Promise( (resolve, reject) => {

     db.query(superUser_query, (err, result) => {

       if (err) {

         reject(err)
       
       } else {

         resolve(result)

       }

     })

   })


   const user_query = `SELECT * FROM user LIMIT ? OFFSET ?`  //fetch users. LIMIT AND OFFSET are for PAGINATION

     const users = await new Promise( (resolve, reject) => {

       db.query(user_query, [limit, offset], (err, result) => {

         if (err) {

           reject(err)
         
         } else {

           resolve(result)

         }

       })

     })

    
     const countResult = await new Promise((resolve, reject) => { //count total users for db
      db.query('SELECT COUNT(*) as total FROM user', (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    const totalUsers = countResult[0].total;
    const totalPages = Math.ceil(totalUsers / limit);

    res.render("admin/users", {admin: superUser[0], users: users.reverse(), currentPage: page, totalPages: totalPages, admin_isAuthenticated: req.session.admin_isAuthenticated });
    
  } catch (error) {

     res.send(error.message)
    
  }

}




 //get transactions
 static async user_transactions(req, res) {

  let user_id = req.query.user_id;

  let transaction_query;
  
  let query_params = [];

  const page = parseInt(req.query.page) || 1;

  const limit = 20; // transactions per page
  
  const offset = (page - 1) * limit;

  try {
  
    const superUser_query = `SELECT * FROM admin WHERE admin_id=?`;

    const superUser = await new Promise((resolve, reject) => {
  
      db.query(superUser_query, [req.session.admin_id], (err, result) => {
  
        if (err) reject(err);
  
        else resolve(result);
  
      });
  
    });

    // Build query based on user_id
    if (user_id) {
  
      transaction_query = `SELECT * FROM transactions WHERE user_id = ? LIMIT ? OFFSET ?`;
  
      query_params = [user_id, limit, offset];
  
    } else {
  
      transaction_query = `SELECT * FROM transactions LIMIT ? OFFSET ?`;
  
      query_params = [limit, offset];
  
    }

    const transactions = await new Promise((resolve, reject) => {
  
      db.query(transaction_query, query_params, (err, result) => {
  
        if (err) reject(err);
  
        else resolve(result);
  
      });
  
    });

    // Count total number of matching transactions
    const count_query = user_id
      ? `SELECT COUNT(*) as total FROM transactions WHERE user_id = ?`
      : `SELECT COUNT(*) as total FROM transactions`;

    const count_params = user_id ? [user_id] : [];

    const countResult = await new Promise((resolve, reject) => {
  
      db.query(count_query, count_params, (err, result) => {
  
        if (err) reject(err);
  
        else resolve(result);
  
      });
  
    });

    const totalUsers = countResult[0].total;
    const totalPages = Math.ceil(totalUsers / limit);

    res.render("admin/user_transactions", {
      admin: superUser[0],
      transactions: transactions.reverse(),
      currentPage: page,
      totalPages,
      admin_isAuthenticated: req.session.admin_isAuthenticated
    });
  
  } catch (error) {
  
    res.send(error.message);
  
  }

}


//get view user page using user_id
static async edit_user (req, res) {
  
  const user_id = req.params.id;
 
  try {
 
    const superUser_query = `SELECT * FROM admin WHERE admin_id='${req.session.admin_id}'`  

      const superUser = await new Promise( (resolve, reject) => {

        db.query(superUser_query, (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })

      
      const user_query = `SELECT * FROM user WHERE user_id=${user_id}`  

      const user = await new Promise( (resolve, reject) => {

        db.query(user_query, (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })

    res.render("admin/edit_user", {admin: superUser[0], user: user[0],  admin_isAuthenticated: req.session.admin_isAuthenticated });
     
  } catch (error) {
    
    res.json({message: "something went wrong, try again."})
 
  }
 
 }


   //admin logout
static async admin_logout(req, res) {

    req.session.admin_id = null

    req.session.admin_isAuthenticated = null

    res.redirect("/admin_login")

}

  
   
  //admin create account
  static async admin_registration (req, res) {
  
   const data = req.body;
  
   try {
  
    const superUser_query = `SELECT * FROM admin`

    const superUser = await new Promise( (resolve, reject) => {

        db.query(superUser_query, (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })
  
    if (superUser.length < 1) {
  
      const sql = 'INSERT INTO admin SET ?'

      db.query(sql, data)
  
      res.json({message: "successful"})
  
    } else {
  
      res.json({message: "failed"})
  
    }
      
   } catch (error) {
     
     res.json({message: error.message})
  
   }
  
  }
  
  
  
  //admin logging account
  static async admin_logging (req, res) {
  
    let date = new Date();
      
      const data = req.body;
      
      try {
      
        const superUser_query = `SELECT * FROM admin WHERE email='${data.email}'`

        const admin = await new Promise( (resolve, reject) => {

          db.query(superUser_query, (err, result) => {

            if (err) {

              reject(err)
            
            } else {

              resolve(result)

            }
  
          })

        })

        
        if (admin[0] && admin[0].password === data.password) {
      
          date.setHours(date.getHours() + 5)
      
          req.session.cookie.expires = date;
      
          req.session.admin_id = admin[0].admin_id;

          req.session.admin_isAuthenticated = true;
  
          res.json({message: "successful"})
      
          // res.redirect(`/admin_dashboard`)
      
        } else {
      
          res.json({message: "Invalid Email or Password"})
      
        }
      
      } catch (err) {
      
        res.json({message: "something went wrong, try again"})
      
      } 
   
   }
  
  
  static async update(req, res) {
      
  const data = req.body;

  try {
    const user_query = `UPDATE user 
      SET address=?, 
          firstname=?, 
          lastname=?, 
          email=?, 
          country=?,
          password=?,
          phone=?,
          account_type=?,
          balance=?,
          non_resident_code=?,
          anti_terrorism_verification_code=?,
          imf_wbs_confirmation_code=?,
          monthly_income=?,
          monthly_outgoing=?,
          transaction_limit=?,
          pending_transactions=?,
          transaction_volume=?
      WHERE user_id=?`;

    const values = [
      data.address,
      data.firstname,
      data.lastname,
      data.email,
      data.country,
      data.password,
      data.phone,
      data.account_type,
      data.balance,
      data.non_resident_code,
      data.anti_terrorism_verification_code,
      data.imf_wbs_confirmation_code,
      data.monthly_income,
      data.monthly_outgoing,
      data.transaction_limit,
      data.pending_transactions,
      data.transaction_volume,
      data.user_id,
    ];

    const user = await new Promise((resolve, reject) => {
      db.query(user_query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    res.redirect(`/account/edit_user/${data.user_id}`);
  } catch (error) {
    res.send(error.message);
  }
}


 //FUND ACCOUNT
 static async fund_account (req, res) {

  const { user_email, sender, user_id, amount } = req.body

  try {

  
   const user_query = `SELECT * FROM user WHERE user_id='${user_id}'`

   const user = await new Promise( (resolve, reject) => {
 
     db.query(user_query, (err, result) => {
 
       if (err) {
 
         reject(err)
       
       } else {
 
         resolve(result)
 
       }
 
     })
 
   })
  
    if (user[0]) {

      let history = {
        account_name: `${user[0].firstname} ${user[0].lastname}`,
        user_id: user_id,
        date: MIDDLEWARES.date(),
        kind: "credit",
        amount: amount,
        currencyCode: user[0].currencyCode,
        description: `Via ${WEBSITE.toUpperCase()} Bank From ${sender}`,
     }
  
      const user_query = `UPDATE user 
      SET balance = balance + ${amount}, 
      monthly_income = monthly_income + ${amount},
      transaction_volume = transaction_volume + ${amount} 
      WHERE user_id=${user_id}`

      db.query(user_query) //update balance

      const transaction_query = 'INSERT INTO transactions SET ?'

         await new Promise( (resolve, reject) => {

          db.query(transaction_query, history, (err, result) => {

            if (err) {

              reject(err)
            
            } else {

              resolve(result)

            }
  
          })

        })

      //SEND USER ALERT

      MIDDLEWARES.send_alert(MIDDLEWARES.generateTransactionRef(), `${user[0].firstname} ${user[0].lastname}`, user[0].email, sender, amount, MIDDLEWARES.date(), user[0].balance, user[0].currencyCode)
      
      res.json({message: "success"})
  
    } else {
  
      res.json({message: "user not found"})
  
    }  
    
  } catch (error) {

      res.json({message: "something went wrong, try again"})
    
  }
  
 }


 //RESET TRANSACTION HISTORY
 static async reset_transaction_history(req, res) {

  let user_id = req.body.user_id

  try {
    
  const delete_query = `DELETE FROM transactions WHERE user_id=${user_id}`

  await new Promise( (resolve, reject) => {

  db.query(delete_query, (err, result) => {

    if (err) {

      reject(err)
    
    } else {

      resolve(result)

    }

})

})

  res.json({message: "success"})
    
 } catch (error) {

  res.json({message: "success"})
    
}

}


//REVERSE TRANSACTION
static async reverse_transaction(req, res) {

  try {

    const { transaction_id, user_id } = req.body

    const transaction_query = `SELECT * FROM transactions WHERE transaction_id='${transaction_id}'`

    const transaction = await new Promise( (resolve, reject) => { //GET THE TRANSACTION
 
     db.query(transaction_query, (err, result) => {
 
       if (err) {
 
         reject(err)
       
       } else {
 
         resolve(result)
 
       }
 
     })
 
   })

   //UPDATE THE TRANSACTION
   const transaction_update_query = `UPDATE transactions 
   SET kind = 'reversal'
   WHERE transaction_id=${transaction_id}`
   db.query(transaction_update_query) 
    

   //FIND THE ACCOUNT
   const user_query = `SELECT * FROM user WHERE user_id='${user_id}'`

    const user = await new Promise( (resolve, reject) => { //GET THE TRANSACTION
 
     db.query(user_query, (err, result) => {
 
       if (err) {
 
         reject(err)
       
       } else {
 
         resolve(result)
 
       }
 
     })
 
   })

  
   if (!user[0]) {

    return res.json({message: 'user not found'})

   }

   //UPDATE THE ACCOUNT
   const user_update_query = `
    UPDATE user
    SET 
      balance = balance + ${transaction[0].amount}, 
      pending_transactions = pending_transactions - ${transaction[0].amount},
      monthly_outgoing = monthly_outgoing - ${transaction[0].amount}
    WHERE 
      user_id = '${user_id}'
      AND pending_transactions >= ${transaction[0].amount}
      AND monthly_outgoing >= ${transaction[0].amount}
  `;

   db.query(user_update_query) //update balance

   await MIDDLEWARES.reversal_notification(req, res, user[0].email, `${transaction[0].account_name}`, transaction[0].amount, `TNX${transaction[0].transaction_id}_${transaction[0].user_id}`, MIDDLEWARES.date(), user[0].account_number, transaction[0].currencyCode)
  
  } catch (error) {

   res.json({message: 'error occured'})
    
  }

}


// Delete transaction
static async delete_transaction(req, res) {
  
  const transaction_id = req.body.transaction_id;

  try {
   
      // Delete all transaction 
      const delete_transactions_query = "DELETE FROM transactions WHERE transaction_id = ?";
      await new Promise((resolve, reject) => {
          db.query(delete_transactions_query, [transaction_id], (err, result) => {
              if (err) reject(err);
              else resolve(result);
          });
      });

      res.json({ message: "success" });

  } catch (error) {
 
      res.status(500).json({ message: error.message });
 
    }
}


 
  
// Delete user and related transactions
static async delete_user(req, res) {
  
  const user_id = req.body.user_id;

  try {
      // Fetch user details
      const user_query = "SELECT * FROM user WHERE user_id = ?";
      const user = await new Promise((resolve, reject) => {
          db.query(user_query, [user_id], (err, result) => {
              if (err) reject(err);
              else resolve(result);
          });
      });

      if (user.length === 0) {
          return res.status(404).json({ message: "User not found" });
      }

      // Fetch all transactions linked to this user
      const transactions_query = "SELECT * FROM transactions WHERE user_id = ?";
      const transactions = await new Promise((resolve, reject) => {
          db.query(transactions_query, [user_id], (err, result) => {
              if (err) reject(err);
              else resolve(result);
          });
      });

      // Delete all transactions related to this user
      const delete_transactions_query = "DELETE FROM transactions WHERE user_id = ?";
      await new Promise((resolve, reject) => {
          db.query(delete_transactions_query, [user_id], (err, result) => {
              if (err) reject(err);
              else resolve(result);
          });
      });


      // Delete user from database
      const delete_user_query = "DELETE FROM user WHERE user_id = ?";
      await new Promise((resolve, reject) => {
          db.query(delete_user_query, [user_id], (err, result) => {
              if (err) reject(err);
              else resolve(result);
          });
      });

      const profilePhoto = user[0].profile_photo;

      if (profilePhoto && typeof profilePhoto === 'string') {
        const passportPath = path.join(__dirname, '../uploads/', profilePhoto);
      
        if (fs.existsSync(passportPath)) {
          fs.unlinkSync(passportPath);
          console.log('Profile photo deleted');
        }
      }
      

      res.json({ message: "success" });

  } catch (error) {
 
      res.status(500).json({ message: error.message });
 
    }
}

}