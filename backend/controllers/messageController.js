const MessageThread = require("../models/MessageThread");
const Message = require("../models/Message");
const User = require("../models/User");

const getMyThreads = async (req, res) => {
  try {
    const threads = await MessageThread.find({ 
      participants: { $in: [req.user._id] } 
    })
      .populate("participants", "name email role")
      .populate("createdBy", "name email role")
      .sort({ lastMessage: -1 });
    res.status(200).json(threads);
  } catch (error) {
    console.error("getMyThreads error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getThreadMessages = async (req, res) => {
  try {
    const thread = await MessageThread.findById(req.params.threadId)
      .populate("participants", "name email role");
    
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    const isParticipant = thread.participants.some(
      (p) => String(p._id) === String(req.user._id)
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not a participant in this thread" });
    }

    const messages = await Message.find({ thread: req.params.threadId })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { 
        thread: req.params.threadId, 
        sender: { $ne: req.user._id },
        readBy: { $nin: [req.user._id] } 
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.status(200).json({ thread, messages });
  } catch (error) {
    console.error("getThreadMessages error:", error);
    res.status(500).json({ message: error.message });
  }
};

const createThread = async (req, res) => {
  try {
    const { recipientId, subject, firstMessage } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: "recipientId is required" });
    }
    if (!firstMessage || !firstMessage.trim()) {
      return res.status(400).json({ message: "firstMessage is required" });
    }
    if (String(recipientId) === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot send message to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Check if a thread already exists between these two users
    const existing = await MessageThread.findOne({
      participants: { $all: [req.user._id, recipientId] }
    }).populate("participants", "name email role");

    let thread;
    if (existing) {
      thread = existing;
    } else {
      thread = await MessageThread.create({
        participants: [req.user._id, recipientId],
        subject: subject && subject.trim() ? subject.trim() : "No Subject",
        createdBy: req.user._id,
        lastMessage: new Date(),
      });
      thread = await MessageThread.findById(thread._id)
        .populate("participants", "name email role");
    }

    // Create the first/new message
    const newMsg = await Message.create({
      thread: thread._id,
      sender: req.user._id,
      content: firstMessage.trim(),
      readBy: [req.user._id],
    });

    thread.lastMessage = new Date();
    await thread.save();

    const populatedMsg = await Message.findById(newMsg._id)
      .populate("sender", "name email role");

    res.status(201).json({ 
      message: "Thread created successfully", 
      thread,
      firstMsg: populatedMsg
    });
  } catch (error) {
    console.error("createThread error:", error);
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const thread = await MessageThread.findById(req.params.threadId)
      .populate("participants", "name email role");
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    const isParticipant = thread.participants.some(
      (p) => String(p._id) === String(req.user._id)
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this thread" });
    }

    const msg = await Message.create({
      thread: thread._id,
      sender: req.user._id,
      content: content.trim(),
      readBy: [req.user._id],
    });

    thread.lastMessage = new Date();
    await thread.save();

    const populated = await Message.findById(msg._id)
      .populate("sender", "name email role");

    res.status(201).json({ message: "Message sent", msg: populated });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteThread = async (req, res) => {
  try {
    const thread = await MessageThread.findById(req.params.threadId);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    const isParticipant = thread.participants.some(
      (p) => String(p) === String(req.user._id)
    );
    if (!isParticipant && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this thread" });
    }

    await Message.deleteMany({ thread: thread._id });
    await thread.deleteOne();

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("deleteThread error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const myThreadIds = await MessageThread.find({
      participants: { $in: [req.user._id] }
    }).distinct("_id");

    const count = await Message.countDocuments({
      thread: { $in: myThreadIds },
      sender: { $ne: req.user._id },
      readBy: { $nin: [req.user._id] },
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { _id: { $ne: req.user._id } };
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }
    const users = await User.find(filter)
      .select("name email role")
      .limit(20)
      .sort({ name: 1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyThreads,
  getThreadMessages,
  createThread,
  sendMessage,
  deleteThread,
  getUnreadCount,
  getUsers,
};