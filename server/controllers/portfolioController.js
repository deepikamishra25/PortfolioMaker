import Portfolio from '../models/Portfolio.js';

// @desc    Get all portfolios for current user
// @route   GET /api/portfolios
// @access  Private
export const getMyPortfolios = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id });
    res.json(portfolios);
  } catch (error) {
    next(error);
  }
};

// @desc    Get portfolio by slug (Public)
// @route   GET /api/portfolios/slug/:slug
// @access  Public
export const getPortfolioBySlug = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ slug: req.params.slug }).populate('user', 'username email');

    if (!portfolio) {
      res.status(404);
      throw new Error('Portfolio not found');
    }

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
};

// @desc    Get portfolio by ID
// @route   GET /api/portfolios/:id
// @access  Public
export const getPortfolioById = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id).populate('user', 'username email');

    if (!portfolio) {
      res.status(404);
      throw new Error('Portfolio not found');
    }

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a portfolio
// @route   POST /api/portfolios
// @access  Private
export const createPortfolio = async (req, res, next) => {
  try {
    const { title, description, slug, template, theme, about, skills, projects, experience, education } = req.body;

    if (!title || !about || !about.name || !about.role) {
      res.status(400);
      throw new Error('Please provide title, author name, and professional role');
    }

    // Check slug uniqueness
    let portfolioSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slugExists = await Portfolio.findOne({ slug: portfolioSlug });
    if (slugExists) {
      // Append a short random string if slug exists
      portfolioSlug = `${portfolioSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const portfolio = new Portfolio({
      user: req.user._id,
      title,
      description,
      slug: portfolioSlug,
      template,
      theme,
      about,
      skills: skills || [],
      projects: projects || [],
      experience: experience || [],
      education: education || [],
    });

    const createdPortfolio = await portfolio.save();
    res.status(201).json(createdPortfolio);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a portfolio
// @route   PUT /api/portfolios/:id
// @access  Private
export const updatePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      res.status(404);
      throw new Error('Portfolio not found');
    }

    // Check ownership
    if (portfolio.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to update this portfolio');
    }

    // Assign fields
    portfolio.title = req.body.title || portfolio.title;
    portfolio.description = req.body.description !== undefined ? req.body.description : portfolio.description;
    portfolio.template = req.body.template || portfolio.template;
    portfolio.theme = req.body.theme || portfolio.theme;
    portfolio.about = req.body.about || portfolio.about;
    portfolio.skills = req.body.skills !== undefined ? req.body.skills : portfolio.skills;
    portfolio.projects = req.body.projects !== undefined ? req.body.projects : portfolio.projects;
    portfolio.experience = req.body.experience !== undefined ? req.body.experience : portfolio.experience;
    portfolio.education = req.body.education !== undefined ? req.body.education : portfolio.education;

    // Generate unique slug if title has changed and slug not manually passed
    if (req.body.title && req.body.title !== portfolio.title) {
      let portfolioSlug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const slugExists = await Portfolio.findOne({ slug: portfolioSlug, _id: { $ne: portfolio._id } });
      if (slugExists) {
        portfolioSlug = `${portfolioSlug}-${Math.random().toString(36).substring(2, 7)}`;
      }
      portfolio.slug = portfolioSlug;
    } else if (req.body.slug && req.body.slug !== portfolio.slug) {
      const slugExists = await Portfolio.findOne({ slug: req.body.slug, _id: { $ne: portfolio._id } });
      if (slugExists) {
        res.status(400);
        throw new Error('Custom slug is already in use');
      }
      portfolio.slug = req.body.slug;
    }

    const updatedPortfolio = await portfolio.save();
    res.json(updatedPortfolio);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a portfolio
// @route   DELETE /api/portfolios/:id
// @access  Private
export const deletePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      res.status(404);
      throw new Error('Portfolio not found');
    }

    // Check ownership
    if (portfolio.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this portfolio');
    }

    await Portfolio.deleteOne({ _id: req.params.id });
    res.json({ message: 'Portfolio removed' });
  } catch (error) {
    next(error);
  }
};
