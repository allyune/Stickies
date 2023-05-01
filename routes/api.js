const router = require("express").Router();

const stickieRoutes = require('./stickie-routes');
const boardRoutes = require('./board-routes');

router.use('/board', boardRoutes);
router.use('/stickie', stickieRoutes)

module.exports = router;