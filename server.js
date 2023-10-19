const express = require("express");
const titleController = require("./titleController");
const app = express();

app.get("/I/want/title/", titleController.getWebsiteTitles);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
