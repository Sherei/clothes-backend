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

require("./model/db");

const bcrypt = require("bcrypt");

const SignupUsers = require("./model/user");

const Product = require("./model/product");

const Comment = require("./model/comments");

const Cart = require("./model/cart");

const Orders = require("./model/Order");

const Blog = require("./model/blog");

const token = require("jsonwebtoken");

// User data

app.post("/signUp", async (req, res) => {
  try {

    const existingUser = await SignupUsers.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).send("User with this email already exists");
    } else {
      // console.log(req.body)
      // const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new SignupUsers({
        ...req.body,
        // password: hashedPassword,
        password: req.body.password,
      });

      await newUser.save();
      res.send("User Created");
    }
  } catch (e) {
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await SignupUsers.findOne({ email: req.body.email,password: req.body.password});
    if (!user) {
      return res.status(404).send("Invalid Credentials");
    }
    // const isPasswordValid = await bcrypt.compare(
    //   req.body.password,
    //   user.password
    // );

    if (user) {
      token.sign(
        { tokenId: user._id },
        "My user",
        { expiresIn: "1y" },
        async (err, myToken) => {
          res.json({ user, myToken });
        }
      );
    } else {
      res.status(404).send("Invalid Credentials");
    }
  } catch (e) {
    res.status(500).send("Internal Server Error");
  }
});

app.post("/session-check", async (req, res) => {
  try {
    token.verify(req.body.token, "My user", async function (err, dataObj) {
      if (dataObj) {
        const user = await SignupUsers.findById(dataObj.tokenId);
        res.json(user);
      }
    });
  } catch (e) { }
});

app.get("/Users", async (req, res) => {
  try {
    const newUser = await SignupUsers.find().sort({ _id: -1 });
    res.json(newUser);
  } catch (e) {
     
  }
});

app.delete("/deleteUser", async function (req, res) {
  try {
    await SignupUsers.findByIdAndDelete(req.query.id);

    res.end("Delete ho gya");
  } catch (e) {
    res.send(e);
  }
});

// Products data

app.post("/product", async (req, res) => {
  try {
    const existingProduct = await Product.findOne({ sn: req.body.sn });
    if (existingProduct) {
      return res.status(400).send("Try with a different Serial Number");
    }
    const newProduct = new Product(req.body);

    await newProduct.save();

    res.send({ message: "Product Added" });
  } catch (e) {
     
    res.status(500).send("Internal Server Error");
  }
});

