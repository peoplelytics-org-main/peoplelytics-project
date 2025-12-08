import express from 'express';
import { searchOrganizations } from "@/controllers/orgController";

const router = express.Router();
router.get('/search', searchOrganizations);

export default router;