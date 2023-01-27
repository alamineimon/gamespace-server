const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

//mmiddle wares
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://game_space:XzY7Rkao7wWWUMtD@cluster0.tkreg8z.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try{ 
        const usersCollection = client.db("GameSpace").collection("UsersInfo");

        // get

        app.get("users", async(req, res) => {
          const query = {}
          const result = usersCollection.find(query).toArray();
          res.send(result);
        });

        // post

        app.post("user", async(req, res) => {
          const user = req.body;
          const result = usersCollection.insertOne(user)
          res.send(result);
        });

        // Delete
    }
    finally{
  
    }
  }run().catch((err) => console.error(err));
  
  







app.get("/", (res, req) => {
    req.send("GameSpace server is running");
  });
  
  app.listen(port, () => {
    console.log(`GameSpace Server running onporrt: ${port}`);
  });