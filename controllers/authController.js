const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError')

exports.signup = catchAsync (async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {expiresIn: process.env.JwT_EXPIRES_IN});
    res.status(201).json({
        status: 'sucess',
        token,
        data: {
            user: newUser
        }
    })
});

exports.login = catchAsync (async (req, res, next) => {
    const { email, password } = req.body;

    // 1) check if email and password exist 
        if(!email || !password) {
           return next(new AppError('Please provide email and password!', 400))
        }
    // 2) check if user && pasword is correct
        const user = await User.findOne({ email }).select('+password')
        console.log(user)
    // 3) if evertyhing is okay send token to client
    const token = '';
    res.status(200).json({
        status: 'success',
        token
    })
});