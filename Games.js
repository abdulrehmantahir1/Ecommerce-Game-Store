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

app.get("/", (req, res) => {
    res.send("API is working");
  });


app.post("/admin/add_games", async (req, res) => {
    try {
      const { title, description, price, genre, platform ,stock} = req.body;
  
      if (!title || !price || !stock) {
        return res.status(400).json({
          success: false,
          message: "Title , price and Stocks are mandatory.",
        });
      }
  
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("title", sql.VARCHAR, title)
        .input("description", sql.VARCHAR, description)
        .input("price", sql.DECIMAL(10,2), price)
        .input("genre", sql.VARCHAR, genre)
        .input("platform", sql.VARCHAR, platform)
        .query(
          "insert into Games(title, description, price, genre, platform) Values (@title,@description,@price,@genre,@platform);"+
          "SELECT SCOPE_IDENTITY() AS game_id"
        );
  
      
  
  const result_game_id=result.recordset[0].game_id;
  
      const result2 = await pool
        .request()
        .input("result_game_id", sql.Int, result_game_id)
        .input("stock_quantity", sql.Int, stock) 
        .query(
          "insert into Inventory(game_id,stock_quantity) Values (@result_game_id,@stock_quantity)"
        );
  
      res.status(200).json({
        message: "Game and inventory are inserted successfully.",
      });
    } catch (error) {
      console.error("Error while inserting:", error);
  
      res.status(500).json({
        message: "Error while inserting",
      });
    }
  });
  
  app.put("/admin/update_games", async (req, res) => {
      try {
        const {id, title, description, price, genre, platform } = req.body;
    
        if (!id || !title || !price) {
          return res.status(400).json({
            success: false,
            message: "Title and price are mandatory.",
          });
        }
        const pool = await poolPromise;
        const result = await pool
          .request()
          .input("id", sql.Int, id)
          .input("title", sql.VARCHAR, title)
          .input("description", sql.VARCHAR, description)
          .input("price", sql.DECIMAL(10,2), price)
          .input("genre", sql.VARCHAR, genre) 
          .input("platform", sql.VARCHAR, platform)
          .query("Update Games set title= @title,description=@description,price=@price,genre=@genre,platform=@platform where game_id=@id");
    
        res.status(200).json({
          message: "ALL fields are updated successfully",
        });
      } catch (error) {
        console.error("Error while updating:", error);
    
        res.status(500).json({
          message: "Error while updating",
        });
      }
    });
  
    app.delete("/admin/delete_games", async (req, res) => {
      try {
        const {id} = req.body;
    
        if (!id) {
          return res.status(400).json({
            success: false,
            message: "ID is mandatory.",
          });
        }
        const pool = await poolPromise;
        const result = await pool
          .request()
          .input("id", sql.Int, id)
          .query("Delete from Games where game_id=@id");
    
          if (result.rowsAffected[0] === 0) {
              return res.status(404).json({
                success: false,
                message: "Game not found with the given ID.",
              });
            }
  
        res.status(200).json({
          message: "ALL fields are deleted successfully",
        });
      } catch (error) {
        console.error("Error while deleting:", error);
    
        res.status(500).json({
          message: "Error while deleting.",
        });
      }
    });
  
    app.get("/admin/display_games", async (req, res) => {
      try {
        const pool = await poolPromise;
        const result = await pool
          .request()
          .query("Select * from Games ");
    
          res.status(200).json({
              success: true,
              message: "Games fetched successfully.",
              games: result.recordset,   
          });
      } catch (error) {
        console.error("Error while displaying:", error);
    
        res.status(500).json({
          message: "Error while displaying.",
        });
      }
    });
  
  
    app.get("/user/display_games", async (req, res) => {
      try {
        const pool = await poolPromise;
        const result = await pool
          .request()
          .query("Select * from Games ");
    
          res.status(200).json({
              success: true,
              message: "Games fetched successfully.",
              games: result.recordset,   
          });
      } catch (error) {
        console.error("Error while displaying:", error);
    
        res.status(500).json({
          message: "Error while displaying.",
        });
      }
    });
  
  
  
    app.get("/admin/display_games/:id", async (req, res) => {
      try {
          const {id} =req.params
  
        const pool = await poolPromise;
        const result = await pool
          .request()
          .input("ID",sql.Int,id)
          .query("Select * from Games where game_id=@ID");
    
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
  