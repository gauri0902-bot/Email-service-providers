// src/EmailService.js
const EmailProviderA = require('./EmailProviderA');
const EmailProviderB = require('./EmailProviderB');
const Logger = require('./Logger');

class EmailService {
    constructor() {
        this.providers = [new EmailProviderA(), new EmailProviderB()];
        this.sentEmails = new Set(); // Idempotency check
        this.rateLimit = 5; // Limit to 5 emails per minute
        this.emailCount = 0;
        this.startTime = Date.now();
        this.logs = [];
    }

    async sendEmail(email) {
        const { id } = email;

        // Idempotency check
        if (this.sentEmails.has(id)) {
            this.logStatus(id, "AlreadySent", "Email was already sent and not re-sent.");
            return { status: "AlreadySent", message: "Email was already sent and not re-sent." };
        }

        // Rate limiting check
        const currentTime = Date.now();
        if (currentTime - this.startTime > 60000) {
            // Reset the count every minute
            this.emailCount = 0;
            this.startTime = currentTime;
        }
        if (this.emailCount >= this.rateLimit) {
            this.logStatus(id, "RateLimited", "Rate limit exceeded.");
            return { status: "RateLimited", message: "Rate limit exceeded." };
        }

        // Try sending the email using the available providers
        for (let provider of this.providers) {
            try {
                await this.retry(() => provider.sendEmail(email), 3);
                this.sentEmails.add(id);
                this.emailCount++;
                this.logStatus(id, "Sent", `Email sent successfully via ${provider.constructor.name}.`);
                return { status: "Sent", message: `Email sent successfully via ${provider.constructor.name}.` };
            } catch (error) {
                Logger.error(`${provider.constructor.name} failed: ${error.message}`);
            }
        }

        this.logStatus(id, "Failed", "Failed to send email after retries and fallback.");
        return { status: "Failed", message: "Failed to send email after retries and fallback." };
    }

    async retry(fn, retries) {
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        let attempt = 0;

        while (attempt < retries) {
            try {
                return await fn();
            } catch (error) {
                attempt++;
                const backoff = Math.pow(2, attempt) * 100; // Exponential backoff
                await delay(backoff);
            }
        }
        throw new Error('All retries failed');
    }

    logStatus(id, status, message) {
        this.logs.push({ id, status, message, timestamp: new Date() });
        Logger.log(`Email ID: ${id}, Status: ${status}, Message: ${message}`);
    }

    getLogs() {
        return this.logs;
    }
}

module.exports = EmailService;
