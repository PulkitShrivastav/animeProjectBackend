import express from 'express'
import pool from '../db_connection'

const db = pool
const data_route = express.Router({ mergeParams: true })

// data_route.get('/', async (req, res) => {
//     const result: any = await db.query('select file_name, js_code, html_code, css_code, buttons from user_files_data;')
//     // console.log(result.rows)
//     res.json(result.rows)
// })

// function checkButtons(data: Array<string>) {
//     if (data[0] === '') {
//         console.log(data)
//         return null
//     } else {
//         console.log(data)
//         return data
//     }
// }

data_route.get('/allfiles', async (req: express.Request<{ userID: number }>, res: express.Response) => {
    const userID = req.params.userID
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

data_route.get('/openfiles', async (req: express.Request<{ userID: number }>, res: express.Response) => {
    const userID = req.params.userID
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
            const query = `SELECT html_code, css_code, js_code FROM user_files_data WHERE file_name = 'new_untitled_file' AND user_id = 2;`
            const result: any = await db.query(query)
            return res.json(result.rows[0])
        }
    } else {
        return res.status(404).json({ message: 'User not found.' })
    }
})

data_route.get('/:fileID', async (req: express.Request<{ userID: number, fileID: number }>, res: express.Response) => {
    const userID = req.params.userID
    const fileID = req.params.fileID
    try {
        const result = await db.query('SELECT file_id, file_name, html_code, js_code, css_code, buttons FROM user_files_data WHERE user_id = $1 AND file_id = $2', [userID, fileID])
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
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Internal Server Error.' })
    }
})

export default data_route