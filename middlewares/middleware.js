const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const fs = require("fs")
const nodemailer = require("nodemailer");
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const WEBSITE = process.env.WEBSITE


module.exports = class MIDDLEWARES {

static async SendConfirmationMail(req, res, useremail, confirmationCode, firstname) {
  const smtpConfig = {
    host: SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    } 
  };

  const transporter = nodemailer.createTransport(smtpConfig);

  // Setup Handlebars options correctly
  const handlebarOptions = {
    viewEngine: {
      extname: '.handlebars',
      partialsDir: path.resolve('./views/'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
    extName: '.handlebars'
  };

  transporter.use('compile', hbs(handlebarOptions));

  const mailOptions = {
    from: `"${WEBSITE.toUpperCase()} Bank" <${SMTP_USER}>`,
    to: useremail,
    subject: 'Confirmation Email',
    attachments: [
      {
        filename: 'logo.png',
        path: './public/assets/img/transparent_logo.png',
        cid: 'logo'
      }
    ],
    template: 'handlebars/ConfirmationEmail',
    context: {
      confirmationCode: confirmationCode,
      firstname: firstname,
      bankName: `${WEBSITE} BANK`,
      supportEmail: SMTP_USER
    }
  };

  try {
      
    await new Promise((resolve, reject) => {
      
      transporter.sendMail(mailOptions, (err, info) => {
        
        if (err) reject(err);
        
        else resolve(info);
          
      });
    
        
    });

    return 'successful';

  } catch (err) {

    console.log(err.message)
     
    return 'error occurred';
    
  }
        
}


//Notify Admin Account was created
static notify_admin(req, res, useremail, firstname, lastname, phone, address, country)  {

    var smtpConfig = {
        host: SMTP_HOST, // Zoho SMTP host
        port: 465, // SSL port
        secure: true, // Use SSL
        auth: {
            user: SMTP_USER, // Replace with your Zoho email address
            pass: SMTP_PASS // Use your Zoho app-specific password (if you have 2FA enabled)
        }
    };
  
  var transporter = nodemailer.createTransport(smtpConfig);
  
       // point to the template folder
    const handlebarOptions = {
      viewEngine: {
          partialsDir: path.resolve('./views/'),
          defaultLayout: false,
      },
      viewPath: path.resolve('./views/')
    };
    
    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions));
  
    
    var mailOptions = {
      from: `${WEBSITE.toUpperCase()} Bank <${SMTP_USER}>`, // sender address, // sender address
      to: SMTP_USER, // list of receivers
      subject: 'New user registered',
      template: 'handlebars/notify_admin', // the name of the template file i.e email.handlebars
      context:{
        email: useremail,
        firstname: firstname, // replace {{name}} with Adebola
        lastname: lastname,
        phone: phone,
        address: address,
        country: country,
      }
      
    };      
  
    // trigger the sending of the E-mail
     transporter.sendMail(mailOptions, (err, info) => {
  
      if (err) {
  
        res.json({message: err.message})

      } else {

        res.json({message: "Email was sent. We will get back to you as soon as possible"})
   
    }
  
  }) 
  
}
  

static async send_link(req, res, useremail, reset_pass_id) {

      var smtpConfig = {
        host: SMTP_HOST, // Zoho SMTP host
        port: 465, // SSL port
        secure: true, // Use SSL
        auth: {
            user: SMTP_USER, // Replace with your Zoho email address
            pass: SMTP_PASS // Use your Zoho app-specific password (if you have 2FA enabled)
        }
    };
    
    var transporter = nodemailer.createTransport(smtpConfig);
    
    // Point to the template folder
    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/')
    };
    
    // Use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions));
    
    var mailOptions = {
        from: `${WEBSITE.toUpperCase()} BANK <${SMTP_USER}>`, // Sender address
        to: useremail, // Recipient email
        subject: 'Password Reset Email',
        template: 'handlebars/reset_pass_email', // The name of the template file i.e. reset_pass_email.handlebars
        context: {
            reset_pass_id: reset_pass_id, // Context data for the template
            useremail: useremail,
            bankName: `${WEBSITE} BANK`,
        }
    };
    
    // Wrap sendMail in a Promise for async handling
    try {
        
      await new Promise((resolve, reject) => {

            transporter.sendMail(mailOptions, (err, info) => {

                if (err) {
              
                  reject(err); // Reject if there's an error
              
                } else {
              
                  resolve(info); // Resolve on successful send
              
                }
            });
        });

        return res.json({message: 'success'}); // Success message if email is sent
    
    } catch (err) {

        return res.json({message: "error occured"}); // Failure message in case of error
    
    }

 } 


