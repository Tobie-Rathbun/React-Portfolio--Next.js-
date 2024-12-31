'use client';

import React, { useState } from 'react';

const ContactForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message. Please try again later.');
      }

      const result = await response.json();
      setSuccess(result.message);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong.');
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form">
      <h1>Contact Me</h1>

      {/* Hidden Static Form for Netlify Detection */}
      <form
        name="contact"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        hidden
      >
        <input type="hidden" name="form-name" value="contact" />
        <input type="text" name="name" />
        <input type="email" name="email" />
        <textarea name="message"></textarea>
      </form>

      {/* Dynamic React Form */}
      <form
        onSubmit={handleContactSubmit}
        data-netlify="true"
        netlify-honeypot="bot-field"
        method="POST"
        name="contact"
      >
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          name="name"
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          required
        />
        <textarea
          placeholder="Your message to me"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          name="message"
          required
        ></textarea>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
        <input type="hidden" name="form-name" value="contact" />
        <input type="hidden" name="bot-field" />
      </form>
    </div>
  );
};

export default ContactForm;
