const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const SSLCommerzPayment = require("sslcommerz-lts");
const app = express();
const stripe = require("stripe")("sk_test_51M6QZ6IlSJrakpLcRB6srpU0MYT767eqSG5AHt0bwrfnjHQnZzdps5MpU6R7Qhvip0dC2EQlvbXWQ9KslQKIEVVs00rFRWl8WP");

const port = process.env.PORT || 9000;
require("dotenv").config();


// bkash secret kay
const store_id = 'games63e5aebfd1941'
const store_passwd = 'games63e5aebfd1941@ssl'
const is_live = false //true for live, false for sandbox


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
    const paymentsCollection = client.db("GameSpace").collection("payments");
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
    //featured e sports games
    app.get("/trendingGames", async (req, res) => {
      const query = {
        ratings:"5.0"
      };
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
    //update a single html games
    app.put("/updateHtmlGame/:id", async (req, res) => {
      const id = req.params.id;
      const game = req.body;
      const query = {
        _id: ObjectId(id),
      };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          gameName: game.gameName,

          authorName: game.authorName,

          gameLink: game.gameLink,

          thumbnail: game.thumbnail,

          category: game.category,

          description: game.description,
        },
      };
      const result = await htmlGamesCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });
    //favorite html games
    app.put("/handleFavorite/:id", async (req, res) => {
      const gameid = req.params.id;
      const userEmail = req.query.email;
      const options = { upsert: true };
      const query = {
        _id: ObjectId(gameid),
      };
      const query2 = {
        _id: ObjectId(gameid),
        favorites: { $all: [userEmail] },
      };
      const exist = await htmlGamesCollection.findOne(query2);
      if (!exist) {
        const updatedDoc = {
          $push: {
            favorites: userEmail,
          },
        };
        const result = await htmlGamesCollection.updateOne(
          query,
          updatedDoc,
          options
        );
        return res.send(result);
      }
      const updatedDoc = {
        $pull: {
          favorites: userEmail,
        },
      };
      const result = await htmlGamesCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });
    //get favorite games
    app.get("/favoriteGames", async (req, res) => {
      const userEmail = req.query.email;
      const result = await htmlGamesCollection
        .find({ favorites: { $in: [userEmail] } })
        .toArray();
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

    app.post('/create-payment-intent', async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
          currency: 'usd',
          amount: amount,
          "payment_method_types": [
              "card"
          ]
      });
      res.send({
          clientSecret: paymentIntent.client_secret,
      });
  });

  app.post('/payments', async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.bookingId
      const filter = { _id: ObjectId(id) }
      const updatedDoc = {
          $set: {
              paid: true,
              transactionId: payment.transactionId,
              paidAt: new Date() 
          }
      }
      const updatedResult = await paymentsCollection.updateOne(filter, updatedDoc)
      res.send(result);
  })
  app.post('/bkashpayment', async (req, res) =>{
    const order = req.body;
    const { service, email, address} = order;
    const orderedService = await orderedGameCollection.findOne({ _id: ObjectId(order.service)});
    // console.log(orderedService)
    const transactionId = new ObjectId().toString();
    const data = {
      total_amount: orderedService.price,
      currency: order.currency,
      tran_id: transactionId, // use unique tran_id for each api call
      success_url: `http://localhost:9000/payment/success?transactionId=${transactionId}`,
      fail_url: `http://localhost:9000/payment/fail?transactionId=${transactionId}`,
      cancel_url: `http://localhost:9000/payment/cancel`,
      ipn_url: "http://localhost:3030/ipn",
      shipping_method: "Courier",
      product_name: "Computer.",
      product_category: "Electronic",
      product_profile: "general",
      cus_name: order.customer,
      cus_email: order.email,
      cus_add1: order.address,
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01711111111",
      cus_fax: "01711111111",
      ship_name: "Customer Name",
      ship_add1: "Dhaka",
      ship_add2: "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: order.postcode,
      ship_country: "Bangladesh",
    };
    // console.log(data)
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.init(data).then((apiResponse) => {
      // Redirect the user to payment gateway
      let GatewayPageURL = apiResponse.GatewayPageURL;
      console.log(apiResponse);
      paymentsCollection.insertOne({
        ...order,
        price: orderedService.price,
        transactionId,
        paid: false,
      });
      res.send({url: GatewayPageURL});
    });
  })
  
  app.post("/payment/success", async (req, res) => {
    const { transactionId } = req.query;
    if(!transactionId){
        return res.redirect(`http://localhost:9000/payment/fail`);
    }
    const result = await paymentsCollection.updateOne(
      { transactionId },
      { $set: { paid: true, paidAt: new Date() } }
    );

    if(result.modifiedCount > 0){
        res.redirect(`http://localhost:3000/payment/success?transactionId=${transactionId}`);
    }
});

app.get("/orderedgames/by-transaction-id/:id", async (req, res) => {
  const { id } = req.params;
  const order = await paymentsCollection.findOne({ transactionId: id });
  console.log(id, order);
  res.send(order);
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
