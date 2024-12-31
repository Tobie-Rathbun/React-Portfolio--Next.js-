'use client';

import React, { useState } from 'react';

export const dynamic = 'force-dynamic';

const ContactForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    setSuccess(null); // Clear any previous success message
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message. Please try again later.');
      }

      setSuccess('Your message has been sent successfully!');
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
      <form 
        onSubmit={handleContactSubmit}
        data-netlify="true"
        netlify-honeypot="bot-field"
        method='POST'
        name='contact'
      >
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          placeholder="Your message to me"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
