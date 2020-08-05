const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el]
  });
  return newObj;
};

exports.getMe = (req, res, next) =>{
  req.params.id = req.user.id;
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for passwordupdate. Please use /updateMyPassword', 400))
  }
  // 2) filtered out unwanted field
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
 


  res.status(200).json({
    status: 'success',
    data: {
      user:  updatedUser
    }
  })
})

exports.deleteMe = catchAsync( async(req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active: false})

  res.status(204).json({
    status: 'success',
    data: null
  })
})


exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup istead'
  });
};

// Do NOT update password with this, no middleware will be used and so no encryption

exports.getUser =  factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAll(User)
