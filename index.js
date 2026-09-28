const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/upload', require('./routes/upload'));

app.listen(port, function() {
  console.log(`Server is running on port ${port}`);
});