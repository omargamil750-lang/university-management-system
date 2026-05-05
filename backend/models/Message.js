const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    thread: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "MessageThread", 
      required: true,
      index: true
    },
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    content: { 
      type: String, 
      required: true,
      trim: true
    },
    readBy: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);