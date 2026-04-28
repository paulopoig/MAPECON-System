const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // 1. Look for the wristband in the request headers
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ error: "Access Denied. No VIP wristband detected!" });

    try {
        // 2. The token usually comes as "Bearer <token_string>", so we remove the word "Bearer "
        const token = authHeader.replace("Bearer ", "");

        // 3. Verify the signature using our wax seal from .env
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Attach the user's ID and Branch to the request so the next function knows who did this
        req.user = verifiedUser;
        
        // 5. Open the door and let them pass to the actual API!
        next(); 
    } catch (err) {
        res.status(400).json({ error: "Invalid or expired wristband. Please log in again." });
    }
};