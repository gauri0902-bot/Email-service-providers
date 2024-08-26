// src/EmailProviderA.js
class EmailProviderA {
    async sendEmail(email) {
        // Simulate random failure
        if (Math.random() < 0.5) {
            throw new Error("Provider A failed to send email.");
        }
        return true;
    }
}

module.exports = EmailProviderA;
