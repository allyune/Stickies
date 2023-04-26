const router = require('express').Router();
const db = require('./postgres');
const Crypto = require('crypto');

router.get ('/load/:uid', async (req, res) => {
    try {
        var stickies = await db.query("SELECT id, color, content, position FROM stickies where board=$1 ORDER BY position", [req.params.uid]);
        res.json(stickies.rows)
    } catch (e) {
        console.error(e);
        res.status(400).end();
    }
    })

router.post('/init', async (req, res) => {
        try {
          const uuid = crypto.randomUUID();
          await db.query('INSERT INTO boards (uuid) VALUES ($1)', [uuid]);
          await db.query('INSERT INTO stickies (board, content) VALUES ($1, $2)', [uuid, ""]);
          console.log(`http://127.0.0.1:7777/${uuid}`)
          return res.redirect(301, `http://127.0.0.1:7777/${uuid}`);
        } catch (err) {
          console.error(err);
          res.status(400).send(err.message);
        }
      });
      
module.exports = router;