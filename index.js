const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4troo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("hello from db");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const orderCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const serviceCollection = client.db("creativeAgency").collection("services");

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    console.log(order);
    orderCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/orders", (req, res) => {
    orderCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addReview", (req, res) => {
    const name = req.body.name;
    const designation = req.body.designation;
    const review = req.body.review;

    reviewCollection.insertOne({ name, designation, review }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/reviews", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    // const filePath = `${__dirname}/services/${file.name}`;

    // file.mv(filePath, err => {
    //     if(err) {
    //         console.log(err);
    //         return res.status(500).send({msg: 'Failed to Upload'});
    //     }
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    serviceCollection
      .insertOne({ title, description, image })
      .then((result) => {
        // fs.remove(filePath, error => {
        //     if(error) {
        //         console.log(error);
        //         return res.status(500).send({msg: 'Failed to Upload'});
        //     }
        res.send(result.insertedCount > 0);
        // })
      });
    // return res.send({name: file.name, path: `/${file.name}`})
    // })
  });

  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
});

app.listen(process.env.PORT || port);
