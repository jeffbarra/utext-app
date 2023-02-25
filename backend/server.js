import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Pusher from "pusher";
import cors from "cors";
import connectDB from "./config/db.js";
import Messages from "./models/dbMessages.js";

dotenv.config();

// ********************** //
// ***** APP CONFIG ***** //
// ********************** //

const app = express();
const port = process.env.PORT || 5001;

// Pusher
const pusher = new Pusher({
  appId: "1559496",
  key: "e81003343134d71cff65",
  secret: "75672d8e012ec6dbb8f1",
  cluster: "us3",
  useTLS: true,
});

// ********************** //
// ***** MIDDLEWARE ***** //
// ********************** //

app.use(express.json()); // allows us to use JSON

// Cors Headers
app.use(cors());

// ********************* //
// ***** DB CONFIG ***** //
// ********************* //

connectDB();

// Pusher Config & Sync //
const db = mongoose.connection;

db.once("open", () => {
  console.log("DB Connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log("A change occurred", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

// ********************** //
// ***** API ROUTES ***** //
// ********************** //

app.get("/", (req, res) => res.status(200).send("Hello There!")); // Test GET request

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/api/messages/new", (req, res) => {
  const dbMessage = req.body; // message structure

  Messages.create(dbMessage, (err, data) => {
    // creates new message from req.body
    if (err) {
      res.status(500).send(err); // error
    } else {
      res.status(201).send(`new message created: \n ${data}`); // success
    }
  });
});

// ******************** //
// ***** LISTENER ***** //
// ******************** //

app.listen(port, () => console.log(`Listening on PORT ${port}`));
