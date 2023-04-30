const cookies = require('./cookies.js');
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const db = require('./postgres');
const app = express();
const api = require('./api');
const path = require('path');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
app.use('/api', api);

function generateUniqueId() {
    var currentDate = new Date();
    var timestamp = currentDate.getTime();
    var randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return timestamp + "_" + randomString;
  }

app.get('/', async function(req, res) {
    let userId = req.cookies['userId'] || '';
    if (userId.length !== 0) {
        let response = await db.query('SELECT uuid FROM boards WHERE board_user = $1 ORDER BY created desc LIMIT 1', [userId]);
        if (response.rows.length !== 0) {
            let uuid = response.rows[0]['uuid']
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            res.redirect(302, `/${uuid}`);
        } else {
            res.redirect(302, '/new');
        }
    } else {
        res.redirect(302, '/new');
    }
})

app.get('/new', async function(req, res) {
    let userId = req.cookies['userId'] || '';
    if (userId.length === 0) {
        let newUserId = generateUniqueId();
        res.cookie('userId', newUserId);
        userId = newUserId;
    }
    try {
        const uuid = crypto.randomUUID();
        await db.query('INSERT INTO boards (uuid, board_user, created) VALUES ($1, $2, clock_timestamp())', [uuid, userId]);
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

  


app.listen(process.env.PORT, () => {
    console.log(`server on port ${process.env.PORT}`)
});