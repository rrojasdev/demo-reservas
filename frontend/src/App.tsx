import { useEffect, useState } from 'react';

type Court = { id: string; name: string };
type Block = { startHour: number; endHour: number; status: 'available' | 'reserved' | 'past' };
type Reservation = { id: number; courtName: string; date: string; startHour: number; endHour: number; status: string };

type ApiError = { error?: { message?: string } };

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiError;
    throw new Error(body.error?.message ?? 'No pudimos completar la operación.');
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());

export function App() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [courtId, setCourtId] = useState('laureles');
  const [date, setDate] = useState(today);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [reservations, setReservations] = useState<{ future: Reservation[]; history: Reservation[] }>({ future: [], history: [] });
  const [view, setView] = useState<'booking' | 'mine'>('booking');

  async function loadAccount() {
    try {
      const result = await api<{ user: { email: string } }>('/api/auth/me');
      setUser(result.user);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => { void loadAccount(); }, []);
  useEffect(() => {
    if (!user) return;
    void api<{ courts: Court[] }>('/api/courts').then((result) => setCourts(result.courts)).catch((cause: Error) => setError(cause.message));
  }, [user]);
  useEffect(() => {
    if (!user || view !== 'booking') return;
    void api<{ blocks: Block[] }>(`/api/courts/${courtId}/availability?date=${date}`).then((result) => setBlocks(result.blocks)).catch((cause: Error) => setError(cause.message));
  }, [courtId, date, user, view]);
  useEffect(() => {
    if (!user || view !== 'mine') return;
    void api<{ future: Reservation[]; history: Reservation[] }>('/api/reservations/me').then(setReservations).catch((cause: Error) => setError(cause.message));
  }, [user, view]);

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault(); setError('');
    try {
      const result = await api<{ user: { email: string } }>(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify({ email, password }) });
      setUser(result.user); setPassword('');
    } catch (cause) { setError((cause as Error).message); }
  }

  async function reserve(startHour: number) {
    setError('');
    try {
      await api('/api/reservations', { method: 'POST', body: JSON.stringify({ courtId, date, startHour }) });
      const result = await api<{ blocks: Block[] }>(`/api/courts/${courtId}/availability?date=${date}`);
      setBlocks(result.blocks);
    } catch (cause) { setError((cause as Error).message); }
  }

  async function cancel(id: number) {
    setError('');
    try { await api(`/api/reservations/${id}/cancel`, { method: 'POST' }); setView('mine'); }
    catch (cause) { setError((cause as Error).message); }
  }

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setUser(null); setCourts([]); setBlocks([]);
  }

  if (!user) return <main className="auth-shell"><section className="auth-card"><p className="eyebrow">CLUB PADEL · MEDELLÍN</p><h1>Reserva tu próxima cancha.</h1><p className="muted">Disponibilidad clara, turnos de una hora y control total de tus reservas.</p><form onSubmit={submitAuth}><label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="error">{error}</p>}<button type="submit">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</button></form><button className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? '¿Primera vez? Crear cuenta' : 'Ya tengo una cuenta'}</button></section></main>;

  return <main className="app-shell"><header><div><p className="eyebrow">RESERVAS · AMERICA/BOGOTA</p><h1>Hola, {user.email}</h1></div><button className="secondary" onClick={logout}>Cerrar sesión</button></header><nav><button className={view === 'booking' ? 'active' : ''} onClick={() => setView('booking')}>Disponibilidad</button><button className={view === 'mine' ? 'active' : ''} onClick={() => setView('mine')}>Mis reservas</button></nav>{error && <p className="error banner">{error}</p>}{view === 'booking' ? <section><div className="controls"><label>Cancha<select value={courtId} onChange={(event) => setCourtId(event.target.value)}>{courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}</select></label><label>Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></div><div className="legend"><span><i className="available-dot" /> Disponible</span><span><i className="reserved-dot" /> Reservado</span><span><i className="past-dot" /> Pasado</span></div><div className="grid">{blocks.map((block) => <button key={block.startHour} disabled={block.status !== 'available'} className={block.status} onClick={() => void reserve(block.startHour)}><strong>{String(block.startHour).padStart(2, '0')}:00</strong><small>{block.status === 'available' ? 'Disponible' : block.status === 'reserved' ? 'Reservado' : 'Pasado'}</small></button>)}</div></section> : <section><h2>Mis reservas</h2><div className="reservation-list"><h3>Próximas</h3>{reservations.future.length ? reservations.future.map((reservation) => <article key={reservation.id}><div><strong>{reservation.courtName}</strong><span>{reservation.date} · {String(reservation.startHour).padStart(2, '0')}:00 - {String(reservation.endHour).padStart(2, '0')}:00</span></div><button className="danger" onClick={() => void cancel(reservation.id)}>Cancelar</button></article>) : <p className="muted">No tienes reservas futuras.</p>}<h3>Historial</h3>{reservations.history.length ? reservations.history.map((reservation) => <article key={reservation.id}><div><strong>{reservation.courtName}</strong><span>{reservation.date} · {String(reservation.startHour).padStart(2, '0')}:00</span></div></article>) : <p className="muted">Aún no tienes historial.</p>}</div></section>}</main>;
}
