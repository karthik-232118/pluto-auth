import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const loginApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 3 requests per `window` (here, per 1 minute)
    headers: true, // Return rate limit info in the `RateLimit-*` headers
    handler: (req: Request, res: Response, /*next: NextFunction*/) => {
        return res.status(429).json({
            status: false,
            message: 'You sent too many requests. Please wait a while then try again'
        });
    }
});

export default {
    loginApiLimiter
};
