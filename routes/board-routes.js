
const router = require("express").Router();
const boardController = require('../controllers/board-controllers');
const cookieParser = require("cookie-parser");

// router.use(express.json());
router.use(cookieParser());

router.get("/load/:uuid", boardController.loadBoard);

router.post("/save", boardController.saveBoard);

router.get('/delete-empty', boardController.deleteEmpty)

module.exports = router;