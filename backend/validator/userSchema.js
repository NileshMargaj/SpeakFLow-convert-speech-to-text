import yup from 'yup';

const email = yup
    .string()
    .trim()
    .required('Email is required')
    .email('Invalid email format');

const password = yup
    .string()
    .trim()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long');





export const registerSchema = yup.object({
    username: yup
        .string()
        .trim()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters long')
        .max(20, 'Username must be at most 20 characters long'),
    email,
    password
});



export const loginSchema = yup.object({
    email,
    password
});



export const forgotPasswordSchema = yup.object({
    email
});



export const verifyOtpSchema = yup.object({
    email,
    otp: yup
        .string()
        .trim()
        .required('OTP is required')
        .matches(/^\d{6}$/, 'OTP must be a 6 digit code')
});



export const resetPasswordSchema = yup.object({
    email,
    otp: yup
        .string()
        .trim()
        .required('OTP is required')
        .matches(/^\d{6}$/, 'OTP must be a 6 digit code'),
    newPassword: password.label('New password')
});
