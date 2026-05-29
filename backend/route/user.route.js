import express from 'express';

import { registerUser, loginUser, logoutUser, forgotPassword, verifyOtp, resetPassword } from '../controller/user.controller.js';
import { validateUser } from '../validator/userValidate.js';
import { registerSchema, loginSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from '../validator/userSchema.js';

const router = express.Router();

router.post('/register', validateUser(registerSchema), registerUser);
router.post('/login', validateUser(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', validateUser(forgotPasswordSchema), forgotPassword);
router.post('/verify-otp', validateUser(verifyOtpSchema), verifyOtp);
router.post('/reset-password', validateUser(resetPasswordSchema), resetPassword);

export default router;
