const Partners = require("../../models/partners");
const { partnerRegisterSchema } = require("../Validators/Partners/validators");

const Register_MSG = {
	signupSuccess: "You are successfully signed up for the partners programme.",
	signupError: "Unable to submit the data. Please try again later!!",
	noDataError: "No data found",
};

const register = async (req, res, next) => {
	try {
		const partnersDetails = await partnerRegisterSchema.validateAsync(req.body);

		const partners = new Partners({
			...partnersDetails,
		});
		partners.save();
		return res.status(201).json({
			message: Register_MSG.signupSuccess,
			success: true,
		});
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

const get = async (req, res, next) => {
	let partners;
	const id = req.params.id;
	try {
		if (id) {
			partners = await Partners.findById(id);
		} else {
			partners = await Partners.find();
		}
    } catch (err) {
        console.log(err);
        return res.status(400).json({
			message: Register_MSG.noDataError,
			success: false,
		});
    }
	if (!partners) {
		return res.status(404).json({
			message: Register_MSG.noDataError,
			success: true,
		});
	}
	return res.status(200).json({
		partners,
		success: true,
	});
};

module.exports = {
	register,
	get,
};
