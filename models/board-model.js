const db = require("../postgres");

exports.loadBoard = async (uuid) => {
  try {
    const board = await db.query("SELECT id, color, content, position FROM stickies where board=$1 ORDER BY position", [uuid]);
    return board.rows
  } catch (err) {
    console.log(err);
  }
}

exports.getAllBoards = async () => {
    try {
      const boards = await db.query("SELECT uuid FROM boards");
      return boards.rows
    } catch (err) {
      console.log(err);
    }
  }

exports.saveBoard = async (stickies) => {
  for (const stickie of stickies) {
    try {
      const result = await db.query(
        "UPDATE stickies SET content=$1, color=$2, position=$3 WHERE id = $4", 
        [stickie.content, stickie.color, stickie.position, stickie.id]
      );
    } catch (err) {
      console.log(err);
    }
  }
}

exports.newBoard = async (uuid, userId) => {
    try {
        let newBoard = await db.query(
            "INSERT INTO boards (uuid, board_user, created) VALUES ($1, $2, clock_timestamp()) returning uuid",
            [uuid, userId]);
        await db.query(
            "INSERT INTO stickies (board, content) VALUES ($1, $2)", 
            [uuid,""]);
        return newBoard;   
      } catch (err) {
        console.log(err);
      }
}

exports.deleteBoard = async (uuid, callback) => {
  try {
    await db.query("DELETE FROM stickies WHERE board = $1", [uuid]);
    await db.query("DELETE FROM boards WHERE uuid = $1", [uuid]);
  } catch (err) {
    console.log(err)
  }
}

exports.deleteEmpty = async (userId) => {
  console.log("deleting empty boards")
  let emptyBoards = await db.query("SELECT uuid FROM boards WHERE board_user = $1 AND (SELECT COUNT(id) FROM stickies WHERE board = uuid) <= 1 AND (SELECT COUNT(id) FROM stickies WHERE board = uuid AND content != '') = 0;", [userId]).then(res => res.rows.map(row => row.uuid));
  console.log(emptyBoards)
  await db.query("DELETE FROM stickies WHERE board IN (SELECT unnest($1::uuid[]))", [emptyBoards])
  await db.query("DELETE FROM boards WHERE uuid IN (SELECT unnest($1::uuid[]))", [emptyBoards])
}