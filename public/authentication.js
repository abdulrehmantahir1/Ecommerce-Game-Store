const { sql, poolPromise } = require("../db.js");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");


const app = express();

app.use(bodyParser.json());
app.use(cors());

const Port = 3000;
app.listen(Port, () => console.log(`Server is running on port : "${Port}"`));

// at the top of server.js, before any routes:
app.use(express.static('public'));

app.post("/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "ALL fields are required while registering.",
        });
      }
  
      const pool = await poolPromise;
  
      const emailChecker = await pool
        .request()
        .input("Email", sql.NVARCHAR, email)
        .query("select 1 from Users where email=@Email");
  
      if (emailChecker.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email exists already.",
        });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const result = await pool
        .request()
        .input("Name", sql.NVARCHAR, username)
        .input("Email", sql.NVARCHAR, email)
        .input("Password", sql.NVARCHAR, hashedPassword)
        .query(
          "insert into Users(username,email,password) Values (@Name,@Email,@Password)"
        );
  
      res.status(200).json({
        message: "ALL fields are inserted successfully",
      });
    } catch (error) {
      console.error("Error while inserting:", error);
  
      res.status(500).json({
        message: "Error while inserting",
      });
    }
  });

  app.post("/login", async (req, res) => {
    try {
      const {email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "ALL fields are required",
        });
      }
  
      const pool = await poolPromise;
  
      const emailChecker = await pool
        .request()
        .input("Email", sql.NVARCHAR, email)
        .query("select role,email,password from Users where email=@Email");
  
      if (emailChecker.recordset.length == 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid email.",
        });
      }
  
      const storedPassword = emailChecker.recordset[0].password;
      const isPasswordCorrect = await bcrypt.compare(password, storedPassword);
  
      if (!isPasswordCorrect) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password",
        });
      }
  
      let role='user';
  
      if(emailChecker.recordset[0].role=='admin')
      {
          role='admin';
      }
  // inside login success
//const token = jwt.sign(
    //{ email: emailChecker.recordset[0].email, role: emailChecker.recordset[0].role },
   // process.env.JWT_SECRET, // keep your secret in .env
   // { expiresIn: "1h" }
  
      res.status(200).json({
          success: true,
        message: "Logged in successfully",
        //token, 
        role:role
      });
    } catch (error) {
      console.error("Error while inserting:", error);
  
      res.status(500).json({
        message: "Error while inserting",
      });
    }
  });


 