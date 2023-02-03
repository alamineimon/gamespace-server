const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

const port = process.env.PORT || 9000;
require("dotenv").config();

//middle wares
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://game_space:XzY7Rkao7wWWUMtD@cluster0.tkreg8z.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {

  try {
    const usersCollection = client.db("GameSpace").collection("users");
    const htmlGamesCollection = client.db("GameSpace").collection("htmlGames");
    const gamesCollection = client.db("GameSpace").collection("games");
    // get users 
    app.get("/users", async(req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    })
    //featured e sports games
    app.get("/downloadGames", async (req, res) => {
      const query = {};
      const games = await gamesCollection.find(query).toArray();
      res.send(games);
    });

    app.get("/downloadGames/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const downloadGames = await gamesCollection.findOne(query);
      res.send(downloadGames);
    });

    // all shop data load from mongodb
    app.get("/shop", async (req, res) => {
      const query = {};
      const games = await gamesCollection.find(query).toArray();
      res.send(games);
    });

    // all play-games data load from mongodb
    app.get("/play-games", async (req, res) => {
      const query = {};
      const htmlGames = await htmlGamesCollection.find(query).toArray();
      res.send(htmlGames);
    });

    // admin route
    app.get('/users/admin/:email', async(req, res) => {
      const email = req.params.email;
      const query ={email: email};
      const user = await usersCollection.findOne(query);
      res.send({isAdmin: user?.role === 'admin'})
  });


    // user post
    app.post('/user', async(req, res) => {
      const data = req.body;
      const result = await usersCollection.insertOne(data);
      res.send(result);
    })
    

    //get a single html games by id
    app.get("/playGames/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: ObjectId(id),
      };
      const singleHtmlGame = await htmlGamesCollection.findOne(query);
      res.send(singleHtmlGame);
    });

    app.delete('/delete/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", (res, req) => {
  req.send("GameSpace server is running");
});

app.listen(port, () => {
  console.log(`GameSpace Server running on port: ${port}`);
});
