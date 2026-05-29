import yup from 'yup';

export const validateUser = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        return res
            .status(400)
            .json({ 
                success: false, 
                message: error.errors ? error.errors.join(', ') : error.message 
            });
    }
}

