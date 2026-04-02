import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.jwt_secret as string

export interface payload {
    user_id: number,
    user_email: string,
}

export const getToken = (req: payload): string => {
    return jwt.sign(req, SECRET_KEY, { expiresIn: '30m' })
}

export const refToken = (req: payload): string => {
    return jwt.sign(req, SECRET_KEY, { expiresIn: '3d' })
}

export const verifyToken = (req: any, res: any, next: any) => {
    const token = req.cookies.accs_token;
    console.log(token)
    if (!token) {
        return res.status(401).json({ message: "No token" });
    }
    // const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as payload;
        console.log(decoded)
        req.userID = decoded.user_id
        req.email_address = decoded.user_email
        next();
    } catch (e) {
        console.log(e)
        return res.status(401).json({ message: "Invalid token" });
    }
};