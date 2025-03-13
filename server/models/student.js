import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  admissionYear: {
    type: Number,
    required: true
  },
  certificateUrl: {
    type: String,
    default: null
  },
  walletAddress: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Student = mongoose.model('Student', studentSchema);