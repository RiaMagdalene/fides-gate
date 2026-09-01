import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, ArrowUpRight, BarChart3, Bell, Bot, Check, CheckCircle2,
  ChevronRight, CircleHelp, Clipboard, Copy, Database,
  FileCheck2, Fingerprint, KeyRound, Layers3, LockKeyhole,
  Menu, Moon, Network, Play, Radio, RefreshCw, RotateCcw, ScanLine, Search,
  Settings2, Shield, ShieldAlert, ShieldCheck, SlidersHorizontal,
  Sun, UploadCloud, UsersRound, X, XCircle, Zap
} from 'lucide-react';
import {
  getGetAnalyticsQueryKey, getGetCrawlersQueryKey, getGetDashboardQueryKey,
  getGetLedgerQueryKey, getGetPoliciesQueryKey, getGetRequestsQueryKey,
  getHealthCheckQueryKey, useGetAnalytics, useGetCrawlers, useGetDashboard, useGetLedger,
  useGetPolicies, useGetRequests, useHealthCheck,
  useResetDemo, useScanCanary, useSimulateRag, useSimulateSearch, useSimulateSpoof,
  useSimulateTraining, useUpdatePolicies
} from '@workspace/api-client-react';
import type {
  Analytics, CanaryScanResult, Crawler, Dashboard, LedgerEvent, Policy, RequestEvent,
  SimulationResult
} from '@workspace/api-client-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const fallbackCrawlers: Crawler[] = [
  { id: 'gptbot', name: 'GPTBot', key: 'ed25519:8fc1…a40e', status: 'verified', purpose: 'Search + RAG', trustScore: 94, requests: 1248, lastSeen: '18 sec ago', accent: 'mint' },
  { id: 'claudebot', name: 'ClaudeBot', key: 'ed25519:1db4…7c29', status: 'verified', purpose: 'RAG retrieval', trustScore: 98, requests: 892, lastSeen: '42 sec ago', accent: 'indigo' },
  { id: 'perplexitybot', name: 'PerplexityBot', key: 'ed25519:3a11…2d8f', status: 'verified', purpose: 'Search', trustScore: 88, requests: 436, lastSeen: '2 min ago', accent: 'cyan' },
  { id: 'unknown', name: 'Unknown / Spoofed', key: 'signature: absent', status: 'unverified', purpose: 'Declared RAG', trustScore: 12, requests: 61, lastSeen: '4 min ago', accent: 'red' },
];

const fallbackRequests: RequestEvent[] = [
  { id: 'req-8f2a', timestamp: new Date(Date.now() - 18000).toISOString(), crawlerId: 'gptbot', crawlerName: 'GPTBot', intent: 'SEARCH', identity: 'VERIFIED', tier: 'SNIPPET', status: 200, evidenceHash: 'sha256:4b92…e1c0', trustScore: 94, action: 'Allowed', location: 'us-east-1' },
  { id: 'req-8f29', timestamp: new Date(Date.now() - 42000).toISOString(), crawlerId: 'claudebot', crawlerName: 'ClaudeBot', intent: 'RAG', identity: 'VERIFIED', tier: 'FULL + CANARY', status: 200, evidenceHash: 'sha256:b812…9d33', trustScore: 98, action: 'Allowed', location: 'eu-west-1' },
  { id: 'req-8f28', timestamp: new Date(Date.now() - 91000).toISOString(), crawlerId: 'unknown', crawlerName: 'Unknown / Spoofed', intent: 'RAG', identity: 'INVALID', tier: 'STRICTEST', status: 403, evidenceHash: 'sha256:0e71…41a8', trustScore: 12, action: 'Downgraded', location: 'ap-southeast-1' },
  { id: 'req-8f27', timestamp: new Date(Date.now() - 144000).toISOString(), crawlerId: 'perplexitybot', crawlerName: 'PerplexityBot', intent: 'SEARCH', identity: 'VERIFIED', tier: 'SNIPPET', status: 200, evidenceHash: 'sha256:81fd…31a2', trustScore: 88, action: 'Allowed', location: 'us-west-2' },
  { id: 'req-8f26', timestamp: new Date(Date.now() - 210000).toISOString(), crawlerId: 'claudebot', crawlerName: 'ClaudeBot', intent: 'TRAINING', identity: 'VERIFIED', tier: 'LICENSE GATE', status: 402, evidenceHash: 'sha256:bb2e…8f04', trustScore: 98, action: 'License required', location: 'eu-west-1' },
];

const fallbackPolicies: Policy[] = [
  { intent: 'SEARCH', label: 'Search indexing', action: 'SNIPPET', description: 'Title, metadata, and a short content excerpt.', enabled: true, tone: 'mint' },
  { intent: 'RAG', label: 'Verified RAG', action: 'FULL + CANARY', description: 'Full content with session canary and secondary watermark.', enabled: true, tone: 'indigo' },
  { intent: 'TRAINING', label: 'Model training', action: 'HTTP 402', description: 'Machine-readable licensing terms. No content payload.', enabled: true, tone: 'amber' },
  { intent: 'UNKNOWN', label: 'Unverified identity', action: 'STRICTEST', description: 'Never trust declared intent without a valid signature.', enabled: true, tone: 'red' },
];

const fallbackLedger: LedgerEvent[] = [
  { id: 'evt-0441', event: 'REQUEST_VERIFIED', crawler: 'ClaudeBot', publisher: 'Northstar Review', intent: 'RAG', timestamp: new Date(Date.now() - 42000).toISOString(), action: 'FULL + CANARY', violation: 'none', hash: '9d33a7c1…e4f2', previousHash: 'b4e821aa…1c08', status: 'confirmed' },
  { id: 'evt-0440', event: 'IDENTITY_REJECTED', crawler: 'Unknown / Spoofed', publisher: 'Northstar Review', intent: 'RAG', timestamp: new Date(Date.now() - 91000).toISOString(), action: 'DOWNGRADED', violation: 'invalid signature', hash: '41a8c9f2…0d17', previousHash: '81fd2190…a29c', status: 'confirmed' },
  { id: 'evt-0439', event: 'REQUEST_VERIFIED', crawler: 'GPTBot', publisher: 'Northstar Review', intent: 'SEARCH', timestamp: new Date(Date.now() - 180000).toISOString(), action: 'SNIPPET', violation: 'none', hash: 'e4f2b9a1…7c50', previousHash: 'a1289f11…4d81', status: 'confirmed' },
  { id: 'evt-0438', event: 'LICENSE_GATE', crawler: 'ClaudeBot', publisher: 'Northstar Review', intent: 'TRAINING', timestamp: new Date(Date.now() - 330000).toISOString(), action: 'HTTP 402', violation: 'license required', hash: 'a1289f11…4d81', previousHash: 'c00f1e92…b53a', status: 'confirmed' },
];

const fallbackAnalytics: Analytics = {
  volume: [{ label: 'Mon', value: 142 }, { label: 'Tue', value: 184 }, { label: 'Wed', value: 168 }, { label: 'Thu', value: 221 }, { label: 'Fri', value: 204 }, { label: 'Sat', value: 238 }, { label: 'Sun', value: 267 }],
  intent: [{ label: 'SEARCH', value: 531 }, { label: 'RAG', value: 308 }, { label: 'TRAINING', value: 141 }, { label: 'UNKNOWN', value: 61 }],
  hourly: [{ label: '00', value: 12 }, { label: '04', value: 8 }, { label: '08', value: 31 }, { label: '12', value: 44 }, { label: '16', value: 38 }, { label: '20', value: 26 }],
  trustLeaderboard: [{ name: 'ClaudeBot', score: 98, requests: 892, violations: 0, status: 'verified' }, { name: 'GPTBot', score: 94, requests: 1248, violations: 2, status: 'verified' }, { name: 'PerplexityBot', score: 88, requests: 436, violations: 3, status: 'verified' }, { name: 'Unknown / Spoofed', score: 12, requests: 61, violations: 17, status: 'unverified' }],
  violations: [{ label: 'Invalid signature', value: 17 }, { label: 'Intent mismatch', value: 8 }, { label: 'Canary reuse', value: 4 }, { label: 'Rate anomaly', value: 2 }],
};

