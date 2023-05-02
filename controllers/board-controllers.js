const boardModel = require("../models/board-model");
const crypto = require('crypto');
const utils = require('../utils/utils')

exports.saveBoard = async (req, res) => {
    try {
        boardModel.saveBoard(req.body.stickies)
        res.status(200).send();
    }
    catch (err) {
        res.status(500).send({ err: err.message });
    }
}

exports.loadBoard = async (req, res) => {
    try {
        let board = await boardModel.loadBoard(req.params.uuid)
        res.json(board)
    }
    catch (err) {
        res.status(500).send({ err: err.message });
    }
}

exports.getAllBoards = async(req, res) => {
    try {
        let boards = await boardModel.getAllBoards();
        res.json(boards)
    } catch {
        res.status(500).send({ err: err.message });
    }
}

exports.createBoard = async (req, res) => {
    let userId = req.cookies["userId"] || "";
    if (userId.length === 0) {
      let newUserId = utils.generateUniqueId();
      res.cookie("userId", newUserId);
      userId = newUserId;
    }
    try {
      let uuid = req.params.uuid || crypto.randomUUID();
      if (utils.uuidRegex.test(uuid)) {
        let maybeRows = await boardModel.loadBoard(uuid);
        if (maybeRows.length !== 0) {
            res.status(460).send('Board already exists');
        } else {
        await boardModel.newBoard(uuid, userId)
        res.set("Cache-Control", "no-cache, no-store, must-revalidate");
        res.set("Expires", "0");
        res.redirect(302, `/${uuid}`);
       }
      } else {
        res.status(461).send('Wrong uuid format');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ err: err.message });
    }
}

exports.deleteBoard = async (req, res) => {
    try {
        let existingBoards = await boardModel.getAllBoards();
        if (
          existingBoards.filter((row) => row.uuid === req.params.uuid).length > 0
        ) {
          await boardModel.deleteBoard(req.params.uuid)
          console.log(`[Board delete]: ${req.params.uuid}`)
          res.redirect(302, "/")
        } else {
          res.send(`Board ${req.params.uuid} does not exist.`);
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({ err: err.message });
      }
}

exports.deleteEmpty = async (req, res) => {
  let userId = req.cookies["userId"] || "";
    if (userId.length === 0) {
      res.status(200).send()
    } else {
    try{
      await boardModel.deleteEmpty(userId)
      res.status(200).send()
    } catch (err) {
      console.log(err)
    }
  }
}