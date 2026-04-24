const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("UMS API running ✓"));

// Auth & Core
app.use("/api/auth",        require("./routes/authRoutes"));
app.use("/api/courses",     require("./routes/courseRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/grades",      require("./routes/gradeRoutes"));

// Facilities
app.use("/api/rooms",       require("./routes/roomRoutes"));
app.use("/api/bookings",    require("./routes/bookingRoutes"));
app.use("/api/resources",   require("./routes/resourceRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/transcripts", require("./routes/transcriptRoutes"));
app.use("/api/admissions",  require("./routes/admissionRoutes"));

// Curriculum
app.use("/api/announcements",     require("./routes/announcementRoutes"));
app.use("/api/materials",         require("./routes/materialRoutes"));
app.use("/api/quizzes",           require("./routes/quizRoutes"));
app.use("/api/uni-announcements", require("./routes/universityAnnouncementRoutes"));

// Staff
app.use("/api/staff",        require("./routes/staffRoutes"));
app.use("/api/ta",           require("./routes/taRoutes"));
app.use("/api/office-hours", require("./routes/officeHourRoutes"));
app.use("/api/leave",        require("./routes/leaveRoutes"));
app.use("/api/payroll",      require("./routes/payrollRoutes"));
app.use("/api/performance",  require("./routes/performanceRoutes"));

// Community
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/parents",  require("./routes/parentRoutes"));
app.use("/api/events",   require("./routes/eventRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✓ Server on port ${PORT}`));