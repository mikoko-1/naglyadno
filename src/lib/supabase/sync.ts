import type { GradeId } from '../../curriculum/types.ts';
import {
  defaultAccount,
  refreshUsageDay,
  saveAccount,
  type AccountRole,
  type AccountState,
  type ActivityDay,
  type DayUsage,
  normalizePlanId,
} from '../account/storage.ts';
import { saveProgress, type ProgressState } from '../progress/storage.ts';
import { saveYearProgress, type YearProgressState } from '../year/progress.ts';
import { getSupabase, isSupabaseConfigured } from './client.ts';

export type CloudBundle = {
  account: AccountState;
  progress: ProgressState;
  year: YearProgressState;
};

function asRole(v: unknown): AccountRole {
  return v === 'parent' ? 'parent' : 'student';
}

function asGrade(v: unknown): GradeId {
  const n = Number(v);
  if (n === 5 || n === 6 || n === 7 || n === 8 || n === 9) return n;
  return 6;
}

function profileToAccount(row: Record<string, unknown>): AccountState {
  const base = defaultAccount();
  return refreshUsageDay({
    ...base,
    onboardingDone: Boolean(row.onboarding_done),
    grade: asGrade(row.grade),
    displayName: typeof row.display_name === 'string' ? row.display_name : '',
    email: typeof row.email === 'string' ? row.email : '',
    role: asRole(row.role),
    plan: normalizePlanId(row.plan),
    planExpiresAt: typeof row.plan_expires_at === 'string' ? row.plan_expires_at : undefined,
    trialEndsAt: typeof row.trial_ends_at === 'string' ? row.trial_ends_at : undefined,
    usage: (row.usage as DayUsage) ?? base.usage,
    activity: Array.isArray(row.activity) ? (row.activity as ActivityDay[]) : [],
    baseline: (row.baseline as AccountState['baseline']) ?? undefined,
    lastSyncAt: new Date().toISOString(),
  });
}

function accountToProfile(account: AccountState) {
  return {
    display_name: account.displayName,
    email: account.email,
    grade: account.grade,
    role: account.role,
    plan: account.plan,
    plan_expires_at: account.planExpiresAt ?? null,
    trial_ends_at: account.trialEndsAt ?? null,
    usage: account.usage,
    activity: account.activity,
    baseline: account.baseline ?? null,
    onboarding_done: account.onboardingDone,
    updated_at: new Date().toISOString(),
  };
}

export async function getSessionUserId(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function pullCloudState(): Promise<CloudBundle | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const userId = await getSessionUserId();
  if (!userId) return null;

  const [profileRes, progressRes, yearRes] = await Promise.all([
    sb.from('profiles').select('*').eq('id', userId).maybeSingle(),
    sb.from('progress_snapshots').select('*').eq('user_id', userId).maybeSingle(),
    sb.from('year_progress').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  if (profileRes.error || progressRes.error || yearRes.error) {
    console.warn('[supabase] pull failed', profileRes.error ?? progressRes.error ?? yearRes.error);
    return null;
  }

  const account = profileRes.data
    ? profileToAccount(profileRes.data as Record<string, unknown>)
    : defaultAccount();

  const progress: ProgressState = progressRes.data
    ? {
        streak: Number(progressRes.data.streak) || 0,
        soundOn: progressRes.data.sound_on !== false,
        results: (progressRes.data.results as ProgressState['results']) ?? {},
      }
    : { streak: 0, soundOn: true, results: {} };

  const year: YearProgressState = yearRes.data
    ? {
        version: 1,
        byGrade: (yearRes.data.by_grade as YearProgressState['byGrade']) ?? {},
      }
    : { version: 1, byGrade: {} };

  saveAccount(account);
  saveProgress(progress);
  saveYearProgress(year);

  return { account, progress, year };
}

export async function pushCloudState(bundle: CloudBundle): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase не настроен' };
  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: 'Нужен вход' };

  const { account, progress, year } = bundle;
  const stamped = { ...account, lastSyncAt: new Date().toISOString() };

  const [p1, p2, p3] = await Promise.all([
    sb.from('profiles').upsert({ id: userId, ...accountToProfile(stamped) }),
    sb.from('progress_snapshots').upsert({
      user_id: userId,
      streak: progress.streak,
      sound_on: progress.soundOn,
      results: progress.results,
      updated_at: new Date().toISOString(),
    }),
    sb.from('year_progress').upsert({
      user_id: userId,
      by_grade: year.byGrade,
      updated_at: new Date().toISOString(),
    }),
  ]);

  const err = p1.error ?? p2.error ?? p3.error;
  if (err) {
    console.warn('[supabase] push failed', err);
    return { ok: false, error: err.message };
  }

  saveAccount(stamped);
  return { ok: true };
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pending: CloudBundle | null = null;

/** Debounce push — не долбить API на каждый клик. */
export function scheduleCloudPush(bundle: CloudBundle, delayMs = 800) {
  if (!isSupabaseConfigured()) return;
  pending = bundle;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    const next = pending;
    pending = null;
    pushTimer = null;
    if (!next) return;
    void getSessionUserId().then((id) => {
      if (!id) return;
      void pushCloudState(next);
    });
  }, delayMs);
}

export async function signUp(email: string, password: string, displayName: string) {
  const sb = getSupabase();
  if (!sb) return { error: 'Добавь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env' };
  const { data, error } = await sb.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName.trim() } },
  });
  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}

export async function signIn(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) return { error: 'Добавь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env' };
  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}

export async function signOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

export function onAuthChange(cb: (userId: string | null) => void) {
  const sb = getSupabase();
  if (!sb) return () => undefined;
  const { data } = sb.auth.onAuthStateChange((_event, session) => {
    cb(session?.user.id ?? null);
  });
  return () => data.subscription.unsubscribe();
}
