import rateLimit from "express-rate-limit";


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 min
  message: { error: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});


const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: "Too many requests. Slow down a bit!" },
  standardHeaders: true,
  legacyHeaders: false,
});


const userActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 min
  message: { error: "Too many requests. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});


const checkoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 order requests per hour
  message: { error: "Too many order attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});


const sellerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 min
  message: { error: "Too many seller requests. Please wait." },
  standardHeaders: true,
  legacyHeaders: false,
});


const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many admin requests." },
  standardHeaders: true,
  legacyHeaders: false,
});

export {
  publicLimiter,
  authLimiter,
  userActionLimiter,
  checkoutLimiter,
  sellerLimiter,
  adminLimiter,
};
