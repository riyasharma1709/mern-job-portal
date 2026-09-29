import mongoose from 'mongoose';

const employerProfileSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  website: {
    type: String,
    default: ""
  },
  industry: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  logo: {
    type: String,
    default: ""
  },
  photos: {
    type: [String],
    default: []
  },
  video: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model('EmployerProfile', employerProfileSchema);
