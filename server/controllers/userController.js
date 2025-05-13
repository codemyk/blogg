const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../auth');
const { errorHandler } = require('../auth');

module.exports.register = (req, res) => {
    const { username, email, password } = req.body;

    if (!email.includes("@")) {
        return res.status(400).send({ message: 'Invalid email format' });
    } 
    else if (!username || username.length < 3) {
        return res.status(400).send({ message: 'Username must be at least 3 characters long' });
    }
    else if (password.length < 8) {
        return res.status(400).send({ message: 'Password must be at least 8 characters long' });
    } else {
        let newUser = new User({
            username,
            email,
            password: bcrypt.hashSync(password, 12)
        });

        return newUser.save()
        .then((result) => res.status(201).send({
            message: 'User registered successfully'
        }))
        .catch(error => errorHandler(error, req, res));
    }
};

module.exports.login = (req, res) => {
    const { identifier, password } = req.body; // rename from 'email' to 'identifier'

    if (!identifier || !password) {
        return res.status(400).send({ message: 'Username or Email and Password are required' });
    }

    User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    })
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: 'User not found' });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, result.password);

        if (isPasswordCorrect) {
            return res.status(200).send({
                access: auth.createAccessToken(result)
            });
        } else {
            return res.status(401).send({ message: 'Incorrect username/email or password' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};