import express from "express";
import mysql from "mysql";
import cors from "cors";
import bcrypt from "bcryptjs";
import session from "express-session";
import multer from "multer";
import path from "path";

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  session({
    name: "bookstore-session",
    secret: "bookstore_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

/* ================= DB ================= */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bekaa-burger",
});

db.connect((err) => {
  if (err) console.log("❌ DB Error:", err);
  else console.log("✅ MySQL Connected");
});

/* ================= STATIC FILES ================= */
app.use("/uploads", express.static("uploads"));

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ================= AUTH ================= */
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  db.query("SELECT id FROM users WHERE email=?", [email], async (err, r) => {
    if (r.length) return res.status(409).json({ message: "Email exists" });

    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name,email,password,role) VALUES (?,?,?,'user')",
      [name, email, hash],
      (err) => {
        if (err) return res.status(500).json({ message: "Register failed" });
        res.json({ message: "Registered" });
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, r) => {
    if (!r.length) return res.status(401).json({ message: "Invalid login" });

    const user = r[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid login" });

    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({ message: "Logged in", user });
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("bookstore-session");
    res.json({ message: "Logged out" });
  });
});

/* ================= BOOKS (MAIN FIX) ================= */

/* GET ALL BOOKS */
app.get("/books", (req, res) => {
  db.query("SELECT * FROM books ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });

    const books = rows.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      price: b.price,
      image: `http://localhost:5000/uploads/${b.image}`,
    }));

    res.json(books);
  });
});

/* ADD BOOK ✅ */
app.post("/books", upload.single("image"), (req, res) => {
  const { title, author, price } = req.body;

  if (!title || !price || !req.file)
    return res.status(400).json({ message: "Missing data" });

  db.query(
    "INSERT INTO books (title, author, price, image) VALUES (?,?,?,?)",
    [title, author || "", price, req.file.filename],
    (err) => {
      if (err) return res.status(500).json({ message: "Insert failed" });
      res.json({ message: "Book added" });
    }
  );
});

/* UPDATE BOOK */
app.put("/books/:id", upload.single("image"), (req, res) => {
  const { title, author, price } = req.body;
  const { id } = req.params;

  let sql = "UPDATE books SET title=?, author=?, price=?";
  const params = [title, author, price];

  if (req.file) {
    sql += ", image=?";
    params.push(req.file.filename);
  }

  sql += " WHERE id=?";
  params.push(id);

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ message: "Update failed" });
    res.json({ message: "Book updated" });
  });
});

/* DELETE BOOK */
app.delete("/books/:id", (req, res) => {
  db.query("DELETE FROM books WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "Book deleted" });
  });
});

