// DATA SCHEMA

import mongoose from "mongoose";

const utextSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received: Boolean,
});

export default mongoose.model("messagecontents", utextSchema); // "messageContent" = name of collection in DB
