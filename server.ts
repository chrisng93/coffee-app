const express = require('express');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const app = express();

const publicPath = path.resolve(__dirname, 'public');

const PORT = argv.port || 3000;

app.use(express.static(publicPath));
app.all('*', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
