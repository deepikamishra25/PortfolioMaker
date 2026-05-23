import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  link: { type: String },
  github: { type: String },
  image: { type: String },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String },
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  description: { type: String },
});

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a portfolio title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    template: {
      type: String,
      default: 'modern',
      enum: ['modern', 'minimal', 'creative', 'developer'],
    },
    theme: {
      primaryColor: { type: String, default: '#6366f1' }, // Indigo
      secondaryColor: { type: String, default: '#10b981' }, // Emerald
      backgroundColor: { type: String, default: '#0f172a' }, // Slate 900
      textColor: { type: String, default: '#f8fafc' }, // Slate 50
    },
    about: {
      name: { type: String, required: true },
      role: { type: String, required: true },
      bio: { type: String },
      avatar: { type: String },
      socials: {
        github: { type: String },
        linkedin: { type: String },
        twitter: { type: String },
        email: { type: String },
      },
    },
    skills: [{ type: String }],
    projects: [projectSchema],
    experience: [experienceSchema],
    education: [educationSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to auto-generate slug if not provided or modified
portfolioSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
