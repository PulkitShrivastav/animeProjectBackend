const express = require('express');
const router = express.Router();
const db = require('../db_connection')

router.get('/', async (req, res) => {

    const [result] = await db.query('select opened_files from my_users where user_id = 1;')
    console.log(result[0]['opened_files'].split('|'))
    res.json(result[0]['opened_files'].split('|'))

})

module.exports = router