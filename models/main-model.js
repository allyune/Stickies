const db = require("../postgres");

exports.loadBoardByUser = async (userId) => {
    try {
      const board = await db.query(
        "SELECT uuid FROM boards WHERE board_user = $1 ORDER BY created desc LIMIT 1",
        [userId]);
      return board.rows[0];
    } catch (err) {
      console.log(err);
    }
  }
  