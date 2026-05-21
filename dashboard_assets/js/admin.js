$(document).ready(function(){
  
    //admin create account
    let registration_form = $('#registration_form');
    
    let spinner = $('.fa-spinner');
    
    let overlay = $('.overlay');

    overlay.hide()

    let registration_btn = $('#submitBtn')
    
    spinner.hide()
    
    registration_form.submit(function(e) {
    
      e.preventDefault();

      let email = $('#email').val();

      let password = $('#password').val();

      let confirm_password = $('#confirm_password').val();

      if (password != confirm_password) {
        
        alert("Password must match 'Confirm Password'")

        return

      }
     
      spinner.show();
    
      registration_btn.prop('disabled', true);
    
      $.ajax({
        url : '/admin_registration',
        type : 'POST',
        data :  {email, password},
        success: function (data) {
    
           if (data.message === "successful") {
    
            spinner.hide();
    
            registration_btn.prop('disabled', false);
    
            alert("Account created")
    
            window.location.assign("/admin_login")
    
           }
    
            else if  (data.message === "failed") {
    
            spinner.hide();
    
            registration_btn.prop('disabled', false);
    
            alert("Cannot create multiple accounts")
             
           } else {
    
            spinner.hide();
    
            registration_btn.prop('disabled', false);
    
            alert(data.message)
    
           }
            
        },
    
      })
    
    })
    
    
    
    //admin login account
    let login_form = $('#login_form');
    
    let login_btn = $('#login_btn')
    
    login_form.submit(function(e) {
    
      e.preventDefault();
     
      spinner.show();
    
      login_btn.prop('disabled', true);
    
      $.ajax({
        url : '/admin_logging',
        type : 'POST',
        data :  login_form.serialize(),
        success: function (data) {
    
           if (data.message === "successful") {
    
            spinner.hide();
    
            login_btn.prop('disabled', false);
    
            window.location.assign("/account/admin_dashboard")
    
           }
    
            else if  (data.message === "Invalid Email or Password") {
    
            spinner.hide();
    
            login_btn.prop('disabled', false);
    
            alert("Invalid Email or Password")
             
           } else {
    
            spinner.hide();
    
            login_btn.prop('disabled', false);
    
            alert("Something went wrong, try again")
    
           }
            
        },
    
      })
    
    })



//RESET TRANSACTION HISTORY
$('#resetTransactionsBtn').on('click', function() {

  let answer = window.confirm('All transactions of this user will be deleted, continue?')
  
  if (!answer) {
    
    return

  }

  let user_id = $('#user_id').val()

  let overlay = $('.overlay');

  overlay.show()
  
  $.ajax({
            url: '/reset_transaction_history', // Your endpoint to handle the reset
            method: 'POST',
            data: {user_id: user_id},
            success: function(response) {
              if (response.message === "success") {

                alert('Transactions history has been reset successfully.');
                
                overlay.hide()

              } else {

                alert('Error Occured, please try again.');
                
                overlay.hide()

              }
                
            }
        });
  });
     

  
//FUND MAIN BALANCE
let fund_btn = $('#fund_btn')

fund_btn.click( function(e) {

e.preventDefault();

let overlay = $('.overlay');
  
let user_email = $('#email').text() //get the user's email

let amount = $('#amount').val()

let sender = $('#sender_name').val()

let sender_id = $('#user_id').val()

  if (sender === "" || amount === "") {

    alert("Field cannot be empty")

    return
    
  }
 
  overlay.show();

  fund_btn.prop('disabled', true);

  $.ajax({
    url : '/fund_account',
    type : 'POST',
    data :  {
         user_email,
         user_id: sender_id,
         sender,
         amount
    },
   
    success: function (data) {
   
      if (data.message === "success") {
  
        alert("Account funded successfully")
  
        window.location.replace(window.location.href)
        
      } else if ("user not found") {

        alert("user not found")

        overlay.hide()
        
      } else {
   
        alert("something went wrong, try again")

        overlay.hide()
  
      }
    
   },
  
   })

})



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

}) 
      


//DELETE USER
function delete_user(user_id) {
  
  let answer = window.confirm(`IF YOU DELETE THIS USER, ALL THERE TRANSACTIONS WILL BE DELETED AS WELL, CONTINUE?`);

  let overlay = $('.overlay');

  if (!answer) {

    return
    
  }

  overlay.show()

  $.ajax({
    url : '/delete_user',
    type : 'POST',
    data :  {
      user_id: user_id
    },
    success: function (data) {

          if (data.message == 'success') {

            alert("success")

            window.location.replace(window.location.href)
            
          } else if (data.message == "User not found") {

            alert(data.message)

            overlay.hide()

          } else {

            alert("Something went wrong, try again.")

            overlay.hide()

          }
    },

  })

}



 
//approve/decline withdrawal
function reverse_transaction(transaction_id, user_id) {
  
  let answer = window.confirm(`DO YOU WANT TO REVERSE THIS TRANSACTION WITH ID ${transaction_id}?`);

  let overlay = $('.overlay');

  if (!answer) {

    return
    
  }

  overlay.show()

  $.ajax({
    url : '/reverse_transaction',
    type : 'POST',
    data :  {
      transaction_id,
      user_id
    },
    success: function (data) {

          if (data.message == 'success') {

            alert("TRANSACTION WAS REVERSED. THIS USER WILL BE NOTIFIED.")

            window.location.replace(window.location.href)
            
          } else if (data.message == 'user not found') {

            alert("USER NOT FOUND")

            overlay.hide()

          } else {

            alert("Something went wrong, try again.")

            overlay.hide()

          }
    },

  })

}


//delete transaction
function delete_transaction(transaction_id) {
  
  let answer = window.confirm(`DELETE TRANSACTION WITH ID ${transaction_id}`);

  let overlay = $('.overlay');

  if (!answer) {

    return
    
  }

  overlay.show()

  $.ajax({
    url : '/delete_transaction',
    type : 'POST',
    data :  {
      transaction_id
    },
    success: function (data) {

          if (data.message == 'success') {

            alert("success")

            window.location.replace(window.location.href)
            
          } else {

            alert("Something went wrong, try again.")

            overlay.hide()

          }
    },

  })

}