const fallbackDashboard: Dashboard = {
  summary: { totalRequests: 2041, verified: 1764, fallback: 61, canaryDetections: 4, activeCrawlers: 4, trustScore: 91, blocked: 22 },
  requests: fallbackRequests, ledger: fallbackLedger, policies: fallbackPolicies, crawlers: fallbackCrawlers,
  canary: { status: 'armed', crawler: 'ClaudeBot', session: 'sess_7fa2…cc18', confidence: 0.96, matchedSignals: ['extended → expanded', 'civic → public', 'ledger → record'] },
};

const timeAgo = (value: string) => {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  if (diff < 60000) return `${Math.max(1, Math.floor(diff / 1000))}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
};

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

function useLiveData() {
  const healthQuery = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 15000 } });
  const dashboardQuery = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey(), refetchInterval: 8000 } });
  const requestsQuery = useGetRequests({ query: { queryKey: getGetRequestsQueryKey(), refetchInterval: 8000 } });
  const crawlersQuery = useGetCrawlers({ query: { queryKey: getGetCrawlersQueryKey(), refetchInterval: 15000 } });
  const analyticsQuery = useGetAnalytics({ query: { queryKey: getGetAnalyticsQueryKey(), refetchInterval: 30000 } });
  const ledgerQuery = useGetLedger({ query: { queryKey: getGetLedgerQueryKey(), refetchInterval: 8000 } });
  const policiesQuery = useGetPolicies({ query: { queryKey: getGetPoliciesQueryKey(), refetchInterval: 30000 } });
  return {
    dashboard: dashboardQuery.data ?? fallbackDashboard,
    requests: requestsQuery.data ?? fallbackRequests,
    crawlers: crawlersQuery.data ?? fallbackCrawlers,
    analytics: analyticsQuery.data ?? fallbackAnalytics,
    ledger: ledgerQuery.data ?? fallbackLedger,
    policies: policiesQuery.data ?? fallbackPolicies,
    health: healthQuery.data,
    loading: dashboardQuery.isLoading && requestsQuery.isLoading,
    error: dashboardQuery.isError || requestsQuery.isError,
  };
}

function App() {
  useEffect(() => {
    const stored = localStorage.getItem('fides-theme');
    document.documentElement.classList.toggle('dark', stored !== 'light');
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <ErrorBoundary>
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route component={ConsoleShell} />
            </Switch>
          </ErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" data-testid="link-brand" className="flex items-center gap-3 group">
    <span className={cx('relative grid h-9 w-9 place-items-center rounded-xl border', light ? 'border-white/20 bg-white/10' : 'border-primary/40 bg-primary/10')}>
      <ShieldCheck size={20} className={light ? 'text-primary' : 'text-primary'} />
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
    </span>
    <span><span className={cx('block font-display text-[13px] tracking-[0.14em]', light ? 'text-white' : 'text-foreground')}>FIDES GATE</span><span className="block font-mono-app text-[9px] tracking-[0.16em] text-muted-foreground">VERIFICATION INFRA</span></span>
  </Link>;
}

const navItems = [
  { href: '/dashboard', label: 'Control room', icon: Activity },
  { href: '/requests', label: 'Request stream', icon: Radio },
  { href: '/crawlers', label: 'Crawler registry', icon: Bot },
  { href: '/policies', label: 'Intent policies', icon: SlidersHorizontal },
  { href: '/analytics', label: 'Threat analytics', icon: BarChart3 },
  { href: '/canary', label: 'Canary detector', icon: ScanLine },
  { href: '/ledger', label: 'Public ledger', icon: Database },
  { href: '/architecture', label: 'Architecture', icon: Network },
];

function ConsoleShell() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const live = useLiveData();
  const active = location === '/' ? '/dashboard' : location;
  return <div className="noise flex min-h-[100dvh] bg-background">
    <aside className={cx('fixed inset-y-0 left-0 z-40 flex w-[268px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 transition-transform duration-300 lg:static lg:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
      <div className="mb-8 flex items-center justify-between px-2"><Brand light /><button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground/60 lg:hidden" data-testid="button-close-sidebar"><X size={18} /></button></div>
      <div className="mb-4 px-3 font-mono-app text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/45">Operations</div>
      <nav className="space-y-1" aria-label="Primary navigation">
        {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} data-testid={`link-nav-${href.slice(1)}`} className={cx('group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors', active === href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground')}>
          <Icon size={16} className={active === href ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-primary'} /><span>{label}</span>{href === '/ledger' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />}
        </Link>)}
      </nav>
      <div className="mt-auto space-y-3">
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-3">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-sidebar-foreground"><span className="h-2 w-2 animate-pulse-soft rounded-full bg-primary" /> Ledger is live</div>
          <div className="font-mono-app text-[10px] leading-5 text-sidebar-foreground/45">Block height <span className="text-sidebar-foreground/75">#00,004,441</span><br />Chain integrity <span className="text-primary">100.00%</span></div>
        </div>
        <Link href="/settings" data-testid="link-nav-settings" className={cx('flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px]', active === '/settings' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent')}>
          <Settings2 size={16} /><span>Settings</span><ChevronRight size={14} className="ml-auto opacity-40" />
        </Link>
        <div className="flex items-center gap-3 border-t border-sidebar-border px-3 pt-4"><div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary/80 to-accent/80 font-display text-[10px] text-primary-foreground">NR</div><div className="min-w-0"><div className="truncate text-[12px] font-medium text-sidebar-foreground">Northstar Review</div><div className="font-mono-app text-[9px] text-sidebar-foreground/45">publisher / owner</div></div><CircleHelp size={15} className="ml-auto text-sidebar-foreground/35" /></div>
      </div>
    </aside>
    {mobileOpen && <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden" data-testid="button-backdrop" />}
    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border/70 bg-background/80 px-5 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden" data-testid="button-open-sidebar"><Menu size={20} /></button><div className="hidden h-5 w-px bg-border sm:block" /><div className="font-mono-app text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{active === '/dashboard' ? 'Publisher control room' : active.replace('/', '').replace('-', ' ')}</div></div>
        <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 font-mono-app text-[10px] text-primary sm:flex"><span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />LIVE MONITORING</div><button className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary" onClick={() => alert('No new alerts. All ledger events are accounted for.')} data-testid="button-notifications"><Bell size={17} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" /></button><div className="h-7 w-7 rounded-full border border-primary/30 bg-primary/10 text-center font-display text-[9px] leading-7 text-primary">NR</div></div>
      </header>
      <div className="mx-auto w-full max-w-[1480px] p-5 sm:p-8">{live.loading ? <PageSkeleton /> : live.error ? <ErrorState onRetry={() => queryClient.invalidateQueries()} /> : <ConsoleRoutes data={live} />}</div>
    </main>
  </div>;
}

function ConsoleRoutes({ data }: { data: ReturnType<typeof useLiveData> }) {
  return <Switch>
    <Route path="/dashboard"><DashboardPage data={data.dashboard} /></Route>
    <Route path="/requests"><RequestsPage requests={data.requests} /></Route>
    <Route path="/crawlers"><CrawlersPage crawlers={data.crawlers} /></Route>
    <Route path="/policies"><PoliciesPage policies={data.policies} /></Route>
    <Route path="/analytics"><AnalyticsPage analytics={data.analytics} /></Route>
    <Route path="/canary"><CanaryPage initial={data.dashboard.canary} /></Route>
    <Route path="/ledger"><LedgerPage ledger={data.ledger} /></Route>
    <Route path="/architecture"><ArchitecturePage /></Route>
    <Route path="/settings"><SettingsPage /></Route>
    <Route component={NotFound} />
  </Switch>;
}

function PageSkeleton() {
  return <div className="space-y-6"><div className="h-10 w-72 animate-pulse rounded-xl bg-secondary" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-secondary" />)}</div><div className="grid gap-4 lg:grid-cols-3"><div className="h-96 animate-pulse rounded-2xl bg-secondary lg:col-span-2" /><div className="h-96 animate-pulse rounded-2xl bg-secondary" /></div></div>;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="flex min-h-[55vh] flex-col items-center justify-center text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive"><ShieldAlert size={26} /></div><h2 className="font-display text-sm">CONNECTION INTERRUPTED</h2><p className="mt-2 max-w-sm text-sm text-muted-foreground">The verification stream could not be reached. Your local view is safe, but live data is paused.</p><button onClick={onRetry} data-testid="button-retry" className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><RefreshCw size={14} className="mr-2 inline" />Retry connection</button></div>;
}

function SectionHeading({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 font-mono-app text-[10px] uppercase tracking-[0.18em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{eyebrow}</div><h1 className="font-display text-xl tracking-tight sm:text-2xl">{title}</h1>{detail && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{detail}</p>}</div><div className="flex items-center gap-4">{eyebrow.startsWith('Signals') && <AnalyticsHeaderChart />}{action}</div></div>;
}

function AnalyticsHeaderChart() {
  return <div className="hidden h-9 w-28 sm:block" data-testid="chart-analytics-sparkline">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={fallbackAnalytics.volume}>
        <defs><linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#spark-fill)" strokeWidth={1.5} />
        <ChartTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
      </AreaChart>
    </ResponsiveContainer>
  </div>;
}

function MetricCard({ label, value, note, icon: Icon, accent = 'primary', trend }: { label: string; value: string | number; note: string; icon: typeof Activity; accent?: string; trend?: string }) {
  return <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={{ y: -3 }}
    className="glass-card group rounded-2xl p-5"
    data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}
  >
    <div className="mb-7 flex items-start justify-between"><span className="font-mono-app text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span><span className={cx('grid h-8 w-8 place-items-center rounded-xl border', accent === 'red' ? 'border-destructive/25 bg-destructive/10 text-destructive' : accent === 'amber' ? 'border-amber-400/25 bg-amber-400/10 text-amber-400' : accent === 'indigo' ? 'border-accent/25 bg-accent/10 text-accent' : 'border-primary/25 bg-primary/10 text-primary')}><Icon size={16} /></span></div>
    <div className="flex items-end justify-between"><span className="font-display text-2xl tracking-tight">{value}</span>{trend && <span className="font-mono-app text-[10px] text-primary">{trend}</span>}</div>
    <div className="mt-2 text-xs text-muted-foreground">{note}</div>
  </motion.div>;
}

function DashboardPage({ data }: { data: Dashboard }) {
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState<number | null>(null);
  const reset = useResetDemo();
  const simSearch = useSimulateSearch();
  const simRag = useSimulateRag();
  const simSpoof = useSimulateSpoof();
  const simTraining = useSimulateTraining();
  const run = (kind: 'search' | 'rag' | 'spoof' | 'training') => {
    const mutation = kind === 'search' ? simSearch : kind === 'rag' ? simRag : kind === 'spoof' ? simSpoof : simTraining;
    mutation.mutate(undefined, { onSuccess: (result) => { setSimulation(result); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetLedgerQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetRequestsQueryKey() }); } });
  };
  const runAll = async () => {
    if (demoRunning) return;
    setDemoRunning(true);
    const scenarios: Array<['search' | 'rag' | 'spoof' | 'training', typeof simSearch]> = [
      ['search', simSearch],
      ['rag', simRag],
      ['spoof', simSpoof],
      ['training', simTraining],
    ];
    try {
      for (const [index, [, mutation]] of scenarios.entries()) {
        setDemoStep(index);
        const result = await mutation.mutateAsync(undefined);
        setSimulation(result);
        await queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        await queryClient.invalidateQueries({ queryKey: getGetLedgerQueryKey() });
        await queryClient.invalidateQueries({ queryKey: getGetRequestsQueryKey() });
        await new Promise(resolve => setTimeout(resolve, 650));
      }
    } finally {
      setDemoStep(null);
      setDemoRunning(false);
    }
  };
  const pending = simSearch.isPending || simRag.isPending || simSpoof.isPending || simTraining.isPending;
  return <div className="space-y-7">
    <SectionHeading eyebrow="System snapshot / 00:04:41" title="The gate is watching." detail="Identity-first access control for every AI request touching your publication." action={<div className="flex items-center gap-2"><button onClick={() => reset.mutate(undefined, { onSuccess: () => queryClient.invalidateQueries() })} data-testid="button-reset-demo" className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground"><RotateCcw size={14} className="mr-2 inline" />Reset demo</button><Link href="/ledger" data-testid="link-open-ledger" className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[0_8px_24px_hsl(var(--primary)/.2)]">Open public ledger <ArrowUpRight size={14} className="ml-1 inline" /></Link></div>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Requests / 24h" value={data.summary.totalRequests.toLocaleString()} note={`${data.summary.verified.toLocaleString()} identity verified`} icon={Activity} trend="+8.4%" /><MetricCard label="Trust score" value={`${data.summary.trustScore}/100`} note="Publisher-wide confidence" icon={ShieldCheck} accent="indigo" trend="healthy" /><MetricCard label="Active crawlers" value={data.summary.activeCrawlers} note="Signed identities online" icon={Bot} accent="amber" trend="live" /><MetricCard label="Canary detections" value={data.summary.canaryDetections} note={`${data.summary.blocked} requests blocked`} icon={ScanLine} accent="red" trend="needs review" /></div>
    <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <div className="glass-card signal-border overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-border/70 px-5 py-4"><div><div className="font-display text-[11px]">LIVE REQUEST ACTIVITY</div><div className="mt-1 text-xs text-muted-foreground">The last five decisions from the verification edge</div></div><Link href="/requests" data-testid="link-view-requests" className="font-mono-app text-[10px] text-primary hover:underline">View stream <ChevronRight size={13} className="inline" /></Link></div><div className="divide-y divide-border/60">{data.requests.slice(0, 5).map((request) => <RequestRow key={request.id} request={request} />)}</div></div>
      <div className="glass-card rounded-2xl p-5"><div className="mb-5 flex items-start justify-between"><div><div className="font-display text-[11px]">TRUST METER</div><div className="mt-1 text-xs text-muted-foreground">Identity confidence across the edge</div></div><Shield size={17} className="text-primary" /></div><div className="relative mx-auto mb-6 grid h-44 w-44 place-items-center rounded-full" style={{ background: `conic-gradient(hsl(var(--primary)) ${data.summary.trustScore * 3.6}deg, hsl(var(--secondary)) 0deg)` }}><div className="grid h-36 w-36 place-items-center rounded-full bg-card"><span className="font-display text-3xl">{data.summary.trustScore}</span><span className="font-mono-app text-[9px] uppercase tracking-widest text-muted-foreground">out of 100</span></div></div><div className="space-y-3">{[['Verified identity', data.summary.verified, 'primary'], ['Fallback / strictest', data.summary.fallback, 'amber'], ['Blocked', data.summary.blocked, 'red']].map(([label, value, color]) => <div key={label as string} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-muted-foreground"><span className={cx('h-1.5 w-1.5 rounded-full', color === 'red' ? 'bg-destructive' : color === 'amber' ? 'bg-amber-400' : 'bg-primary')} />{label as string}</span><span className="font-mono-app">{value as number}</span></div>)}</div></div>
    </div>
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <DemoRunner simulation={simulation} pending={pending} onRun={run} onRunAll={runAll} demoRunning={demoRunning} demoStep={demoStep} />
      <div className="glass-card rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><div><div className="font-display text-[11px]">POLICY ROUTER</div><div className="mt-1 text-xs text-muted-foreground">What each verified intent receives</div></div><Link href="/policies" data-testid="link-manage-policies" className="text-muted-foreground hover:text-primary"><Settings2 size={16} /></Link></div><div className="space-y-2">{data.policies.slice(0, 4).map(policy => <PolicyCompact key={policy.intent} policy={policy} />)}</div></div>
    </div>
    <div className="glass-card rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><div><div className="font-display text-[11px]">LATEST LEDGER EVENTS</div><div className="mt-1 text-xs text-muted-foreground">Tamper-evident chain, publicly inspectable</div></div><Link href="/ledger" data-testid="link-view-ledger-events" className="font-mono-app text-[10px] text-primary">Explore chain <ArrowUpRight size={13} className="ml-1 inline" /></Link></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{data.ledger.slice(0, 4).map(event => <LedgerMini key={event.id} event={event} />)}</div></div>
  </div>;
}

function RequestRow({ request }: { request: RequestEvent }) {
  const good = request.identity === 'VERIFIED';
  return <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/40" data-testid={`row-request-${request.id}`}><div className={cx('grid h-8 w-8 place-items-center rounded-lg border', good ? 'border-primary/20 bg-primary/10 text-primary' : 'border-destructive/20 bg-destructive/10 text-destructive')}><Bot size={15} /></div><div className="min-w-[130px] flex-1"><div className="flex items-center gap-2 text-sm font-medium">{request.crawlerName}<span className={cx('rounded-full px-1.5 py-0.5 font-mono-app text-[8px]', good ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive')}>{request.identity}</span></div><div className="mt-1 font-mono-app text-[10px] text-muted-foreground">{request.intent} · {request.location}</div></div><div className="hidden min-w-[100px] text-right sm:block"><div className="font-mono-app text-[10px] text-muted-foreground">{request.tier}</div><div className="mt-1 text-xs">{request.status} <span className={good ? 'text-primary' : 'text-destructive'}>{request.action}</span></div></div><div className="w-12 text-right font-mono-app text-[10px] text-muted-foreground">{timeAgo(request.timestamp)}</div></div>;
}

function DemoRunner({ simulation, pending, onRun, onRunAll, demoRunning, demoStep }: { simulation: SimulationResult | null; pending: boolean; onRun: (kind: 'search' | 'rag' | 'spoof' | 'training') => void; onRunAll: () => void; demoRunning: boolean; demoStep: number | null }) {
  const scenarioLabels = ['SEARCH', 'RAG', 'SPOOF', 'TRAINING'];
  return <div className="glass-card signal-border rounded-2xl p-5"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 font-display text-[11px]"><Zap size={14} className="text-amber-400" /> DEMO RUNNER</div><div className="mt-1 text-xs text-muted-foreground">Make the security principle visible in one click.</div></div><div className="flex items-center gap-2"><button onClick={onRunAll} disabled={pending || demoRunning} data-testid="button-run-full-demo" className="rounded-xl bg-primary px-3 py-2 font-mono-app text-[9px] font-bold text-primary-foreground shadow-[0_8px_24px_hsl(var(--primary)/.18)] disabled:cursor-wait disabled:opacity-60">{demoRunning ? `RUNNING ${demoStep === null ? '' : `${demoStep + 1}/4`}` : 'RUN FULL DEMO'} <Play size={12} className="ml-1 inline" /></button><span className="hidden rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 font-mono-app text-[9px] text-amber-300 sm:inline">SAFE SANDBOX</span></div></div>{demoRunning && <div className="mb-4 grid grid-cols-4 gap-1">{scenarioLabels.map((label, index) => <div key={label} className={cx('rounded-md px-2 py-1.5 text-center font-mono-app text-[8px] transition-colors', demoStep === index ? 'bg-primary text-primary-foreground' : demoStep !== null && index < demoStep ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground')}>{index < (demoStep ?? -1) ? 'DONE ' : ''}{label}</div>)}</div>}<div className="grid gap-2 sm:grid-cols-2">{[ ['search', 'Signed search', 'GPTBot · valid signature'], ['rag', 'Verified RAG', 'ClaudeBot · canary payload'], ['spoof', 'Spoofing attack', 'Unknown · invalid signature'], ['training', 'License gate', 'ClaudeBot · HTTP 402']].map(([kind, title, detail]) => <button key={kind} disabled={pending || demoRunning} onClick={() => onRun(kind as 'search' | 'rag' | 'spoof' | 'training')} data-testid={`button-run-${kind}`} className={cx('group rounded-xl border border-border bg-secondary/45 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 disabled:cursor-wait disabled:opacity-60', kind === 'spoof' && 'hover:border-destructive/50')}><div className="flex items-center justify-between text-sm font-medium"><span>{title}</span><Play size={13} className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" /></div><div className="mt-1 font-mono-app text-[9px] text-muted-foreground">{detail}</div></button>)}</div>{pending && <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary"><div className="h-full w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-primary to-transparent" /></div>}{simulation && <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4" data-testid="panel-simulation-result"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary"><CheckCircle2 size={14} />{simulation.message}</div><div className="grid gap-2 sm:grid-cols-2">{simulation.steps.slice(0, 4).map((step, i) => <div key={i} className="rounded-lg bg-background/40 p-2"><div className="font-mono-app text-[9px] uppercase text-muted-foreground">{step.label}</div><div className="mt-1 text-xs">{step.detail}</div></div>)}</div><div className="mt-3 font-mono-app text-[9px] text-muted-foreground">evidence {simulation.evidence.hash}</div></div>}</div>;
}

function PolicyCompact({ policy }: { policy: Policy }) {
  const color = policy.tone === 'red' ? 'text-destructive bg-destructive/10 border-destructive/20' : policy.tone === 'amber' ? 'text-amber-300 bg-amber-400/10 border-amber-400/20' : policy.tone === 'indigo' ? 'text-accent bg-accent/10 border-accent/20' : 'text-primary bg-primary/10 border-primary/20';
  return <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/35 p-3"><span className={cx('grid h-8 w-8 place-items-center rounded-lg border font-mono-app text-[9px]', color)}>{policy.intent === 'UNKNOWN' ? '!' : policy.intent.slice(0, 3)}</span><div className="min-w-0 flex-1"><div className="text-xs font-medium">{policy.label}</div><div className="mt-0.5 truncate text-[11px] text-muted-foreground">{policy.description}</div></div><span className="shrink-0 font-mono-app text-[9px] text-muted-foreground">{policy.action}</span></div>;
}

function LedgerMini({ event }: { event: LedgerEvent }) {
  const bad = event.violation !== 'none';
  return <div className="rounded-xl border border-border/70 bg-secondary/25 p-3" data-testid={`card-ledger-${event.id}`}><div className="mb-3 flex items-center justify-between"><span className={cx('rounded-full px-2 py-1 font-mono-app text-[8px]', bad ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary')}>{event.event.replace('_', ' ')}</span><span className="font-mono-app text-[9px] text-muted-foreground">{timeAgo(event.timestamp)}</span></div><div className="text-xs font-medium">{event.crawler} <span className="text-muted-foreground">/ {event.intent}</span></div><div className="mt-2 flex items-center gap-1 font-mono-app text-[9px] text-muted-foreground"><Fingerprint size={11} className="text-primary" />{event.hash}</div></div>;
}

function RequestsPage({ requests }: { requests: RequestEvent[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const filtered = requests.filter(r => (filter === 'ALL' || r.identity === filter || r.intent === filter) && `${r.crawlerName} ${r.intent} ${r.location} ${r.action}`.toLowerCase().includes(query.toLowerCase()));
  return <div><SectionHeading eyebrow="Edge telemetry / stream" title="Request stream" detail="Every request is a decision: identify the caller, verify the signature, then route the payload." action={<div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 font-mono-app text-[10px] text-primary"><span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />{requests.length} events buffered</div>} /><div className="glass-card rounded-2xl p-4 sm:p-5"><div className="mb-5 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search crawler, intent, region…" data-testid="input-search-requests" className="h-10 w-full rounded-xl border border-border bg-secondary/45 pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/10" /></label><div className="flex gap-1 overflow-x-auto">{['ALL', 'VERIFIED', 'INVALID', 'RAG', 'SEARCH'].map(item => <button key={item} onClick={() => setFilter(item)} data-testid={`button-filter-${item.toLowerCase()}`} className={cx('rounded-lg px-3 py-2 font-mono-app text-[10px] whitespace-nowrap', filter === item ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}>{item}</button>)}</div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground"><th className="px-3 py-3 font-mono-app">Crawler</th><th className="px-3 py-3 font-mono-app">Intent</th><th className="px-3 py-3 font-mono-app">Identity</th><th className="px-3 py-3 font-mono-app">Response</th><th className="px-3 py-3 font-mono-app">Trust</th><th className="px-3 py-3 font-mono-app">Evidence</th><th className="px-3 py-3 font-mono-app">Seen</th></tr></thead><tbody className="divide-y divide-border/60">{filtered.map(r => <tr key={r.id} className="text-xs hover:bg-secondary/35" data-testid={`table-row-request-${r.id}`}><td className="px-3 py-4"><div className="flex items-center gap-2 font-medium"><Bot size={15} className={r.identity === 'VERIFIED' ? 'text-primary' : 'text-destructive'} />{r.crawlerName}</div><div className="mt-1 pl-5 font-mono-app text-[9px] text-muted-foreground">{r.crawlerId}</div></td><td className="px-3 py-4 font-mono-app text-[10px]">{r.intent}</td><td className="px-3 py-4"><span className={cx('rounded-full px-2 py-1 font-mono-app text-[9px]', r.identity === 'VERIFIED' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive')}>{r.identity}</span></td><td className="px-3 py-4"><span className="font-mono-app text-[10px]">{r.status}</span><span className="ml-2 text-muted-foreground">{r.action}</span></td><td className="px-3 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary"><div className={cx('h-full rounded-full', r.trustScore < 40 ? 'bg-destructive' : 'bg-primary')} style={{ width: `${r.trustScore}%` }} /></div><span className="font-mono-app text-[10px]">{r.trustScore}</span></div></td><td className="px-3 py-4 font-mono-app text-[9px] text-muted-foreground">{r.evidenceHash}</td><td className="px-3 py-4 font-mono-app text-[9px] text-muted-foreground">{timeAgo(r.timestamp)}</td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState icon={Search} title="No matching requests" detail="Try a different crawler, intent, or location." />}</div></div></div>;
}

function CrawlersPage({ crawlers }: { crawlers: Crawler[] }) {
  return <div><SectionHeading eyebrow="Identity registry / ed25519" title="Crawler identities" detail="A self-declared user-agent is only a claim. These are the identities the gate can actually verify." action={<div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 font-mono-app text-[10px] text-primary"><KeyRound size={13} className="mr-2 inline" />{crawlers.filter(c => c.status === 'verified').length} verified keys</div>} /><div className="grid gap-4 md:grid-cols-2">{crawlers.map(crawler => <div key={crawler.id} className={cx('glass-card signal-border rounded-2xl p-5', crawler.status !== 'verified' && 'border-destructive/20')} data-testid={`card-crawler-${crawler.id}`}><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className={cx('grid h-11 w-11 place-items-center rounded-xl border', crawler.status === 'verified' ? 'border-primary/20 bg-primary/10 text-primary' : 'border-destructive/20 bg-destructive/10 text-destructive')}><Bot size={21} /></div><div><h2 className="font-display text-[12px]">{crawler.name}</h2><div className="mt-1 flex items-center gap-1.5 font-mono-app text-[9px] text-muted-foreground"><span className={cx('h-1.5 w-1.5 rounded-full', crawler.status === 'verified' ? 'bg-primary' : 'bg-destructive')} />{crawler.status} · {crawler.lastSeen}</div></div></div><span className="font-display text-xl text-gradient">{crawler.trustScore}</span></div><div className="mt-6 grid grid-cols-2 gap-4 border-y border-border/70 py-4"><div><div className="font-mono-app text-[9px] uppercase text-muted-foreground">Public key</div><div className="mt-1 font-mono-app text-[10px]">{crawler.key}</div></div><div><div className="font-mono-app text-[9px] uppercase text-muted-foreground">Declared purpose</div><div className="mt-1 text-xs">{crawler.purpose}</div></div></div><div className="mt-4 flex items-center justify-between"><div className="flex-1"><div className="mb-1 flex justify-between font-mono-app text-[9px] text-muted-foreground"><span>Trust history</span><span>{crawler.requests.toLocaleString()} requests</span></div><div className="flex h-6 items-end gap-1">{[42, 56, 49, 64, 72, 61, 78, crawler.trustScore].map((height, i) => <span key={i} className={cx('flex-1 rounded-sm', crawler.status === 'verified' ? 'bg-primary/30' : 'bg-destructive/30')} style={{ height: `${Math.max(10, height / 2)}%` }} />)}</div></div><button onClick={() => navigator.clipboard?.writeText(crawler.key)} data-testid={`button-copy-key-${crawler.id}`} className="ml-4 rounded-lg border border-border p-2 text-muted-foreground hover:text-primary" title="Copy public key"><Copy size={14} /></button></div></div>)}</div></div>;
}

function PoliciesPage({ policies }: { policies: Policy[] }) {
  const [draft, setDraft] = useState(policies);
  const update = useUpdatePolicies();
  useEffect(() => setDraft(policies), [policies]);
  const toggle = (intent: string) => setDraft(current => current.map(p => p.intent === intent ? { ...p, enabled: !p.enabled } : p));
  const save = () => update.mutate({ data: { policies: draft } }, { onSuccess: (next) => { setDraft(next); queryClient.invalidateQueries({ queryKey: getGetPoliciesQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); } });
  return <div><SectionHeading eyebrow="Intent router / policy surface" title="Publisher policies" detail="Route content by verified intent. When identity fails, the strictest policy wins — every time." action={<button onClick={save} disabled={update.isPending} data-testid="button-save-policies" className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60">{update.isPending ? 'Saving…' : 'Save policy changes'} <Check size={14} className="ml-2 inline" /></button>} /><div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]"><div className="space-y-3">{draft.map(policy => <div key={policy.intent} className="glass-card rounded-2xl p-5" data-testid={`card-policy-${policy.intent.toLowerCase()}`}><div className="flex items-start gap-4"><div className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl border font-display text-[10px]', policy.tone === 'red' ? 'border-destructive/20 bg-destructive/10 text-destructive' : policy.tone === 'amber' ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' : policy.tone === 'indigo' ? 'border-accent/20 bg-accent/10 text-accent' : 'border-primary/20 bg-primary/10 text-primary')}>{policy.intent.slice(0, 3)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-[11px]">{policy.label}</h2><span className="rounded-full bg-secondary px-2 py-1 font-mono-app text-[9px] text-muted-foreground">{policy.intent}</span></div><p className="mt-2 text-sm text-muted-foreground">{policy.description}</p></div><button onClick={() => toggle(policy.intent)} aria-pressed={policy.enabled} data-testid={`button-toggle-policy-${policy.intent.toLowerCase()}`} className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors', policy.enabled ? 'bg-primary' : 'bg-secondary')}><span className={cx('absolute top-1 h-4 w-4 rounded-full bg-background transition-transform', policy.enabled ? 'left-6' : 'left-1')} /></button></div><div className="mt-5 flex items-center justify-between rounded-xl border border-border/60 bg-secondary/35 px-3 py-2.5"><span className="font-mono-app text-[9px] uppercase tracking-wider text-muted-foreground">Payload action</span><span className="font-display text-[10px] text-primary">{policy.action}</span></div></div>)}</div><div className="glass-card signal-border h-fit rounded-2xl p-5"><div className="mb-5 flex items-center gap-2 font-display text-[11px]"><LockKeyhole size={15} className="text-primary" /> CORE RULE</div><div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="font-display text-sm leading-7">NEVER TRUST<br /><span className="text-gradient">CRAWLER INTENT</span><br />WITHOUT IDENTITY.</p></div><div className="mt-5 space-y-4 text-xs text-muted-foreground"><div className="flex gap-3"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary" /><span>Ed25519 signature is checked against the registry.</span></div><div className="flex gap-3"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary" /><span>Verified identity unlocks the declared intent policy.</span></div><div className="flex gap-3"><ShieldAlert size={15} className="mt-0.5 shrink-0 text-destructive" /><span>Unknown callers are automatically downgraded to strictest.</span></div></div></div></div></div>;
}

function AnalyticsPage({ analytics }: { analytics: Analytics }) {
  const max = Math.max(...analytics.volume.map(x => x.value), 1);
  return <div><SectionHeading eyebrow="Signals / last 7 days" title="Threat analytics" detail="Volume is useful. Trust context is what makes it actionable." action={<button onClick={() => queryClient.invalidateQueries({ queryKey: getGetAnalyticsQueryKey() })} data-testid="button-refresh-analytics" className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-primary"><RefreshCw size={14} className="mr-2 inline" />Refresh analysis</button>} /><div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]"><div className="glass-card rounded-2xl p-5"><div className="mb-6 flex items-start justify-between"><div><div className="font-display text-[11px]">REQUEST VOLUME</div><div className="mt-1 text-xs text-muted-foreground">Daily request decisions</div></div><div className="font-mono-app text-[10px] text-primary">+18.6% vs prior week</div></div><div className="flex h-56 items-end gap-2 sm:gap-4">{analytics.volume.map(point => <div key={point.label} className="flex flex-1 flex-col items-center gap-2"><div className="relative flex h-full w-full items-end justify-center"><div className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-primary/30 to-primary transition-all hover:from-primary/60" style={{ height: `${(point.value / max) * 100}%` }} /><span className="absolute -top-5 font-mono-app text-[9px] text-muted-foreground opacity-0 transition-opacity hover:opacity-100">{point.value}</span></div><span className="font-mono-app text-[9px] text-muted-foreground">{point.label}</span></div>)}</div></div><div className="glass-card rounded-2xl p-5"><div className="mb-5 font-display text-[11px]">INTENT MIX</div><div className="space-y-4">{analytics.intent.map((item, i) => <div key={item.label}><div className="mb-1.5 flex justify-between text-xs"><span className="font-mono-app">{item.label}</span><span className="text-muted-foreground">{item.value}</span></div><div className="h-2 rounded-full bg-secondary"><div className={cx('h-full rounded-full', i === 0 ? 'bg-primary' : i === 1 ? 'bg-accent' : i === 2 ? 'bg-amber-400' : 'bg-destructive')} style={{ width: `${Math.min(100, (item.value / Math.max(...analytics.intent.map(x => x.value))) * 100)}%` }} /></div></div>)}</div></div></div><div className="mt-5 grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="glass-card rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><div className="font-display text-[11px]">VIOLATION TYPES</div><ShieldAlert size={16} className="text-destructive" /></div><div className="space-y-3">{analytics.violations.map(v => <div key={v.label} className="flex items-center justify-between border-b border-border/50 pb-3 text-xs"><span className="text-muted-foreground">{v.label}</span><span className="font-mono-app text-destructive">{v.value.toString().padStart(2, '0')}</span></div>)}</div></div><div className="glass-card rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><div><div className="font-display text-[11px]">TRUST LEADERBOARD</div><div className="mt-1 text-xs text-muted-foreground">Compliance history by identity</div></div><UsersRound size={16} className="text-primary" /></div><div className="space-y-1">{analytics.trustLeaderboard.map((entry, i) => <div key={entry.name} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-secondary/40"><span className="w-5 font-display text-[10px] text-muted-foreground">0{i + 1}</span><div className={cx('grid h-8 w-8 place-items-center rounded-lg', entry.status === 'verified' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive')}><Bot size={15} /></div><div className="min-w-0 flex-1"><div className="text-xs font-medium">{entry.name}</div><div className="mt-1 font-mono-app text-[9px] text-muted-foreground">{entry.requests} requests · {entry.violations} violations</div></div><span className={cx('font-display text-sm', entry.score < 40 ? 'text-destructive' : 'text-primary')}>{entry.score}</span></div>)}</div></div></div></div>;
}

function CanaryPage({ initial }: { initial: Dashboard['canary'] }) {
  const [text, setText] = useState('The company rapidly extended its international operations. Its public record is available for review.');
  const [result, setResult] = useState<CanaryScanResult | null>(null);
  const scan = useScanCanary();
  const submit = () => scan.mutate({ data: { text } }, { onSuccess: setResult });
  return <div><SectionHeading eyebrow="Forensics / semantic signals" title="Canary detector" detail="Find session-specific language variants that indicate downstream reuse. Statistical evidence, not courtroom-grade proof." action={<div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 font-mono-app text-[10px] text-primary"><span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />Detector armed</div>} /><div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><div className="glass-card signal-border rounded-2xl p-5"><div className="mb-4 flex items-center justify-between"><div><div className="font-display text-[11px]">PASTE CONTENT TO SCAN</div><div className="mt-1 text-xs text-muted-foreground">Compare text against known session canary variants.</div></div><UploadCloud size={18} className="text-muted-foreground" /></div><textarea value={text} onChange={e => setText(e.target.value)} data-testid="textarea-canary-input" className="min-h-52 w-full resize-y rounded-xl border border-border bg-background/55 p-4 text-sm leading-7 outline-none placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/10" placeholder="Paste a suspected reuse here…" /><div className="mt-4 flex items-center justify-between"><span className="font-mono-app text-[9px] text-muted-foreground">{text.length} characters · local preflight ready</span><button onClick={submit} disabled={!text.trim() || scan.isPending} data-testid="button-scan-canary" className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"><ScanLine size={14} className="mr-2 inline" />{scan.isPending ? 'Scanning…' : 'Run canary scan'}</button></div></div><div className="glass-card rounded-2xl p-5">{result ? <CanaryResult result={result} /> : <><div className="mb-5 flex items-center justify-between"><div className="font-display text-[11px]">LAST KNOWN SIGNAL</div><span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 font-mono-app text-[9px] text-primary">ARMED</span></div><div className="grid place-items-center rounded-2xl border border-dashed border-primary/25 bg-primary/5 py-9 text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary animate-float"><ScanLine size={25} /></div><div className="font-display text-sm">READY TO INSPECT</div><p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">Scan pasted text to surface matched signals, confidence, and the evidence record.</p></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border border-border bg-secondary/35 p-3"><div className="font-mono-app text-[9px] text-muted-foreground">ACTIVE CRAWLER</div><div className="mt-1 text-xs">{initial.crawler}</div></div><div className="rounded-xl border border-border bg-secondary/35 p-3"><div className="font-mono-app text-[9px] text-muted-foreground">SESSION</div><div className="mt-1 font-mono-app text-[10px]">{initial.session}</div></div></div></>}</div></div></div>;
}

function CanaryResult({ result }: { result: CanaryScanResult }) {
  return <div data-testid="panel-canary-result"><div className="mb-5 flex items-start justify-between"><div><div className={cx('flex items-center gap-2 font-display text-sm', result.detected ? 'text-destructive' : 'text-primary')} >{result.detected ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}{result.detected ? 'CANARY DETECTED' : 'NO SIGNAL FOUND'}</div><div className="mt-2 text-xs text-muted-foreground">{result.status}</div></div><div className="font-display text-2xl text-gradient">{Math.round(result.confidence <= 1 ? result.confidence * 100 : result.confidence)}<span className="text-sm">%</span></div></div><div className="space-y-3 rounded-xl border border-border bg-secondary/35 p-4"><InfoLine label="Crawler" value={result.crawler} /><InfoLine label="Session" value={result.session} mono /><InfoLine label="Matched signals" value={result.matchedSignals.length ? result.matchedSignals.join(' · ') : 'none'} /><InfoLine label="Evidence hash" value={result.evidence.hash} mono /></div><div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs leading-5 text-amber-200/80"><AlertTriangle size={14} className="mr-2 inline text-amber-300" />Semantic canaries provide statistical evidence of downstream reuse and should be evaluated with surrounding context.</div></div>;
}

function InfoLine({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-2 last:border-0 last:pb-0"><span className="text-xs text-muted-foreground">{label}</span><span className={cx('max-w-[65%] text-right text-xs', mono && 'font-mono-app text-[10px]')}>{value}</span></div>;
}

function LedgerPage({ ledger }: { ledger: LedgerEvent[] }) {
  return <div><SectionHeading eyebrow="Public accountability / append-only" title="The public ledger" detail="A readable chain of decisions. Every event points backwards, every hash makes tampering visible." action={<div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 font-mono-app text-[10px] text-primary"><span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />CHAIN HEALTHY</div>} /><div className="grid gap-5 xl:grid-cols-[1fr_320px]"><div className="relative"><div className="absolute bottom-6 left-[25px] top-6 w-px bg-gradient-to-b from-primary via-accent to-transparent" />{ledger.map((event, index) => <div key={event.id} className="relative mb-4 flex gap-4" data-testid={`ledger-event-${event.id}`}><div className="z-10 mt-5 grid h-3 w-3 shrink-0 place-items-center rounded-full border-2 border-background bg-primary shadow-[0_0_14px_hsl(var(--primary)/.8)]" /><div className="glass-card min-w-0 flex-1 rounded-2xl p-5 transition-transform hover:-translate-y-0.5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className={cx('rounded-full px-2 py-1 font-mono-app text-[9px]', event.violation !== 'none' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary')}>{event.event.replaceAll('_', ' ')}</span><span className="font-mono-app text-[9px] text-muted-foreground">{event.id}</span></div><h2 className="mt-3 text-sm font-semibold">{event.crawler} <span className="font-normal text-muted-foreground">requested</span> {event.intent}</h2></div><div className="text-right font-mono-app text-[9px] text-muted-foreground">{timeAgo(event.timestamp)}<br /><span className="text-primary">{event.action}</span></div></div><div className="mt-4 grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-3"><div><div className="font-mono-app text-[9px] uppercase text-muted-foreground">Publisher</div><div className="mt-1 text-xs">{event.publisher}</div></div><div><div className="font-mono-app text-[9px] uppercase text-muted-foreground">Violation</div><div className={cx('mt-1 text-xs', event.violation !== 'none' && 'text-destructive')}>{event.violation}</div></div><div><div className="font-mono-app text-[9px] uppercase text-muted-foreground">Current hash</div><div className="mt-1 flex items-center gap-1 font-mono-app text-[9px] text-primary"><Fingerprint size={11} />{event.hash}</div></div></div><div className="mt-3 font-mono-app text-[9px] text-muted-foreground">previous <span className="text-foreground/70">{event.previousHash}</span>{index === 0 && <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-primary">HEAD</span>}</div></div></div>)}</div><div className="glass-card signal-border h-fit rounded-2xl p-5"><div className="mb-5 flex items-center gap-2 font-display text-[11px]"><Database size={15} className="text-primary" /> CHAIN DETAILS</div><div className="space-y-4"><InfoLine label="Block height" value="#00,004,441" mono /><InfoLine label="Records today" value="1,284" mono /><InfoLine label="Chain integrity" value="100.00%" mono /><InfoLine label="Public endpoint" value="/api/ledger" mono /></div><div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">This is an append-only SQLite ledger with a tamper-evident hash chain. It is not a blockchain.</div><button onClick={() => navigator.clipboard?.writeText(`${location.origin}/api/ledger`)} data-testid="button-copy-ledger-endpoint" className="mt-3 w-full rounded-xl border border-border py-2.5 text-xs text-muted-foreground hover:text-primary"><Clipboard size={13} className="mr-2 inline" />Copy public endpoint</button></div></div></div>;
}

function ArchitecturePage() {
  const nodes = [{ icon: Bot, title: 'CRAWLER', detail: 'signed request', tone: 'indigo' }, { icon: Fingerprint, title: 'VERIFY IDENTITY', detail: 'Ed25519 registry', tone: 'primary' }, { icon: SlidersHorizontal, title: 'CHECK INTENT', detail: 'payload policy', tone: 'amber' }, { icon: ScanLine, title: 'PLANT CANARY', detail: 'session variant', tone: 'primary' }, { icon: Database, title: 'PUBLIC LEDGER', detail: 'hash chain', tone: 'indigo' }];
  return <div><SectionHeading eyebrow="System map / live path" title="From crawler to accountability" detail="Fides Gate makes the invisible path of an AI request legible — and leaves a record when it is not." action={<span className="font-mono-app text-[10px] text-muted-foreground">pipeline latency <span className="text-primary">42ms</span></span>} /><div className="glass-card signal-border overflow-hidden rounded-2xl p-6 sm:p-10"><div className="dot-grid relative rounded-2xl border border-border/60 bg-background/30 p-5 sm:p-10"><div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />{nodes.map((node, i) => <div key={node.title} className="relative z-10 flex flex-col items-center"><div className={cx('group grid h-20 w-20 place-items-center rounded-2xl border bg-card shadow-2xl transition-transform hover:scale-105 sm:h-24 sm:w-24', node.tone === 'indigo' ? 'border-accent/40 text-accent' : node.tone === 'amber' ? 'border-amber-400/40 text-amber-300' : 'border-primary/45 text-primary')}><node.icon size={28} className={i === 1 || i === 3 ? 'animate-pulse-soft' : ''} /></div><div className="mt-3 rounded-full border border-border bg-card px-3 py-1 font-display text-[10px]">{node.title}</div><div className="mt-1 font-mono-app text-[9px] text-muted-foreground">{node.detail}</div>{i < nodes.length - 1 && <div className="my-4 flex h-12 flex-col items-center"><div className="h-8 border-l border-dashed border-primary/40" /><ChevronRight size={14} className="rotate-90 text-primary" /></div>}</div>)}</div><div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-border bg-secondary/35 p-4"><div className="font-mono-app text-[9px] text-primary">01 / IDENTITY</div><p className="mt-2 text-xs leading-5 text-muted-foreground">Valid signature plus registered public key. No exceptions.</p></div><div className="rounded-xl border border-border bg-secondary/35 p-4"><div className="font-mono-app text-[9px] text-accent">02 / PAYLOAD</div><p className="mt-2 text-xs leading-5 text-muted-foreground">Search, RAG, and training each receive a deliberate response.</p></div><div className="rounded-xl border border-border bg-secondary/35 p-4"><div className="font-mono-app text-[9px] text-amber-300">03 / PROVENANCE</div><p className="mt-2 text-xs leading-5 text-muted-foreground">Canaries and evidence hashes preserve a trail beyond the request.</p></div></div></div></div>;
}

function SettingsPage() {
  const [compact, setCompact] = useState(false);
  const [theme, setTheme] = useState(document.documentElement.classList.contains('dark'));
  const toggleTheme = () => { const next = !theme; setTheme(next); document.documentElement.classList.toggle('dark', next); localStorage.setItem('fides-theme', next ? 'dark' : 'light'); };
  return <div><SectionHeading eyebrow="Publisher / preferences" title="Settings" detail="Tune how your team experiences the console. These controls are local to this publisher workspace." action={<span className="font-mono-app text-[10px] text-primary">workspace: northstar_review</span>} /><div className="grid max-w-5xl gap-5 lg:grid-cols-[1fr_1fr]"><div className="glass-card rounded-2xl p-5"><div className="mb-5 font-display text-[11px]">DISPLAY PREFERENCES</div><div className="divide-y divide-border/60"><SettingRow icon={theme ? Moon : Sun} title="Dark signal theme" detail="Use the high-contrast control room palette." control={<button onClick={toggleTheme} aria-pressed={theme} data-testid="button-toggle-theme" className={cx('relative h-6 w-11 rounded-full', theme ? 'bg-primary' : 'bg-secondary')}><span className={cx('absolute top-1 h-4 w-4 rounded-full bg-background transition-transform', theme ? 'left-6' : 'left-1')} /></button>} /><SettingRow icon={Layers3} title="Compact request rows" detail="Fit more activity into the live stream." control={<button onClick={() => setCompact(!compact)} aria-pressed={compact} data-testid="button-toggle-compact" className={cx('relative h-6 w-11 rounded-full', compact ? 'bg-primary' : 'bg-secondary')}><span className={cx('absolute top-1 h-4 w-4 rounded-full bg-background transition-transform', compact ? 'left-6' : 'left-1')} /></button>} /><SettingRow icon={Bell} title="Ledger alert sounds" detail="Notify when an identity is rejected." control={<button onClick={() => alert('Ledger alert preference saved.')} data-testid="button-configure-alerts" className="rounded-lg border border-border px-2.5 py-1.5 text-[10px] text-muted-foreground hover:text-primary">Configure</button>} /></div></div><div className="glass-card rounded-2xl p-5"><div className="mb-5 font-display text-[11px]">API DETAILS</div><div className="space-y-4"><div><label className="font-mono-app text-[9px] uppercase tracking-wider text-muted-foreground">Publisher ID</label><div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2.5 font-mono-app text-[10px]">pub_northstar_7f2a<button onClick={() => navigator.clipboard?.writeText('pub_northstar_7f2a')} data-testid="button-copy-publisher-id" className="text-muted-foreground hover:text-primary"><Copy size={14} /></button></div></div><div><label className="font-mono-app text-[9px] uppercase tracking-wider text-muted-foreground">Public ledger endpoint</label><div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2.5 font-mono-app text-[10px]">/api/ledger<button onClick={() => navigator.clipboard?.writeText('/api/ledger')} data-testid="button-copy-api-endpoint" className="text-muted-foreground hover:text-primary"><Copy size={14} /></button></div></div><div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs leading-5 text-muted-foreground"><KeyRound size={14} className="mr-2 inline text-amber-300" />Private signing keys never leave the crawler identity owner. Fides Gate stores verification metadata only.</div></div></div></div><div className="mt-5 max-w-5xl rounded-2xl border border-border/70 bg-secondary/25 p-5"><div className="flex items-center gap-3"><FileCheck2 size={17} className="text-primary" /><div><div className="font-display text-[11px]">RSL COMPATIBILITY</div><div className="mt-1 text-xs text-muted-foreground">Training requests return machine-readable license terms at <span className="font-mono-app text-primary">/license.xml</span>.</div></div><button onClick={() => alert('RSL license.xml preview opened.')} data-testid="button-preview-license" className="ml-auto rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-primary">Preview</button></div></div></div>;
}

function SettingRow({ icon: Icon, title, detail, control }: { icon: typeof Sun; title: string; detail: string; control: ReactNode }) {
  return <div className="flex items-center gap-3 py-4"><div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-muted-foreground"><Icon size={16} /></div><div className="min-w-0 flex-1"><div className="text-sm">{title}</div><div className="mt-1 text-xs text-muted-foreground">{detail}</div></div>{control}</div>;
}

function LandingPage() {
  const query = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey(), refetchInterval: 8000 } });
  const data = query.data ?? fallbackDashboard;
  // @ts-expect-error icon tuple components are compatible at runtime
  return <div className="noise min-h-[100dvh] overflow-hidden bg-background"><header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><Brand /><div className="hidden items-center gap-7 text-xs text-muted-foreground md:flex"><a href="#principle" data-testid="link-principle" className="hover:text-foreground">The principle</a><a href="#ledger" data-testid="link-public-ledger" className="hover:text-foreground">Public ledger</a><Link href="/dashboard" data-testid="link-console-top" className="text-primary hover:underline">Open console <ArrowUpRight size={13} className="ml-1 inline" /></Link></div><Link href="/dashboard" data-testid="link-launch-console" className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary md:hidden">Launch console</Link></header><main><section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24"><div className="pointer-events-none absolute -right-20 top-0 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[110px]" /><div className="pointer-events-none absolute -left-40 top-36 h-[420px] w-[420px] rounded-full bg-accent/10 blur-[110px]" /><div className="relative max-w-4xl"><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 font-mono-app text-[10px] uppercase tracking-[0.16em] text-primary"><span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />Publisher edge / live</div><h1 className="max-w-4xl font-display text-4xl leading-[1.18] tracking-[-0.04em] sm:text-6xl lg:text-7xl">Know who is asking.<br /><span className="text-gradient">Control what they get.</span></h1><p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Fides Gate verifies AI crawler identity before content access, routes payloads by intent, plants forensic canaries, and chains every decision into a public record.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/dashboard" data-testid="link-hero-console" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_12px_32px_hsl(var(--primary)/.2)]">Enter control room <ArrowUpRight size={16} className="ml-2 inline" /></Link><Link href="/ledger" data-testid="link-hero-ledger" className="rounded-xl border border-border bg-card px-5 py-3 text-sm text-foreground hover:border-primary/50">Read the public ledger <Database size={15} className="ml-2 inline text-primary" /></Link></div></div><div className="relative mt-16 grid gap-3 sm:grid-cols-4">{[['Requests today', data.summary.totalRequests.toLocaleString(), Activity], ['Verified', `${Math.round((data.summary.verified / Math.max(1, data.summary.totalRequests)) * 100)}%`, ShieldCheck], ['Active identities', data.summary.activeCrawlers, Bot], ['Chain status', 'HEALTHY', Database]].map(([label, value, Icon]) => <div key={label as string} className="glass-card rounded-2xl p-4"><Icon size={16} className="mb-5 text-primary" /><div className="font-display text-xl">{value as string}</div><div className="mt-1 font-mono-app text-[9px] uppercase tracking-wider text-muted-foreground">{label as string}</div></div>)}</div></section><section id="principle" className="border-y border-border/70 bg-card/30"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><div className="mb-3 font-mono-app text-[10px] uppercase tracking-[.18em] text-primary">The gate's only rule</div><h2 className="font-display text-3xl leading-tight sm:text-4xl">A claim is not<br /><span className="text-gradient">an identity.</span></h2></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5"><XCircle size={20} className="text-destructive" /><div className="mt-5 font-display text-[12px]">UNVERIFIED</div><p className="mt-2 text-sm leading-6 text-muted-foreground">A crawler says “RAG” in a header but cannot prove who it is. Fides Gate ignores the claim and applies the strictest tier.</p></div><div className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><CheckCircle2 size={20} className="text-primary" /><div className="mt-5 font-display text-[12px]">VERIFIED</div><p className="mt-2 text-sm leading-6 text-muted-foreground">A registered Ed25519 identity signs the request. Now — and only now — the publisher's intent policy can be honored.</p></div></div></div></section><section id="ledger" className="mx-auto max-w-7xl px-5 py-20 sm:px-8"><div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-3 font-mono-app text-[10px] uppercase tracking-[.18em] text-primary">Public accountability / live</div><h2 className="font-display text-3xl sm:text-4xl">The record remembers.</h2></div><Link href="/ledger" data-testid="link-landing-ledger" className="text-xs text-primary hover:underline">Inspect all events <ArrowUpRight size={14} className="ml-1 inline" /></Link></div><div className="grid gap-3 md:grid-cols-2">{data.ledger.slice(0, 4).map(event => <LedgerMini key={event.id} event={event} />)}</div></section><section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"><div className="signal-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-primary/10 p-7 sm:p-12"><div className="relative z-10 max-w-2xl"><div className="mb-4 flex items-center gap-2 font-mono-app text-[10px] uppercase tracking-wider text-primary"><Fingerprint size={14} /> Provenance for the licensing ecosystem</div><h2 className="font-display text-2xl leading-relaxed sm:text-3xl">Every standard says what a crawler may do. Fides Gate verifies who is asking — and catches them when they lie.</h2><Link href="/architecture" data-testid="link-architecture" className="mt-7 inline-flex items-center rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs text-primary">See how it works <ChevronRight size={14} className="ml-2" /></Link></div><Network size={210} className="absolute -bottom-10 -right-4 text-primary/10 sm:right-10" /></div></section></main><footer className="border-t border-border/70 px-5 py-6 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-muted-foreground sm:flex-row"><span>FIDES GATE / NORTHSTAR REVIEW</span><span className="font-mono-app text-[10px]">identity · intent · provenance · accountability</span></div></footer></div>;
}

function EmptyState({ icon: Icon, title, detail }: { icon: typeof Search; title: string; detail: string }) {
  return <div className="flex flex-col items-center justify-center py-14 text-center"><Icon size={24} className="mb-3 text-muted-foreground" /><div className="font-display text-[11px]">{title}</div><div className="mt-2 text-xs text-muted-foreground">{detail}</div></div>;
}

function NotFound() {
  return <div className="grid min-h-[100dvh] place-items-center bg-background p-6 text-center"><div><div className="font-display text-5xl text-gradient">404</div><p className="mt-3 text-sm text-muted-foreground">This route does not exist in the chain.</p><Link href="/dashboard" data-testid="link-return-dashboard" className="mt-6 inline-block rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Return to control room</Link></div></div>;
}

export default App;