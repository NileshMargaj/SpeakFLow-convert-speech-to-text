import User from '../model/user.model.js';
import { OTP } from '../model/otp.model.js';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { sendEmail } from '../service/email.service.js';

//? regester user
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res
                .status(400)
                .json(
                    {
                        success: false,
                        message: "Please provide username, email and password"
                    });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json(
                    {
                        success: false,
                        message: "User with this email already exists"
                    });
        }
        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ username, email, password: hashPassword });

        const token = jwt.sign({ id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '2d' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        })

        const message = `Welcome to our application, ${username}! Your account has been successfully created. You can now log in using your email and password. `
        await sendEmail(email, "User registration successful", message)

        return res
            .status(201)
            .json(
                {
                    success: true,
                    message: "User registered successfully",
                    user: newUser
                }
            );
    } catch (error) {
        return res
            .status(500)
            .json(
                {
                    success: false,
                    message: "Internal Server Error while registering user",
                    error: error.message
                }
            );
    }
}




//? login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res
                .status(400)
                .json(
                    {
                        success: false,
                        message: "Please provide email and password"
                    }
                );
        }

        const isUserExist = await User.findOne({ email });

        if (!isUserExist) {
            return res
                .status(404)
                .json(
                    {
                        success: false,
                        message: "User not found"
                    }
                );
        }
        const isPasswordMatch = await bcrypt.compare(password, isUserExist.password);

        if (!isPasswordMatch) {
            return res
                .status(401)
                .json(
                    {
                        success: false,
                        message: "Invalid credentials"
                    }
                );
        }

        const token = jwt.sign({ id: isUserExist._id },
            process.env.JWT_SECRET,
            { expiresIn: '2d' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        })

        return res
            .status(200)
            .json(
                {
                    success: true,
                    message: "User logged in successfully",
                    user: isUserExist
                }
            );

    } catch (error) {
        return res
            .status(500)
            .json(
                {
                    success: false,
                    message: "Internal Server Error while logging in user",
                    error: error.message
                }
            );
    }
}





//? logout user
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });

        return res
            .status(200)
            .json(
                {
                    success: true,
                    message: "User logged out successfully"
                }
            );
    } catch (error) {
        return res
            .status(500)
            .json(
                {
                    success: false,
                    message: "Internal Server Error while logging out user",
                    error: error.message
                }
            );
    }
}




//? forgot password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res
                .status(400)
                .json(
                    {
                        success: false,
                        message: "Please provide email"
                    }
                );
        }
        const isUserExist = await User.findOne({ email });

        if (!isUserExist) {
            return res
                .status(404)
                .json(
                    {
                        success: false,
                        message: "User not found"
                    }
                );
        }
        const otp = Math.floor(100000 + Math.random() * 900000);

        await OTP.create({ otp, email });

        const message = `Your OTP for password reset is ${otp}. This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.`

        await sendEmail(email, "Password Reset OTP", message)

        return res
            .status(200)
            .json(
                {
                    success: true,
                    message: "OTP sent successfully"
                }
            );

    } catch (error) {
        return res
            .status(500)
            .json(
                {
                    success: false,
                    message: "Internal Server Error while processing forgot password",
                    error: error.message
                }
            );
    }
}





//? verify otp
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body
    try {
        if (!email || !otp) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Email and OTP are required"
                })
        }
        const otpRecord = await OTP.findOne({ email, otp })
        if (!otpRecord || Date.now() > otpRecord.createdAt.getTime() + 60 * 60 * 1000) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Invalid or expired OTP"
                })
        }
        return res
            .status(200)
            .json({
                success: true,
                message: "OTP verified successfully"
            })
    } catch (error) {
        res
            .status(500)
            .json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
    }
}




//? reset password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body
    try {
        if (!email || !otp || !newPassword) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Email, OTP, and new password are required"
                })
        }
        const otpRecord = await OTP.findOne({ email, otp })
        if (!otpRecord || Date.now() > otpRecord.createdAt.getTime() + 60 * 60 * 1000) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Invalid or expired OTP"
                })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "User not found from the given email"
                })
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword
        await user.save()
        await OTP.deleteMany({ email })
        return res
            .status(200)
            .json({
                success: true,
                message: "Password reset successfully"
            })
    } catch (error) {
        return res 
            .status(500)
             .json({
                 success: false,
                 message: "Internal server error",
                 error: error.message
             });
    }
}
