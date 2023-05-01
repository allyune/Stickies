require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const api = require("./routes/api");
const mainController = require('./controllers/main-controllers');
const boardController = require('./controllers/board-controllers');

app.use(express.json());
app.use(cookieParser());
app.use("/api", api);

app.get("/", mainController.handleRoot);

app.get("/new/:uuid?", boardController.createBoard);
  
app.get("/delete/:uuid", boardController.deleteBoard);

app.use(express.static(path.join(__dirname, "app")));

app.get("/:uuid", mainController.handleUuid);

module.exports = app;

app.listen(process.env.PORT, () => {
  console.log(`server on port ${process.env.PORT}`);
});
