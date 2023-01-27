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

    //featured e sports games
    app.get("/downloadGames", async (req, res) => {
      const query = {};
      const games = await gamesCollection.find(query).limit(4).toArray();
      res.send(games);
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
    //get a single html games by id
    app.get("/playGames/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: ObjectId(id),
      };
      const singleHtmlGame = await htmlGamesCollection.findOne(query);
      console.log(singleHtmlGame);
      res.send(singleHtmlGame);
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
