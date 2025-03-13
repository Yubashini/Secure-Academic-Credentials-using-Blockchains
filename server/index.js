import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create necessary directories
const DATA_DIR = join(__dirname, '../data');
const STUDENTS_FILE = join(DATA_DIR, 'students.json');
const CERTIFICATES_DIR = join(DATA_DIR, 'certificates');

fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(CERTIFICATES_DIR);

// Initialize students.json if it doesn't exist
if (!fs.existsSync(STUDENTS_FILE)) {
  fs.writeJsonSync(STUDENTS_FILE, []);
}

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(fileUpload());
app.use('/certificates', express.static(CERTIFICATES_DIR));
app.use(express.static(join(__dirname, '../dist')));

// Helper function to read/write student data
const getStudents = () => fs.readJsonSync(STUDENTS_FILE);
const saveStudents = (students) => fs.writeJsonSync(STUDENTS_FILE, students, { spaces: 2 });

app.post('/api/students', async (req, res) => {
  try {
    const { name, rollNumber, department, admissionYear, walletAddress } = req.body;
    
    if (!name || !rollNumber || !department || !admissionYear || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const students = getStudents();
    
    if (students.some(s => s.rollNumber === rollNumber)) {
      return res.status(409).json({ error: 'Student already exists' });
    }

    const newStudent = {
      name,
      rollNumber,
      department,
      admissionYear,
      walletAddress,
      certificateUrl: null,
      createdAt: new Date().toISOString()
    };

    students.push(newStudent);
    saveStudents(students);

    // Create wallet-specific directory
    const walletDir = join(CERTIFICATES_DIR, walletAddress);
    fs.ensureDirSync(walletDir);

    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:rollNumber', (req, res) => {
  try {
    const students = getStudents();
    const student = students.find(s => s.rollNumber === req.params.rollNumber);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students/:rollNumber/certificate', async (req, res) => {
  try {
    if (!req.files || !req.files.certificate) {
      return res.status(400).json({ error: 'No certificate file uploaded' });
    }

    const students = getStudents();
    const student = students.find(s => s.rollNumber === req.params.rollNumber);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { certificate } = req.files;
    const walletDir = join(CERTIFICATES_DIR, student.walletAddress);
    const certificatePath = join(walletDir, `${student.rollNumber}.pdf`);

    await certificate.mv(certificatePath);

    // Update certificate URL
    student.certificateUrl = `/certificates/${student.walletAddress}/${student.rollNumber}.pdf`;
    saveStudents(students);

    res.json(student);
  } catch (error) {
    console.error('Error uploading certificate:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/wallet/:address', (req, res) => {
  try {
    const students = getStudents();
    const student = students.find(s => s.walletAddress.toLowerCase() === req.params.address.toLowerCase());
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});