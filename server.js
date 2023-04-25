require('dotenv').config();
const express = require('express');
const db = require('./postgres');
const app = express();
const api = require('./api');

app.use(express.json());

app.use('/api', api);

app.use(express.static('app'));

//getting rid of trailing slash
app.use((req, res, next) => {
  if (req.path.substr(-1) === '/' && req.path.length > 1) {
    const newPath = req.path.slice(0, -1);
    return res.redirect(301, newPath);
  }
  next();
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/app/index.html');
  });
  
// app.get('/:uuid', async function(req, res) {
//   let allowedPaths = await getAllowedUrls();
//   let currPath = req.path
//   if (allowedPaths.includes(currPath.substring(1))) {
//     res.sendFile(__dirname + '/app/index.html');
//     } else {
//       res.status(404).send('Not found'); 
//     } 
//   });
  

app.listen(process.env.PORT, () => {
    console.log(`server on port ${process.env.PORT}`)
});