/* ================= CART ================= */
app.post("/cart/add", (req, res) => {
  // 1️⃣ Check login
  if (!req.session.userId) {
    return res.status(401).json({ message: "Login required" });
  }

  const { bookId } = req.body;

  // 2️⃣ Validate input
  if (!bookId || isNaN(bookId)) {
    return res.status(400).json({ message: "Valid Book ID required" });
  }

  console.log("ADD TO CART:", {
    userId: req.session.userId,
    bookId,
  });

  // 3️⃣ Check book exists (IMPORTANT)
  db.query(
    "SELECT id FROM books WHERE id = ?",
    [bookId],
    (err, book) => {
      if (err) {
        console.error("BOOK CHECK ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (!book.length) {
        return res.status(404).json({ message: "Book not found" });
      }

      // 4️⃣ Insert / Update cart
      db.query(
        `
        INSERT INTO cart (user_id, book_id, quantity)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE quantity = quantity + 1
        `,
        [req.session.userId, bookId],
        (err, result) => {
          if (err) {
            console.error("ADD TO CART ERROR:", err);
            return res.status(500).json({ message: "Failed to add to cart" });
          }

          res.json({
            message: "Added to cart",
            bookId,
            affectedRows: result.affectedRows,
          });
        }
      );
    }
  );
});

app.post("/checkout", (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "Login required" });

  const userId = req.session.userId;

  db.query(
    `
    SELECT c.book_id, c.quantity, b.price
    FROM cart c
    JOIN books b ON c.book_id = b.id
    WHERE c.user_id = ?
    `,
    [userId],
    (err, cart) => {
      if (err) {
        console.error("CART FETCH ERROR:", err);
        return res.status(500).json({ message: "Failed to load cart" });
      }

      if (!cart.length)
        return res.status(400).json({ message: "Cart empty" });

      const total = cart.reduce(
        (s, i) => s + i.price * i.quantity,
        0
      );

      db.query(
        "INSERT INTO orders (user_id, total) VALUES (?, ?)",
        [userId, total],
        (err, r) => {
          if (err) {
            console.error("ORDER INSERT ERROR:", err);
            return res.status(500).json({ message: "Order failed" });
          }

          const orderId = r.insertId;

          const items = cart.map(i => [
            orderId,
            i.book_id,
            i.quantity,
            i.price,
          ]);

          db.query(
            "INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ?",
            [items],
            (err) => {
              if (err) {
                console.error("ORDER ITEMS ERROR:", err);
                return res.status(500).json({ message: "Order items failed" });
              }

              db.query(
                "DELETE FROM cart WHERE user_id = ?",
                [userId],
                (err) => {
                  if (err) {
                    console.error("CLEAR CART ERROR:", err);
                    return res.status(500).json({ message: "Cart cleanup failed" });
                  }

                  res.json({ message: "Order placed", orderId });
                }
              );
            }
          );
        }
      );
    }
  );
});
app.get("/cart", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Login required" });
  }

  const sql = `
    SELECT
      c.id,
      c.quantity,
      b.title,
      b.price,
      b.image
    FROM cart c
    JOIN books b ON c.book_id = b.id
    WHERE c.user_id = ?
  `;

  db.query(sql, [req.session.userId], (err, rows) => {
    if (err) {
      console.error("CART FETCH ERROR:", err);
      return res.status(500).json({ message: "Failed to load cart" });
    }

    res.json(rows);
  });
});

app.post("/cart/update", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Login required" });
  }

  const { cartId, change } = req.body;

  if (!cartId || typeof change !== "number") {
    return res.status(400).json({ message: "Invalid data" });
  }

  db.query(
    `
    UPDATE cart
    SET quantity = GREATEST(1, quantity + ?)
    WHERE id = ? AND user_id = ?
    `,
    [change, cartId, req.session.userId],
    (err, result) => {
      if (err) {
        console.error("UPDATE CART ERROR:", err);
        return res.status(500).json({ message: "Failed to update quantity" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json({ message: "Quantity updated" });
    }
  );
});


app.post("/cart/remove", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Login required" });
  }

  const { cartId } = req.body;

  if (!cartId) {
    return res.status(400).json({ message: "Cart ID required" });
  }

  db.query(
    "DELETE FROM cart WHERE id = ? AND user_id = ?",
    [cartId, req.session.userId],
    (err, result) => {
      if (err) {
        console.error("REMOVE CART ERROR:", err);
        return res.status(500).json({ message: "Failed to remove item" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json({ message: "Item removed" });
    }
  );
});

app.get("/orders", (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "Login required" });

  const sql = `
    SELECT
      o.id AS order_id,
      o.total,
      o.created_at,
      oi.quantity,
      oi.price,
      b.title,
      b.image
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN books b ON oi.book_id = b.id
    WHERE o.user_id = ?
    ORDER BY o.id DESC
  `;

  db.query(sql, [req.session.userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });

    const orders = {};
    rows.forEach((r) => {
      if (!orders[r.order_id]) {
        orders[r.order_id] = {
          id: r.order_id,
          total: r.total,
          date: r.created_at,
          items: [],
        };
      }

      orders[r.order_id].items.push({
        title: r.title,
        quantity: r.quantity,
        price: r.price,
        image: `http://localhost:5000/uploads/${r.image}`,
      });
    });

    res.json(Object.values(orders));
  });
});

/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
