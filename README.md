# Email-service-providers
This project is a resilient email sending service built using Node.js and Express. The service integrates two mock email providers and implements key features like retry logic with exponential backoff, fallback between providers, idempotency to prevent duplicate sends, rate limiting, and status tracking. Additional features like a basic logging system are also included.

Features
Retry Mechanism: The service attempts to resend emails with exponential backoff if a provider fails.
Fallback: If the primary email provider fails, the service will fallback to a secondary provider.
Idempotency: Prevents duplicate emails from being sent by checking the email's unique ID.
Rate Limiting: Limits the number of emails that can be sent per minute.
Status Tracking: Logs the status of each email sent, including success, failure, rate limiting, and duplicates.
Basic Logging: Logs important actions and errors.

1.----Get email---
curl --location 'http://localhost:3000/email-logs' \
--data ''
2.---post email---
curl --location 'http://localhost:3000/send-email' \
--header 'Content-Type: application/json' \
--data-raw '{
  "id": "email-id-7",
  "to": "sejal@example.com",
  "subject": "Test Email",
  "body": "This is a test email."
}

3.Duplicate
curl --location 'http://localhost:3000/send-email' \
--header 'Content-Type: application/json' \
--data-raw '{
  "id": "email-id-7",
  "to": "sejal@example.com",
  "subject": "Test Email",
  "body": "This is a test email."
}

{
    "status": "AlreadySent",
    "message": "Email was already sent and not re-sent."
}
'
4.Fallback Mechanism
curl --location 'http://localhost:3000/send-email' \
--header 'Content-Type: application/json' \
--data-raw '{
  "id": "email-id-34",
  "to": "rani1@example.com",
  "subject": "Test Email",
  "body": "This is a test email."
}
{
    "status": "Sent",
    "message": "Email sent successfully via EmailProviderB."
}
5.Rate Limiting
curl --location 'http://localhost:3000/send-email' \
--header 'Content-Type: application/json' \
--data-raw '{
  "id": "email-id-42",
  "to": "rani1@example.com",
  "subject": "Test Email",
  "body": "This is a test email."
}
{
    "status": "Failed",
    "message": "Failed to send email after retries and fallback."
}
