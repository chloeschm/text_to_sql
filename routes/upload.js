const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { insertCSVData } = require('../utils/csv');

router.post('/', upload.single('csvFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    if (!req.body.tableName) {
        return res.status(400).json({ success: false, message: 'Table name is required.' });
    }
    try {
        await insertCSVData(req.file.buffer, req.body.tableName);
        res.json({ success: true, message: 'File uploaded and data inserted successfully.' });
    } catch (error) {
        console.error('Error inserting CSV data:', error);
        res.status(500).json({ success: false, message: 'Error inserting CSV data.' });
    }
});

module.exports = router;