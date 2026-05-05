"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_connection_1 = __importDefault(require("../db_connection"));
const dataRoutes_1 = __importDefault(require("./dataRoutes"));
const loginRoutes_1 = __importDefault(require("./loginRoutes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const webToken_1 = require("./webToken");
const db = db_connection_1.default;
const api_route = express_1.default.Router();
api_route.put('/savefile', webToken_1.verifyToken, async (req, res) => {
    const { fileName, js_code, css_code, html_code, buttons, action } = req.body;
    const userID = req.userID;
    if (action === 'save') {
        const query = 'INSERT INTO user_files_data(user_id, file_name, js_code, css_code, html_code, buttons) VALUES ($1, $2, $3, $4, $5, $6) RETURNING file_id, file_name, js_code, css_code, html_code, buttons;';
        const queryParams = [userID, fileName, js_code, css_code, html_code, buttons];
        const result = await db.query(query, queryParams);
        const res_data = result.rows[0];
        return res.json([{
                fileID: res_data.file_id,
                file_name: res_data.file_name,
                js_code: res_data.js_code,
                css_code: res_data.css_code,
                html_code: res_data.html_code,
                buttons: res_data.buttons
            }]);
    }
    else if (action === 'update') {
        const query = 'UPDATE user_files_data SET js_code = $1, css_code = $2, html_code = $3, buttons = $4 WHERE user_id = $5 AND file_name = $6;';
        console.log(`js: ${js_code}\ncss: ${css_code}\nhtml: ${html_code}\nbut: ${buttons}\nuser: ${userID}\nfile: ${fileName}`);
        const queryParams = [js_code, css_code, html_code, buttons, userID, fileName];
        await db.query(query, queryParams);
        return res.json({ message: 'Updated Succesfully' });
    }
    else {
        return res.json({ message: 'Failiure' });
    }
});
api_route.get('/delete_file', webToken_1.verifyToken, async (req, res) => {
    const { fileName } = req.body;
    const userID = req.userID;
    const query = 'DELETE FROM user_files_data WHERE user_id = $1 AND file_name = $2';
    await db.query(query, [userID, fileName]);
    res.json({ message: 'Success' });
});
api_route.put('/closefile', async (req, res) => {
    const { userID, openFiles } = req.body;
    let query = 'UPDATE my_users SET opened_files = $1 WHERE user_id = $2';
    let queryParams = [openFiles, userID];
    await db.query(query, queryParams);
    res.json({ message: 'Success' });
});
api_route.get('/newfile', async (req, res) => {
    const result = await db.query('SELECT * FROM user_files_data WHERE file_name = $1 and user_id = $2', ['untitled_file', 2]);
    res.json(result.rows);
});
api_route.put('/renamefile', webToken_1.verifyToken, async (req, res) => {
    const { fileID, newName, oldName } = req.body;
    const userID = req.userID;
    let query = 'UPDATE user_files_data SET file_name = $1 WHERE user_id = $2 AND file_id = $3';
    let queryParams = [newName, userID, fileID];
    await db.query(query, queryParams);
    query = 'SELECT opened_files FROM my_users WHERE user_id = $1';
    queryParams = [userID];
    const result = await db.query(query, queryParams);
    const data_rows = result.rows;
    console.log(result);
    let openFiles = data_rows[0].opened_files;
    const checkFiles = openFiles.split('|');
    if (openFiles && checkFiles.find(f => f === oldName)) {
        openFiles = openFiles.replace(oldName, newName);
        query = 'UPDATE my_users SET opened_files = $1 WHERE user_id = $2';
        queryParams = [openFiles, userID];
        await db.query(query, queryParams);
    }
    return res.json({ message: 'Success' });
});
api_route.get('/refresh_token', async (req, res) => {
    const token = req.cookies.ref_token;
    const SECRET_KEY = process.env.jwt_secret;
    if (!token) {
        return res.status(403).json({ message: 'Invalid Request' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const newAccsToken = (0, webToken_1.getToken)({ user_email: decoded.user_email, user_id: decoded.user_id });
        const newRefToken = (0, webToken_1.refToken)({ user_email: decoded.user_email, user_id: decoded.user_id });
        res.cookie('accs_token', newAccsToken, {
            httpOnly: true,
            secure: process.env.environment === 'production',
            sameSite: process.env.environment === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000
        });
        res.cookie('ref_token', newRefToken, {
            httpOnly: true,
            secure: process.env.environment === 'production',
            sameSite: process.env.environment === 'production' ? 'none' : 'lax',
            maxAge: 3 * 24 * 60 * 60 * 1000
        });
        res.json({ message: 'success' });
    }
    catch (e) {
        console.log(e);
        res.status(403).json({ message: 'Expired' });
    }
});
api_route.use('/user', loginRoutes_1.default);
api_route.use('/data', dataRoutes_1.default);
exports.default = api_route;
//# sourceMappingURL=apiRoutes.js.map