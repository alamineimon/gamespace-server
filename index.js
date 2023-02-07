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
    const gamesComment = client.db("GameSpace").collection("comment");
    const orderedGameCollection = client.db("GameSpace").collection("orderedGames");
    const activePlayerProfile = client.db("GameSpace").collection("activeProfile");

    // get users

    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    //featured e sports games
    app.get("/downloadGames", async (req, res) => {
      const query = {};
      const games = await gamesCollection.find(query).toArray();
      res.send(games);
    });

    app.get("/downloadGames/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const downloadGames = await gamesCollection.findOne(query);
      res.send(downloadGames);
    });

    app.post("/comment", async (req, res) => {
      const users = req.body;
      const result = await gamesComment.insertOne(users);
      res.send(result);
    });
    app.get("/comment", async (req, res) => {
      const query = {};
      const comment = await gamesComment.find(query).toArray();
      res.send(comment);
    });
    app.delete("/comment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await gamesComment.deleteOne(query);
      res.send(result);
    });
    app.patch("/comment/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const query = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          comment: user.comment,
        },
      };
      const result = await gamesComment.updateOne(query, updateDoc, option);
      res.send(result);
    });

    // all shop data load from mongodb
    app.get("/shop", async (req, res) => {
      const query = {};
      const games = await gamesCollection.find(query).toArray();
      res.send(games);
    });

    // admin route
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // get categories only
    app.get("/categories", async (req, res) => {
      const categories = await htmlGamesCollection.distinct("category");
      res.send(categories);
    });

    // user post
    app.post("/user", async (req, res) => {
      const data = req.body;
      const result = await usersCollection.insertOne(data);
      res.send(result);
    });
    // Active Players
    app.post("/activePlayres", async (req, res) =>{
      const data = req.body;
      const result = await activePlayerProfile.insertOne(data)
      res.send(result);
    })
    app.get("/activePlayres", async (req, res) => {
       const query = req.body;
      console.log(query)
      const activePlayres = await activePlayerProfile.find(query).toArray();
      console.log(activePlayres)
      res.send(activePlayres);
    });


    app.post("/user", async (req, res) => {
      const data = req.body;
      const result = await usersCollection.insertOne(data);
      res.send(result);
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
      res.send(singleHtmlGame);
    });
    //delete a single html games
    app.delete("/deleteHtmlGame/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: ObjectId(id),
      };
      const result = await htmlGamesCollection.deleteOne(query);
      res.send(result);
    });
    //delete user
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // add single html games to database
    app.post("/addHtmlGame", async (req, res) => {
      const game = req.body;
      const result = await htmlGamesCollection.insertOne(game);
      res.send(result);
    });

    // post orderd games
    app.post("/orderedGames", async (req, res) => {
      const order = req.body;
      console.log(order);
      const result = await orderedGameCollection.insertOne(order);
      res.send(result);
    });
    app.post("/bookings", async (req, res) => {
      const data = req.body;
      const result = await orderedGameCollection.insertOne(data);
      res.send(result);
    });
    // get all orderd games by email
    app.get("/orderedGames", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const bookings = await orderedGameCollection.find(query).toArray();
      res.send(bookings);
    });

    // delete orderd games data by id
    app.delete("/orderedGames/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await orderedGameCollection.deleteOne(filter);
      res.send(result);
    });
    // get order by email
    app.get("/orderedGames/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const orderedGames = await orderedGameCollection.findOne(query);
      res.send(orderedGames);
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
