// Noted — authentication + account store.
//
// Uses Supabase when configured, and falls back to an in-browser store so the
// prototype is fully demoable out of the box. To point this at a real Supabase
// project, paste your URL + anon key into supabase-config.js (which sets
// window.NOTED_SUPABASE_URL / window.NOTED_SUPABASE_ANON_KEY before this script
// loads). Two tables back it, both with row-level security so each user can
// read/write only their own rows:
//
//   profiles — the user's information, keyed by their auth user id
//   entries  — their saved logs / check-ins / PROM results (payload jsonb)
//
// The full DDL + RLS policies are in supabase-schema.sql; run it once in the
// Supabase SQL editor.

(function () {
  // ---- Configuration -------------------------------------------------------
  const SUPABASE_URL = window.NOTED_SUPABASE_URL || 'YOUR_SUPABASE_URL';
  const SUPABASE_ANON_KEY = window.NOTED_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

  const hasLib = !!(window.supabase && window.supabase.createClient);
  const configured = hasLib
    && /^https?:\/\//.test(SUPABASE_URL)
    && typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY.length > 20;

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---- Real Supabase backend ----------------------------------------------
  let client = null;
  if (configured) client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function rowToProfile(row) {
    if (!row) return null;
    return {
      name: row.name, firstName: row.first_name, age: row.age,
      gender: row.gender, conditions: row.conditions || [],
      medications: row.medications || [], allergies: row.allergies || [],
      note: row.note || '',
    };
  }

  const supa = {
    mode: 'supabase',
    async signUp({ email, password, name }) {
      const { data, error } = await client.auth.signUp({
        email, password, options: { data: { name } },
      });
      if (error) throw new Error(error.message);
      const user = data.user;
      if (user) {
        await client.from('profiles')
          .upsert({ id: user.id, email, name, first_name: (name || '').split(' ')[0] });
      }
      return { id: user && user.id, email, name };
    },
    async signIn({ email, password }) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      const user = data.user;
      let profile = null;
      try {
        const { data: row } = await client.from('profiles').select('*').eq('id', user.id).single();
        profile = rowToProfile(row);
      } catch (e) { /* no row yet */ }
      return { id: user.id, email: user.email, name: (profile && profile.name) || (user.user_metadata || {}).name, profile };
    },
    async signOut() { await client.auth.signOut(); },
    async getSession() {
      const { data } = await client.auth.getSession();
      const s = data && data.session;
      if (!s) return null;
      const user = s.user;
      let profile = null;
      try {
        const { data: row } = await client.from('profiles').select('*').eq('id', user.id).single();
        profile = rowToProfile(row);
      } catch (e) { /* no row yet */ }
      return { id: user.id, email: user.email, name: (profile && profile.name) || (user.user_metadata || {}).name, profile };
    },
    async saveProfile(userId, profile) {
      if (!userId) return;
      await client.from('profiles').upsert({
        id: userId, name: profile.name, first_name: profile.firstName, age: profile.age,
        gender: profile.gender, conditions: profile.conditions, medications: profile.medications,
        allergies: profile.allergies, note: profile.note, updated_at: new Date().toISOString(),
      });
    },
    // ---- Entries: symptom logs, check-ins, PROM results --------------------
    async listEntries(userId, kind = 'log') {
      if (!userId) return [];
      const { data, error } = await client.from('entries')
        .select('payload').eq('user_id', userId).eq('kind', kind)
        .order('logged_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map((r) => r.payload);
    },
    async saveEntry(userId, entry) {
      if (!userId || !entry || !entry.id) return;
      const kind = entry.kind || 'log';
      const payload = { kind, ...entry };
      const { error } = await client.from('entries').upsert({
        id: entry.id, user_id: userId, kind, payload,
        logged_at: entry.dateKey || entry.date || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,id' });
      if (error) throw new Error(error.message);
    },
    async deleteEntry(userId, id) {
      if (!userId || !id) return;
      await client.from('entries').delete().eq('user_id', userId).eq('id', id);
    },
  };

  // ---- In-browser mock backend (prototype default) -------------------------
  const LS_USERS = 'noted.auth.users';
  const LS_SESSION = 'noted.auth.session';
  const readUsers = () => { try { return JSON.parse(localStorage.getItem(LS_USERS)) || {}; } catch (e) { return {}; } };
  const writeUsers = (u) => localStorage.setItem(LS_USERS, JSON.stringify(u));
  const norm = (e) => (e || '').trim().toLowerCase();

  const mock = {
    mode: 'mock',
    async signUp({ email, password, name }) {
      await delay(550);
      email = norm(email);
      const users = readUsers();
      if (users[email]) throw new Error('An account already exists with this email. Try logging in instead.');
      const id = 'u_' + Math.random().toString(36).slice(2, 10);
      users[email] = {
        id, email, password, name,
        profile: { name, firstName: (name || '').split(' ')[0] },
      };
      writeUsers(users);
      localStorage.setItem(LS_SESSION, email);
      return { id, email, name };
    },
    async signIn({ email, password }) {
      await delay(550);
      email = norm(email);
      const users = readUsers();
      const u = users[email];
      if (!u) throw new Error('We couldn’t find an account with this email.');
      if (u.password !== password) throw new Error('That password isn’t right. Try again.');
      localStorage.setItem(LS_SESSION, email);
      return { id: u.id, email, name: u.name, profile: u.profile || null };
    },
    async signOut() { await delay(150); localStorage.removeItem(LS_SESSION); },
    async getSession() {
      const email = localStorage.getItem(LS_SESSION);
      if (!email) return null;
      const u = readUsers()[email];
      if (!u) return null;
      return { id: u.id, email, name: u.name, profile: u.profile || null };
    },
    async saveProfile(userId, profile) {
      const email = localStorage.getItem(LS_SESSION);
      if (!email) return;
      const users = readUsers();
      if (users[email]) {
        users[email].profile = { ...(users[email].profile || {}), ...profile };
        writeUsers(users);
      }
    },
    // ---- Entries (per-user, persisted in localStorage) ---------------------
    async listEntries(userId, kind = 'log') {
      if (!userId) return [];
      let all = [];
      try { all = JSON.parse(localStorage.getItem('noted.entries.' + userId)) || []; } catch (e) { all = []; }
      return all.filter((e) => (e.kind || 'log') === kind);
    },
    async saveEntry(userId, entry) {
      if (!userId || !entry || !entry.id) return;
      const key = 'noted.entries.' + userId;
      let all = [];
      try { all = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { all = []; }
      const withKind = { kind: 'log', ...entry };
      all = all.filter((e) => e.id !== entry.id); // upsert
      all.unshift(withKind);
      localStorage.setItem(key, JSON.stringify(all));
    },
    async deleteEntry(userId, id) {
      if (!userId || !id) return;
      const key = 'noted.entries.' + userId;
      let all = [];
      try { all = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { all = []; }
      localStorage.setItem(key, JSON.stringify(all.filter((e) => e.id !== id)));
    },
  };

  window.NotedAuth = configured ? supa : mock;
})();
