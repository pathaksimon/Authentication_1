const express = require("express");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running.... ^_^");
    });
  } catch (e) {
    console(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedpassword = await bcrypt.hash(password, 10);
  const selectuser = `
  SELECT * 
  FROM user WHERE 
  username='${username}';`;

  const dbUser = await db.get(selectuser);

  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const createnew = `
      INSERT INTO
      user(username,name,password,gender,location)
      VALUES ('${username}','${name}','${hashedpassword}','${gender}','${location}')`;
      await db.run(createnew);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const checking = `SELECT *
    FROM user 
    WHERE username='${username}';`;
  const lemish = await db.get(checking);

  if (lemish === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const checkingpassword = await bcrypt.compare(password, lemish.password);
    if (checkingpassword === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const whetherheis = `
  SELECT *
  FROM user 
  WHERE username='${username}'`;

  const manchar = await db.get(whetherheis);
  const encryption = await bcrypt.compare(oldPassword, manchar.password);
  const newpassword111 = await bcrypt.hash(newPassword, 10);

  if (encryption === true) {
    if (newPassword.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const latestoflatest = `UPDATE user 
          SET password='${newpassword111}'
          `;
      await db.run(latestoflatest);
      response.send("Password updated");
    }
  } else {
    response.status(400);
    response.send("Invalid current password");
  }
});

module.exports = app;
