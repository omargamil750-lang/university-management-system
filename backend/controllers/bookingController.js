const Booking = require("../models/Booking");
const Room = require("../models/Room");

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ bookedBy: req.user._id })
      .populate("room", "name building floor type")
      .sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("room", "name building floor type")
      .populate("bookedBy", "name email role")
      .sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getBookingsByRoom = async (req, res) => {
  try {
    const bookings = await Booking.find({ room: req.params.roomId, status: "approved" })
      .populate("bookedBy", "name email");
    res.status(200).json(bookings);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createBooking = async (req, res) => {
  try {
    const { room, title, date, startTime, endTime, notes } = req.body;
    if (!room || !title || !date || !startTime || !endTime)
      return res.status(400).json({ message: "All required fields must be provided" });

    // Check for time conflicts
    const conflict = await Booking.findOne({
      room, date, status: "approved",
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });
    if (conflict) return res.status(400).json({ message: "Room is already booked for that time slot" });

    const booking = await Booking.create({ room, bookedBy: req.user._id, title, date, startTime, endTime, notes });
    res.status(201).json({ message: "Booking request submitted", booking });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: `Booking ${status}`, booking });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (String(booking.bookedBy) !== String(req.user._id))
      return res.status(403).json({ message: "Not authorized" });
    booking.status = "cancelled";
    await booking.save();
    res.status(200).json({ message: "Booking cancelled" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getMyBookings, getAllBookings, getBookingsByRoom, createBooking, updateBookingStatus, cancelBooking };