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

app.get("/display_cart", async (req, res) => {
    try {
      const { user_id} = req.body;
  
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("user_id", sql.Int, user_id)
        
        .query("select * from CartItems where user_id=@user_id");
  

      res.status(200).json({
        message: "Cart is displayed successfully.",
        cart:result.recordset
      });
    } catch (error) {
      console.error("Error while displaying cart:", error);
  
      res.status(500).json({
        message: "Error while inserting",
      });
    }
  });

  app.post("/add_item_to_cart", async (req, res) => {
      try {
        const { user_id, game_id, quantity} = req.body;
    
        if (!user_id) {
          return res.status(400).json({
            success: false,
            message: "User Id are mandatory.",
          });
        }
    
        const pool = await poolPromise;
        const result = await pool
          .request()
          .input("user_id", sql.Int, user_id)
          .input("game_id", sql.Int, game_id)
          .input("quantity", sql.Int, quantity)
          .query("insert into CartItems(user_id,game_id, quantity) Values (@user_id,@game_id,@quantity) ;"
          );
    
    
        res.status(200).json({
          message: "Items in Cart are inserted successfully.",
        });
      } catch (error) {
        console.error("Error while inserting:", error);
    
        res.status(500).json({
          message: "Error while inserting",
        });
      }
    });

    app.put("/update_quantity_to_cart", async (req, res) => {
        try {
          const { user_id, game_id, quantity} = req.body;
      
          if (!user_id) {
            return res.status(400).json({
              success: false,
              message: "User Id are mandatory.",
            });
          }
      
          const pool = await poolPromise;
          const result = await pool
            .request()
            .input("user_id", sql.Int, user_id)
            .input("game_id", sql.Int, game_id)
            .input("quantity", sql.Int, quantity)
            .query("update CartItems set quantity=@quantity where user_id=@user_id and game_id=@game_id ;"
            );
      
      
          res.status(200).json({
            message: "Items in Cart are updated successfully.",
          });
        } catch (error) {
          console.error("Error while inserting:", error);
      
          res.status(500).json({
            message: "Error while inserting",
          });
        }
      });


      app.delete("/delete_item_to_cart", async (req, res) => {
        try {
          const { user_id, game_id} = req.body;
      
          if (!user_id) {
            return res.status(400).json({
              success: false,
              message: "User Id are mandatory.",
            });
          }
      
          const pool = await poolPromise;
          const result = await pool
            .request()
            .input("user_id", sql.Int, user_id)
            .input("game_id", sql.Int, game_id)
            .query("delete CartItems where user_id=@user_id and game_id=@game_id ;"
            );
      
      
          res.status(200).json({
            message: "Items in Cart are deleted successfully.",
          });
        } catch (error) {
          console.error("Error while inserting:", error);
      
          res.status(500).json({
            message: "Error while inserting",
          });
        }
      });

      //checkout and create order
      app.post("/checkout_cart", async (req, res) => {
        try {
          const {user_id} = req.body;
      
          if (!user_id) {
            return res.status(400).json({
              success: false,
              message: "User Id are mandatory.",
            });
          }
      
          const pool = await poolPromise;
          const fetch_items = await pool
            .request()
            .input("user_id", sql.Int, user_id)
            .query("select sum(price*quantity) As total_amount from CartItems c Join Games g on g.game_id=c.game_id where user_id=@user_id"
            ); 

            const total_amount=fetch_items.recordset[0].total_amount;
const status='Pending';
            const insert_orders = await pool
            .request()
            .input("user_id", sql.Int, user_id)
            .input("total_amount", sql.DECIMAL(10,2), total_amount)
            .input("status", sql.VarChar(20), status)
            .query("insert into Orders(user_id,total_amount,status) Values (@user_id,@total_amount,@status);"+
          "SELECT SCOPE_IDENTITY() AS order_id"
            );

            const cartItemsResult = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
              SELECT game_id, quantity 
              FROM CartItems 
              WHERE user_id = @user_id;
            `);

            const order_id=insert_orders.recordset[0].order_id;
            
    const cartItems = cartItemsResult.recordset;

    for (const item of cartItems) {
        await pool.request()
          .input("order_id", sql.Int, order_id)
          .input("game_id", sql.Int, item.game_id)
          .input("quantity", sql.Int, item.quantity)
          .query(`
            INSERT INTO OrderDetails(order_id, game_id, quantity) 
            VALUES (@order_id, @game_id, @quantity);
          `);
      }

      const delete_items=
      await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .query("delete CartItems where user_id=@user_id;"
      );
      
      
          res.status(200).json({
            message: "Cart is checkout successfully.",
          }); 
        } catch (error) {
          console.error("Error while inserting:", error);
      
          res.status(500).json({
            message: "Error while inserting",
          });
        }
      });