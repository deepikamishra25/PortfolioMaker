import express from 'express';
import {
  getMyPortfolios,
  getPortfolioBySlug,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMyPortfolios)
  .post(protect, createPortfolio);

router.route('/:id')
  .get(getPortfolioById)
  .put(protect, updatePortfolio)
  .delete(protect, deletePortfolio);

router.get('/slug/:slug', getPortfolioBySlug);

export default router;