//send alert to user
static send_alert(reference, receiver_name, receiver_email, sender, amount, date, availabe_balance, currencyCode) {

  var smtpConfig = {
    host: SMTP_HOST,
    port: 465,
    secure: true, // use SSL
     auth:{
             user: SMTP_USER,
             pass: SMTP_PASS
       }
};

var transporter = nodemailer.createTransport(smtpConfig);
      
      // point to the template folder
      const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/')
      };
      
      // use a template file with nodemailer
      transporter.use('compile', hbs(handlebarOptions));
      
      var mailOptions = {
        from: `${WEBSITE.toUpperCase()} Bank <${SMTP_USER}>`, // sender address
        to: receiver_email,
        subject: 'Credit Alert',
        template: 'handlebars/send_alert', // the name of the template file i.e email.handlebars
        context:{
            reference,
            receiver_name,
            receiver_email,
            sender,
            bankName: `${WEBSITE} BANK`,
            amount: (new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount)),
            available_balance: (new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(availabe_balance + amount)),
            date,
            year: new Date().getFullYear()
        }
      };      
          // trigger the sending of the E-mail
          transporter.sendMail(mailOptions, (err, info) => {

                if (err) {
                
                  return "error occured"
                
                } else {

                    return "success"
                
                }
          })        
}



//send user reversal notification
static async reversal_notification(req, res, receiver_email, account_name, amount, transaction_id, reversalDate, account_number, currencyCode) {

  var smtpConfig = {
    host: SMTP_HOST,
    port: 465,
    secure: true, // use SSL
     auth:{
             user: SMTP_USER,
             pass: SMTP_PASS
       }
};

var transporter = nodemailer.createTransport(smtpConfig);
      
      // point to the template folder
      const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/')
      };
      
      // use a template file with nodemailer
      transporter.use('compile', hbs(handlebarOptions));
      
      var mailOptions = {
        from: `${WEBSITE.toUpperCase()} Bank <${SMTP_USER}>`, // sender address
        to: receiver_email,
        subject: 'Funds Reversal',
        template: 'handlebars/reversal', // the name of the template file i.e email.handlebars
        context:{
            receiver_email,
            account_name,
            amount: (new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount)),
            transaction_id,
            reversalDate,
            account_number,
            reason: 'Local Entrepreneur Protection Needed',
            bankName: `${WEBSITE.toUpperCase()} BANK`,
            accountLink: `https://${WEBSITE.toLowerCase()}.com/account/dashboard`,
            supportEmail: SMTP_USER
        }
      };      
      
      try {
        
      await new Promise( (resolve, reject) => { //GET THE TRANSACTION

          transporter.sendMail(mailOptions, (err, result) => {
        
            if (err) {
        
              reject(err)
        
            } else {
        
              resolve(result)
        
            }
        
          })
          
      })

      res.json({message: 'success'})

    } catch (error) {
      
      res.json({message: 'error occured'})

    }

  }


static create_virtual_card (data) {

    function generateRandomDigits(groups = 4, digitsPerGroup = 4) { //function generates random card numbers
        
        let result = [];
    
        for (let i = 0; i < groups; i++) {
            let group = "";
            for (let j = 0; j < digitsPerGroup; j++) {
                group += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
            }    
            result.push(group);
        }
        return result.join(" "); // Join groups with spaces
    }

    const card_number = generateRandomDigits(); // Output: "5243 9823 7823 4678" (randomized)

    const expiry = (new Date().getFullYear() + 4).toString().split("");

    const virtual_card = JSON.stringify({

        name: `${data.firstname} ${data.lastname}`,

        card_number: card_number,

        expiry: `01/${expiry[2]}${expiry[3]}`
    
      })

    return virtual_card

}


//get currency code
static async get_currency_code (countryName) {
    
  const res = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);

  const data = await res.json();

  if (!data || !data[0]?.currencies) {
  
  return 'USD';
  
  }

  const currencyCode = Object.keys(data[0].currencies)[0];

  return currencyCode;

}


/* DATE function */

static date() {
     
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "thursday", "Friday", "Saturday"];

  let d = new Date();

  let dateAdded = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`

  return dateAdded;

 }


 static generateTransactionRef() {
  
  const prefix = "NSN_"; // You can change this to your bank's prefix
  
  const timestamp = Date.now().toString(); // current timestamp
  
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0"); // 6-digit random number
  
  return `${prefix}${timestamp}${random}`;

}



}