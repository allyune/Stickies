const router = require('express').Router();
const db = require('./postgres');
const Crypto = require('crypto');

router.get ('/board/load/:uid', async (req, res) => {
    try {
        var stickies = await db.query("SELECT id, color, content, position FROM stickies where board=$1 ORDER BY position", [req.params.uid]);
        res.json(stickies.rows)
    } catch (e) {
        console.error(e);
        res.status(400).end();
    }
    })

router.post('/board/save', async (req, res) => {
    try {
        req.body.stickies.forEach(async (stickie) => {
        await db.query("UPDATE stickies SET content=$1, color=$2, position=$3 WHERE id = $4", [stickie.content, stickie.color, stickie.position, stickie.id]);
        res.status(200).send()
      });
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
    })

  router.post('/stickie/add', async (req, res) => {
    try {
            let newStickie = await db.query("INSERT INTO stickies (board) VALUES ($1) RETURNING id, color, content, position", [req.body.board]);
            res.json(newStickie.rows[0]);
          } catch (err) {
              console.error(err);
              res.status(400).send(err.message);
          }
  })

  router.delete('/stickie/delete/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM stickies WHERE id = $1', [req.params.id]);
      res.status(200).send();
    } 
    catch (err) {
      console.error(err);
      res.status(400).send(err.message);
    }
  })
  
      
module.exports = router;