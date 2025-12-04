import express from 'express';
import {
  getAllDepartments,
  getDepartment,
  createDepartmentController,
  updateDepartmentController,
  deleteDepartmentController,
  getDepartmentsStatsController,
} from '../controllers/departmentsController';
import {
  validateGetDepartments,
  validateGetDepartment,
  validateCreateDepartment,
  validateUpdateDepartment,
  validateDeleteDepartment,
} from '../validators/departmentsValidator';

const router = express.Router();

router.get('/', validateGetDepartments, getAllDepartments);
router.get('/stats', getDepartmentsStatsController);
router.get('/:departmentId', validateGetDepartment, getDepartment);
router.post('/', validateCreateDepartment, createDepartmentController);
router.put('/:departmentId', validateUpdateDepartment, updateDepartmentController);
router.delete('/:departmentId', validateDeleteDepartment, deleteDepartmentController);

export default router;



