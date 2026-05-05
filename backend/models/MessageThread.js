const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema(
  {
    participants: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    }],
    subject: { 
      type: String, 
      default: "No Subject",
      trim: true
    },
    lastMessage: { 
      type: Date, 
      default: Date.now 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
  },
  { timestamps: true }
);

// Index for faster queries
threadSchema.index({ participants: 1, lastMessage: -1 });

module.exports = mongoose.model("MessageThread", threadSchema);