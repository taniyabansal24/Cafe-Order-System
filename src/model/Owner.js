// model/Owner.js - CORRECTED VERSION
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ownerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    verifyCode: String,
    verifyCodeExpiry: Date,
    resetCode: String,
    resetCodeExpiry: Date,
    cafeName: {
        type: String,
        required: [true, 'Cafe name is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        trim: true
    },
    registrationStep: {
        type: String,
        enum: ['email-verification', 'phone-verification', 'completed'],
        default: 'email-verification'
    }
}, {
    timestamps: true
});

// CORRECT pre-save hook - only hash if password is modified AND not already hashed
ownerSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
    
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, etc.)
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
        console.log('⚠️ Password appears to already be hashed, skipping re-hash');
        return next();
    }
    
    try {
        // Hash the password with cost factor 12
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error);
    }
});



// Update TTL field when document is saved (if unverified)
ownerSchema.pre('save', function (next) {
    if (!this.isVerified) {
        this.ttlExpireAt = new Date(Date.now() + 10 * 60 * 1000);
    } else {
        this.ttlExpireAt = undefined;
    }
    next();
});

// TTL index for unverified accounts
ownerSchema.index({ "ttlExpireAt": 1 }, {
    expireAfterSeconds: 0
});

// ✅ ADDING YOUR REQUESTED INDEX
// TTL index for auto-expiring reset codes
ownerSchema.index(
    { "resetCodeExpiry": 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: {
            resetCode: { $exists: true }
        }
    }
);

module.exports = mongoose.models.Owner || mongoose.model('Owner', ownerSchema);
