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

app.use(express.static("public"));

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
    const { email, password } = req.body;

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
      .query(
        "select user_id,role,email,password from Users where email=@Email"
      );

    const user_id = emailChecker.recordset[0].user_id;

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

    let role = "user";

    if (emailChecker.recordset[0].role == "admin") {
      role = "admin";
    }
    // inside login success
    //const token = jwt.sign(
    //{ email: emailChecker.recordset[0].email, role: emailChecker.recordset[0].role },
    // process.env.JWT_SECRET, // keep your secret in .env
    // { expiresIn: "1h" }

    res.status(200).json({
      success: true,
      user: { id: user_id },
      message: "Logged in successfully",
      //token,
      role: role,
    });
  } catch (error) {
    console.error("Error while inserting:", error);

    res.status(500).json({
      message: "Invalid email or password. ",
    });
  }
});

//CART

app.get("/display_cart", async (req, res) => {
  try {
    //const { user_id} = req.query;
    const user_id = parseInt(req.query.user_id); // Get from query parameter

    const pool = await poolPromise;
    const result = await pool.request().input("user_id", sql.Int, user_id)
      .query(`
        SELECT c.cart_item_id, c.quantity, g.game_id, g.title, g.price
        FROM CartItems c
        JOIN Games g ON c.game_id = g.game_id
        WHERE c.user_id = @user_id
      `);

    res.status(200).json({
      message: "Cart is displayed successfully.",
      cart: result.recordset,
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
    const { user_id, game_id, quantity } = req.body;

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
      .query(
        "insert into CartItems(user_id,game_id, quantity) Values (@user_id,@game_id,@quantity) ;"
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
    const { user_id, game_id, quantity } = req.body;

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
      .query(
        "update CartItems set quantity=@quantity where user_id=@user_id and game_id=@game_id ;"
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
    const { user_id, game_id } = req.body;

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
      .query("delete CartItems where user_id=@user_id and game_id=@game_id ;");

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
    const { user_id, payment_status, payment_method } = req.body;

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
      .query(
        "select sum(price*quantity) As total_amount from CartItems c Join Games g on g.game_id=c.game_id where user_id=@user_id"
      );

    const status = "Pending";
    const total_amount = fetch_items.recordset[0].total_amount || 0;

    if (total_amount === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Cannot proceed to checkout.",
      });
    }

    const insert_orders = await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .input("total_amount", sql.DECIMAL(10, 2), total_amount)
      .input("status", sql.VarChar(20), status)
      .query(
        "insert into Orders(user_id,total_amount,status) Values (@user_id,@total_amount,@status);" +
          "SELECT SCOPE_IDENTITY() AS order_id"
      );

    const cartItemsResult = await pool
      .request()
      .input("user_id", sql.Int, user_id).query(`
               SELECT game_id, quantity 
               FROM CartItems 
               WHERE user_id = @user_id;
             `);

    const order_id = insert_orders.recordset[0].order_id;

    const cartItems = cartItemsResult.recordset;

    for (const item of cartItems) {
      const stockCheck = await pool
        .request()
        .input("game_id", sql.Int, item.game_id)
        .query("SELECT stock_quantity FROM Inventory WHERE game_id = @game_id");

      const availableStock = stockCheck.recordset[0].stock_quantity;

      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for game_id ${item.game_id}`,
        });
      }
    }

    for (const item of cartItems) {
      await pool
        .request()
        .input("order_id", sql.Int, order_id)
        .input("game_id", sql.Int, item.game_id)
        .input("quantity", sql.Int, item.quantity).query(`
             INSERT INTO OrderDetails(order_id, game_id, quantity) 
             VALUES (@order_id, @game_id, @quantity);
           `);
      
    }

    const delete_items = await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .query("delete CartItems where user_id=@user_id;");

    const payment = await pool
      .request()
      .input("order_id", sql.Int, order_id)
      .input("payment_status", sql.VARCHAR(20), payment_status)
      .input("payment_method", sql.VARCHAR(50), payment_method)

      .query(
        "insert into Payments(order_id, payment_status, payment_method) Values (@order_id,@payment_status,@payment_method);"
      );

      
    res.status(200).json({
      message: "Cart is checkout successfully.",
      order_id: order_id,
    });
  } catch (error) {
    console.error("Error while inserting:", error);

    res.status(500).json({
      message: "Error while inserting",
    });
  }
});

//Orders

app.get("/display_log_orders", async (req, res) => {
  try {
    const { user_id } = req.body;

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
    const { order_id } = req.body;

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
    const result = await pool.request().query("Select * from Orders ");

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      orders: result.recordset,
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
    const { status, order_id } = req.body;

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

//Games

app.post("/admin/add_games", async (req, res) => {
  try {
    const { title, description, price, genre, platform, stock } = req.body;

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
      .input("price", sql.DECIMAL(10, 2), price)
      .input("genre", sql.VARCHAR, genre)
      .input("platform", sql.VARCHAR, platform)
      .query(
        "insert into Games(title, description, price, genre, platform) Values (@title,@description,@price,@genre,@platform);" +
          "SELECT SCOPE_IDENTITY() AS game_id"
      );

    const result_game_id = result.recordset[0].game_id;

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
    const { id, title, description, price, genre, platform } = req.body;

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
      .input("price", sql.DECIMAL(10, 2), price)
      .input("genre", sql.VARCHAR, genre)
      .input("platform", sql.VARCHAR, platform)
      .query(
        "Update Games set title= @title,description=@description,price=@price,genre=@genre,platform=@platform where game_id=@id"
      );

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
    const { id } = req.body;

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
    const result = await pool.request().query("Select * from Games ");

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
    const result = await pool.request().query("Select * from Games ");

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
    const { id } = req.params;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("ID", sql.Int, id)
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









//order summary












app.get("/order_summary", async (req, res) => {
  try {
    const order_id = parseInt(req.query.order_id); // Get order_id from query parameter

    console.log("Received order_id:", order_id);  // Log the received order_id

    if (isNaN(order_id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input("order_id", sql.Int, order_id)
      .query(`SELECT * FROM order_summary WHERE order_id = @order_id`);

    if (result.recordset.length > 0) {
      res.status(200).json({
        success: true,
        message: "Order summary fetched successfully.",
        games: result.recordset
      });
    } else {
      res.status(404).json({ success: false, message: "No order summary found." });
    }
  } catch (error) {
    console.error("Error while fetching order summary:", error);

    res.status(500).json({
      message: "Error while fetching order summary.",
    });
  }
});
