const myExpress = require("express");

const app = myExpress();

const cors = require("cors");

require("dotenv").config();

app.use(myExpress.json());

app.use(cors());

app.use(myExpress.json());

const port = process.env.PORT || 3010;

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});