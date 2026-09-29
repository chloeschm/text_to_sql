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
        if (!tableName) {
            return res.status(400).json({ success: false, message: 'Table name is required.' });
        }

        const fetchSchema = async (db) => {
            const schema = db.prepare(`PRAGMA table_info("${tableName}")`).all();
            return schema;
        };

        const db = require('../db');
        const schema = await fetchSchema(db);
        const schemaString = `Table: ${tableName}\nColumns: ${schema.map(col => `${col.name} (${col.type})`).join(', ')}`;

        const sqlQuery = await getSQLFromOpenAI(schemaString, question);
        const results = db.prepare(sqlQuery).all();

        res.json({ success: true, results });

    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

module.exports = router;
