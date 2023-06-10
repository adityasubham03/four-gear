const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserTransactionSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  user: {
    type: String,
    required: true,
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

const UserTransaction = mongoose.model('UserTransaction', UserTransactionSchema);

module.exports = UserTransaction;