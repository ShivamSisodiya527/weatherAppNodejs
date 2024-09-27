require('dotenv').config();
const http = require("http");
const fs = require("fs");
const requests = require("requests");
const express = require('express');

const app = express();
const PORT = 8000;

// Read the HTML file
const homeFile = fs.readFileSync("home.html", "utf-8");

// Function to replace placeholders in the HTML with actual data
const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
  temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);

  return temperature;
};

// Create the server
const server = http.createServer((req, res) => {
  if (req.url == "/") {
    requests(
      `https://api.openweathermap.org/data/2.5/weather?lat=18.52&lon=73.85
       E&appid=${process.env.API_KEY}&units=metric`
    )
      .on("data", (chunk) => {
        const objdata = JSON.parse(chunk);
        const arrData = [objdata];
        const realTimeData = arrData
          .map((val) => replaceVal(homeFile, val))
          .join("");
        res.write(realTimeData);
      })
      .on("end", (err) => {
        if (err) return console.log("connection closed due to errors", err);
        res.end();
      });
  } else {
    res.end("File not found");
  }
});

// Start the server
server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});
