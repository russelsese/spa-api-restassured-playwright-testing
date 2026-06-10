import { useState } from 'react';

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  dateOfBirth: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegistrationForm() {
  const [fields, setFields] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null); // { type: 'success' | 'error', message }
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e = {};
    if (!fields.firstName.trim()) e.firstName = 'First name is required.';
    if (!fields.lastName.trim()) e.lastName = 'Last name is required.';
    if (!fields.email.trim()) {
      e.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(fields.email)) {
      e.email = 'Enter a valid email address.';
    }
    if (!fields.password) {
      e.password = 'Password is required.';
    } else if (fields.password.length < 6) {
      e.password = 'Password must be at least 6 characters.';
    }
    if (!fields.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (fields.password !== fields.confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          email: fields.email.trim(),
          password: fields.password,
          phone: fields.phone.trim() || undefined,
          dateOfBirth: fields.dateOfBirth || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: 'error', message: data.error || 'Registration failed.' });
      } else {
        setBanner({ type: 'success', message: 'Registration successful!' });
        setFields(INITIAL);
        setErrors({});
      }
    } catch {
      setBanner({ type: 'error', message: 'Could not connect to the server. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h1>Create Account</h1>

      {banner && (
        <div className={`banner banner--${banner.type}`} role="alert">
          {banner.message}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="field">
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={fields.firstName}
              onChange={handleChange}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && <span id="firstName-error" className="field-error">{errors.firstName}</span>}
          </div>

          <div className="field">
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={fields.lastName}
              onChange={handleChange}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && <span id="lastName-error" className="field-error">{errors.lastName}</span>}
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && <span id="email-error" className="field-error">{errors.email}</span>}
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={fields.password}
              onChange={handleChange}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && <span id="password-error" className="field-error">{errors.password}</span>}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={fields.confirmPassword}
              onChange={handleChange}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            {errors.confirmPassword && <span id="confirmPassword-error" className="field-error">{errors.confirmPassword}</span>}
          </div>
        </div>

        <div className="field">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={fields.phone}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={fields.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? 'Registering…' : 'Register'}
        </button>
      </form>
    </div>
  );
}
