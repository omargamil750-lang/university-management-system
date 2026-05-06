const CourseAnnouncement = require("../models/CourseAnnouncement");
const Course = require("../models/Course");

const getAnnouncementsByCourse = async (req, res) => {
  try {
    const announcements = await CourseAnnouncement.find({ course: req.params.courseId })
      .populate("postedBy", "name role")
      .sort({ pinned: -1, createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createAnnouncement = async (req, res) => {
  try {
    const { course, title, content, pinned } = req.body;
    if (!course || !title || !content) return res.status(400).json({ message: "course, title, and content are required" });
    const announcement = await CourseAnnouncement.create({ course, title, content, pinned: pinned || false, postedBy: req.user._id });
    res.status(201).json({ message: "Announcement posted", announcement });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await CourseAnnouncement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Not found" });
    if (String(announcement.postedBy) !== String(req.user._id))
      return res.status(403).json({ message: "Not authorized" });
    Object.assign(announcement, req.body);
    await announcement.save();
    res.status(200).json({ message: "Updated", announcement });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await CourseAnnouncement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Not found" });
    if (String(announcement.postedBy) !== String(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });
    await announcement.deleteOne();
    res.status(200).json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAnnouncementsByCourse, createAnnouncement, updateAnnouncement, deleteAnnouncement };