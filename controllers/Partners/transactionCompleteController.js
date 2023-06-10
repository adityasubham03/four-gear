const Transaction = require("../../models/userTransaction");
const { transactionSchema } = require("../Validators/userTransaction/validator");
const { FAST2API_API_KEY } = require("../../config/db");
const axios = require('axios');

const Register_MSG = {
  signupSuccess: "Transaction successfully saved.",
  signupError: "Unable to submit the transaction. Please try again later!",
  noDataError: "No data found.",
};

async function sendSMS(number, message) {
  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        message,
        language: 'english',
        route: 'q',
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
    console.error('Failed to send SMS:', error.response.data);
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

    const message = "Detail for your last service are ${transaction.details}, Amount: ${transaction.amount}";

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

module.exports = {
  saveTransaction,
  getTransactions,
};
