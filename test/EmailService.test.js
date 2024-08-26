// tests/EmailService.test.js
const EmailService = require('../src/EmailService');
const EmailProviderA = require('../src/EmailProviderA');
const EmailProviderB = require('../src/EmailProviderB');

jest.mock('../src/EmailProviderA');
jest.mock('../src/EmailProviderB');

describe('EmailService', () => {
    beforeEach(() => {
        EmailProviderA.mockClear();
        EmailProviderB.mockClear();
    });

    it('should send an email with Provider A on the first attempt', async () => {
        const emailService = new EmailService();
        const email = { id: '1', to: 'test@example.com', subject: 'Test', body: 'Testing' };

        EmailProviderA.prototype.sendEmail.mockResolvedValue(true);

        const result = await emailService.sendEmail(email);
        expect(result.status).toBe("Sent");
        expect(result.message).toContain("Email sent successfully via EmailProviderA.");
    });

    it('should fallback to Provider B after Provider A fails', async () => {
        const emailService = new EmailService();
        const email = { id: '2', to: 'test@example.com', subject: 'Test', body: 'Testing' };

        EmailProviderA.prototype.sendEmail.mockRejectedValue(new Error("Failed"));
        EmailProviderB.prototype.sendEmail.mockResolvedValue(true);

        const result = await emailService.sendEmail(email);
        expect(result.status).toBe("Sent");
        expect(result.message).toContain("Email sent successfully via EmailProviderB.");
    });

    it('should not send duplicate emails', async () => {
        const emailService = new EmailService();
        const email = { id: '3', to: 'test@example.com', subject: 'Test', body: 'Testing' };

        EmailProviderA.prototype.sendEmail.mockResolvedValue(true);

        await emailService.sendEmail(email);
        const result = await emailService.sendEmail(email);
        expect(result.status).toBe("AlreadySent");
        expect(result.message).toBe("Email was already sent and not re-sent.");
    });

    it('should rate limit email sending', async () => {
        const emailService = new EmailService();
        const email = { id: '4', to: 'test@example.com', subject: 'Test', body: 'Testing' };

        EmailProviderA.prototype.sendEmail.mockResolvedValue(true);

        // Send 5 emails within the limit
        for (let i = 0; i < 5; i++) {
            await emailService.sendEmail({ id: `email-${i}`, to: 'test@example.com', subject: 'Test', body: 'Testing' });
        }

        // The 6th email should be rate-limited
        const result = await emailService.sendEmail(email);
        expect(result.status).toBe("RateLimited");
        expect(result.message).toBe("Rate limit exceeded.");
    });

    it('should retry failed attempts before falling back', async () => {
        const emailService = new EmailService();
        const email = { id: '5', to: 'test@example.com', subject: 'Test', body: 'Testing' };

        // Fail twice and succeed on the third retry
        EmailProviderA.prototype.sendEmail
            .mockRejectedValueOnce(new Error("Failed"))
            .mockRejectedValueOnce(new Error("Failed"))
            .mockResolvedValue(true);

        const result = await emailService.sendEmail(email);
        expect(result.status).toBe("Sent");
        expect(result.message).toContain("Email sent successfully via EmailProviderA.");
    });

    it('should log the email sending status', async () => {
        const emailService = new EmailService();
        const email = { id: '6', to: 'test@example.com', subject: 'Test', body: 'Testing' };

        EmailProviderA.prototype.sendEmail.mockResolvedValue(true);

        await emailService.sendEmail(email);
        const logs = emailService.getLogs();
        expect(logs).toHaveLength(1);
        expect(logs[0].status).toBe("Sent");
    });
});
