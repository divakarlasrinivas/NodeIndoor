const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');
const http = require('http');
const bodyParser = require('body-parser');

// Create Express app and HTTP server
const app = express();
const server = http.Server(app);
const port = process.env.PORT || 3000; // Use Railway-assigned PORT or default to 3000

// Middleware setup
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Default route to serve app.html
app.get('/', function (req, res) {
  console.log('POST request received with payload:', req.body);
  res.sendFile(path.join(__dirname, 'public/html/app.html'));
});

// Post request to get the exit path
app.post('/getPath', function (req, res) {
  const mapData = req.body.mapDataIn;
  const startPoint = req.body.startPointIn;
  const endPoint = req.body.endPointIn;

  console.log(req.body);

  let possiblePaths = [];
  let response = { exitPath: [] };

  if (
    mapData["data"].hasOwnProperty(startPoint) &&
    mapData["data"].hasOwnProperty(endPoint) &&
    mapData["size"] > 0
  ) {
    findExitPath(mapData, startPoint, endPoint, startPoint, [], possiblePaths);

    const optimalPath = findOptimalPath(possiblePaths, mapData);

    response = {
      exitPath: optimalPath
    };
  }

  res.send(response);
});

// Function to find all possible exit paths
function findExitPath(mapDataIn, startVertex, endVertex, curVertex, path, possiblePathsIn) {
  const tempPath = [...path];

  if (curVertex === endVertex) {
    tempPath.push(curVertex);
    possiblePathsIn.push(tempPath);
  } else if (tempPath.length <= mapDataIn["size"] && !tempPath.includes(curVertex)) {
    tempPath.push(curVertex);

    const nextArr = mapDataIn.data[curVertex]["next"];

    for (let i = 0; i < nextArr.length; i++) {
      const nextVertex = nextArr[i];
      findExitPath(mapDataIn, startVertex, endVertex, nextVertex, tempPath, possiblePathsIn);
    }
  }
}

// Function to return the best exit path from all possible paths
function findOptimalPath(possiblePathsIn, mapDataIn) {
  let minDistance = mapDataIn["size"] + 1;
  let bestPathIndex = -1;

  for (let i = 0; i < possiblePathsIn.length; i++) {
    if (possiblePathsIn[i].length <= minDistance) {
      minDistance = possiblePathsIn[i].length;
      bestPathIndex = i;
    }
  }

  return possiblePathsIn[bestPathIndex];
}

// Fallback route for undefined paths
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/html/app.html'));
});

// Start server
server.listen(port, function () {
  console.log('Server listening on port: ' + port);
});
