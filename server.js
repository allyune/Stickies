require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const db = require('./postgres');
const app = express();
const api = require('./api');
const path = require('path');

app.use(express.json());

app.use('/api', api);

// Serve static files in the /app folder


app.get('/', async function(req, res) {
    try {
        const uuid = crypto.randomUUID();
        await db.query('INSERT INTO boards (uuid) VALUES ($1)', [uuid]);
        await db.query('INSERT INTO stickies (board, content) VALUES ($1, $2)', [uuid, ""]);
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.redirect(302, `/${uuid}`);

    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
});

app.use(express.static(path.join(__dirname, 'app')));

app.get('/:uuid', (req, res) => {
    res.sendFile(path.join(__dirname, 'app', 'index.html'));
  });



// app.get('/:uuid', async function(req, res) {
// //   let allowedPaths = await getAllowedUrls();
// //   let currPath = req.path
// //   if (allowedPaths.includes(currPath.substring(1))) {
// //     res.sendFile(__dirname + '/app/index.html');
// //     } else {
// //       res.status(404).send('Not found'); 
// //     } 
//     res.sendFile(__dirname + '/app/index.html');    
//   });
  


app.listen(process.env.PORT, () => {
    console.log(`server on port ${process.env.PORT}`)
});