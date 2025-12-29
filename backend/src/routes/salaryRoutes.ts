import express from 'express';
import {
  getAllSalaries,
  getSalary,
  getSalaryByEmployee,
  createSalaryController,
  updateSalaryController,
  deleteSalaryController,
  getSalaryStatsController,
} from '../controllers/salaryController';
import {
  validateGetSalaries,
  validateGetSalary,
  validateCreateSalary,
  validateUpdateSalary,
  validateDeleteSalary,
} from '../validators/salaryValidator';

const router = express.Router();

router.get('/', validateGetSalaries, getAllSalaries);
router.get('/stats', getSalaryStatsController);
router.get('/employee/:employeeId', getSalaryByEmployee);
router.get('/:salaryId', validateGetSalary, getSalary);
router.post('/', validateCreateSalary, createSalaryController);
router.put('/:salaryId', validateUpdateSalary, updateSalaryController);
router.delete('/:salaryId', validateDeleteSalary, deleteSalaryController);

export default router;



