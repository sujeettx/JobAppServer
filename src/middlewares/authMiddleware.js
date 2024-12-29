import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;


if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization; // Assume token is sent directly in the header
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied, no token provided' });
        }

        try {
            console.log(token);
            console.log(JWT_SECRET);
            const decoded = jwt.verify(token, JWT_SECRET);

            req.user = decoded;
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ message: 'Token has expired' });
            }
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Internal server error during authentication' });
    }
};

export const authorize = (roles) => (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!Array.isArray(roles)) {
            throw new Error('Roles must be an array');
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        return res.status(500).json({ message: 'Internal server error during authorization' });
    }
};
