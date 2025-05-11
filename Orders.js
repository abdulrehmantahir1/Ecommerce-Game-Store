const { sql, poolPromise } = require("./db.js");
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


app.get("/display_log_orders", async (req, res) => {
    try {

        const { user_id} = req.body;

      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("user_id", sql.Int, user_id)
        .query("Select * from Orders where user_id=@user_id");
  
        res.status(200).json({
            success: true,
            message: "Orders fetched successfully.",
            games: result.recordset,   
        });
    } catch (error) {
      console.error("Error while displaying orders :", error);
  
      res.status(500).json({
        message: "Error while displaying orders.",
      });
    }
  });

  app.get("/display_order_detail", async (req, res) => {
    try {

        const { order_id} = req.body;

      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("order_id", sql.Int, order_id)
        .query("Select * from OrderDetails where order_id=@order_id");
  
        res.status(200).json({
            success: true,
            message: "Orders fetched successfully.",
            games: result.recordset,   
        });
    } catch (error) {
      console.error("Error while displaying orders :", error);
  
      res.status(500).json({
        message: "Error while displaying orders.",
      });
    }
  });



app.get("/admin/display_orders", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("Select * from Orders ");
  
        res.status(200).json({
            success: true,
            message: "Orders fetched successfully.",
            games: result.recordset,   
        });
    } catch (error) {
      console.error("Error while displaying orders :", error);
  
      res.status(500).json({
        message: "Error while displaying orders.",
      });
    }
  });

  app.put("/update_status", async (req, res) => {
    try {

        const { status,order_id} = req.body;

      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("status", sql.VarChar, status)
        .input("order_id", sql.Int, order_id)
        .query("update Orders set status=@status where order_id=@order_id");
  
        res.status(200).json({
            success: true,
            message: "Orders fetched successfully.",
            games: result.recordset,   
        });
    } catch (error) {
      console.error("Error while displaying orders :", error);
  
      res.status(500).json({
        message: "Error while displaying orders.",
      });
    }
  });