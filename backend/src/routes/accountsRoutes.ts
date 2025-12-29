import express from 'express';
import {
  getAllAccounts,
  getAccount,
  createAccountController,
  updateAccountController,
  deleteAccountController,
  getAccountsStatsController,
} from '../controllers/accountsController';
import {
  validateGetAccounts,
  validateGetAccount,
  validateCreateAccount,
  validateUpdateAccount,
  validateDeleteAccount,
} from '../validators/accountsValidator';

const router = express.Router();

router.get('/', validateGetAccounts, getAllAccounts);
router.get('/stats', getAccountsStatsController);
router.get('/:accountId', validateGetAccount, getAccount);
router.post('/', validateCreateAccount, createAccountController);
router.put('/:accountId', validateUpdateAccount, updateAccountController);
router.delete('/:accountId', validateDeleteAccount, deleteAccountController);

export default router;



