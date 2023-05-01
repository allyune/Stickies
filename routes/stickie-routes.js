const router = require("express").Router();
const stickieController = require('../controllers/stickie-controllers');

// router.use(express.json());

router.post("/add", stickieController.addStickie);

router.delete("/delete/:id", stickieController.deleteStickie);
  
module.exports = router;