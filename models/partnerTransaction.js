const mongoose = require('mongoose');
const { Schema } = mongoose;

const partnerTransactionSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  customerId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
  },
  partnerId: {
    type: String,
    required: true,
  },
  mechanicName: {
    type: String,
    required: true
  },
  sendsms: {
    type: Boolean,
    default: false,
  },
  partsReplaced: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      }
    },
  ],
});

const PartnerTransaction = mongoose.model('PartnerTransaction', partnerTransactionSchema);

module.exports = PartnerTransaction;