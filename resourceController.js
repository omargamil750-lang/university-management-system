const Resource = require("../models/Resource");

const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().populate("assignedTo", "name email");
    res.status(200).json(resources);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({ message: "Resource created", resource });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.status(200).json({ message: "Resource updated", resource });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const assignResource = async (req, res) => {
  try {
    const { userId } = req.body;
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    if (resource.available <= 0) return res.status(400).json({ message: "No units available" });
    resource.assignedTo.push(userId);
    resource.available -= 1;
    await resource.save();
    res.status(200).json({ message: "Resource assigned", resource });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Resource deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getResources, createResource, updateResource, assignResource, deleteResource };