import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export const isUserAuthenticated = (req, res, next) => {
    const token = req.cookies.token;

    try {

        if (!token) {
            return res
                .status(401)
                .json(
                    {
                        success: false,
                        message: "Unauthorized: No token provided while checking is user authenticated"
                    }
                );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res
            .status(401)
            .json(
                {
                    success: false,
                    message: "Unauthorized: Invalid token or token expired while checking is user authenticated",
                    error: error.message
                }
            );
    }
}