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

async function getBoards() {
    let boards = await db.query('SELECT uuid from boards');
    return boards.rows
}

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  

app.get('/', async function(req, res) {
    let userId = req.cookies['userId'] || '';
    if (userId.length !== 0) {
        let latestUserBoard = await db.query('SELECT uuid FROM boards WHERE board_user = $1 ORDER BY created desc LIMIT 1', [userId]);
        if (latestUserBoard.rows.length !== 0) {
            let uuid = latestUserBoard.rows[0].uuid
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

app.get('/new/:uuid?', async function(req, res) {
    let userId = req.cookies['userId'] || '';
    if (userId.length === 0) {
        let newUserId = generateUniqueId();
        res.cookie('userId', newUserId);
        userId = newUserId;
    }
    try {
        let uuid = req.params.uuid || crypto.randomUUID();
        if (uuidRegex.test(uuid)) {
            await db.query('INSERT INTO boards (uuid, board_user, created) VALUES ($1, $2, clock_timestamp())', [uuid, userId]);
            await db.query('INSERT INTO stickies (board, content) VALUES ($1, $2)', [uuid, ""]);
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            res.redirect(302, `/${uuid}`);
        } else {
            res.send("Wrong board id format")
        }

    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
});

app.get('/delete/:uuid', async (req, res) => {
    try {
      let existingBoards = await getBoards()
      if (existingBoards.filter(row => row.uuid === req.params.uuid).length > 0) {
        await db.query('DELETE FROM stickies WHERE board = $1', [req.params.uuid])
        await db.query('DELETE FROM boards WHERE uuid = $1', [req.params.uuid])
        res.status(200).send(`Board ${req.params.uuid} has beeen deleted.`)
      } else {
        res.send(`Board ${req.params.uuid} does not exist.`)
      }
    } 
    catch (err) {
      console.error(err);
      res.status(400).send(err.message);
    }
  })

app.use(express.static(path.join(__dirname, 'app')));

app.get('/:uuid', async function(req, res) {
    let existingBoards = await getBoards();
    if (existingBoards.filter(row => row.uuid === req.params.uuid).length > 0) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.sendFile(path.join(__dirname, 'app', 'index.html'));
    } else {
        if (uuidRegex.test(req.params.uuid)) {
        res.redirect(302, `/new/${req.params.uuid}`)
        } else {
            res.send("Board not found")
        }
    }
}) 


app.listen(process.env.PORT, () => {
    console.log(`server on port ${process.env.PORT}`)
});