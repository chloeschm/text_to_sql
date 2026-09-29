const express = require('express');
const router = express.Router();
const { getSQLFromOpenAI } = require('../openai');

router.post('/', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ success: false, message: 'Question is required.' });
        }
        const tableName = req.body.tableName;
        const fetchSchema = async (db) => {
            const schema = db.prepare('PRAGMA table_info(?)').all(tableName);
            return schema;
        };
        const db = require('../db');
        const schema = await fetchSchema(db);
        
        const sqlQuery = await getSQLFromOpenAI(schema, question);
        const results = db.prepare(sqlQuery).all();
        res.json({ success: true, results });

    } catch (error) {
        console.error('Error executing SQL:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
        return;
    }

});

module.exports = router;