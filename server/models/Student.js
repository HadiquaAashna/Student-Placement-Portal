import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  year: { type: String, required: true }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String }
});

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  photoUrl: {
    type: String,
    default: ''
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  education: [educationSchema],
  skills: [{
    type: String,
    trim: true
  }],
  projects: [projectSchema],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }]
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
