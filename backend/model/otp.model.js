import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    otp: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "10m", // OTP will expire after 10 minutes
    },
});

export const OTP = mongoose.model("OTP", otpSchema);

