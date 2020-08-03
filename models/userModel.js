const crypto = require('crypto')
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
        role: {
            type: String,
            enum:['user','guide', 'lead-guide', 'admin'],
            default: 'user'
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
        },
        passwordChangedAt: {
            type: Date
        },
        passwordResetToken: {
           type: String
        },
        passwordResetExpires: {
            type: Date
        },
        active: {
            type: Boolean,
            default: true,
            select:false
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

userSchema.pre('save', function(next){
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre(/^find/, function(next) {
    // this points to the current query 
    this.find({ active: {$ne: false} });
    next();
});

userSchema.methods.correctPassword = function(candidatePassword, userPassword){
    return bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(
                this.passwordChangedAt.getTime() / 1000,
                10
            );

        return JWTTimestamp > changedTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
 const resetToken = crypto.randomBytes(32).toString('hex');
 this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;