import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetStatusGeral,
  getGetStatusGeralQueryKey,
  useAtualizarSala,
} from '@workspace/api-client-react';
import {
  Activity,
  Radio,
  Volume2,
  VolumeX,
  UserCheck,
  UserX,
  Clock,
  Send,
  Wifi,
  WifiOff,
} from 'lucide-react';

function NoiseBar({ value }: { value: number | null }) {
  const pct = value !== null ? Math.min(Math.max(value, 0), 130) / 130 * 100 : 0;
  const color =
    value === null ? 'bg-muted'
    : value < 40 ? 'bg-emerald-500'
    : value < 70 ? 'bg-amber-400'
    : 'bg-red-500';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground font-mono">
        <span>0 dB</span>
        <span className="font-semibold text-foreground">
          {value !== null ? `${value} dB` : '—'}
        </span>
        <span>130 dB</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PresenceBadge({ value }: { value: boolean | null }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
        <Radio className="w-3 h-3" />
        Aguardando
      </span>
    );
  }
  if (value) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <UserCheck className="w-3 h-3" />
        Detectada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
      <UserX className="w-3 h-3" />
      Ausente
    </span>
  );
}

function formatTs(ts: string | null) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('pt-BR');
  } catch {
    return ts;
  }
}

interface SalaData {
  ruido: number | null;
  presenca: boolean | null;
  ultimaAtualizacao: string | null;
}

function RoomCard({ label, data }: { label: string; data: SalaData }) {
  const noiseIcon =
    data.ruido === null ? <VolumeX className="w-4 h-4 text-muted-foreground" />
    : data.ruido >= 70 ? <Volume2 className="w-4 h-4 text-red-400" />
    : <Volume2 className="w-4 h-4 text-primary" />;

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 flex flex-col gap-5 shadow-md hover:border-primary/40 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-primary" />
          </span>
          {label}
        </h2>
        <PresenceBadge value={data.presenca} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {noiseIcon}
          Nível de Ruído
        </div>
        <NoiseBar value={data.ruido} />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
        <Clock className="w-3 h-3 shrink-0" />
        <span>Atualizado: {formatTs(data.ultimaAtualizacao)}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isError, isLoading } = useGetStatusGeral({
    query: {
      refetchInterval: 3000,
      queryKey: getGetStatusGeralQueryKey(),
    },
  });

  const mutation = useAtualizarSala({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetStatusGeralQueryKey() });
        setFeedback('Dados enviados com sucesso!');
        setRuido('');
        setTimeout(() => setFeedback(''), 3000);
      },
      onError: () => {
        setFeedback('Erro ao enviar dados.');
        setTimeout(() => setFeedback(''), 3000);
      },
    },
  });

  const [sala, setSala] = useState('sala1');
  const [ruido, setRuido] = useState('');
  const [presenca, setPresenca] = useState('true');
  const [feedback, setFeedback] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      data: {
        sala,
        ...(ruido !== '' ? { ruido: Number(ruido) } : {}),
        presenca: presenca === 'true',
      },
    });
  }

  const isLive = !isError && !isLoading && !!data;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">Monitor de Salas</h1>
              <p className="text-xs text-muted-foreground">Atualização a cada 3 segundos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-muted border border-border">
            {isLive ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Ao vivo</span>
              </>
            ) : isLoading ? (
              <>
                <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                <span className="text-amber-400">Conectando…</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-400" />
                <span className="text-red-400">Sem conexão</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Room cards */}
        <section>
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-card-border bg-card p-6 h-52 animate-pulse" />
              ))}
            </div>
          )}
          {isError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400 text-sm">
              Não foi possível conectar à API. Verifique se o servidor está rodando.
            </div>
          )}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RoomCard label="Sala 1" data={data.sala1} />
              <RoomCard label="Sala 2" data={data.sala2} />
            </div>
          )}
        </section>

        {/* Send test data form */}
        <section className="rounded-xl border border-card-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Enviar dados de teste</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sala
              </label>
              <select
                value={sala}
                onChange={(e) => setSala(e.target.value)}
                className="bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="sala1">Sala 1</option>
                <option value="sala2">Sala 2</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ruído (dB)
              </label>
              <input
                type="number"
                min={0}
                max={130}
                placeholder="ex: 45"
                value={ruido}
                onChange={(e) => setRuido(e.target.value)}
                className="bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Presença
              </label>
              <select
                value={presenca}
                onChange={(e) => setPresenca(e.target.value)}
                className="bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="true">Detectada</option>
                <option value="false">Ausente</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
              {mutation.isPending ? 'Enviando…' : 'Enviar'}
            </button>
          </form>

          {feedback && (
            <p className={`text-xs font-medium ${feedback.includes('sucesso') ? 'text-emerald-400' : 'text-red-400'}`}>
              {feedback}
            </p>
          )}
        </section>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Monitor de Salas — dados em tempo real via API
      </footer>
    </div>
  );
}
