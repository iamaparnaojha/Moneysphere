const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All transaction routes require authentication
router.use(authMiddleware);

// GET /api/transactions - Get all transactions for logged-in user
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ date: -1, createdAt: -1 });

    res.json(transactions.map(t => ({
      id: t._id.toString(),
      date: t.date,
      amount: t.amount,
      category: t.category,
      description: t.description,
      type: t.type
    })));
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
});

// POST /api/transactions - Create transaction (admin only)
router.post('/', adminOnly, async (req, res) => {
  try {
    const { date, amount, category, description, type, cardId } = req.body;

    if (!date || !amount || !category || !description || !type) {
      return res.status(400).json({ message: 'All fields (date, amount, category, description, type) are required.' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be income or expense.' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0.' });
    }

    const transaction = new Transaction({
      userId: req.user.userId,
      date,
      amount: Number(amount),
      category: category.trim(),
      description: description.trim(),
      type,
      cardId: (cardId && mongoose && mongoose.Types.ObjectId.isValid(cardId)) ? cardId : null
    });

    await transaction.save();

    // Update card balance if valid cardId is provided
    if (transaction.cardId) {
      try {
        const card = await Card.findOne({ _id: transaction.cardId, userId: req.user.userId });
        if (card) {
          if (type === 'income') {
            card.balance += Number(amount);
          } else {
            card.balance -= Number(amount);
          }
          await card.save();
        }
      } catch (cardError) {
        console.error('Card balance update error:', cardError);
        // We don't fail the transaction if the balance update fails, but we log it
      }
    }

    res.status(201).json({
      id: transaction._id.toString(),
      date: transaction.date,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      type: transaction.type,
      cardId: transaction.cardId
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ 
      message: 'Failed to create transaction.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// PUT /api/transactions/:id - Update transaction (admin only)
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { date, amount, category, description, type, cardId } = req.body;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const oldAmount = transaction.amount;
    const oldType = transaction.type;
    const oldCardId = transaction.cardId;

    if (date) transaction.date = date;
    if (amount !== undefined) transaction.amount = Number(amount) || 0;
    if (category) transaction.category = category.trim();
    if (description) transaction.description = description.trim();
    if (type) transaction.type = type;
    
    // Validate cardId if provided
    if (cardId !== undefined) {
      transaction.cardId = (cardId && mongoose.Types.ObjectId.isValid(cardId)) ? cardId : null;
    }

    await transaction.save();

    // ── Handle Balance Adjustments ──
    
    // 1. Revert Old Transaction Effect
    if (oldCardId) {
      const oldCard = await Card.findOne({ _id: oldCardId, userId: req.user.userId });
      if (oldCard) {
        if (oldType === 'income') {
          oldCard.balance -= oldAmount;
        } else {
          oldCard.balance += oldAmount;
        }
        await oldCard.save();
      }
    }

    // 2. Apply New Transaction Effect
    if (transaction.cardId) {
      const newCard = await Card.findOne({ _id: transaction.cardId, userId: req.user.userId });
      if (newCard) {
        if (transaction.type === 'income') {
          newCard.balance += transaction.amount;
        } else {
          newCard.balance -= transaction.amount;
        }
        await newCard.save();
      }
    }

    res.json({
      id: transaction._id.toString(),
      date: transaction.date,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      type: transaction.type,
      cardId: transaction.cardId
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Failed to update transaction.' });
  }
});

// DELETE /api/transactions/:id - Delete transaction (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    // Revert balance if card was associated and ID is valid
    if (transaction.cardId && mongoose.Types.ObjectId.isValid(transaction.cardId)) {
      const card = await Card.findOne({ _id: transaction.cardId, userId: req.user.userId });
      if (card) {
        if (transaction.type === 'income') {
          card.balance -= transaction.amount;
        } else {
          card.balance += transaction.amount;
        }
        await card.save();
      }
    }

    res.json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Failed to delete transaction.' });
  }
});

module.exports = router;
