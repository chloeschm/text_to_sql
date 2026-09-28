const fs = require('fs');
const csv = require('csv-parser');
const Database = require('better-sqlite3');
const db = new Database('data/database.db', { verbose: console.log });

function processHeaders(rawHeaders) {
    const seenKeys = new Set();

    return rawHeaders.map((rawHeader, index) => {
        let clean = String(rawHeader);

        clean = clean
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');

        if (clean.length > 60) {
            clean = clean.slice(0, 60).replace(/_+$/, '');
        }

        if (!clean) {
            clean = `column_${index + 1}`;
        }

        if (/^[0-9]/.test(clean)) {
            clean = 'num_' + clean;
        }

        let finalKey = clean;
        let counter = 1;

        while (seenKeys.has(finalKey)) {
            finalKey = `${clean}_${counter}`;
            counter++;
        }

        seenKeys.add(finalKey);
        return finalKey;
    });
}

function parseCSVHeaders(filePath) {
    return new Promise((resolve, reject) => {
        let headersParsed = false;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('headers', (headers) => {
                if (!headersParsed) {
                    const sanitizedHeaders = processHeaders(headers);
                    headersParsed = true;
                    resolve(sanitizedHeaders);
                }
            })
            .on('error', (err) => {
                reject(new Error(`Failed to parse CSV headers: ${err.message}`));
            });
    });
}

function insertCSVData(filePath, tableName) {
    return new Promise((resolve, reject) => {
        let insertStmt = null;
        let sanitizedHeaders = null;
        let rawHeaders = null;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('headers', (headers) => {
                rawHeaders = headers;
                sanitizedHeaders = processHeaders(headers);

                const columnDefinitions = sanitizedHeaders.map(h => `"${h}" TEXT`).join(', ');
                const createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefinitions})`;

                try {
                    db.prepare(createTableQuery).run();
                    console.log(`Table "${tableName}" created with sanitized schema.`);

                    const columns = sanitizedHeaders.map(h => `"${h}"`).join(', ');
                    const placeholders = sanitizedHeaders.map(() => '?').join(', ');
                    insertStmt = db.prepare(`INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders})`);
                } catch (err) {
                    reject(new Error(`Failed to create table: ${err.message}`));
                }
            })
            .on('data', (row) => {
                if (insertStmt && rawHeaders && sanitizedHeaders) {
                    const values = rawHeaders.map(h => row[h]);
                    try {
                        insertStmt.run(values);
                    } catch (err) {
                        reject(new Error(`Failed to insert row: ${err.message}`));
                    }
                }
            })
            .on('end', () => {
                console.log(`All CSV data successfully imported into "${tableName}"!`);
                resolve();
            })
            .on('error', (err) => {
                reject(new Error(`CSV parsing error: ${err.message}`));
            });
    });
}

module.exports = {
    processHeaders,
    parseCSVHeaders,
    insertCSVData
};