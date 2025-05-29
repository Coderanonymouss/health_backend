console.log('Server is starting...');

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // ключ будет храниться в render, не в коде!

app.post('/api/ai-chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({error: 'Нет сообщения!'});

    try {
        const openaiRes = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Ты медицинский ассистент. Отвечай только на вопросы о болезнях, симптомах и здоровье. Если вопрос не про болезнь, скажи, что можешь отвечать только по медицинским вопросам."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json({response: openaiRes.data.choices[0].message.content});
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({error: "AI сервер қатесі"});
    }
});

app.get('/', (req, res) => res.send('AI Proxy сервер работает!'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('AI Proxy сервер запущен на порту ' + PORT));
