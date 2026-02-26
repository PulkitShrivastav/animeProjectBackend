import express from 'express'
import pool from '../db_connection'
import data_route from './dataRoutes'
import { SaveFile } from '../Models/models'

const db = pool
const api_route = express.Router()

api_route.put('/savefile', (req: express.Request<SaveFile>, res: express.Response) => {
    const { userID, fileName, js_code, css_code, html_code, buttons, action } = req.body
    if (action === 'save') {
        const query = 'INSERT INTO user_files_data(user_id, file_name, js_code, css_code, html_code, buttons) VALUES ($1, $2, $3, $4, $5, $6);'
        const queryParams = [userID, fileName, js_code, css_code, html_code, buttons]
        db.query(query, queryParams)
        return res.json({ message: 'Saved Successfully' })
    } else if (action === 'update') {
        const query = 'UPDATE user_files_data SET js_code = $1, css_code = $2, html_code = $3, buttons = $4 WHERE user_id = $5 AND file_name = $6;'
        const queryParams = [js_code, css_code, html_code, buttons, userID, fileName]
        db.query(query, queryParams)
        return res.json({ message: 'Updated Succesfully' })
    }
    else {
        return res.json({ message: 'Failiure' })
    }
})

api_route.use('/:userID', data_route)

export default api_route