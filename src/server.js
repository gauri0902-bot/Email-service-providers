// src/server.js
const express = require('express');
const bodyParser = require('body-parser');
const EmailService = require('./EmailService');
const Logger = require('./Logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const emailService = new EmailService();

app.post('/send-email', async (req, res) => {
    const { id, to, subject, body } = req.body;

    if (!id || !to || !subject || !body) {
        return res.status(400).json({ message: 'Missing required fields: id, to, subject, body.' });
    }

    try {
        const result = await emailService.sendEmail({ id, to, subject, body });
        return res.status(200).json(result);
    } catch (error) {
        Logger.error(`Error in /send-email: ${error.message}`);
        return res.status(500).json({ message: 'An error occurred while sending the email.' });
    }
});

app.get('/email-logs', (req, res) => {
    const logs = emailService.getLogs();
    return res.status(200).json(logs);
});

app.listen(port, () => {
    Logger.log(`Server is running on http://localhost:${port}`);
});
