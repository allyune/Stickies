const db = require("../postgres");

exports.addStickie = async (uuid) => {
    try {
        let newStickie = await db.query(
            "INSERT INTO stickies (board) VALUES ($1) RETURNING id, color, content, position", [uuid])
            return newStickie.rows[0];
      } catch (err) {
        console.log(err);
      }
}

exports.deleteStickie = async (id) => {
    try {
        await db.query(
            "DELETE FROM stickies WHERE id = $1", [id])
         console.log("[Sticky delete]: " + id)
      } catch (err) {
        console.log(err);
      }
    }

