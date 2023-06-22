const Transaction = require("../../models/userTransaction");
const bike = require("../../models/bike-booking");
const partners = require("../../models/partners");
const {
	transactionSchema,
} = require("../Validators/userTransaction/validator");
const { FAST2API_API_KEY } = require("../../config/db");
const axios = require("axios");

const Register_MSG = {
	signupSuccess: "Transaction successfully saved.",
	signupError: "Unable to submit the transaction. Please try again later!",
	noDataError: "No data found.",
};

async function sendSMS(number, message) {
	try {
		const response = await axios.post(
			"https://www.fast2sms.com/dev/bulkV2",
			{
				message,
				language: "english",
				route: "q",
				numbers: number,
			},
			{
				headers: {
					authorization: FAST2API_API_KEY,
				},
			}
		);
		console.log(response.data);
	} catch (error) {
		console.error("Failed to send SMS:", error.response.data);
	}
}

const saveTransaction = async (req, res, next) => {
	try {
		const transactionDetails = await transactionSchema.validateAsync(req.body);

		const transaction = new Transaction({
			...transactionDetails,
		});

		await transaction.save();

		const number = req.phone;

		const message =
			"Detail for your last service are ${transaction.details}, Amount: ${transaction.amount}";

		try {
			await sendSMS(userNumber, message);
			return res.status(201).json({
				message: Register_MSG.signupSuccess,
				success: true,
			});
		} catch (error) {
			return res.status(201).json({
				message: Register_MSG.signupSuccess,
				success: true,
			});
		}
	} catch (err) {
		let errorMsg = Register_MSG.signupError;
		if (err.isJoi === true) {
			err.status = 403;
			errorMsg = err.message;
		}
		console.log(err);
		return res.status(err.status).json({
			message: errorMsg,
			success: false,
		});
	}
};

const dayWiseTransactionHistory = async (req, res, next) => {
	try {
		const transactions = await PartnerTransaction.find({
			partnerId: req._id,
			date: {
				$gte: new Date(params.desiredDate),
				$lt: new Date(params.desiredDate),
			},
		});

		if (!transactions) {
			return res.status(404).json({
				message: Register_MSG.noDataError,
				success: true,
			});
		}

		return res.status(200).json({
			transactions,
			success: true,
		});
	} catch (error) {
		console.error("Error filtering transactions:", error);
		console.log(err);
		return res.status(400).json({
			message: Register_MSG.noDataError,
			success: false,
		});
	}
};

const getTransactions = async (req, res, next) => {
	try {
		const { id } = req.params;
		let transactions;

		if (id) {
			transactions = await Transaction.find({ user: id });
		}

		if (!transactions) {
			return res.status(404).json({
				message: Register_MSG.noDataError,
				success: true,
			});
		}

		return res.status(200).json({
			transactions,
			success: true,
		});
	} catch (err) {
		console.log(err);
		return res.status(400).json({
			message: Register_MSG.noDataError,
			success: false,
		});
	}
};

const confirmBooking = async (req, res, next) => {
	const { _id } = req.body;
	if (!_id) {
		return res.status(404).json({
			reason: "no-id",
			message: "No id found!!",
			success: false,
		});
	} else {
		try {
			const service = await bike.findById(_id);
			if (!service) {
				return res.status(404).json({
					reason: "no-record",
					message: "No data found!!",
					success: false,
				});
			} else {
				if (service.isConfirmed) {
					return res.status(403).json({
						reason: "confirmed",
						message: "The service is already confirmed!",
						success: false,
					});
				} else {
					service.isConfirmed = true;
					await service.save();
					return res.status(200).json({
						data: "Successfully confirmed servicing!",
						success: true,
					});
				}
			}
		} catch (err) {
			console.log(err);
			return res.status(500).json({
				reason: "server",
				message:
					"An error was encountered on the server! Please try again later.",
				success: false,
			});
		}
	}
};

const declineBooking = async (req, res, next) => {
	const { _id } = req.body;
	if (!_id) {
		return res.status(404).json({
			reason: "no-id",
			message: "No id found!!",
			success: false,
		});
	} else {
		try {
			const service = await bike.findById(_id);
			if (!service) {
				return res.status(404).json({
					reason: "no-record",
					message: "No data found!!",
					success: false,
				});
			} else {
				const len = service.distances.length;
				if (len >= service.current) {
					service.isAbandoned = true;
					service.isCompleted = true;
					service.save();
				} else {
					service.current += 1;
					service.assignedTo = service.distances[service.current].phone;
					const partner = await partners.findOne({ phone: service.assignedTo });
					service.partnerName = partner.shopName;
					service.save();
				}
			}
			return res.status(200).json({
				data: "Successfully declined servicing!",
				success: true,
			});
		} catch (err) {
			console.log(err);
			return res.status(500).json({
				reason: "server",
				message:
					"An error was encountered on the server! Please try again later.",
				success: false,
			});
		}
	}
};

const userConfirmBookingSms = async (req, res, next) => {};

const sendUserSms = async (req, res, next) => {};

const sendPartnerSms = async (req, res, next) => {};

const notify = async (req, res, next) => {};

module.exports = {
	saveTransaction,
	getTransactions,
	dayWiseTransactionHistory,
	confirmBooking,
	declineBooking,
	userConfirmBookingSms,
	sendUserSms,
	sendPartnerSms,
	notify,
};
