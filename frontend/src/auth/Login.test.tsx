import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../core/AuthContext';
import { Login } from './Login';

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Login', () => {
  it('disables the submit button until email and password are filled in', async () => {
    renderLogin();
    const submit = screen.getByRole('button', { name: /sign in/i });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/^password$/i), 'whatever');
    expect(submit).not.toBeDisabled();
  });

  it('toggles password visibility', async () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
