import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { PasswordToggleButton } from '../components/PasswordToggleButton';
import { isValidEmail } from '../core/validation';
import { ApiError } from '../core/api';

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [clientName, setClientName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    clientName.trim() !== '' && isValidEmail(adminEmail) && adminPassword.length >= 8;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!isValid) {
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signup(clientName, adminEmail, adminPassword);
      navigate('/dashboard');
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof ApiError ? err.message : 'Signup failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-8 rounded-lg shadow space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Create your company account</h1>

        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
            Company name
          </label>
          <input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            type="text"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
            Admin email
          </label>
          <input
            id="adminEmail"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            type="email"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
            Admin password
          </label>
          <div className="relative mt-1">
            <input
              id="adminPassword"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <PasswordToggleButton visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </div>
        </div>

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full bg-blue-600 text-white rounded py-2 font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-sm text-gray-500 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
