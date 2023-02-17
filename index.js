const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const SSLCommerzPayment = require("sslcommerz-lts");
const app = express();
const stripe = require("stripe")(
  "sk_test_51M6QZ6IlSJrakpLcRB6srpU0MYT767eqSG5AHt0bwrfnjHQnZzdps5MpU6R7Qhvip0dC2EQlvbXWQ9KslQKIEVVs00rFRWl8WP"
);

const port = process.env.PORT || 9000;
require("dotenv").config();

// bkash secret kay
const store_id = "games63e5aebfd1941";
const store_passwd = "games63e5aebfd1941@ssl";
const is_live = false; //true for live, false for sandbox

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
    const postCollection = client.db("GameSpace").collection("posts");
    const postcommentCollection = client
      .db("GameSpace")
      .collection("postcomments");
    const htmlGamesCollection = client.db("GameSpace").collection("htmlGames");
    const gamesCollection = client.db("GameSpace").collection("games");
    const gamesComment = client.db("GameSpace").collection("comment");
    const paymentsCollection = client.db("GameSpace").collection("payments");
    const orderedGameCollection = client
      .db("GameSpace")
      .collection("orderedGames");

    // admin
    const verifyAdmin = async (req, res, next) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      next();
    };

    // get users
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const users = await usersCollection.findOne(query);
      res.send(users);
    });

    // user Profile Update
    app.get("/profileUpdate/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    app.patch("/profileUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const profile = req.body;
      const query = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          name: profile.name,
          email: profile.email,
          photoURL: profile.photoURL,
          facebook: profile.facebook,
          instagram: profile.instagram,
          youTube: profile.youTube,
          twitter: profile.twitter,
          bio: profile.bio,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, option);
      res.send(result);
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

    // make admin
    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
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
      v;
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
    //get popular games
    app.get("/popularGames", async (req, res) => {
      const games = await htmlGamesCollection.find({}).toArray();
      const gamesWithFavoritesLength = games.map((game) => {
        return {
          ...game,
          favoritesLength: game.favorites?.length,
        };
      });
      const sortedGames = gamesWithFavoritesLength.sort(
        (a, b) => b.favoritesLength - a.favoritesLength
      );
      const top3Games = sortedGames.slice(0, 4);
      res.send(top3Games);
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

    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.bookingId;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const updatedResult = await paymentsCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });
    app.post("/bkashpayment", async (req, res) => {
      const order = req.body;
      const { service, email, address } = order;
      const orderedService = await orderedGameCollection.findOne({
        _id: ObjectId(order.service),
      });
      const transactionId = new ObjectId().toString();
      const data = {
        total_amount: orderedService.price,
        currency: order.currency,
        tran_id: transactionId, // use unique tran_id for each api call
        success_url: `https://gamespace-server.vercel.app/payment/success?transactionId=${transactionId}`,
        fail_url: `https://gamespace-server.vercel.app/payment/fail?transactionId=${transactionId}`,
        cancel_url: `https://gamespace-server.vercel.app/payment/cancel`,
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
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL;
        paymentsCollection.insertOne({
          ...order,
          price: orderedService.price,
          transactionId,
          paid: false,
        });
        res.send({ url: GatewayPageURL });
      });
    });

    app.post("/payment/success", async (req, res) => {
      const { transactionId } = req.query;
      if (!transactionId) {
        return res.redirect(`https://gamespace-server.vercel.app/payment/fail`);
      }
      const result = await paymentsCollection.updateOne(
        { transactionId },
        { $set: { paid: true, paidAt: new Date() } }
      );

      if (result.modifiedCount > 0) {
        res.redirect(
          `https://gamespace777.netlify.app/payment/success?transactionId=${transactionId}`
        );
      }
    });

    app.get("/orderedgames/by-transaction-id/:id", async (req, res) => {
      const { id } = req.params;
      const order = await paymentsCollection.findOne({ transactionId: id });

      res.send(order);
    });

    //send friend request
    app.put("/sendFriendRequest", async (req, res) => {
      const from = req.query.from;
      const to = req.query.to;
      const option = { upsert: true };
      const findFrom = {
        email: from,
        requested: { $all: [to] },
      };
      const alreadyFriend = {
        email: from,
        friends: { $all: [to] },
      };

      const findTo = {
        email: to,
        friendRequest: { $all: [from] },
      };

      const friendAlready = await usersCollection.findOne(alreadyFriend);
      const toExist = await usersCollection.findOne(findTo);
      if (!toExist && !friendAlready) {
        const query1 = {
          email: to,
        };
        const query2 = {
          email: from,
        };
        const updatedDoc1 = {
          $push: {
            friendRequest: from,
          },
        };
        const updatedDoc2 = {
          $push: {
            requested: to,
          },
        };
        const operation1 = await usersCollection.updateOne(
          query1,
          updatedDoc1,
          option
        );
        const operation2 = await usersCollection.updateOne(
          query2,
          updatedDoc2,
          option
        );
        return res.send(operation1);
      }
      //remove data
      const query1 = {
        email: to,
      };
      const query2 = {
        email: from,
      };
      const updatedDoc1 = {
        $pull: {
          friendRequest: from,
        },
      };
      const updatedDoc2 = {
        $pull: {
          requested: to,
        },
      };
      const operation1 = await usersCollection.updateOne(
        query1,
        updatedDoc1,
        option
      );
      const operation2 = await usersCollection.updateOne(
        query2,
        updatedDoc2,
        option
      );
      res.send(operation1);
    });

    //get friend requestlist
    app.get("/getFriendRequsts", async (req, res) => {
      const userEmail = req.query.email;
      const query = {
        email: userEmail,
      };
      const mainUser = await usersCollection.findOne(query);
      let friendReqList = mainUser.friendRequest;
      if (Array.isArray(friendReqList)) {
        const usersQuery = { email: { $in: friendReqList } };
        const result = await usersCollection
          .find(usersQuery)
          .project({
            requested: 0,
          })
          .toArray();
        return res.send(result);
      }
      res.send(friendReqList);
    });

    //get friends
    app.get("/friends", async (req, res) => {
      const userEmail = req.query.email;
      const query = {
        email: userEmail,
      };
      const mainUser = await usersCollection.findOne(query);
      let frindsCount = mainUser.friends;
      if (Array.isArray(frindsCount)) {
        const usersQuery = { email: { $in: frindsCount } };
        const result = await usersCollection
          .find(usersQuery)
          .project({
            requested: 0,
            friends: 0,
          })
          .toArray();
        return res.send(result);
      }
      res.send(frindsCount);
    });

    //accept of delete friend request
    app.put("/friendReqAction", async (req, res) => {
      const action = req.query.action;
      const requestedBy = req.query.requestedBy;
      const userEmail = req.query.email;
      const option = { upsert: true };
      const findUser = {
        email: userEmail,
      };
      const findReqSender = {
        email: requestedBy,
      };
      if (action === "accept") {
        const updatedDocUser = {
          $pull: {
            friendRequest: requestedBy,
          },
          $push: {
            friends: requestedBy,
          },
        };
        const userDataResult = await usersCollection.updateOne(
          findUser,
          updatedDocUser,
          option
        );
        const updatedDocReqBy = {
          $pull: {
            requested: userEmail,
          },
          $push: {
            friends: userEmail,
          },
        };
        const reqByDataResult = await usersCollection.updateOne(
          findReqSender,
          updatedDocReqBy,
          option
        );
        return res.send(userDataResult);
      }
      //if user decline
      const updatedDocUser = {
        $pull: {
          friendRequest: requestedBy,
        },
      };
      const userDataResult = await usersCollection.updateOne(
        findUser,
        updatedDocUser,
        option
      );
      const updatedDocReqBy = {
        $pull: {
          requested: userEmail,
        },
      };
      const reqByDataResult = await usersCollection.updateOne(
        findReqSender,
        updatedDocReqBy,
        option
      );
      res.send(userDataResult);
    });

    //add a post
    app.post("/post", async (req, res) => {
      const post = req.body;
      const result = await postCollection.insertOne(post);
      res.send(result);
    });

    //get all post
    app.get("/posts", async (req, res) => {
      const result = await postCollection.find({}).sort({ _id: -1 }).toArray();
      res.send(result);
    });

    //get post of by email address
    app.get("/getposts", async (req, res) => {
      const userEmail = req.query.email;
      const query = {
        authorEmail: userEmail,
      };
      const result = await postCollection
        .find(query)
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });
    //get post of by id
    app.get("/getpost", async (req, res) => {
      const postId = req.query.id;
      const query = {
        _id: ObjectId(postId),
      };
      const result = await postCollection.findOne(query);
      res.send(result);
    });

    //post like button
    app.put("/posts/like/:id", async (req, res) => {
      const userEmail = req.query.email;
      const postId = req.params.id;
      //find the post
      const query = {
        _id: ObjectId(postId),
      };
      const query2 = {
        _id: ObjectId(postId),
        likes: { $all: [userEmail] },
      };
      const exist = await postCollection.findOne(query2);

      if (!exist) {
        const updatedDoc = {
          $inc: { quantity: 1 },
          $push: {
            likes: userEmail,
          },
        };
        const options = { upsert: true };
        const result = await postCollection.updateOne(
          query,
          updatedDoc,
          options
        );
        return res.send(result);
      }
      const updatedDoc = {
        $inc: { quantity: -1 },
        $pull: {
          likes: userEmail,
        },
      };
      const options = { upsert: true };
      const result = await postCollection.updateOne(query, updatedDoc, options);
      res.send(result);
    });

    //post a comment
    app.post("/commentcommunitypost", async (req, res) => {
      const pid = req.query.postid;
      const comment = req.body;
      const result = await postcommentCollection.insertOne(comment);
      const option = {
        upsert: true,
      };
      const query = {
        _id: ObjectId(pid),
      };
      const updatedDoc = {
        $inc: { comments: 1 },
      };
      const update = await postCollection.updateOne(query, updatedDoc, option);
      res.send(update);
    });
    //get comments by post id
    app.get("/postComments", async (req, res) => {
      const id = req.query.postid;
      const query = {
        postId: id,
      };
      const result = await postcommentCollection
        .find(query)
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });

    // ---------------------------------------------------------------------------------------
    // // post all payment data

    // // app.post("/api/stripe-payment", (req, res) => {
    // app.post("/stripe-payment", (req, res) => {
    //   const stripe = require("stripe")(
    //     "sk_test_51M6QZ6IlSJrakpLcRB6srpU0MYT767eqSG5AHt0bwrfnjHQnZzdps5MpU6R7Qhvip0dC2EQlvbXWQ9KslQKIEVVs00rFRWl8WP"
    //   );

    //   const { amount, email, token } = req.body;

    //   stripe.customers
    //     .create({
    //       email: email,
    //       source: token.id,
    //       name: token.card.name,
    //     })
    //     .then((customer) => {
    //       return stripe.charges.create({
    //         amount: parseFloat(amount) * 100,
    //         description: `Payment for USD ${amount}`,
    //         currency: "USD",
    //         customer: customer.id,
    //       });
    //     })
    //     .then((charge) => res.status(200).send(charge))
    //     .catch((err) => console.log(err));
    // });
    // ------------------------------------------------------------------------------
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
