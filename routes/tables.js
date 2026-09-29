const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();
    const tableNames = tables.map(t => t.name);
    res.json({ tables: tableNames });
});

module.exports = router;