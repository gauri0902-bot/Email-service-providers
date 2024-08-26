// src/EmailProviderB.js
class EmailProviderB {
    async sendEmail(email) {
        // Simulate random failure
        if (Math.random() < 0.5) {
            throw new Error("Provider B failed to send email.");
        }
        return true;
    }
}

module.exports = EmailProviderB;
