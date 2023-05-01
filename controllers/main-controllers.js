const mainModel = require('../models/main-model');
const boardModel = require("../models/board-model");
const utils = require('../utils/utils')
const path = require("path");

exports.handleRoot = async (req, res) => {
    let userId = req.cookies["userId"] || "";
    try {
        if (userId.length !== 0) {
        let latestUserBoard = await mainModel.loadBoardByUser(userId)
        if (latestUserBoard.length !== 0) {
            let uuid = latestUserBoard.uuid;
            res.set("Cache-Control", "no-cache, no-store, must-revalidate");
            res.set("Expires", "0");
            res.redirect(302, `/${uuid}`);
        } else {
            res.redirect(302, "/new");
        }
        } else {
            res.redirect(302, "/new");
        }
    }  catch (err) {
        res.status(500).send({ err: err.message });
    }
}  

exports.handleUuid = async (req, res) => {
    let existingBoards = await boardModel.getAllBoards();
    if (existingBoards.filter((row) => row.uuid === req.params.uuid).length > 0) {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Expires", "0");
      res.sendFile(path.join(__dirname, "..", "app", "index.html"));
    } else {
      if (utils.uuidRegex.test(req.params.uuid)) {
        res.redirect(302, `/new/${req.params.uuid}`);
      } else {
        res.send("Board not found");
      }
    }
}  