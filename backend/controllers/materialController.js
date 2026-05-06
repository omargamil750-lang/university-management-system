const CourseMaterial = require("../models/CourseMaterial");

const getMaterialsByCourse = async (req, res) => {
  try {
    const materials = await CourseMaterial.find({ course: req.params.courseId })
      .populate("uploadedBy", "name role")
      .sort({ week: 1, createdAt: -1 });
    res.status(200).json(materials);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const uploadMaterial = async (req, res) => {
  try {
    const { course, title, description, fileUrl, fileType, week } = req.body;
    if (!course || !title || !fileUrl) return res.status(400).json({ message: "course, title, and fileUrl are required" });
    const material = await CourseMaterial.create({ course, title, description, fileUrl, fileType, week, uploadedBy: req.user._id });
    res.status(201).json({ message: "Material uploaded", material });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteMaterial = async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ message: "Not found" });
    if (String(material.uploadedBy) !== String(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });
    await material.deleteOne();
    res.status(200).json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getMaterialsByCourse, uploadMaterial, deleteMaterial };