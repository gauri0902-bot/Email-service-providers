const express = require('express');
const bodyParser = require('body-parser');
const EmailService = require('./EmailService');
const Logger = require('./Logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize EmailService
const emailService = new EmailService();

// Endpoint to send email
app.post('/send-email', async (req, res) => {
    const { id, to, subject, body } = req.body;

    // Log the incoming request for debugging
    Logger.log(`Received request to send email: ID=${id}, To=${to}, Subject=${subject}`);

    // Check for missing fields
    if (!id || !to || !subject || !body) {
        return res.status(400).json({ message: 'Missing required fields: id, to, subject, body.' });
    }

    try {
        // Attempt to send the email using EmailService
        const result = await emailService.sendEmail({ id, to, subject, body });
        return res.status(200).json(result);
    } catch (error) {
        // Log any errors encountered
        Logger.error(`Error in /send-email: ${error.message}`);
        return res.status(500).json({ message: 'An error occurred while sending the email.' });
    }
});

// Endpoint to get email logs
app.get('/email-logs', (req, res) => {
    // Retrieve logs from EmailService
    const logs = emailService.getLogs();
    return res.status(200).json(logs);
});

// Start the server
app.listen(port, () => {
    Logger.log(`Server is running on http://localhost:${port}`);
});
