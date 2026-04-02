import express from 'express'
import pool from '../db_connection'
import { OpenFiles } from '../Models/models'
import { verifyToken } from './webToken'

const db = pool
const data_route = express.Router({ mergeParams: true })

data_route.get('/allfiles', verifyToken, async (req: express.Request, res: express.Response) => {
    const userID = req.userID
    console.log(userID)
    try {
        const result = await db.query('SELECT file_name, file_id FROM user_files_data WHERE user_id = $1', [userID])
        if (result.rows.length !== 0) {
            return res.json(result.rows)
        } else {
            return res.status(200).json([])
        }
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({ message: 'Internal Server Error.' })
    }
})

data_route.get('/openfiles', verifyToken, async (req: express.Request<{ userID: number }>, res: express.Response) => {
    const userID = req.userID
    console.log(userID)
    let result: any = await db.query('SELECT opened_files FROM my_users WHERE user_id = $1;', [userID])
    if (result.rows.length !== 0) {
        if (result.rows[0]['opened_files']) {
            const openfiles = result.rows[0]['opened_files'].split('|')
            let query = 'SELECT file_id, file_name, html_code, js_code, css_code, buttons FROM user_files_data WHERE user_id = $1 AND file_name IN ('
            let queryParams = [userID]
            let counts = 2
            for (let dt of openfiles) {
                query = query + `$${counts}, `
                counts += 1
                queryParams.push(dt)
            }
            query = query.slice(0, -2)
            query = query + ');'
            result = await db.query(query, queryParams)
            const data_rows = result.rows
            let res_data = []
            for (let dt of data_rows) {
                res_data.push({
                    fileID: dt.file_id,
                    file_name: dt.file_name,
                    html_code: dt.html_code,
                    js_code: dt.js_code,
                    css_code: dt.css_code,
                    buttons: dt.buttons
                })
            }
            return res.json(res_data)
        } else {
            return res.json('')
        }
    } else {
        return res.status(404).json({ message: 'User not found.' })
    }
})

data_route.put('/:fileID', verifyToken, async (req: express.Request<OpenFiles>, res: express.Response) => {
    const { fileID, openFiles } = req.body
    const userID = req.userID
    try {
        const result = await db.query('SELECT file_id, file_name, html_code, js_code, css_code, buttons FROM user_files_data WHERE user_id = $1 AND file_id = $2', [userID, fileID])
        const data_rows = result.rows
        let res_data = [{
            fileID: data_rows[0].file_id,
            file_name: data_rows[0].file_name,
            html_code: data_rows[0].html_code,
            js_code: data_rows[0].js_code,
            css_code: data_rows[0].css_code,
            buttons: data_rows[0].buttons
        }]
        let query = 'UPDATE my_users SET opened_files = $1 WHERE user_id = $2'
        let queryParams: any = [openFiles, userID]
        await db.query(query, queryParams)
        return res.json(res_data)
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Internal Server Error.' })
    }
})

export default data_route