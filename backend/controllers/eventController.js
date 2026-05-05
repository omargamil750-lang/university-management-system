const Event = require("../models/Event");

const getEvents = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isPublic: true };
    if (type) filter.type = type;
    const events = await Event.find(filter)
      .populate("organizer", "name email")
      .sort({ startDate: 1 });
    res.status(200).json(events);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("attendees", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, type, startDate, endDate, location, isPublic, imageUrl } = req.body;
    if (!title || !type || !startDate || !endDate) return res.status(400).json({ message: "title, type, startDate, endDate required" });
    const event = await Event.create({ title, description, type, startDate, endDate, location, isPublic, imageUrl, organizer: req.user._id });
    res.status(201).json({ message: "Event created", event });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Updated", event });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Not found" });
    const alreadyIn = event.attendees.map(String).includes(String(req.user._id));
    if (alreadyIn) {
      event.attendees = event.attendees.filter(a => String(a) !== String(req.user._id));
    } else {
      event.attendees.push(req.user._id);
    }
    await event.save();
    res.status(200).json({ message: alreadyIn ? "RSVP cancelled" : "RSVP confirmed", attending: !alreadyIn });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, rsvpEvent };