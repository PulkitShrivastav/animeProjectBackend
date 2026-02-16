const router = require('express').Router()
const db = require('../db_connection')

router.get('/', async (req, res) => {
    const [result] = await db.query('select file_name, js_code, html_code, css_code, buttons from user_files_data;')
    res.json(result)
})

module.exports = router