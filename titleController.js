
const async = require("async");
const express = require("express");
const https = require("https");

function isURLValid(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function getWebsiteTitles(req, res) {
  const { addresses } = req.query;

  if (!addresses) {
    return res.status(400).send("Address is required");
  }

  const addressesArray = Array.isArray(addresses) ? addresses : [addresses];
  let invalidResults = [];
  async.map(
    addressesArray,
    (address, callback) => {
      if (!isURLValid(address)) {
        invalidResults.push({ address, title: "NO RESPONSE" });
        callback(null, { address, title: "NO RESPONSE" }); 
      } else {
        https.get(address, (response) => {
          let data = "";
  
          response.on("data", (chunk) => {
            data += chunk;
          });
  
          response.on("end", () => {
            const match = data.match(/<title>(.*)<\/title>/i);
            const title = match[1]
            callback(null, { address, title });
          });
  
          response.on("error", (err) => {
            callback(err);
          });
        });
      }
    },
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Server error! Please be patient.");
      }
  
      const htmlResponse = `
        <html>
          <head></head>
          <body>
            <h1>Following are the titles of given websites:</h1>
            <ul>
              ${results
                .filter((result) => result !== null)
                .map((result) => `<li>${result.address} - "${result.title}"</li>`)}
              ${invalidResults
                .map((invalidResult) => `<li>${invalidResult.address} - "${invalidResult.title}"</li>`)}
            </ul>
          </body>
        </html>
      `;
      res.status(200).send(htmlResponse);
    }
  );
  
}

module.exports = {
  getWebsiteTitles,
};
