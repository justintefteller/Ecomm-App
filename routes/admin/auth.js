const express = require('express');
const {handleErrors} = require('./middlewares.js');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const { requireEmail, requirePassword, requirePasswordConfirmation, requireEmailExists, requireValidPasswordForUser } = require('./validators');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
});

// const bodyParser = (req, res, next) => {
//     if (req.method === 'POST'){
//         req.on('data', data => {
//             const parsed = data.toString('utf8').split('&');
//             const formData ={};
//             for (let pair of parsed) {
//                 const [key, value] = pair.split('=');
//                 formData[key] = value;
//             }
//             req.body = formData;
//             next();
//         });
//     } else {
//         next();
//     }
// };

router.post(
    '/signup', 
    [
    requireEmail,
    requirePassword,
    // requirePasswordConfirmation
    ], handleErrors(signupTemplate), 
    async (req, res) => {
        const { email, password } = req.body;
        const user = await usersRepo.create({ email, password });
        req.session.userId = user.id;
        res.redirect('/admin/products')
});

router.get('/serve', (req, res) => {
    res.send("<h1 style='display:flex; justify-content: center; align-items: center; position: sticky; height: 100vh; width: 100vw;'> I'm here to serve you.</h1>")
});

router.get('/signout', (req, res) => {
    req.session = null;
    res.send('You are logged out');

});

router.get('/signin', (req, res) => {
    // res.render('signin.html');
    res.send(signinTemplate({}));
});

router.post('/signin',
    [
     requireEmailExists,
     requireValidPasswordForUser
    ],
    handleErrors(signinTemplate),
    async (req, res) => {

    const { email } = req.body;
    
    const user = await usersRepo.getOneBy({ email });

    if (!user) {
        return res.send('Email not found');
    }

    req.session.userId = user.id;

    res.redirect('/admin/products')
    }
);

module.exports = router;