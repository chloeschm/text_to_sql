const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, function() {
  console.log(`Server is running on port ${port}`);
});