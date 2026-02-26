"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_connection_1 = __importDefault(require("../db_connection"));
const dataRoutes_1 = __importDefault(require("./dataRoutes"));
const db = db_connection_1.default;
const api_route = express_1.default.Router();
api_route.put('/savefile', (req, res) => {
    const { userID, fileName, js_code, css_code, html_code, buttons, action } = req.body;
    if (action === 'save') {
        const query = 'INSERT INTO user_files_data(user_id, file_name, js_code, css_code, html_code, buttons) VALUES ($1, $2, $3, $4, $5, $6);';
        const queryParams = [userID, fileName, js_code, css_code, html_code, buttons];
        db.query(query, queryParams);
        return res.json({ message: 'Saved Successfully' });
    }
    else if (action === 'update') {
        const query = 'UPDATE user_files_data SET js_code = $1, css_code = $2, html_code = $3, buttons = $4 WHERE user_id = $5 AND file_name = $6;';
        const queryParams = [js_code, css_code, html_code, buttons, userID, fileName];
        db.query(query, queryParams);
        return res.json({ message: 'Updated Succesfully' });
    }
    else {
        return res.json({ message: 'Failiure' });
    }
});
api_route.use('/:userID', dataRoutes_1.default);
exports.default = api_route;
//# sourceMappingURL=apiRoutes.js.map