"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.refToken = exports.getToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.jwt_secret;
const getToken = (req) => {
    return jsonwebtoken_1.default.sign(req, SECRET_KEY, { expiresIn: '30m' });
};
exports.getToken = getToken;
const refToken = (req) => {
    return jsonwebtoken_1.default.sign(req, SECRET_KEY, { expiresIn: '3d' });
};
exports.refToken = refToken;
const verifyToken = (req, res, next) => {
    const token = req.cookies.accs_token;
    console.log(token);
    if (!token) {
        return res.status(401).json({ message: "No token" });
    }
    // const token = header.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        console.log(decoded);
        req.userID = decoded.user_id;
        req.email_address = decoded.user_email;
        next();
    }
    catch (e) {
        console.log(e);
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=webToken.js.map