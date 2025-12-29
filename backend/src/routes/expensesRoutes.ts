import express from 'express';
import {
  getAllExpenses,
  getExpense,
  createExpenseController,
  updateExpenseController,
  deleteExpenseController,
  getExpensesStatsController,
} from '../controllers/expensesController';
import {
  validateGetExpenses,
  validateGetExpense,
  validateCreateExpense,
  validateUpdateExpense,
  validateDeleteExpense,
} from '../validators/expensesValidator';

const router = express.Router();

router.get('/', validateGetExpenses, getAllExpenses);
router.get('/stats', getExpensesStatsController);
router.get('/:expenseId', validateGetExpense, getExpense);
router.post('/', validateCreateExpense, createExpenseController);
router.put('/:expenseId', validateUpdateExpense, updateExpenseController);
router.delete('/:expenseId', validateDeleteExpense, deleteExpenseController);

export default router;



