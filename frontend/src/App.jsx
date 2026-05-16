import { useEffect, useMemo, useState } from 'react';
import { apiRequest, clearSession, loadSession, saveSession } from './api.js';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'USER'
};

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(emptyForm);
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  useEffect(() => {
    if (session) {
      loadUsers();
    }
  }, [session]);

  async function loadUsers() {
    setError('');
    try {
      const data = await apiRequest('/users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
    const payload = authMode === 'login'
      ? { email: authForm.email, password: authForm.password }
      : authForm;

    try {
      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      saveSession(data);
      setSession(loadSession());
      setAuthForm(emptyForm);
      setStatus(`Signed in as ${data.name}`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUserSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    const payload = {
      ...userForm,
      password: userForm.password.trim()
    };

    if (isEditing && !payload.password) {
      delete payload.password;
    }

    try {
      await apiRequest(isEditing ? `/users/${editingId}` : '/users', {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setUserForm(emptyForm);
      setEditingId(null);
      setStatus(isEditing ? 'User updated' : 'User created');
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteUser(id) {
    setError('');
    setStatus('');

    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      setStatus('User deleted');
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  function editUser(user) {
    setEditingId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
  }

  function signOut() {
    clearSession();
    setSession(null);
    setUsers([]);
    setStatus('');
    setError('');
  }

  if (!session) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <div>
            <p className="eyebrow">Spring Boot + JWT + Postgres</p>
            <h1>User Management</h1>
            <p className="lede">Sign in or create the first account to manage users in the database.</p>
          </div>

          <div className="tabs">
            <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Login</button>
            <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Register</button>
          </div>

          <form onSubmit={handleAuthSubmit} className="form">
            {authMode === 'register' && (
              <label>
                Name
                <input value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
              </label>
            )}
            <label>
              Email
              <input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
            </label>
            <label>
              Password
              <input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required minLength={6} />
            </label>
            {error && <p className="error">{error}</p>}
            {status && <p className="success">{status}</p>}
            <button className="primary" type="submit">{authMode === 'login' ? 'Login' : 'Create Account'}</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Authenticated CRUD app</p>
          <h1>User Management</h1>
        </div>
        <div className="session">
          <span>{session.user.name}</span>
          <button onClick={signOut}>Sign out</button>
        </div>
      </header>

      <section className="workspace">
        <form onSubmit={handleUserSubmit} className="form editor">
          <h2>{isEditing ? 'Edit user' : 'Add user'}</h2>
          <label>
            Name
            <input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required={!isEditing}
              minLength={isEditing && userForm.password.length === 0 ? undefined : 6}
              placeholder={isEditing ? 'Leave blank to keep current password' : ''}
            />
          </label>
          <label>
            Role
            <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <div className="actions">
            <button className="primary" type="submit">{isEditing ? 'Save changes' : 'Add user'}</button>
            {isEditing && (
              <button type="button" onClick={() => { setEditingId(null); setUserForm(emptyForm); }}>
                Cancel
              </button>
            )}
          </div>
          {error && <p className="error">{error}</p>}
          {status && <p className="success">{status}</p>}
        </form>

        <section className="users-panel">
          <div className="panel-heading">
            <h2>Users</h2>
            <button onClick={loadUsers}>Refresh</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className="role">{user.role}</span></td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="row-actions">
                      <button onClick={() => editUser(user)}>Edit</button>
                      <button className="danger" onClick={() => deleteUser(user.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty">No users yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
