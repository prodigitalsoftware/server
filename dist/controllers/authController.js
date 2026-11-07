"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.getMe = exports.logout = exports.login = exports.register = exports.loginSchema = exports.registerSchema = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'navasealstore_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '7d';
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const generateToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ id: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email is already registered' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const user = new User_1.User({
            name,
            email: email.toLowerCase(),
            passwordHash,
            phone: phone || '',
            role: 'customer',
            status: 'active',
        });
        await user.save();
        const token = generateToken(user._id.toString(), user.role);
        res.status(201).json({
            success: true,
            message: 'Account registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        if (user.status === 'suspended') {
            res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const token = generateToken(user._id.toString(), user.role);
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
};
exports.login = login;
const logout = async (_req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        res.json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                role: req.user.role,
                status: req.user.status,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving profile', error: error.message });
    }
};
exports.getMe = getMe;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Return 200 to prevent email enumeration
            res.json({
                success: true,
                message: 'If an account exists with that email, a password reset link has been dispatched.',
            });
            return;
        }
        // In production, send email with reset token. In demo mode, return confirmation.
        res.json({
            success: true,
            message: 'Password reset link sent to your email. (Demo simulation code: 889900)',
            demoResetToken: 'demo-token-12345',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Forgot password request failed', error: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword || newPassword.length < 6) {
            res.status(400).json({ success: false, message: 'Valid email and password (min 6 chars) required' });
            return;
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        user.passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
        await user.save();
        res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Reset password failed', error: error.message });
    }
};
exports.resetPassword = resetPassword;
