console.log('Server is starting...');

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Маршрут: получить данные пациента по ИИН
app.get('/api/patient/:iin', (req, res) => {
    const iin = req.params.iin;

    // Путь до файла JSON (предположим, /data/patients.json)
    const dataPath = path.join(__dirname, 'patients.json');

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка чтения базы' });
        }
        let patients;
        try {
            patients = JSON.parse(data);
        } catch (e) {
            return res.status(500).json({ error: 'Ошибка разбора базы' });
        }
        const patient = patients.find(p => p.iin === iin);
        if (!patient) {
            return res.status(404).json({ error: 'Пациент не найден' });
        }
        res.json(patient);
    });
});

// Для теста: простой корень
app.get('/', (req, res) => {
    res.send('Patient API is working!');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
