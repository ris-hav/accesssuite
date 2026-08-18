import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../core/AuthContext';
import { ApiError } from '../core/api';
import { PasswordToggleButton } from '../components/PasswordToggleButton';
import { createUser, deleteUser, listUsers, type TeamMember } from './teamApi';

export function Team() {
  const { user } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VIEWER');

  const isValid = email.trim() !== '' && password.length >= 8;

  function load() {
    listUsers()
      .then(setMembers)
      .catch(() => setLoadError('Could not load the team.'));
  }

  useEffect(load, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!isValid) {
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await createUser(email, password, role);
      setIsSubmitting(false);
      setEmail('');
      setPassword('');
      setRole('VIEWER');
      load();
    } catch (err) {
      setIsSubmitting(false);
      setFormError(err instanceof ApiError ? err.message : 'Could not add that user.');
    }
  }

  async function removeMember(id: string) {
    setRemoveError(null);
    setRemovingId(id);
    try {
      await deleteUser(id);
      setRemovingId(null);
      load();
    } catch (err) {
      setRemovingId(null);
      setRemoveError(err instanceof ApiError ? err.message : 'Could not remove that user.');
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Team</h1>

        {loadError && <p className="text-red-600 mb-4">{loadError}</p>}
        {removeError && <p className="text-red-600 mb-4">{removeError}</p>}

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-gray-100">
                  <td className="py-2 text-gray-900">{member.email}</td>
                  <td className="py-2 text-gray-600">{member.role}</td>
                  <td className="py-2 text-right">
                    {member.id !== user?.userId && (
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        disabled={removingId === member.id}
                        className="text-sm text-red-600 hover:text-red-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {removingId === member.id ? 'Removing…' : 'Remove'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={submit}
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4"
        >
          <h2 className="font-medium text-gray-900">Add a team member</h2>

          <div>
            <label htmlFor="member-email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="member-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="member-password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="member-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <PasswordToggleButton visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
            </div>
          </div>

          <div>
            <label htmlFor="member-role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="member-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="VIEWER">Viewer</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full bg-blue-600 text-white rounded py-2 font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding…' : 'Add member'}
          </button>
        </form>
      </div>
    </div>
  );
}
