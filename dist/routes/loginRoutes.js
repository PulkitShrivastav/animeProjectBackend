"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_connection_1 = __importDefault(require("../db_connection"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const webToken_1 = require("./webToken");
const db = db_connection_1.default;
const login_route = express_1.default.Router();
const mailer = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.user_email,
        pass: process.env.user_password
    }
});
function generateOTP() {
    const list = '0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        const random_digit = Math.floor(Math.random() * 10);
        code = code + list[random_digit];
    }
    return code;
}
async function sendOTP(email, otp, name) {
    const info = await mailer.sendMail({
        from: `"Dev Anime Team" <${process.env.user_email}>`,
        to: email,
        subject: "Dev Anime Verification Code",
        html: myHTMLmssg(otp, name),
    });
}
function myHTMLmssg(otp, name) {
    const mssg = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">

    <style>

    body{
        margin:0;
        padding:0;
        background:#0f172a;
        font-family:'Poppins',sans-serif;
    }

    .container{
        max-width:520px;
        margin:40px auto;
        padding:30px;
        background:#111827;
        border-radius:14px;
        color:#e5e7eb;
        box-shadow:0 10px 30px rgba(0,0,0,0.6);
        animation:fadeIn 1s ease;
    }

    @keyframes fadeIn{
        from{
            opacity:0;
            transform:translateY(15px);
        }
        to{
            opacity:1;
            transform:translateY(0);
        }
    }

    .logo{
        text-align:center;
        font-size:26px;
        font-weight:600;
        color:#60a5fa;
        margin-bottom:20px;
    }

    h2{
        text-align:center;
        font-weight:500;
        margin-bottom:25px;
    }

    p{
        line-height:1.6;
        font-size:14px;
    }

    .otp-box{
        text-align:center;
        margin:30px 0;
    }

    .otp{
        display:inline-block;
        padding:14px 24px;
        font-size:28px;
        font-weight:600;
        letter-spacing:6px;
        background:#1f2937;
        border-radius:10px;
        color:#38bdf8;
        transition:all .3s ease;
        border:1px solid #334155;
    }

    .otp:hover{
        background:#38bdf8;
        color:#0f172a;
        transform:scale(1.05);
    }

    .footer{
        margin-top:30px;
        font-size:12px;
        color:#9ca3af;
    }

    .signature{
        margin-top:20px;
        font-weight:500;
    }

    .highlight{
        color:#38bdf8;
        font-weight:500;
    }

    </style>

    </head>

    <body>

    <div class="container">

    <div class="logo">
    Dev_Anime
    </div>

    <h2>Account Verification</h2>

    <p>Hi ${name},</p>

    <p>
    Your <span class="highlight">DevAnime verification code</span> is:
    </p>

    <div class="otp-box">
    <div class="otp">
    ${otp}
    </div>
    </div>

    <p>
    This code is required to confirm your identity and complete the authentication process.
    </p>

    <p>
    For your security, this code will expire in <b>5 minutes</b>. Please do not share this code with anyone.
    </p>

    <p>
    If you did not request this verification, you can safely ignore this email.
    </p>

    <p>
    Welcome to <span class="highlight">Dev Anime</span> — where developers and creativity come together.
    </p>

    <div class="signature">
    Best regards,<br>
    Dev_Anime Team
    </div>

    <div class="footer">
    This is an automated message. Please do not reply to this email.
    </div>

    </div>

    </body>
    </html>
    `;
    return mssg;
}
login_route.put('/send_otp', async (req, res) => {
    const { email_address, firstname } = req.body;
    const get_query = 'SELECT email_address, generated_at, guest_id, attempts FROM verfiy_user WHERE email_address = $1';
    const result_1 = await db.query(get_query, [email_address]);
    if (result_1.rows.length !== 0) {
        const attempts = result_1.rows[0].attemps;
        if (attempts >= 5) {
            return res.json({ message: 'Too many requests try later.' });
        }
        const generated_at = new Date(result_1.rows[0].generated_at).getTime();
        const now = Date.now();
        if (now - generated_at <= 2 * 60 * 1000) {
            const guest_id = result_1.rows[0].guest_id;
            await db.query('UPDATE verify_user SET attempts = $1 WHERE guest_id = $2', [attempts + 1, guest_id]);
            return res.json({ message: 'Invalid Request.' });
        }
    }
    const verify_code = generateOTP();
    const query = 'INSERT INTO verify_user (email_address, otp_code, attempts) values ($1, $2, $3) RETURNING guest_id, otp_code';
    const result = await db.query(query, [email_address, verify_code, 1]);
    await sendOTP(email_address, verify_code, firstname);
    return res.json({ guest_id: result.rows[0].guest_id });
});
login_route.put('/login', async (req, res) => {
    const { email_address, password } = req.body;
    const get_query = 'SELECT user_id, first_name, password_hash FROM my_users WHERE email_address = $1';
    const result = await db.query(get_query, [email_address]);
    if (result.rows.length === 0) {
        return res.json({ message: 'Failed' });
    }
    const stored_pass = result.rows[0].password_hash;
    const userID = result.rows[0].user_id;
    const firstname = result.rows[0].first_name;
    const isOkay = await bcrypt_1.default.compare(password, stored_pass);
    if (!isOkay) {
        return res.json({ message: 'Failed' });
    }
    const newToken = (0, webToken_1.getToken)({ user_id: userID, user_email: email_address });
    res.cookie('accs_token', newToken, {
        httpOnly: true,
        secure: process.env.environment === 'production',
        sameSite: process.env.environment === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000
    });
    const ref_token = (0, webToken_1.refToken)({ user_id: userID, user_email: email_address });
    res.cookie('ref_token', ref_token, {
        httpOnly: true,
        secure: process.env.environment === 'production',
        sameSite: process.env.environment === 'production' ? 'none' : 'lax',
        maxAge: 3 * 24 * 60 * 60 * 1000
    });
    return res.json({
        message: 'Success',
        user_id: userID,
        firstname: firstname,
        user_email: email_address
    });
});
login_route.put('/verify_otp', async (req, res) => {
    const { email_adress, firstname, lastname, myPass, guest_id, otp } = req.body;
    const get_query = 'SELECT otp_code, generated_at FROM verify_user WHERE guest_id = $1';
    const result_1 = await db.query(get_query, [guest_id]);
    const myOTP = result_1.rows[0].otp_code;
    const submit_time = new Date(result_1.rows[0].generated_at).getTime();
    const current_time = Date.now();
    const diff = current_time - submit_time;
    if (otp === myOTP) {
        if (diff > 2 * 60 * 1000) {
            return res.json({
                message: 'Expired'
            });
        }
        const hashed_pass = await bcrypt_1.default.hash(myPass, 12);
        const put_query = 'INSERT INTO my_users (email_address, first_name, last_name, password_hash) VALUES ($1, $2, $3, $4) RETURNING user_id';
        const queryParams = [email_adress, firstname, lastname, hashed_pass];
        const result = await db.query(put_query, queryParams);
        const userID = result.rows[0].user_id;
        const delete_query = 'DELETE FROM verify_user WHERE guest_id = $1';
        await db.query(delete_query, [guest_id]);
        return res.json({
            message: 'Success',
            user_id: userID
        });
    }
    return res.json({
        message: 'Wrong'
    });
});
login_route.put('/resend_otp', async (req, res) => {
    const { email_address, firstname, guest_id } = req.body;
    const get_querry = 'SELECT generated_at, attempts FROM verify_user WHERE guest_id = $1';
    const result_1 = await db.query(get_querry, [guest_id]);
    if (result_1.rows.length === 0) {
        return res.json({ message: 'Invalid Request.' });
    }
    const attempts = result_1.rows[0].attempts;
    if (attempts >= 5) {
        return res.status(400).json({ message: 'Too many requests. Try later!!' });
    }
    const gen_at = new Date(result_1.rows[0].generated_at).getTime();
    const curr_time = Date.now();
    if (curr_time - gen_at < 2 * 60 * 1000) {
        await db.query('UPDATE verify_user SET attempts = $1 WHERE guest_id = $2', [attempts + 1, guest_id]);
        return res.status(400).json({ message: 'Spam Request.' });
    }
    const delete_query = 'DELETE FROM verify_user WHERE guest_id = $1';
    await db.query(delete_query, [guest_id]);
    const newOTP = generateOTP();
    const put_querry = 'INSERT INTO verify_user (email_address, otp_code) VALUES ($1, $2) RETURNING guest_id';
    const result = await db.query(put_querry, [email_address, newOTP]);
    await sendOTP(email_address, newOTP, firstname);
    return res.json(result.rows[0].guest_id);
});
login_route.put('/demo-login', async (req, res) => {
    const newToken = (0, webToken_1.getToken)({ user_id: 2, user_email: 'pulkitadmin01.dev_anime@gmail.com' });
    res.cookie('accs_token', newToken, {
        httpOnly: true,
        secure: process.env.environment === 'production',
        sameSite: process.env.environment === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000,
    });
    const ref_token = (0, webToken_1.refToken)({ user_id: 2, user_email: 'pulkitadmin01.dev_anime@gmail.com' });
    res.cookie('ref_token', ref_token, {
        httpOnly: true,
        secure: process.env.environment === 'production',
        sameSite: process.env.environment === 'production' ? 'none' : 'lax',
        maxAge: 3 * 24 * 60 * 60 * 1000
    });
    return res.json({
        message: 'Demo-Login',
    });
});
exports.default = login_route;
//# sourceMappingURL=loginRoutes.js.map