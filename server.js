console.log('Server is starting...');

const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Для отдачи html-страниц по прямой ссылке
app.use(express.static(__dirname));

const MONGO_URI = "mongodb+srv://greatstack:greatstack@health.t8k3jnw.mongodb.net/health?retryWrites=true&w=majority";

// 1. Подключаемся к MongoDB только один раз
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // 2. Определяем схему пациента
    const patientSchema = new mongoose.Schema({
      iin: { type: String, required: true, unique: true },
      firstName: String,
      lastName: String,
      middleName: String,
      email: String,
      birthDate: String,
      gender: String,
      diagnosis: String,
      rehabStage: String
    });

    const Patient = mongoose.model('Patient', patientSchema);

    // 3. Получить пациента по ИИН
    app.get('/api/patient/:iin', async (req, res) => {
      try {
        const patient = await Patient.findOne({ iin: req.params.iin });
        if (!patient) {
          return res.status(404).json({ error: 'Пациент не найден' });
        }
        res.json(patient);
      } catch (err) {
        console.error('❌ Ошибка при поиске пациента:', err);
        res.status(500).json({ error: 'Ошибка при поиске пациента', details: err.message });
      }
    });

    // 4. Добавить пациента
    app.post('/api/patient', async (req, res) => {
      try {
        const existing = await Patient.findOne({ iin: req.body.iin });
        if (existing) {
          return res.status(400).json({ error: 'Пациент с таким ИИН уже существует' });
        }

        const newPatient = new Patient(req.body);
        await newPatient.save();
        res.status(201).json({ message: 'Пациент добавлен', patient: newPatient });
      } catch (err) {
        console.error('❌ Ошибка при добавлении пациента:', err);
        res.status(500).json({ error: 'Ошибка при добавлении пациента', details: err.message });
      }
    });

    // 5. Массовое добавление пациентов
    app.post('/api/patients', async (req, res) => {
      const patients = req.body; // Ожидается массив объектов

      if (!Array.isArray(patients)) {
        return res.status(400).json({ error: "Ожидается массив пациентов!" });
      }

      const results = [];
      for (const p of patients) {
        try {
          // Проверяем на дубль
          const exists = await Patient.findOne({ iin: p.iin });
          if (exists) {
            results.push({ iin: p.iin, status: "error", message: "Пациент с таким ИИН уже есть" });
            continue;
          }
          const patient = new Patient(p);
          await patient.save();
          results.push({ iin: p.iin, status: "success" });
        } catch (err) {
          results.push({ iin: p.iin, status: "error", message: err.message });
        }
      }
      res.json(results);
    });

    // 6. Отдача HTML-страниц (не внутрь других функций!)
    app.get('/add_patient', (req, res) => {
      res.sendFile(path.join(__dirname, 'add_patient.html'));
    });

    app.get('/add_patients', (req, res) => {
      res.sendFile(path.join(__dirname, 'add_patients.html'));
    });

    // 7. Проверка сервера
    app.get('/', (req, res) => {
      res.send('✅ Patient API is working');
    });

    // 8. Запуск сервера
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });
