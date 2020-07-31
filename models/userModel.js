const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'you muse have a name'],
            trim: true,
            maxlength: [40, 'A username must have less or equal then 40 characters'],
            minlength: [3, 'A username must have more or equal then 3 characters']
            // validate: [validator.isAlpha, 'Tour name must only contain characters']
        },
        email: {
            type: String,
            required: [true, 'Please prvide your email'],
            unique: true,
            lowercase: true,
            valdate: [validator.isEmail, 'Please provide a valid email']
        },
        photo: {
            type: String
        },
        password: {
            type: String,
            required: [true, 'You need a password'],
            minlength: 8,
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your password'],
            validate: {
                validator: function(el) {
                    return el === this.password; 
                },
                message: 'Passwords are not the same'
            }
        }
    });

    
userSchema.pre('save', async function(next) {
    // only run this function if password was modified 
    if(!this.isModified('password')) return next();

    // hash the password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // delete password confirm
    this.passwordConfirm = undefined;
})



const User = mongoose.model('User', userSchema);

module.exports = User;