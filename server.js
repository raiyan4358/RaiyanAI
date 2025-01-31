const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual OpenAI API key

app.use(express.json());
app.use(cors()); // Allow cross-origin requests (helpful for local development)

app.post('/chat', async (req, res) => {
    const userInput = req.body.message;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: userInput },
                ],
                max_tokens: 150,
            }),
        });

        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error communicating with OpenAI');
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
