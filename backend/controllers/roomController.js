const Room = require("../models/Room");

const getRooms = async (req, res) => {
  try {
    const { type, building } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (building) filter.building = building;
    const rooms = await Room.find(filter);
    res.status(200).json(rooms);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(room);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ message: "Room created", room });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json({ message: "Room updated", room });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Room deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };