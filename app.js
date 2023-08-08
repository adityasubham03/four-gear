const express = require("express");
const { set, connect } = require("mongoose");
const cors = require("cors");
const { DB, REQUEST_TIMEOUT, PORT } = require("./config/db");
const { success, error } = require("consola");
const auth = require("./routes/auth-routes");
const book = require("./routes/servicing-routes");
const partners = require("./routes/partner-routes");
const booking = require("./routes/view-bookings");
const gallery = require("./routes/gallery-routes");
const googleSignIn = require("./routes/oauth-routes");

const Bike = require("./models/bike-booking");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//App routes start here

app.get("/", async (req, res) => {
	res.send({
		data: {
			appName: "Four Gear",
			developedBy: "Aditya Choudhury",
			maintainedBy: "Four Gear",
			version: "1.0.0",
		},
		success: true,
	});
});

app.post("/", (req, res, next) => {
	res.send({
		message: "POST request is not allowed in this endpoint!!",
		success: false,
	});
});

app.get("/api/health", (req, res) => {
	res.send({
		message: "Server is Up and running",
		success: true,
	});
});

app.use("/api/auth", auth);
app.use("/api/book", book);
app.use("/api/bookings", booking);
app.use("/api/partners", partners);
app.use("/api/gallery", gallery);
app.use("/api/oauth", googleSignIn);

app.use("/db/update", async (req, res) => {
	await Bike.updateMany({}, { paid: false });
	return res.status(200).json({
		message: "Records updated sucessfully",
		success: true,
	});
});

app.use((req, res) => {
	res.status(404).json({
		reason: "invalid-request",
		message:
			"The endpoint you wanna reach is not available! Please check the endpoint again",
		success: false,
	});
});

//App routes ends here

//Connecting tp the DB
const startApp = async () => {
	try {
		// Connection With DB
		await connect(DB, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			serverSelectionTimeoutMS: REQUEST_TIMEOUT,
			dbName: "fourgear",
		});

		success({
			message: `Successfully connected with the Database \n${DB}`,
			badge: true,
		});

		// Start Listenting for the server on PORT
		app.listen(PORT, async () => {
			success({ message: `Server started on PORT ${PORT}`, badge: true });
		});
	} catch (err) {
		error({
			message: `Unable to connect with Database \n${err}`,
			badge: true,
		});
		startApp();
	}
};

startApp();
