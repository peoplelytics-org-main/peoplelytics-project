import express from 'express';
import {addOrganization} from "../../docs/database/superAdmin"

const router = express.Router();

router.post('/add-organization', async (req, res) => {
  try {
    const orgData = req.body; // ✅ contains name, dates, etc.

    if (!orgData.name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const org = await addOrganization(orgData); // ✅ pass full data
    res.status(201).json({ message: 'Organization created successfully', org });
  } catch (error: any) {
    console.error("❌ Error creating organization:", error);
    res.status(500).json({ error: error.message || 'Failed to add organization' });
  }
});

export default router;