$(document).ready(function(){


  /* DATE function */

 function date() {
     
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "thursday", "Friday", "Saturday"];

  let d = new Date();

  let dateAdded = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`

  return dateAdded;

 }

  /*SOME VARIABLES*/
  
  let spinner = $(".fa-spinner");

  let overlay = $('.overlay');

  let error_modal = $('.error_modal');

  let network_error_modal = $('#networkModal')

  let success_modal = $('.success_modal');

  /*SOME VARIABLES*/

  /* FOR SIDE BAR */
  let open_hamburger = $(".open_hamburger")

  let close_hamburger = $(".close_hamburger")

  let container =  $(".container")

  let sub_container =  $(".sub_container")

  let side_bar =  $(".side_bar")

  function Open_Sidebar() {

  side_bar.css({"display":"block"})

  container.css({
    "height": "100vmax", 
    "width": "calc(100% + 250px)",
    "overflow-x": "auto",
    "overflow-y": "hidden"
  });

  sub_container.css({
    "transition": "0.5s",
    "width": "calc(100% - 250px)",
  });

  open_hamburger.css({"display": "none"})

  close_hamburger.css({"display": "inline-block"})
    
  }

  function Close_Sidebar() {

  side_bar.css({"display":"none"})

  container.css({
    "height": "auto", 
    "width": "100%",
  });

  sub_container.css({
    "transition": "0s",
    "width": "100%",
  });

  close_hamburger.css({"display": "none"})

  open_hamburger.css({"display": "inline-block"})

  }


  $(window).resize( function() {

     if (innerWidth >= 850) { //for desktops

      side_bar.css({"display":"block"})
     
      sub_container.css({"width": "calc(100% - 250px)"})

      container.css({
        "width": "100%",
        "height": "auto",
        "overflow-x": "auto",
        "overflow-y": "hidden"
      })

      open_hamburger.css({"display": "none"})

      close_hamburger.css({"display": "none"})

     }

     if (innerWidth >= 700 && innerWidth <= 850) { //for tablets

      Close_Sidebar()
      
     }

    if (innerWidth <= 700) { //for tablets

      Close_Sidebar()
       
     }
        
  })

  open_hamburger.click(function() {

    Open_Sidebar()
    
  })

  close_hamburger.click(function() {
  
    Close_Sidebar()

  })

 /* FOR SIDE BAR */



 /* TOOGLE BOX FOR NAV BAR */

 let pop_up_box = $(".pop_up_box") //the pop up box

 pop_up_box.hide() //when page first loads, hide it

 container.click( function (e) { //when the overall container is clicked

  if (e.target.className.includes("toggler")) { //check the class name of the exact element that was clicked, if it inludes toggler then na the normal toggler btn.

    pop_up_box.slideToggle() //allow toggle

  } else {

    pop_up_box.slideUp() //if the element no get toggler class, hide the pop up

  }

 })

 /* TOOGLE BOX FOR NAV BAR */

 


 // REMOVE THOSE GOOGLE TRANSLATE NONSENSE FROM THE TOP
 setInterval(() => {

  $("body").css({'position': 'relative', 'min-height': '100%', 'top': '0px'})

  let google_body_elem = $('.skiptranslate');

  let another_google = $('#goog-gt-')

  another_google.remove()

  google_body_elem[0] ? google_body_elem[0].attributes[1].nodeValue = "display: none;" : null

  let text = $('.VIpgJd-ZVi9od-l4eHX-hSRGPd')

  text[0] ? text[0].attributes[0].nodeValue = "dissapear" : null

  let google_select_elem = $('.goog-te-combo');

  google_select_elem.change(function(){

  google_body_elem[0].attributes[1].nodeValue = "display: none;" //make the files dissapear

  })

}, 1000) 





/* VALIDATE PASSWORD */

  let submit_btn = $("#submitBtn");

  submit_btn.click(function(e) {

  let pass = $("#id_password1").val()

  let confirm_pass = $("#id_password2").val()
  
   if (pass !== confirm_pass) {

    e.preventDefault();
    
    alert("Password must match 'confirm password'")
  
  }

})

/* VALIDATE PASSWORD */


// UPDATE PROFILE PICTURE 
$('#file').on("change", function() {

let formData = new FormData();

let user_email = $('#email').val() //get the user's email 

formData.append('file', file.files[0]);

formData.append('email', user_email) //append email to data to be sent to backend

$.ajax({
       url : '/update_photo',
       type : 'POST',
       data : formData,
       processData: false,  // tell jQuery not to process the data
       contentType: false,  // tell jQuery not to set contentType
       success : function(data) {
           alert(`${data.message}`);
           window.location.replace(`/account/profile`)
       }
});

});



//SEND PASSWORD RESET LINK
let forgot_password_form = $('#forgot_password_form');

forgot_password_form.submit(function(e) {

e.preventDefault();

let overlay = $('.overlay');

overlay.show()

$.ajax({
  url : '/request_reset_pass_link',
  type : 'POST',
  data :  forgot_password_form.serialize(),
  success: function (data) {

     if (data.message === "success") {

      overlay.hide();

      alert("A password reset link has been sent to this email. please follow the link to reset your password.")

     } else if  (data.message === "user not found") {

      overlay.hide();

      alert("Sorry. But you do not have an account with us.")
       
     } else {

      overlay.hide();

      alert("Something went wrong, try again")

     }
      
  },

})

})


//CREATE NEW PASSWORD
let create_pass_btn = $("#createpass_Btn");

create_pass_btn.click( (e) => {

let overlay = $('.overlay');

e.preventDefault();

let password = $("#password").val();

let confirm_password = $("#confirm_password").val();

let reset_pass_id = window.location.href.split("/")[window.location.href.split("/").length - 1]
 
if (password === "" || confirm_password === "") {

alert("Fields cannot be empty")

} else if (password !== confirm_password) {

alert("Password Must Match 'Confirm Password' ")

} else {

overlay.show();

$.ajax({
 url : '/create_new_password',
 type : 'POST',
 data :  {
    password: password,
    confirm_password: confirm_password,
    reset_pass_id: reset_pass_id
 },

 success : function(data) {

   overlay.hide();
    
   if (data.message === "success") {

    window.location.replace("/login")

   } else if (data.message === "invalid token") {

    alert("Token is invalid. please try again or restart the process")

   } else {

    alert("An error occured. try again later")

   }
   
 }

});

} 

}); 




// SEND COMPLAINT
let complaint_btn = $("#complaint_btn");

complaint_btn.click((e) => {
e.preventDefault();

let subject = $("#subject").val();
let name = $("#fullname").val();
let email = $("#email").val();
let complaint = $("#complaint").val();

if (subject === "" || name === "" || email === "" || complaint === "") {
    alert("Fields cannot be empty");
} else {
    complaint_btn.prop('disabled', true);
    spinner.show();

    $.ajax({
        url: '/send_complaint_mail',
        type: 'POST',
        data: {
            subject: subject,
            name: name,
            email: email,
            message: complaint,
        },
        success: function(data) {
            spinner.hide();
            alert(data.message);

            // ✅ Reset form fields
            $("#subject").val("");
            $("#fullname").val("");
            $("#email").val("");
            $("#complaint").val("");

            // Re-enable the button
            complaint_btn.prop('disabled', false);
        },
        error: function() {
            spinner.hide();
            alert("An error occurred. Please try again.");
            complaint_btn.prop('disabled', false);
        }
    });
}
});


//GENERATE RANDOM IP ADDRESS FOR DASHBOARD
function generateRandomIP() {
  const randomOctet = () => Math.floor(Math.random() * 256); // Generates a number between 0 and 255
  return `${randomOctet()}.${randomOctet()}.${randomOctet()}.${randomOctet()}`;
}

const randomIP = generateRandomIP();

$('#ip_address').text(`${randomIP}`)



//GENERATES SECURITY DATE FOR DASHBOARD
function getDateThreeDaysAgo() {
  let dateObj = new Date(); // Create a new date object for the current date
  dateObj.setDate(dateObj.getDate() - 3); // Subtract 3 days from the current date
  return dateObj.toDateString(); // Return the date in a readable format
}

const dateThreeDaysAgo = getDateThreeDaysAgo();

$("#security_check_date").text(`${dateThreeDaysAgo}`)





//TRANSFER FUNDS
let transfer_funds_form = $('#transfer_funds_form');

transfer_funds_form.submit(function(e) {

  e.preventDefault();

  let error_text;

  overlay[0].attributes[1].nodeValue = "display: flex;"

  $.ajax({
    url : '/transfer_money',
    type : 'POST',
    data :  transfer_funds_form.serialize(),
    success: function (data) {

    setTimeout(() => {

    const transfer_details = data.transfer_details

    if (parseInt(transfer_details.amount) > parseInt(transfer_details.account_balance)) { //confirm account balance
      
      alert("INSUFFICIENT FUNDS") 
      
      overlay[0].attributes[1].nodeValue = "display: none;"

      return
    
    } 

    if (
      
      parseInt(transfer_details.amount) > parseInt(transfer_details.transaction_limit) &&
      
      parseInt(transfer_details.transaction_limit) !== 0
    
    ) {
    
      alert("YOU CANNOT TRANSFER ABOVE TRANSACTION LIMIT");
    
      overlay[0].attributes[1].nodeValue = "display: none;";
    
      return;
    
    }
    
      localStorage.setItem("date",  date());

      localStorage.setItem("sender", transfer_details.sender);  //save this details for localstorage cause i go need am for other pages

      localStorage.setItem("beneficiary", transfer_details.recipient_name);

      localStorage.setItem("account_number", transfer_details.recipient_account_number);

      localStorage.setItem("beneficiary_bank", transfer_details.bank_name);

      localStorage.setItem("amount", transfer_details.amount);
 
    if (data.message === "Blocked") { //if account status is blocked (I LEFT THIS JUST INCASE HE WANT THIS FEATURE LATA ALSO)

      // error_text = "YOUR TRANSACTION WAS UNABLE TO COMPLETE. REFLECTION PIN IS NEEDED FOR SUCCESSFUL TRANSFER. KINDLY CONTACT THE BANK."

      // error_modal[0].children[0].children[1].innerText = error_text //set error text

      // overlay[0].attributes[1].nodeValue = "display: none;" //close overlay

      // error_modal[0].attributes[1].nodeValue = "display: flex;" //show the reflection pin error

    } else if (data.message === "Active") { //if account status is active

      // window.location.assign("/account/transfer_funds/review_transfer")

      error_text = "YOUR TRANSACTION WAS UNABLE TO COMPLETE. NON-RESIDENT CODE IS NEEDED FOR SUCCESSFUL TRANSFER. KINDLY CONTACT THE BANK."

      error_modal[0].children[0].children[1].innerText = error_text //set error text

      overlay[0].attributes[1].nodeValue = "display: none;" //close overlay

      error_modal[0].attributes[1].nodeValue = "display: flex;" //show the reflection pin error

    } else { //if there is an error from backend

      overlay[0].attributes[1].nodeValue = "display: none;"
 
      alert(data.message)

      window.location.assign("/account/dashboard")

    }      
    
  }, 10000) 
      
  }, 

})

})




//NON RESIDENT CODE PAGE
let non_resident_code_form = $('#non_resident_code_form');

non_resident_code_form.submit(function(e) {

  e.preventDefault();

  success_modal[0].children[0].children[1].innerText = "Non Resident Code Confirmed" //set custom text for h2

  success_modal[0].children[0].children[2].innerText = "Your Non Resident Code has been successfully verified. You can now proceed with your transfer." //set custom text for p

  success_modal[0].children[0].children[3].attributes[0].nodeValue = "/account/transfer_funds/anti_terrorism_verification_code" //set custom link

  if ($("#non_resident_code").val().trim() === "") {

    alert("Field cannot be empty!");

    return

  }

  overlay[0].attributes[1].nodeValue = "display: flex;"

  $.ajax({
    url : '/check_non_resident_code',
    type : 'POST',
    data :  non_resident_code_form.serialize(),
    success: function (data) {

      setTimeout(() => {
   
      if (data.message === "valid non resident code") {

        success_modal[0].attributes[1].nodeValue = "display: flex;"

      } else if (data.message === "invalid non resident code") {

        alert("Invalid code, Please try again")//error_div[0].attributes[1].nodeValue = "display: block;"

        overlay[0].attributes[1].nodeValue = "display: none;"

      } else { //if there is an error from backend

        alert(data.message)

        window.location.assign("/account/dashboard")

      }      
      
    }, 10000)
        
    },

  })

})



//ANTI TERRORISM VERIFICATION CODE PAGE
let anti_terrorism_verification_code_form = $('#anti_terrorism_verification_code_form');

anti_terrorism_verification_code_form.submit(function(e) {

  e.preventDefault();

  success_modal[0].children[0].children[1].innerText = "Anti Terrorism Verification Code Confirmed" //set custom text for h2

  success_modal[0].children[0].children[2].innerText = "Your Anti Terrorism Verification Code has been successfully verified. You can now proceed with your transfer." //set custom text for p

  success_modal[0].children[0].children[3].attributes[0].nodeValue = "/account/transfer_funds/imf_wbs_confirmation_code" //set custom link

  if ($("#anti_terrorism_verification_code").val().trim() === "") {

    alert("Field cannot be empty!");
  
    overlay[0].attributes[1].nodeValue = "display: none;"

    return

  }

  overlay[0].attributes[1].nodeValue = "display: flex;"

  $.ajax({
    url : '/check_anti_terrorism_verification_code',
    type : 'POST',
    data :  anti_terrorism_verification_code_form.serialize(),
    success: function (data) {

      setTimeout(() => {
   
      if (data.message === "valid Anti Terrorism Verification Code") {

        success_modal[0].attributes[1].nodeValue = "display: flex;"

      } else if (data.message === "invalid Anti Terrorism Verification Code") {

        alert("Invalid Code, Please try again")//error_div[0].attributes[1].nodeValue = "display: block;"

        overlay[0].attributes[1].nodeValue = "display: none;"

      } else { //if there is an error from backend

        alert(data.message)

        window.location.assign("/account/dashboard")

      }      
      
    }, 10000)
        
    },

  })

})






//IMF/WBS CONFIRMATION CODE PAGE
let imf_wbs_confirmation_code_form = $('#imf_wbs_confirmation_code_form');

imf_wbs_confirmation_code_form.submit(function(e) {

  e.preventDefault();

  success_modal[0].children[0].children[1].innerText = "Imf/Wbs Confirmation Code Confirmed" //set custom text for h2

  success_modal[0].children[0].children[2].innerText = "Your Imf/Wbs Confirmation Code has been successfully verified. You can now proceed with your transfer." //set custom text for p

  success_modal[0].children[0].children[3].attributes[0].nodeValue = "/account/transfer_funds/review_transfer" //set custom link

  if ($("#imf_wbs_confirmation_code").val().trim() === "") {

    alert("Field cannot be empty!");

    return

  }

  overlay[0].attributes[1].nodeValue = "display: flex;"

  $.ajax({
    url : '/check_imf_wbs_confirmation_code',
    type : 'POST',
    data :  imf_wbs_confirmation_code_form.serialize(),
    success: function (data) {

      setTimeout(() => {
   
      if (data.message === "valid imf_wbs_confirmation_code") {

        success_modal[0].attributes[1].nodeValue = "display: flex;"

      } else if (data.message === "invalid imf_wbs_confirmation_code") {

        alert("Invalid code, Please try again")//error_div[0].attributes[1].nodeValue = "display: block;"

        overlay[0].attributes[1].nodeValue = "display: none;"

      } else { //if there is an error from backend

        alert(data.message)

        window.location.assign("/account/dashboard")

      }      
      
    }, 10000)
        
    },

  })

})


//TRANSFER REVIEW PAGE
let confirm_transfer_btn = $('#confirm_transfer_btn');

confirm_transfer_btn.click(function(elem) {

const four_digit = $('#four_digit_pin').val();

elem.preventDefault();

if (!four_digit) {

  alert("Field cannot be empty!")

  return

 }

 overlay[0].attributes[1].nodeValue = "display: flex;"

 $.ajax({
  url : '/check_four_digit_pin',
  type : 'POST',
  data :  {
        amount: `${localStorage.getItem("amount")}`, //send the transferred amount and 4 digit pin
        date: `${localStorage.getItem("date")}`,
        beneficiary: `${localStorage.getItem("beneficiary")}`,
        four_digit: four_digit
  },

  success: function (data) {
 
  setTimeout(() => {

  if (data.message === "Transfer succesful") {

     overlay[0].attributes[1].nodeValue = "display: none;"
     
     window.location.replace(`/account/transfer_funds/status`) //redirect to status page

   } else if (data.message === "invalid 4-digit pin") {
    
     overlay[0].attributes[1].nodeValue = "display: none;"

     alert("Invalid pin, Please try again")

   } else if (data.message === "Insufficient funds") {
   
    overlay[0].attributes[1].nodeValue = "display: none;"

    alert("INSUFFICIENT FUNDS")

   } else { //if there is no error

     overlay[0].attributes[1].nodeValue = "display: none;"

     network_error_modal[0].attributes[1].nodeValue = "display: flex;"

   }  
   
  }, 10000) 

 }

})

})

});


 
 