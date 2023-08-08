const Bill = require("../../models/bill");
const Booking = require("../../models/bike-booking");
const { billSchema } = require("../Validators/billGenerator/validator");

const generateBill = async (req, res, next) => {
	try {
		const billRequest = await billSchema.validateAsync(req.body);
		const booking = await Booking.findById(billRequest.serviceId);
		if (!booking) {
			return res.status(404).json({
				reason: "service-id",
				message: "No service record found",
				success: false,
			});
		}

		const existingBill = await Bill.findOne({
			serviceId: billRequest.serviceId,
		});
		if (booking.isBillGenerated) {
			if (existingBill) {
				if (existingBill.serviceId === booking.billId) {
					return res.status(409).json({
						reason: "bill",
						message: "Bill already exists!!",
						success: false,
					});
				}
			}
		}

		const bill = new Bill({
			...billRequest,
			phoneNumber: booking.bookingDetails.phone,
			customerName: booking.bookingDetails.name,
			bikeModel: `${booking.bookingDetails.bike_Company} ${booking.bookingDetails.bike_Model}`,
			billedBy: req._id,
		});
		await bill.save();
		console.log(bill._id);
		booking.billId = bill._id;
		booking.isBillGenerated = true;
		booking.save();
		return res.json();
	} catch (err) {
		console.log(err);
		res.status(500).json();
	}
};

module.exports = {
	generateBill,
};
