import { Bot, LoaderCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  createMessage,
  getSocraticProvider,
  type ChatMessage,
} from '../../lib/socratic/provider.ts';

export type SocratesLaunch = {
  contextNote?: string;
  seedUserMessage?: string;
  open: boolean;
};

type SocraticAITutorProps = {
  open: boolean;
  onClose: () => void;
  contextNote?: string;
  seedUserMessage?: string;
  dark?: boolean;
  /** Верни false — лимит/paywall, сообщение не уйдёт */
  onBeforeSend?: () => boolean;
  limitHint?: string | null;
};

export function SocraticAITutor({
  open,
  onClose,
  contextNote,
  seedUserMessage,
  dark,
  onBeforeSend,
  limitHint,
}: SocraticAITutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createMessage(
      'assistant',
      'Привет, я Сократ. Кидай задачу — разберём по шагам простыми словами и дойдём до ответа вместе.',
    ),
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (!open || !seedUserMessage) return;
    if (seededRef.current === seedUserMessage) return;
    seededRef.current = seedUserMessage;
    void send(seedUserMessage, contextNote);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seedUserMessage, contextNote]);

  async function send(text: string, note = contextNote) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (onBeforeSend && !onBeforeSend()) return;
    const user = createMessage('user', trimmed);
    setMessages((prev) => [...prev, user]);
    setDraft('');
    setBusy(true);
    try {
      const reply = await getSocraticProvider().ask({
        history: [...messages, user],
        userMessage: trimmed,
        contextNote: note,
      });
      setMessages((prev) => [...prev, createMessage('assistant', reply)]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'неизвестная ошибка';
      const short = detail.replace(/\s+/g, ' ').slice(0, 220);
      setMessages((prev) => [
        ...prev,
        createMessage(
          'assistant',
          `Не смог ответить: ${short}\n\nСократ ходит через сервер (Supabase). Если снова ошибка — проверь, что функция socrates задеплоена и секрет GEMINI_API_KEY задан в проекте.`,
        ),
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const panel = dark
    ? 'border-white/10 bg-slate-950 text-slate-100'
    : 'border-slate-200 bg-white text-slate-900';
  const bubbleUser = dark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white';
  const bubbleAi = dark ? 'bg-white/8 text-slate-200 ring-1 ring-white/10' : 'bg-slate-100 text-slate-800';

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l shadow-2xl ${panel}`}
      aria-label="ИИ-ментор Сократ"
    >
      <div className="flex items-center justify-between gap-3 border-b border-inherit px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <Bot className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Сократ</p>
            <p className={`truncate text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Помогаю по шагам · простым языком
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`grid size-9 place-items-center rounded-full ${dark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
          aria-label="Закрыть Сократа"
        >
          <X className="size-4" />
        </button>
      </div>

      {contextNote && (
        <p
          className={`border-b px-4 py-2 text-xs leading-relaxed ${
            dark ? 'border-white/10 bg-amber-500/10 text-amber-100' : 'border-slate-100 bg-amber-50 text-amber-900'
          }`}
        >
          Контекст: {contextNote}
        </p>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <p
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user' ? bubbleUser : bubbleAi
              }`}
            >
              {msg.content}
            </p>
          </div>
        ))}
        {busy && (
          <p className={`inline-flex items-center gap-2 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            <LoaderCircle className="size-3.5 animate-spin" />
            Думаю над вопросом…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {limitHint && (
        <p
          className={`border-t px-4 py-2 text-xs ${
            dark ? 'border-white/10 bg-rose-500/10 text-rose-200' : 'border-slate-200 bg-rose-50 text-rose-800'
          }`}
        >
          {limitHint}
        </p>
      )}
      <form
        className={`flex gap-2 border-t p-3 ${dark ? 'border-white/10' : 'border-slate-200'}`}
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Задача или твой шаг…"
          className={`h-11 flex-1 rounded-xl px-3 text-sm outline-none ring-1 ${
            dark
              ? 'bg-white/5 text-slate-100 ring-white/10 placeholder:text-slate-500 focus:ring-indigo-400/60'
              : 'bg-slate-50 text-slate-900 ring-slate-200 placeholder:text-slate-400 focus:ring-indigo-400'
          }`}
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="grid size-11 place-items-center rounded-xl bg-indigo-600 text-white disabled:opacity-40"
          aria-label="Отправить"
        >
          <Send className="size-4" />
        </button>
      </form>
    </aside>
  );
}

/** Плавающая кнопка вызова Сократа */
export function SocratesFab({ onClick, dark }: { onClick: () => void; dark?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] ${
        dark ? 'bg-indigo-500' : 'bg-indigo-600'
      }`}
      aria-label="Открыть Сократа"
    >
      <Bot className="size-4" />
      Сократ
    </button>
  );
}