app.get("/products", async (req, res) => {
  try {
    const { name, sort, minPrice, maxPrice, search } = req.query;

    let query = {};
    let sortQuery = {};

    if (name === "all") {
      query = {};
    } else {
      query = {
        $or: [
          { category: new RegExp(`^${name}$`, 'i') },
          { subCategory: new RegExp(`^${name}$`, 'i') }
        ]
      };

    }

    if (minPrice || maxPrice) {
      query.Fprice = { $gte: minPrice, $lte: maxPrice };
    }

    if (search) {
      query.$or = [
        { category: new RegExp(search, 'i') },
        { subCategory: new RegExp(search, 'i') },
        { title: new RegExp(search, 'i') }
      ];
    }

    if (sort) {
      switch (sort) {
        case "asc":
          sortQuery = { Fprice: -1 };
          break;
        case "desc":
          sortQuery = { Fprice: 1 };
          break;
        default:
          break;
      }
    }

    const newProduct = await Product.find(query).sort({ ...sortQuery, _id: -1 }).exec();
    res.json(newProduct);

  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/product", async (req, res) => {
  try {
    const newProduct = await Product.find().sort({_id: -1});
    res.json(newProduct);
  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/singleProduct", async (req, res) => {
  try {
    const singleProduct = await Product.findById(req.query.id);
    res.json(singleProduct);
  } catch (e) {
    res.end(e);
  }
});

app.delete("/deleteProduct", async function (req, res) {
  try {
    await Product.findByIdAndDelete(req.query.id);

    fs.rmSync("./server/pics/", { recursive: true, force: true });

    res.end("Delete ho gya");
  } catch (e) {
    res.send(e);
  }
});

// Find Update Product

app.get("/product_edit", async function (req, res) {
  try {
    let product = await Product.findById(req.query.id);
    res.json(product);
  } catch (e) {
    res.status(500).json(e);
  }
});

// Update Product

app.put("/product-update", async function (req, res) {
  try {
    const productId = req.body._id;
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    else if (req.body.images && (req.body.images.length < 1 || req.body.images.length > 10)) {
      return res.status(400).json({
        message: "Invalid number of images. Must be between 1 and 10.",
      });
    } else {
      existingProduct.images = req.body.images;
    }

    existingProduct.title = req.body.title;
    existingProduct.sn = req.body.sn;
    existingProduct.category = req.body.category;
    existingProduct.subCategory = req.body.subCategory;
    existingProduct.descriptionHead1 = req.body.descriptionHead1;
    existingProduct.description = req.body.description;
    existingProduct.descriptionHead2 = req.body.descriptionHead2;
    existingProduct.description2 = req.body.description2;
    existingProduct.descriptionHead3 = req.body.descriptionHead3;
    existingProduct.description3 = req.body.description3;
    existingProduct.descriptionHead4 = req.body.descriptionHead4;
    existingProduct.description4 = req.body.description4;
    existingProduct.featureHead = req.body.featureHead;
    existingProduct.feature1 = req.body.feature1;
    existingProduct.feature2 = req.body.feature2;
    existingProduct.feature3 = req.body.feature3;
    existingProduct.feature4 = req.body.feature4;
    existingProduct.feature5 = req.body.feature5;
    existingProduct.feature6 = req.body.feature6;
    existingProduct.feature7 = req.body.feature7;
    existingProduct.dimensionHead = req.body.dimensionHead;
    existingProduct.dimension1 = req.body.dimension1;
    existingProduct.dimension2 = req.body.dimension2;
    existingProduct.dimension3 = req.body.dimension3;
    existingProduct.dimension4 = req.body.dimension4;
    existingProduct.home = req.body.home;
    existingProduct.stock = req.body.stock;
    existingProduct.note2 = req.body.note2;
    existingProduct.double = req.body.double;
    existingProduct.standard = req.body.standard;
    existingProduct.king = req.body.king;
    existingProduct.super = req.body.super;
    existingProduct.color1 = req.body.color1;
    existingProduct.color2 = req.body.color2;
    existingProduct.color3 = req.body.color3;
    existingProduct.color4 = req.body.color4;
    existingProduct.color5 = req.body.color5;
    existingProduct.color6 = req.body.color6;
    existingProduct.color7 = req.body.color7;
    existingProduct.color8 = req.body.color8;
    existingProduct.color9 = req.body.color9;
    existingProduct.color10 = req.body.color10;
    existingProduct.price = req.body.price || existingProduct.price;
    existingProduct.discount = req.body.discount;
    existingProduct.Fprice = req.body.Fprice || existingProduct.Fprice;

    await existingProduct.save();

    res.json({ message: "Product Updated" });
  } catch (e) {
     
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Cart data

app.post("/addToCart", async function (req, res) {

  try {
    let ob = { ...req.body };
    delete ob._id;
    const newCart = await Cart.create(ob);
    const allItems = await Cart.find();
    res.send({ message: "Product Added", alldata: allItems });
  } catch (e) {
  }
});

app.get("/addToCart", async function (req, res) {
  try {
    const newCart = await Cart.find().sort({ _id: -1 });
    res.json(newCart);
  } catch (e) {
     
  }
});

app.put("/updateCart", async function (req, res) {
  try {
    const updatedCartData = req.body;
    for (const item of updatedCartData) {
      await Cart.updateOne(
        { _id: item._id },
        {
          quantity: item.quantity,
          total: item.total,
        }
      );
    }
    let allItems = await Cart.find();
    res.send({ status: "success", alldata: allItems });
  } catch (e) {
     
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/chkdeleteCart", async function (req, res) {
  try {
    await Cart.findByIdAndDelete(req.query.id);
    let allItems = await Cart.find({ userId: req.query.userId });
    res.send({
      status: "success",
      alldata: allItems,
      message: "Item deleted successfully",
    });
  } catch (e) {
    res.send(e);
  }
});

app.delete("/deleteCart", async function (req, res) {
  try {
    await Cart.findByIdAndDelete(req.query.id);
    let allItems = await Cart.find();
    res.send({
      status: "success",
      alldata: allItems,
      message: "Item deleted successfully",
    });
  } catch (e) {
    res.send(e);
  }
});

// Order data

app.get("/checkout", async function (req, res) {
  try {
    const newCart = await Cart.find({ userId: req.query.userId }).sort({ _id: -1 });
    res.json(newCart);
  } catch (e) {
     
  }
});

app.post("/Order", async (req, res) => {
  try {
    const orderItems = JSON.parse(req.body.orderItems);
    const newOrder = new Orders({
      userId: req.body.userId,
      orderId: req.body.orderId,
      orderItems: orderItems,
      total: req.body.total,
      name1: req.body.name1,
      name2: req.body.name2,
      number1: req.body.number1,
      street: req.body.street,
      appartment: req.body.appartment,
      country: req.body.country,
      city: req.body.city,
      postal: req.body.postal,
      email: req.body.email,
      shipping: req.body.shipping,
      note: req.body.note,
    });

    await newOrder.save();
    res.send("Order is Placed");
    await Cart.deleteMany({ userId: req.body.userId });
  } catch (e) {
    console.error(e);
    res.status(500).send("Error placing the order");
  }
});

app.get("/order", async (req, res) => {
  try {
    const newOrder = await Orders.find().sort({ _id: -1 });
    res.json(newOrder);
  } catch (e) {
     
    res.status(500).send("Error fetching orders");
  }
});

app.get("/orderDetail", async (req, res) => {
  try {
    const singleOrder = await Orders.findById(req.query.id);
    res.json(singleOrder);
  } catch (e) {
    res.end(e);
  }
});

// Update Order Status pending or delivered

app.put("/updateStatus", async (req, res) => {
  try {
    const orderId = req.body.id;
    const newStatus = req.body.status;
    const updatedOrder = await Orders.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).send("Order not found");
    }
    res.json(updatedOrder);

  } catch (e) {
    res.status(500).send("Error updating order status");
  }
});

app.delete("/deleteOrder", async function (req, res) {
  try {
    await Orders.findByIdAndDelete(req.query.id);
    res.end("Delete ho gya");
  } catch (e) {
    res.send(e);
  }
});

// Comments data

app.post("/comments", async (req, res) => {
  try {
    let ob = { ...req.body };
    delete ob._id;
    const newComment = await Comment.create(ob);
    const allItems = await Comment.find();
    res.send({ message: "Comment Added", alldata: allItems });
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.find().sort({ _id: -1 });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/deleteComment", async function (req, res) {
  try {
    await Comment.findByIdAndDelete(req.query.id);
    res.end("Delete ho gya");
  } catch (e) {
    res.send(e);
  }
});


//Blog data

app.post("/blog", async (req, res) => {
  try {
    const newBlog = new Blog(req.body);
    await newBlog.save();
    res.send({ message: "Blog Added" });
  } catch (e) {
     
    res.status(500).send("Internal Server Error");
  }
});

app.get("/blog", async (req, res) => {
  try {
    const newBlog = await Blog.find().sort({ _id: -1 });
    res.json(newBlog);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/singleBlog", async (req, res) => {
  try {
    const singleBlog = await Blog.findById(req.query.id);
    res.json(singleBlog);
  } catch (e) {
    res.end(e);
  }
});

app.delete("/deleteBlog", async function (req, res) {
  try {
    await Blog.findByIdAndDelete(req.query.id);
    res.end("Delete ho gya");
  } catch (e) {
    res.send(e);
  }
});

app.get("/blog_edit", async function (req, res) {
  try {
    const blog = await Blog.findById(req.query.id);
    res.json(blog);
  } catch (e) {
    res.status(500).json(e);
  }
});

app.put("/blog_update", async function (req, res) {
  try {
    const blogId = req.body._id;

    const existingBlog = await Blog.findById(blogId);

    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    existingBlog.title = req.body.title;
    existingBlog.author = req.body.author;
    existingBlog.issueDate = req.body.issueDate;
    existingBlog.image = req.body.image || existingBlog.image;
    existingBlog.introduction = req.body.introduction;
    existingBlog.heading1 = req.body.heading1;
    existingBlog.description1 = req.body.description1;
    existingBlog.heading2 = req.body.heading2;
    existingBlog.description2 = req.body.description2;
    existingBlog.heading3 = req.body.heading3;
    existingBlog.description3 = req.body.description3;
    existingBlog.heading4 = req.body.heading4;
    existingBlog.description4 = req.body.description4;
    existingBlog.heading5 = req.body.heading5;
    existingBlog.description5 = req.body.description5;
    existingBlog.heading6 = req.body.heading6;
    existingBlog.description6 = req.body.description6;
    await existingBlog.save();
    res.json({ message: "Blog Updated" });
  } catch (e) {
     
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Admin Data 

app.get("/dashboard", async function (req, res) {
  try {
    const Users = await SignupUsers.find();
    const Products = await Product.find();
    const comments = await Comment.find();
    const allOrder = await Orders.find();
    const allBlog = await Blog.find();
    res.json({ Users, Products, comments, allOrder, allBlog });
  } catch (e) {
    res.send(e);
  }
});

app.get('/AdminUsers', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ],
      };
    }
    const newUser = await SignupUsers.find(query).sort({ _id: -1 });
    res.json(newUser);
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/Admincomments", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { comment: { $regex: searchRegex } },
        ],
      };
    }

    const comments = await Comment.find(query).sort({ _id: -1 });
    res.json(comments);

  } catch (error) {
    console.error("Error fetching comments", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/Adminproduct", async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      if (!isNaN(search)) {
        query = {
          $or: [
            { sn: Number(search) },
            { title: { $regex: searchRegex } },
            { category: { $regex: searchRegex } },
            { subCategory: { $regex: searchRegex } },
          ],
        };
      } else {
        query = {
          $or: [
            { title: { $regex: searchRegex } },
            { category: { $regex: searchRegex } },
            { subCategory: { $regex: searchRegex } },
          ],
        };
      }
    }
    const products = await Product.find(query).sort({ _id: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/AdminBlog', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { title: { $regex: searchRegex } },
          { author: { $regex: searchRegex } },
          { description1: { $regex: searchRegex } },
          { description2: { $regex: searchRegex } },
          { description3: { $regex: searchRegex } },
          { description4: { $regex: searchRegex } },
          { description5: { $regex: searchRegex } },
          { description6: { $regex: searchRegex } },
        ],
      };
    }
    const newBlog = await Blog.find(query).sort({ _id: -1 });
    res.json(newBlog);
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});