module.exports = (req, res, next) => {

    if (req.session.admin_id && req.session.admin_isAuthenticated) {  

        next()
        
    } else {

        res.redirect("/admin_login")

    }

}