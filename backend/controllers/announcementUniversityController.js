const Announcement = require("../models/Announcement");

const getAnnouncements = async (req, res) => {
  try {
    const { audience } = req.query;
    const filter = { $or: [{ targetAudience: "all" }] };
    if (audience) filter.$or.push({ targetAudience: audience });
    const announcements = await Announcement.find(filter)
      .populate("postedBy", "name role")
      .sort({ pinned: -1, createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetAudience, priority, pinned, expiresAt } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content required" });
    const ann = await Announcement.create({
      title, content, targetAudience, priority, pinned, expiresAt,
      postedBy: req.user._id,
    });
    res.status(201).json({ message: "Announcement posted", ann });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ann) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Updated", ann });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };