import { type ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter, Link } from 'wouter';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness, Check,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Compass, ExternalLink,
  FileText, Gauge, GraduationCap, Leaf, Menu, RotateCcw, ShieldCheck,
  Sparkles, Target, TrendingUp, Users, X, Clock3, CircleDot, Search, AlertTriangle
} from 'lucide-react';
import { useHealthCheck, useListMarketSignals, useListWorkforceRoles } from '@workspace/api-client-react';
import type { MarketSignal, WorkforceRole } from '@workspace/api-client-react';
import { LiveTrendStrip } from '@/components/live-trend-strip';
import { AiPlanCard } from '@/components/ai-plan-card';
import { FutureRolesSection } from '@/components/future-roles-section';
import { LearningPathSection } from '@/components/learning-path-section';
import { HeroSection } from '@/components/hero-section';
import { AboutPage } from '@/components/about-page';
import { WelcomeDialog } from '@/components/welcome-dialog';
import { AskAura } from '@/components/ask-aura';
import { SettingsProvider, SettingsControls, useSettings } from '@/lib/settings';
import { signalBm } from '@/lib/signal-translations';
import { profileCopy } from '@/lib/profile-i18n';
import { ExploreRoles } from '@/components/explore-roles';
import { fetchTrends, type TrendSnapshot } from '@/lib/live-trends';
import { type DisruptionMode, type ProfileData, hasProfileSkill, normalize, scoreRole, urgencyFor } from '@/lib/scoring';

const queryClient = new QueryClient();

type DisruptionMode = 'Moderate' | 'Aggressive';

type AiPlan = {
  recommendedRoleId: string;
  recommendedRoleTitle: string;
  headline: string;
  ranking: Array<{ roleId: string; roleTitle: string; fit: number; appEstimate: number; reason: string; gaps: string[] }>;
  pathway: Array<{ moduleId: string; title: string; order: number; hours: number; why: string }>;
  nextAction: string;
  caveat: string;
  model: string;
  generatedAt: string;
};

type ExploredRole = {
  title: string;
  sector: string;
  reason: string;
  skillsToBuild: string[];
  firstStep: string;
  occupationSource: string;
  confidence: 'high' | 'medium' | 'low';
};

type ExploreResult = {
  roles: ExploredRole[];
  note: string;
  model: string;
  generatedAt: string;
};

type VerifiedStep = {
  moduleId: string;
  title: string;
  skill: string;
  hours: number;
  provider: string;
  url: string;
  costNote: string;
  order: number;
  why: string;
};

type VerifiedPathway = {
  roleTitle: string;
  steps: VerifiedStep[];
  topics?: Array<{ topic: string; why: string; provider: string; hours: number; searchUrl: string }>;
  totalHours: number;
  note: string;
  model: string;
  generatedAt: string;
};
type AppContextValue = {
  roles: WorkforceRole[]; signals: MarketSignal[]; loadingRoles: boolean; loadingSignals: boolean;
  rolesError: boolean; signalsError: boolean; refetchRoles: () => void; refetchSignals: () => void;
  health: string; profile: ProfileData; setProfile: (p: ProfileData) => void;
  mode: DisruptionMode; setMode: (m: DisruptionMode) => void; selectedRoleId: string;
  setSelectedRoleId: (id: string) => void; scores: (role: WorkforceRole) => number; urgency: (role: WorkforceRole) => number;
  trends?: TrendSnapshot; trendsLoading: boolean; trendsError: boolean; trendsRefreshing: boolean;
  refreshTrends: () => void;
  plan: AiPlan | null; planLoading: boolean; generatePlan: (input: ProfileData) => Promise<void>;
  explored: ExploreResult | null; exploredLoading: boolean; generateExplore: (input: ProfileData) => Promise<void>;
  exploredPathway: VerifiedPathway | null; pathwayLoading: boolean; pathwayError: string | null; pathwayRoleTitle: string | null; buildPathwayFor: (role: ExploredRole) => Promise<void>;
};
const AppContext = createContext<AppContextValue | null>(null);
const useApp = () => {
  const value = useContext(AppContext);
  if (!value) throw new Error('AURA workspace context is unavailable');
  return value;
};
const initialProfile: ProfileData = {
  currentRole: 'Procurement Assistant', industry: 'Procurement & operations', yearsExperience: 7,
  skills: ['Vendor communication', 'Manual PO processing', 'Microsoft Excel', 'Inventory auditing'],
  competencies: ['Communication', 'Attention to detail', 'Organization'],
  targetSectors: ['Smart logistics', 'Technology'],
  weeklyHours: 6,
};
const navItems = [
  { href: '#signals', key: 'signals' as const, icon: Activity },
  { href: '#profile', key: 'profile' as const, icon: Users },
  { href: '#roles', key: 'roles' as const, icon: Compass },
  { href: '#pathway', key: 'pathway' as const, icon: BookOpen },
];

function App() {
  return <QueryClientProvider client={queryClient}><SettingsProvider><AppContent/></SettingsProvider></QueryClientProvider>;
}

function AppContent() {
  const { lang } = useSettings();
  const rolesQuery = useListWorkforceRoles();
  const signalsQuery = useListMarketSignals();
  const healthQuery = useHealthCheck();
  // Live trend layer: fetched once, cached by React Query for 5 minutes.
  // If it fails, the app keeps working with the curated snapshot only.
  const trendsQuery = useQuery({
    queryKey: ['trends'],
    queryFn: () => fetchTrends(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [mode, setMode] = useState<DisruptionMode>('Moderate');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [refreshingTrends, setRefreshingTrends] = useState(false);
  const roles = rolesQuery.data ?? [];
  const signals = signalsQuery.data ?? [];
  const trendShare = (roleId: string) =>
    trendsQuery.data?.roles.find((trend) => trend.roleId === roleId)?.share ?? 0;
  const sortedRoles = useMemo(() => [...roles].sort((a, b) => scoreRole(b, profile, mode, trendShare(b.id)) - scoreRole(a, profile, mode, trendShare(a.id))), [roles, profile, mode, trendsQuery.data]);
  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? sortedRoles[0];
  // Forces the server to bypass its 6-hour cache, then stores the fresh result.
  const refreshTrends = () => {
    setRefreshingTrends(true);
    void fetchTrends({ refresh: true })
      .then((fresh) => { queryClient.setQueryData(['trends'], fresh); })
      .catch(() => undefined)
      .finally(() => { setRefreshingTrends(false); });
  };
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  // Generated when the user presses "Apply to role explorer". The role explorer
  // renders this ranking; if the model is unavailable the deterministic order
  // is used instead, so the page never blocks on the AI.
  const generatePlan = async (input: ProfileData) => {
    setPlanLoading(true);
    try {
      const candidates = roles.map((role) => ({
        roleId: role.id,
        score: scoreRole(role, input, mode, trendShare(role.id)),
      }));
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profile: input, mode, candidates }),
      });
      if (!response.ok) return;
      setPlan((await response.json()) as AiPlan);
    } catch {
      // Keep whatever plan we had; the deterministic ranking still renders.
    } finally {
      setPlanLoading(false);
    }
  };
  const [explored, setExplored] = useState<ExploreResult | null>(null);
  const [exploredLoading, setExploredLoading] = useState(false);
  // Roles the model proposes OUTSIDE the curated five. Same model, same profile;
  // the difference is that these have no curated pathway, which the UI states.
  const generateExplore = async (input: ProfileData) => {
    setExploredLoading(true);
    try {
      const response = await fetch('/api/explore', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          profile: {
            currentRole: input.currentRole,
            industry: input.industry,
            yearsExperience: input.yearsExperience,
            skills: input.skills,
            competencies: input.competencies,
            targetSectors: input.targetSectors,
          },
          lang,
        }),
      });
      if (!response.ok) return;
      setExplored((await response.json()) as ExploreResult);
    } catch {
      // Non-fatal: the curated list still renders.
    } finally {
      setExploredLoading(false);
    }
  };
  const [exploredPathway, setExploredPathway] = useState<VerifiedPathway | null>(null);
  const [pathwayLoading, setPathwayLoading] = useState(false);
  const [pathwayError, setPathwayError] = useState<string | null>(null);
  const [pathwayRoleTitle, setPathwayRoleTitle] = useState<string | null>(null);
  // Builds a pathway for an AI-proposed occupation. The model may only choose
  // courses from our verified library, so every step has a real URL.
  const buildPathwayFor = async (role: ExploredRole) => {
    setPathwayLoading(true);
    setPathwayError(null);
    setPathwayRoleTitle(role.title);
    try {
      const response = await fetch('/api/pathway', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          roleTitle: role.title,
          skillsToBuild: role.skillsToBuild,
          profileSummary: `${profile.currentRole} in ${profile.industry}, ${profile.yearsExperience} years of experience. Current skills: ${profile.skills.join(', ')}.`,
          lang,
        }),
      });

      if (!response.ok) {
        const detail = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(detail?.message ?? `The planner returned HTTP ${response.status}.`);
      }

      setExploredPathway((await response.json()) as VerifiedPathway);
      document.getElementById('pathway')?.scrollIntoView({ behavior: 'smooth' });
    } catch (caught) {
      setPathwayError(caught instanceof Error ? caught.message : 'Could not build the pathway.');
    } finally {
      setPathwayLoading(false);
    }
  };
  const value: AppContextValue = {
    roles, signals, loadingRoles: rolesQuery.isLoading, loadingSignals: signalsQuery.isLoading,
    rolesError: !!rolesQuery.error, signalsError: !!signalsQuery.error,
    refetchRoles: () => { void rolesQuery.refetch(); }, refetchSignals: () => { void signalsQuery.refetch(); },
    health: healthQuery.data?.status ?? (healthQuery.isError ? 'unavailable' : 'checking'),
    profile, setProfile, mode, setMode, selectedRoleId: selectedRole?.id ?? '', setSelectedRoleId,
    scores: (role) => scoreRole(role, profile, mode, trendShare(role.id)), urgency: (role) => urgencyFor(role, mode, profile),
    trends: trendsQuery.data, trendsLoading: trendsQuery.isLoading, trendsError: !!trendsQuery.error,
    trendsRefreshing: refreshingTrends, refreshTrends,
    plan, planLoading, generatePlan,
    explored, exploredLoading, generateExplore,
    exploredPathway, pathwayLoading, pathwayError, pathwayRoleTitle, buildPathwayFor,
  };
  return <TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppContext.Provider value={value}><WorkspaceShell /></AppContext.Provider></WouterRouter><Toaster /></TooltipProvider>;
}

function outlookMetric(role: WorkforceRole) {
  if (role.outlook.includes("12%")) return { value: "12%", caption: "projected growth · U.S. BLS" };
  if (role.outlook.startsWith("Emerging")) return { value: "Emerging", caption: "demand varies by employer" };
  return { value: "Adjacent", caption: "validate local demand" };
}

function WorkspaceShell() {
  const { plan, planLoading, explored, exploredLoading, exploredPathway, pathwayLoading, pathwayError, pathwayRoleTitle, buildPathwayFor, profile } = useApp();
  const { t } = useSettings();
  const [location, setLocation] = useLocation();

  // The sidebar is shared by the planner and /about. On /about the anchor targets
  // do not exist, so navigate home first, then scroll once the sections mount.
  const goToSection = (id: string) => {
    setMobileNav(false);
    if (location !== '/') {
      setLocation('/');
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const [mobileNav, setMobileNav] = useState(false);
  const title = navItems.find((item) => item.href === location)?.label ?? 'Workspace';
  return <div className="aura-shell flex bg-background text-foreground">
    <aside className={`sidebar fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`} data-testid="navigation-sidebar">
      <Link href="/" className="flex items-center gap-3 px-6 pt-7 pb-8" data-testid="link-home">
        <div className="brand-mark flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"><Compass size={21} strokeWidth={2.3}/></div>
        <div><div className="font-display text-[19px] font-extrabold tracking-[-.06em]">AURA</div><div className="font-mono-ui text-[9px] tracking-[.2em] text-sidebar-foreground/55">WORKFORCE</div></div>
      </Link>
      <button onClick={() => setMobileNav(false)} aria-label="Close navigation" className="absolute right-3 top-7 rounded-md p-2 lg:hidden" data-testid="button-close-navigation"><X size={18}/></button>
      <div className="px-5 pb-3 font-mono-ui text-[9px] uppercase tracking-[.2em] text-sidebar-foreground/45">Your workspace</div>
      <nav className="flex flex-col gap-1 px-3" aria-label="Main navigation">
        {navItems.map(({ href, key, icon: Icon }) => <a key={href} href={href} onClick={(event) => { event.preventDefault(); goToSection(href.slice(1)); }} className="nav-link group flex items-center gap-3 rounded-xl px-3 py-3 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-foreground" data-testid={`link-${href.slice(1)}`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-foreground/5"><Icon size={17}/></span>
          <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{t.nav[key]}</span><span className="mt-0.5 block text-[10px] text-sidebar-foreground/45">{t.navDetail[key]}</span></span>
        </a>)}
      </nav>
      <div className="px-3 pt-2">
        <Link href="/about" onClick={() => setMobileNav(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[11px] text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-foreground" data-testid="link-about">
          <CircleHelp size={15}/> {t.about.eyebrow}
        </Link>
      </div>
      <div className="mt-auto px-4 pb-5">
        <div className="privacy-note rounded-2xl border border-sidebar-foreground/10 bg-sidebar-foreground/[.035] p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold"><ShieldCheck size={15} className="text-sidebar-primary"/>Private by design</div>
          <p className="mt-2 text-[10px] leading-relaxed text-sidebar-foreground/55">Your profile stays in this browser session. Nothing personal is sent to a model.</p>
        </div>
        <HealthPill/>
      </div>
    </aside>
    {mobileNav && <button aria-label="Close menu overlay" onClick={() => setMobileNav(false)} className="fixed inset-0 z-30 bg-[hsl(var(--foreground)/.35)] lg:hidden" data-testid="button-close-overlay"/>}
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-md sm:px-7 lg:px-10" data-testid="workspace-header">
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-border p-2 lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={18}/></button>
          <div className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-muted-foreground">AURA <span className="px-1 text-accent">/</span> {title}</div>
        </div>
        <div className="flex items-center gap-3"><SettingsControls/><span className="hidden text-[11px] text-muted-foreground sm:inline">A guide, not a verdict</span><div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold" data-testid="text-session-profile">P</div></div>
      </header>
      <main className="mx-auto w-full max-w-[1500px] px-4 sm:px-7 lg:px-10">
        <ErrorBoundary>
          {location === '/about' ? <AboutPage/> : <>
          <WelcomeDialog/>
          <HeroSection/>

          <section id="signals" className="scroll-mt-24 border-t border-border pt-8"><SignalsPage/></section>
          <section id="profile" className="scroll-mt-24 border-t border-border pt-8"><ProfilePage/></section>
          <FutureRolesSection explored={explored} exploredLoading={exploredLoading} onBuildPathway={buildPathwayFor} pathwayLoading={pathwayLoading} pathwayRoleTitle={pathwayRoleTitle}/>
          <LearningPathSection verified={exploredPathway} pathwayLoading={pathwayLoading} pathwayError={pathwayError} weeklyHours={profile.weeklyHours}/>
          </>}
        </ErrorBoundary>
        <footer className="mt-14 flex flex-col gap-2 border-t border-border/70 py-5 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between" data-testid="footer-caveat">
          <span>{t.footer.left}</span><span className="font-mono-ui tracking-[.08em]">{t.footer.right}</span>
        </footer>
      </main>
      <AskAura/>
    </div>
  </div>;
}
function HealthPill() {
  const { health } = useApp();
  return <div className="mt-4 flex items-center gap-2 px-2 text-[10px] text-sidebar-foreground/50" data-testid="status-api-health"><span className={`h-1.5 w-1.5 rounded-full ${health === 'unavailable' ? 'bg-accent' : 'bg-sidebar-primary'}`}/><span>Workspace service {health === 'checking' ? 'checking' : health}</span></div>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function PageHeading({ eyebrow, title, description, right }: { eyebrow: string; title: ReactNode; description: string; right?: ReactNode }) {
  return <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between page-enter"><div><div className="mb-3 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.19em] text-muted-foreground"><span className="h-px w-5 bg-accent"/>{eyebrow}</div><h1 className="font-display max-w-3xl text-[32px] font-bold leading-[1.1] tracking-[-.055em] sm:text-[40px]" data-testid="heading-page-title">{title}</h1><p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground" data-testid="text-page-description">{description}</p></div>{right}</div>;
}
function Card({ children, className = '', testId }: { children: ReactNode; className?: string; testId?: string }) { return <section className={`rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(40,57,52,.025)] ${className}`} data-testid={testId}>{children}</section>; }
function LoadingState({ label }: { label: string }) { return <div className="space-y-4" role="status" data-testid={`loading-${label}`}><div className="h-4 w-40 animate-pulse rounded bg-muted"/><div className="grid gap-4 md:grid-cols-2"><div className="h-44 animate-pulse rounded-2xl bg-muted"/><div className="h-44 animate-pulse rounded-2xl bg-muted"/></div><span className="sr-only">Loading {label}</span></div>; }
function ErrorState({ label, retry }: { label: string; retry: () => void }) { return <div className="flex flex-col items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-6" data-testid={`error-${label}`}><div className="flex items-center gap-2 font-semibold"><AlertTriangle size={17}/>We couldn’t load {label}</div><p className="text-sm text-muted-foreground">The service may be taking a pause. Your local profile is still here.</p><button onClick={retry} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground" data-testid={`button-retry-${label}`}><RotateCcw size={14}/>Try again</button></div>; }
function Metric({ label, value, caption, icon: Icon }: { label: string; value: string; caption: string; icon: typeof Gauge }) { return <div className="flex items-start gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary"><Icon size={17}/></div><div><div className="font-mono-ui text-[9px] uppercase tracking-[.13em] text-muted-foreground">{label}</div><div className="mt-1 text-[18px] font-bold leading-none">{value}</div><div className="mt-1 text-[10px] text-muted-foreground">{caption}</div></div></div>; }

function Dashboard() {
  const { roles, loadingRoles, rolesError, refetchRoles, mode, setMode, scores, urgency, setSelectedRoleId, profile, trends, trendsLoading, trendsError, trendsRefreshing, refreshTrends, plan, planLoading, explored, exploredLoading } = useApp();
  const [search, setSearch] = useState('');
  const [showAllRoles, setShowAllRoles] = useState(false);
  const ordered = useMemo(() => {
    const deterministic = [...roles].sort((a, b) => scores(b) - scores(a));
    if (!plan) return deterministic;
    // The AI's ranking decides the order; anything it did not rank goes last.
    const position = new Map(plan.ranking.map((entry, index) => [entry.roleId, index]));
    return [...deterministic].sort((a, b) => (position.get(a.id) ?? 99) - (position.get(b.id) ?? 99));
  }, [roles, scores, plan]);
  // Only roles that fall inside the sectors this person chose to explore.
  // If nothing matches (or they chose none), we show everything rather than an
  // empty page — and the toggle below makes the filter reversible.
  const sectorMatches = useMemo(() => ordered.filter((role) => profile.targetSectors.some((sector) => normalize(role.sector).includes(normalize(sector)) || normalize(sector).includes(normalize(role.sector)))), [ordered, profile.targetSectors]);
  const inMySectors = profile.targetSectors.length > 0 && sectorMatches.length > 0 && !showAllRoles;
  const related = inMySectors ? sectorMatches : ordered;
  const filtered = related.filter((r) => `${r.title} ${r.sector} ${r.summary}`.toLowerCase().includes(search.toLowerCase()));
  if (loadingRoles) return <><PageHeading eyebrow="Role explorer" title="Your next chapter, in view." description="Compare roles through the strengths you already carry and the skills you can build next."/><LoadingState label="roles"/></>;
  if (rolesError) return <><PageHeading eyebrow="Role explorer" title="Your next chapter, in view." description="Compare roles through the strengths you already carry and the skills you can build next."/><ErrorState label="roles" retry={refetchRoles}/></>;
  return <div className="page-enter">
     <PageHeading eyebrow="Role explorer · 01" title={<>A next step that starts<br className="hidden sm:block"/> with what you know.</>} description="Ranked for the profile you entered: your skills, your target sectors and your years of experience. Roles you do not match are shown further down, not hidden — you decide what is worth exploring." right={<div className="rounded-xl border border-border bg-card px-3 py-2 text-right"><div className="font-mono-ui text-[9px] uppercase tracking-[.13em] text-muted-foreground">Your profile · current role</div><div className="mt-1 text-[12px] font-semibold" data-testid="text-current-role">{profile.currentRole || 'Add your role in profile'}</div></div>}/>
    <Card className="mb-7 overflow-hidden border-primary/10 bg-primary text-primary-foreground" testId="card-transition-context">
      <div className="surface-grid grid gap-7 p-5 sm:p-7 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-primary-foreground/65"><Sparkles size={14}/>A practical starting point</div><h2 className="font-display mt-3 max-w-xl text-[23px] font-semibold leading-tight tracking-[-.04em] sm:text-[27px]">Your people skills have more than one place to go.</h2><p className="mt-2 max-w-lg text-[12px] leading-relaxed text-primary-foreground/68">Compare fit signals, training effort, and local market evidence. You can adjust your profile at any time.</p>
          <Link href="/profile" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--sidebar-primary))] px-4 py-2.5 text-[11px] font-bold text-[hsl(var(--sidebar-primary-foreground))] transition-transform hover:-translate-y-0.5" data-testid="link-edit-profile">Review your strengths <ArrowRight size={14}/></Link>
        </div>
        <div className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/[.045] p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2"><div className="text-[11px] font-semibold">Change scenario</div><div className="flex rounded-lg bg-primary-foreground/10 p-1" data-testid="control-disruption-mode">
            {(['Moderate','Aggressive'] as const).map((value) => <button key={value} onClick={() => setMode(value)} className={`rounded-md px-3 py-1.5 text-[10px] font-semibold transition-colors ${mode === value ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-primary-foreground/65 hover:text-primary-foreground'}`} data-testid={`button-scenario-${value.toLowerCase()}`}>{value}</button>)}
          </div></div>
           <p className="text-[10px] leading-relaxed text-primary-foreground/55">Moderate assumes a 4-year runway; Aggressive assumes an 18-month runway. These scenarios change planning urgency, not your job security.</p>
          <div className="mt-4 grid grid-cols-2 border-t border-primary-foreground/15 pt-4">
            <div><span className="font-mono-ui text-[9px] uppercase tracking-widest text-primary-foreground/50">Scenario</span><div className="mt-1 text-[15px] font-bold" data-testid="text-selected-scenario">{mode}</div></div>
            <div><span className="font-mono-ui text-[9px] uppercase tracking-widest text-primary-foreground/50">Weekly time</span><div className="mt-1 text-[15px] font-bold" data-testid="text-weekly-hours">{profile.weeklyHours} hrs <span className="text-[10px] font-normal text-primary-foreground/60">/ week</span></div></div>
          </div>
        </div>
      </div>
    </Card>
    {plan ? <div className="mb-5 rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5" data-testid="banner-ai-recommendation">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-muted-foreground">AI recommendation · {plan.model}</span>
        <span className="font-mono-ui text-[9px] text-muted-foreground">{new Date(plan.generatedAt).toLocaleString('en-GB')}</span>
      </div>
      <p className="font-display mt-2 text-[16px] font-semibold leading-snug">{plan.headline}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">Ranked from the profile you submitted. First: <span className="font-semibold text-foreground">{plan.recommendedRoleTitle}</span></p>
    </div> : planLoading ? <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-[11px] text-muted-foreground" role="status">Asking the AI to rank your roles…</div> : null}
    {exploredLoading ? <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-[11px] text-muted-foreground" role="status">Looking beyond our five curated roles…</div> : explored && explored.roles.length > 0 ? <section className="mb-6" data-testid="section-explored-roles">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div><h2 className="font-display text-[20px] font-bold tracking-[-.04em]">Other roles the AI sees for you</h2><p className="mt-1 max-w-2xl text-[11px] text-muted-foreground">Outside our five curated roles. Real occupations with a reference you can check — but no verified pathway yet.</p></div>
        <span className="rounded-full border border-accent/50 bg-accent/10 px-2.5 py-1 text-[9px] font-semibold">Exploratory · no pathway</span>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">{explored.roles.map((role) => <article key={role.title} className="rounded-2xl border border-dashed border-border bg-card p-5" data-testid={`explored-card-${normalize(role.title)}`}>
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="font-mono-ui text-[9px] uppercase tracking-[.15em] text-muted-foreground">{role.sector || 'Occupation'}</div><h3 className="font-display mt-1 text-[18px] font-bold leading-tight tracking-[-.03em]">{role.title}</h3></div><span className="shrink-0 rounded bg-secondary px-2 py-0.5 text-[8px] text-muted-foreground">{role.confidence}</span></div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{role.reason}</p>
        {role.skillsToBuild.length > 0 ? <div className="mt-3"><div className="font-mono-ui text-[8px] uppercase tracking-[.14em] text-muted-foreground">Skills to build</div><div className="mt-1 flex flex-wrap gap-1">{role.skillsToBuild.map((skill) => <span key={skill} className="rounded border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">{skill}</span>)}</div></div> : null}
        {role.firstStep ? <p className="mt-3 rounded-lg bg-primary/5 px-2.5 py-2 text-[10px] leading-relaxed"><span className="font-semibold">This week: </span>{role.firstStep}</p> : null}
        <p className="mt-3 border-t border-border pt-2 text-[8px] leading-relaxed text-muted-foreground">Check it yourself: {role.occupationSource}</p>
      </article>)}</div>
    </section> : null}
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-border/70 bg-secondary/45 p-4 text-[10px] leading-relaxed text-muted-foreground" data-testid="note-fit-caveat"><CircleHelp size={15} className="mt-0.5 shrink-0 text-primary"/><p><strong className="text-foreground">How to read these scores:</strong> Fit and transition urgency are directional estimates based on the profile you entered and role data. They are not hiring probabilities, performance ratings, or predictions. Speak with a counselor to add local context.</p></div>
  </div>;
}
function RoleCard({ role, profile, rank, score, urgency, onSelect, aiReason }: { role: WorkforceRole; profile: ProfileData; rank: number; score: number; urgency: number; onSelect: () => void; aiReason?: string }) {
  const retainedSkills = (role.transferableSkills ?? []).filter((skill) => hasProfileSkill(profile, skill));
  const skillGaps = (role.requiredSkills ?? []).filter((skill) => !hasProfileSkill(profile, skill));
  const outlook = outlookMetric(role);
  return <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_12px_30px_rgba(41,64,58,.08)]" testId={`card-role-${role.id}`}>
    <div className="absolute left-0 top-0 h-full w-[3px] bg-[hsl(var(--chart-1))] opacity-70 group-hover:opacity-100"/>
    <div className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="mb-2 flex items-center gap-2"><span className="font-mono-ui text-[9px] uppercase tracking-[.15em] text-muted-foreground">OPTION {String(rank).padStart(2,'0')}</span><span className="h-1 w-1 rounded-full bg-accent"/><span className="text-[10px] text-muted-foreground">{role.sector}</span></div><h3 className="font-display text-[20px] font-bold leading-tight tracking-[-.04em]" data-testid={`text-role-title-${role.id}`}>{role.title}</h3></div>
        <div className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-[hsl(var(--chart-1)/.18)] bg-[hsl(var(--chart-1)/.07)]" data-testid={`metric-fit-${role.id}`}><span className="font-mono-ui text-[17px] font-medium leading-none">{score}</span><span className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">fit</span></div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground" data-testid={`text-role-summary-${role.id}`}>{role.summary}</p>
      {aiReason ? <p className="mt-2 rounded-lg bg-primary/5 px-2.5 py-2 text-[10px] leading-relaxed text-foreground" data-testid={`text-ai-reason-${role.id}`}><span className="font-semibold">Why this fits: </span>{aiReason}</p> : null}
      <div className="my-4 grid grid-cols-2 gap-3 border-y border-border/70 py-4">
        <Metric label="Transition urgency" value={`${urgency}%`} caption={Number(role.disruptionExposure) > 60 ? 'More planning may help' : 'Room to plan thoughtfully'} icon={urgency > 58 ? ArrowUpRight : ArrowDownRight}/>
        <Metric label="Role outlook" value={outlook.value} caption={outlook.caption} icon={TrendingUp}/>
      </div>
      <p className="mb-4 text-[9px] leading-relaxed text-muted-foreground" data-testid={`text-role-outlook-note-${role.id}`}>{role.outlook}</p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div><div className="mb-2 font-mono-ui text-[9px] uppercase tracking-[.14em] text-muted-foreground">Strengths retained · {retainedSkills.length}</div><div className="flex flex-wrap gap-1.5">{retainedSkills.length ? retainedSkills.slice(0,4).map((skill) => <span key={skill} className="rounded-md bg-secondary px-2 py-1 text-[9px] font-medium text-secondary-foreground" data-testid={`tag-transferable-${role.id}-${normalize(skill)}`}>{skill}</span>) : <span className="text-[9px] text-muted-foreground">Add skills in your profile to see overlaps.</span>}</div></div>
        <div><div className="mb-2 font-mono-ui text-[9px] uppercase tracking-[.14em] text-muted-foreground">Critical skills to build · {skillGaps.length}</div><div className="flex flex-wrap gap-1.5">{skillGaps.length ? skillGaps.slice(0,3).map((skill) => <span key={skill} className="rounded-md border border-border px-2 py-1 text-[9px] text-muted-foreground" data-testid={`tag-gap-${role.id}-${normalize(skill)}`}>{skill}</span>) : <span className="text-[9px] text-primary">No listed critical gaps.</span>}{skillGaps.length > 3 && <span className="px-1 py-1 text-[9px] text-muted-foreground">+{skillGaps.length - 3} more</span>}</div></div>
      </div>
      <div className="flex items-center justify-between gap-3"><span className="text-[9px] text-muted-foreground">{role.learningPathway?.length ?? 0} learning steps · {role.requiredSkills?.length ?? 0} core skills</span><Link href="/pathway" onClick={onSelect} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-[10px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90" data-testid={`link-pathway-${role.id}`}>Explore pathway <ArrowRight size={13}/></Link></div>
    </div>
  </Card>;
}

function ProfilePage() {
  const { profile, setProfile, roles, mode, generatePlan, planLoading, generateExplore, exploredLoading } = useApp();
  const { t, lang } = useSettings();
  const p = profileCopy[lang];
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const steps = p.steps;
  const update = (field: keyof ProfileData, value: string | number | string[]) => { setDraft((current) => ({ ...current, [field]: value })); setSaved(false); };
  const toggleList = (field: 'skills'|'competencies'|'targetSectors', value: string) => update(field, draft[field].includes(value) ? draft[field].filter((v) => v !== value) : [...draft[field], value]);
   const competencies = ['Communication','Adaptability','Coaching','Reliability','Empathy','Attention to detail','Organization','Decision making','Collaboration','Problem solving','Time management','Leadership'];
   const sectors = ['Smart logistics','Technology','Healthcare','Education','Public services','Logistics','Clean energy','Financial services','Community services'];
   // Grouped by WHERE the work happens, not by "soft vs hard". A career switcher
   // thinks "which part of my job is this?", not "is this a technical skill?".
   // Competencies are already the people/thinking axis below.
   // Titles and descriptions come from the dictionary; option names stay in the
   // shared vocabulary so the API and the catalogue keep matching.
   const skillGroups: Array<{ key: keyof typeof p.groups; title: string; description: string; options: string[] }> = ([
     { key: 'tools', title: 'Tools & software', description: 'The systems someone in this role actually opens.', options: ['Microsoft Excel','Power BI','SQL','Python','Figma','Canva','Adobe Creative Suite','SAP / ERP systems','CRM systems','Google Analytics'] },
     { key: 'ops', title: 'Business operations & procurement', description: 'Work with suppliers, stock, money or hiring.', options: ['Vendor communication','Supplier coordination','Procurement','Manual PO processing','Inventory management','Inventory auditing','Logistics coordination','Cash handling','Recruitment support','Quality assurance'] },
     { key: 'care', title: 'Care, education & customer-facing', description: 'Work where the person in front of you is the job.', options: ['Clinical documentation','Patient coordination','Shift scheduling','Teaching & facilitation','Customer support'] },
     { key: 'data', title: 'Data, documentation & process', description: 'Turning records into something other people can use.', options: ['Data entry','Data analysis','Documentation','Report writing','Process mapping'] },
     { key: 'creative', title: 'Creative & project work', description: 'Making things, and getting them finished with other people.', options: ['Visual design','Content writing','Project coordination'] },
   ] as const).map((group) => ({
     key: group.key,
     options: [...group.options],
     title: p.groups[group.key]?.title ?? group.title,
     description: p.groups[group.key]?.desc ?? group.description,
   }));
   // Which of the above are software/tools. Used to split the AI's suggestion
   // into "tools", "practical skills" and "ways of working".
   const toolSkills = new Set(['Microsoft Excel','Power BI','SQL','Python','Figma','Canva','Adobe Creative Suite','SAP / ERP systems','CRM systems','Google Analytics']);
  const [inferring, setInferring] = useState(false);
  const [skillsSource, setSkillsSource] = useState<'ai' | 'empty' | 'failed' | null>(null);
  const [suggestedSummary, setSuggestedSummary] = useState<string | null>(null);
  const [suggested, setSuggested] = useState<{ tools: string[]; practical: string[]; competencies: string[] } | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [customSector, setCustomSector] = useState('');
  const vocabulary = new Set(skillGroups.flatMap((group) => group.options));
  const customSkills = draft.skills.filter((skill) => !vocabulary.has(skill));
  const addCustomSkill = () => {
    const value = customSkill.trim();
    if (!value) return;
    if (!draft.skills.includes(value)) {
      setDraft((current) => ({ ...current, skills: [...current.skills, value] }));
    }
    setCustomSkill('');
    setSaved(false);
  };
  const removeCustomSkill = (skill: string) => {
    setDraft((current) => ({ ...current, skills: current.skills.filter((item) => item !== skill) }));
    setSaved(false);
  };
  const addCustomSector = () => {
    const value = customSector.trim();
    if (!value) return;
    if (!draft.targetSectors.includes(value)) toggleList('targetSectors', value);
    setCustomSector('');
  };

  // Step 0 -> 1: the AI turns "role + industry + years" into concrete skills.
  // If the model is unavailable we still advance — a broken model must never
  // trap the user inside the form.
  const saveAndContinue = async () => {
    let next = draft;

    if (step === 0) {
      setInferring(true);
      setSkillsSource(null);
      try {
        const text = `${draft.currentRole || 'A worker'} in ${draft.industry || 'an unspecified industry'}, ${draft.yearsExperience} years of experience.`;
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const suggestion = (await response.json()) as {
          currentRole?: string;
          skills?: string[];
          competencies?: string[];
          summary?: string;
        };

        const suggestedSkills = suggestion.skills ?? [];
        const suggestedCompetencies = suggestion.competencies ?? [];

        if (suggestedSkills.length > 0 || suggestedCompetencies.length > 0) {
          // Suggestions are OFFERED, not applied: nothing is pre-selected on the
          // user's behalf. Only skills they typed themselves survive, because
          // those were a deliberate action.
          const keepCustom = draft.skills.filter((skill) => !vocabulary.has(skill));
          // Tools are pre-ticked because they are factual — you either use SAP or
          // you do not — while judgement-based skills and competencies stay
          // unticked so the person decides for themselves.
          const preTickedTools = suggestedSkills.filter((skill) => toolSkills.has(skill));
          next = {
            ...draft,
            currentRole: draft.currentRole || suggestion.currentRole || '',
            skills: Array.from(new Set([...keepCustom, ...preTickedTools])),
            competencies: [],
          };
          setSuggestedSummary(suggestion.summary?.trim() ? suggestion.summary.trim() : null);
          setSuggested({
            tools: suggestedSkills.filter((skill) => toolSkills.has(skill)),
            practical: suggestedSkills.filter((skill) => !toolSkills.has(skill)),
            competencies: suggestedCompetencies,
          });
          setSkillsSource('ai');
        } else {
          // The model answered, but nothing in its answer matched our vocabulary.
          // Say that, instead of pretending a suggestion was applied.
          setSuggestedSummary(null);
          setSkillsSource('empty');
        }
      } catch {
        setSkillsSource('failed');
      } finally {
        setInferring(false);
      }
    }

    setDraft(next);
    setProfile(next);
    setSaved(true);
    if (step < 3) setStep(step + 1);
  };
  return <div className="page-enter">
     <PageHeading eyebrow={t.cp.twoEyebrow} title={t.cp.twoTitle} description={p.description} right={<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[10px] text-muted-foreground"><ShieldCheck size={14} className="text-primary"/>{p.notSaved}</div>}/>
    <div className="grid gap-7 lg:grid-cols-[250px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
          <div className="font-mono-ui text-[9px] uppercase tracking-[.18em] text-primary-foreground/55">{p.builder}</div>
          <div className="mt-2 font-display text-[19px] font-bold tracking-[-.04em]">{p.builderTitle}</div>
          <div className="mt-5 space-y-2">{steps.map((label, index) => <button key={label} onClick={() => { setProfile(draft); setStep(index); }} className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${step === index ? 'bg-primary-foreground/12' : 'text-primary-foreground/55 hover:text-primary-foreground'}`} data-testid={`button-profile-step-${index+1}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[9px] ${index < step ? 'border-transparent bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : step === index ? 'border-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary))]' : 'border-primary-foreground/25'}`}>{index < step ? <Check size={12}/> : `0${index+1}`}</span><span className="text-[10px] font-medium">{label}</span>{step === index && <ChevronRight size={13} className="ml-auto"/>}</button>)}</div>
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2 text-[10px] font-semibold"><ShieldCheck size={14} className="text-primary"/>{p.privacyTitle}</div><p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{p.privacyBody}</p></div>
      </aside>
      <Card className="p-5 sm:p-7" testId="card-profile-step">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4"><div><div className="font-mono-ui text-[9px] uppercase tracking-[.16em] text-muted-foreground">{p.stepWord} 0{step+1} {p.ofWord} 04</div><h2 className="font-display mt-1 text-[22px] font-bold tracking-[-.04em]">{steps[step]}</h2></div><div className="font-mono-ui text-[10px] text-muted-foreground">{Math.round(((step+1)/4)*100)}% {p.completeWord}</div></div>
        {step === 0 && <div className="grid gap-5 sm:grid-cols-2">
          <Field label={p.roleLabel} hint={p.roleHint}><input value={draft.currentRole} onChange={(e) => update('currentRole', e.target.value)} placeholder={p.rolePlaceholder} className="form-input" data-testid="input-current-role"/></Field>
          <Field label={p.industryLabel} hint={p.industryHint}><input value={draft.industry} onChange={(e) => update('industry', e.target.value)} list="industry-options" placeholder={p.industryPlaceholder} className="form-input" data-testid="input-industry"/><datalist id="industry-options">
            {['Healthcare','Education','Public services','Procurement & operations','Logistics & transport','Retail & e-commerce','Manufacturing','Financial services','Construction','Hospitality & tourism','Technology','Telecommunications','Energy & utilities','Agriculture','Media & creative','Professional services','Community services','Oil, gas & chemicals'].map((option) => <option key={option} value={option}/>)}
          </datalist></Field>
          <Field label={p.yearsLabel} hint={p.yearsHint}><div className="relative"><input min="0" max="60" type="number" value={draft.yearsExperience} onChange={(e) => update('yearsExperience', Number(e.target.value))} className="form-input pr-16" data-testid="input-years-experience"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{p.yearsSuffix}</span></div></Field>
          <div className="rounded-xl bg-secondary/50 p-4"><div className="text-[11px] font-semibold">{p.startTitle}</div><p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{p.startBody}</p></div>
        </div>}
        {step === 1 && <div className="space-y-6">
          {skillsSource === 'ai' && <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-[10px] leading-relaxed" data-testid="note-skills-suggested"><span className="font-semibold">{p.suggested} </span>{suggestedSummary ? <>{suggestedSummary} </> : null}{p.suggestedNote}</div>}
          {skillsSource === 'empty' && <div className="rounded-lg border border-border bg-secondary/50 p-3 text-[10px] leading-relaxed text-muted-foreground" data-testid="note-skills-empty">{p.emptyNote}</div>}
          {skillsSource === 'failed' && <div className="rounded-lg border border-border bg-secondary/50 p-3 text-[10px] leading-relaxed text-muted-foreground" data-testid="note-skills-failed">{p.failedNote}</div>}
          {skillsSource === 'ai' && suggested ? <div className="space-y-6">
            {suggested.tools.length > 0 && <ChoiceGroup title={p.toolsTitle} description={p.toolsDesc} options={suggested.tools} chosen={draft.skills} toggle={(v) => toggleList('skills',v)} prefix="sugg-tool"/>}
            {suggested.practical.length > 0 && <ChoiceGroup title={p.practicalTitle} description={p.practicalDesc} options={suggested.practical} chosen={draft.skills} toggle={(v) => toggleList('skills',v)} prefix="sugg-practical"/>}
            {suggested.competencies.length > 0 && <ChoiceGroup title={p.waysTitle} description={p.waysDesc} options={suggested.competencies} chosen={draft.competencies} toggle={(v) => toggleList('competencies',v)} prefix="sugg-competency"/>}
            <button type="button" onClick={() => setShowAllSkills((current) => !current)} className="focus-ring text-[10px] font-semibold text-primary underline underline-offset-4" data-testid="button-toggle-all-skills">{showAllSkills ? p.hideAll : p.showAll}</button>
            {showAllSkills && <div className="space-y-6 border-t border-border pt-5">{skillGroups.map((group) => <ChoiceGroup key={group.key} title={group.title} description={group.description} options={group.options} chosen={draft.skills} toggle={(v) => toggleList('skills',v)} prefix={`skill-${group.key}`}/>)}<ChoiceGroup title={p.competenciesTitle} description={p.competenciesDesc} options={competencies} chosen={draft.competencies} toggle={(v) => toggleList('competencies',v)} prefix="competency"/></div>}
          </div> : <>
            {skillGroups.map((group) => <ChoiceGroup key={group.key} title={group.title} description={group.description} options={group.options} chosen={draft.skills} toggle={(v) => toggleList('skills',v)} prefix={`skill-${group.key}`}/>)}
            <ChoiceGroup title={p.competenciesTitle} description={p.competenciesDesc} options={competencies} chosen={draft.competencies} toggle={(v) => toggleList('competencies',v)} prefix="competency"/>
          </>}
          <Field label={p.addSkillTitle} hint={p.addSkillHint}>
            <div className="flex gap-2">
              <input value={customSkill} onChange={(event) => setCustomSkill(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustomSkill(); } }} placeholder={p.addSkillPlaceholder} className="form-input" data-testid="input-add-skill"/>
              <button type="button" onClick={addCustomSkill} className="shrink-0 rounded-lg bg-secondary px-4 text-[10px] font-semibold hover:bg-secondary/70" data-testid="button-add-skill">{p.add}</button>
            </div>
          </Field>
          {customSkills.length > 0 && <div className="flex flex-wrap items-center gap-2" data-testid="row-custom-skills">{customSkills.map((skill) => <button key={skill} type="button" onClick={() => removeCustomSkill(skill)} className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dashed border-primary/50 bg-primary/5 px-2.5 py-1.5 text-[10px] text-primary" data-testid={`tag-custom-skill-${normalize(skill)}`}>{skill} <X size={10}/></button>)}</div>}
          <p className="text-[9px] leading-relaxed text-muted-foreground" data-testid="note-skill-glossary">{p.definitions} <a href="/skill-glossary.pdf" target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-2">{p.glossary}</a> · <a href="/skill-taxonomy-onet.pdf" target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-2">{p.fullReference}</a> · {p.taxonomies} <a href="https://www.onetonline.org/find/descriptor/browse/2.B/" target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-2">O*NET</a> · <a href="https://esco.ec.europa.eu/en/classification/skill_main" target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-2">ESCO</a></p>
          <div className="rounded-lg bg-secondary/40 p-3 text-[10px] leading-relaxed text-muted-foreground" data-testid="note-strengths-explanation">{p.transferable}</div>
        </div>}
        {step === 2 && <div className="space-y-6"><ChoiceGroup title={p.sectorsTitle} description={p.sectorsDesc} options={sectors} chosen={draft.targetSectors} toggle={(v) => toggleList('targetSectors',v)} prefix="sector"/><Field label={p.sectorLabel} hint={p.sectorHint}><div className="flex gap-2"><input value={customSector} onChange={(event) => setCustomSector(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustomSector(); } }} placeholder={p.sectorPlaceholder} className="form-input" data-testid="input-custom-sector"/><button type="button" onClick={addCustomSector} className="shrink-0 rounded-lg bg-secondary px-4 text-[10px] font-semibold hover:bg-secondary/70" data-testid="button-add-sector">{p.add}</button></div></Field></div>}
        {step === 3 && <div className="space-y-6"><div className="rounded-xl border border-border bg-secondary/35 p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-primary"><Clock3 size={19}/></div><div><div className="text-[12px] font-semibold">{p.hoursTitle}</div><p className="mt-1 text-[10px] text-muted-foreground">{p.hoursBody}</p></div></div><div className="mt-6 flex items-end justify-between gap-4"><div><div className="font-mono-ui text-[9px] uppercase tracking-widest text-muted-foreground">{p.hoursLabel}</div><div className="mt-1 font-display text-[34px] font-bold tracking-[-.06em]" data-testid="text-hours-preview">{draft.weeklyHours} <span className="font-sans text-[14px] font-medium tracking-normal text-muted-foreground">{p.hoursSuffix}</span></div></div><input type="range" min="1" max="20" step="1" value={draft.weeklyHours} onChange={(e) => update('weeklyHours', Number(e.target.value))} className="w-1/2 accent-[hsl(var(--primary))]" aria-label="Weekly study hours" data-testid="slider-weekly-hours"/></div><div className="mt-3 flex justify-between font-mono-ui text-[9px] text-muted-foreground"><span>1 hr</span><span>10 hrs</span><span>20 hrs</span></div></div><div className="grid gap-3 sm:grid-cols-3"><Metric label={p.skillsMetric} value={`${draft.skills.length + draft.competencies.length}`} caption={p.skillsCaption} icon={Target}/><Metric label={p.sectorsMetric} value={`${draft.targetSectors.length}`} caption={p.sectorsCaption} icon={BriefcaseBusiness}/><Metric label={p.rhythmMetric} value={`${draft.weeklyHours}h`} caption={p.rhythmCaption} icon={Clock3}/></div></div>}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <button disabled={step===0} onClick={() => setStep(step-1)} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-profile-back"><ChevronLeft size={14}/>{p.back}</button>
          <div className="flex items-center gap-3">{saved && <span className="flex items-center gap-1 text-[10px] text-primary" data-testid="status-profile-updated"><CheckCircle2 size={13}/>{p.updated}</span>}
            {step < 3 ? <button onClick={() => { void saveAndContinue(); }} disabled={inferring} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[10px] font-semibold text-primary-foreground disabled:opacity-55" data-testid="button-profile-continue">{inferring ? p.finding : p.saveContinue} <ArrowRight size={14}/></button> : <button onClick={() => { setProfile(draft); setSaved(true); void generateExplore(draft).then(() => { document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' }); }); }} disabled={exploredLoading} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[10px] font-semibold text-primary-foreground disabled:opacity-55" data-testid="button-profile-finish"><Check size={14}/>{exploredLoading ? p.asking : p.apply}</button>}</div>
        </div>
      </Card>
    </div>
  </div>;
}
function Field({ label, hint, children }: { label: string; hint: string; children: ReactNode }) { return <label className="block"><span className="text-[11px] font-semibold">{label}</span><span className="mt-1 block text-[9px] text-muted-foreground">{hint}</span><div className="mt-2">{children}</div></label>; }
function ChoiceGroup({ title, description, options, chosen, toggle, prefix }: { title: string; description: string; options: string[]; chosen: string[]; toggle: (v: string) => void; prefix: string }) {
  return <section><h3 className="text-[12px] font-semibold">{title}</h3><p className="mt-1 text-[10px] text-muted-foreground">{description}</p><div className="mt-3 flex flex-wrap gap-2">{options.map((option) => { const active = chosen.includes(option); return <button key={option} type="button" onClick={() => toggle(option)} className={`focus-ring inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] transition-colors ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'}`} aria-pressed={active} data-testid={`button-${prefix}-${normalize(option)}`}>{active && <Check size={12}/>} {option}</button>; })}</div></section>;
}

function PathwayPage() {
  const { roles, loadingRoles, rolesError, refetchRoles, selectedRoleId, setSelectedRoleId, profile, scores } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  if (loadingRoles) return <><PageHeading eyebrow="Learning pathway · 03" title="Small steps, clearly sequenced." description="A practical learning plan built from role requirements and available time."/><LoadingState label="pathway"/></>;
  if (rolesError) return <><PageHeading eyebrow="Learning pathway · 03" title="Small steps, clearly sequenced." description="A practical learning plan built from role requirements and available time."/><ErrorState label="roles" retry={refetchRoles}/></>;
  const active = roles.find((role) => role.id === selectedRoleId) ?? [...roles].sort((a,b) => scores(b)-scores(a))[0];
  if (!active) return <EmptyState title="No pathways available yet" description="When role pathway data is available, you’ll find the learning steps here." icon={<BookOpen size={20}/>}/>;
  const modules = active.learningPathway ?? [];
  const totalHours = modules.reduce((sum, module) => sum + Number(module.hours || 0), 0);
  const totalWeeks = Math.ceil(totalHours / Math.max(1, profile.weeklyHours));
  return <div className="page-enter">
    <PageHeading eyebrow="Learning pathway · 03" title="Small steps, clearly sequenced." description="Start with the foundations, check prerequisites, and fit the time to your week." right={<label className="block"><span className="sr-only">Select target role</span><select value={active.id} onChange={(e) => setSelectedRoleId(e.target.value)} className="focus-ring h-10 max-w-[250px] rounded-xl border border-border bg-card px-3 text-[11px] font-semibold outline-none" data-testid="select-pathway-role">{roles.map((role) => <option key={role.id} value={role.id}>{role.title}</option>)}</select></label>}/>
    <Card className="mb-6 overflow-hidden" testId="card-pathway-overview"><div className="grid gap-0 md:grid-cols-[1fr_auto]"><div className="p-5 sm:p-7"><div className="font-mono-ui text-[9px] uppercase tracking-[.16em] text-muted-foreground">PATHWAY FOR</div><h2 className="font-display mt-2 text-[26px] font-bold tracking-[-.05em]" data-testid="text-pathway-role">{active.title}</h2><p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-muted-foreground">{active.summary}</p><div className="mt-5 flex flex-wrap gap-2">{active.sdgTargets?.map((target) => <span key={target} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[9px] font-medium" data-testid={`tag-pathway-sdg-${normalize(target)}`}><Leaf size={11} className="text-primary"/>{target}</span>)}</div></div><div className="grid grid-cols-2 border-t border-border bg-secondary/35 md:w-[280px] md:grid-cols-1 md:border-l md:border-t-0"><div className="flex items-center gap-3 border-b border-r border-border p-4 md:border-r-0"><Clock3 size={16} className="text-primary"/><div><div className="font-mono-ui text-[8px] uppercase tracking-wider text-muted-foreground">Learning time</div><div className="mt-1 text-[15px] font-bold" data-testid="text-pathway-hours">{totalHours} hrs</div></div></div><div className="flex items-center gap-3 border-b border-border p-4"><Activity size={16} className="text-primary"/><div><div className="font-mono-ui text-[8px] uppercase tracking-wider text-muted-foreground">At {profile.weeklyHours} hrs / week</div><div className="mt-1 text-[15px] font-bold" data-testid="text-pathway-weeks">{totalWeeks} {totalWeeks === 1 ? 'week' : 'weeks'} <span className="text-[10px] font-normal text-muted-foreground">approx.</span></div></div></div><div className="col-span-2 p-4 text-[9px] leading-relaxed text-muted-foreground md:col-span-1">Estimated learning time only. Pace varies by learner and provider.</div></div></div></Card>
    <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="font-display text-[20px] font-bold tracking-[-.04em]">Learning sequence</h2><p className="mt-1 text-[10px] text-muted-foreground">Prerequisites are shown before each step. Check the provider for current availability.</p></div><span className="font-mono-ui text-[9px] text-muted-foreground">{modules.length} MODULES</span></div>
    {!modules.length ? <EmptyState title="No modules listed for this role" description="Role requirements are available, but a learning sequence has not been provided." icon={<GraduationCap size={20}/>}/> :
      <div className="relative space-y-3" data-testid="list-learning-modules"><div className="absolute bottom-8 left-[20px] top-8 w-px bg-border sm:left-[24px]"/>{modules.map((module,index) => {
        const open = expanded === module.id;
        const weeks = Math.ceil(Number(module.hours || 0) / Math.max(1, profile.weeklyHours));
        return <article key={module.id} className="relative grid grid-cols-[42px_1fr] gap-2 sm:grid-cols-[50px_1fr] sm:gap-3" data-testid={`module-${module.id}`}>
          <div className="relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background font-mono-ui text-[10px] font-medium sm:h-12 sm:w-12">{String(index+1).padStart(2,'0')}</div>
          <Card className="min-w-0 overflow-hidden"><button onClick={() => setExpanded(open ? null : module.id)} className="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5" aria-expanded={open} data-testid={`button-module-expand-${module.id}`}><div className="min-w-0"><div className="mb-1 flex flex-wrap items-center gap-2"><span className="font-mono-ui text-[8px] uppercase tracking-[.13em] text-muted-foreground">{module.skill}</span><span className="rounded-full bg-secondary px-2 py-0.5 text-[8px] text-secondary-foreground">{module.hours} hours</span><span className="text-[8px] text-muted-foreground">≈ {weeks} {weeks === 1 ? 'week' : 'weeks'}</span></div><h3 className="font-display text-[16px] font-bold tracking-[-.03em]" data-testid={`text-module-title-${module.id}`}>{module.title}</h3><p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">{module.description}</p></div><ChevronDown size={16} className={`mt-1 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}/></button>
          {open && <div className="border-t border-border bg-secondary/25 px-4 py-4 sm:px-5"><div className="grid gap-4 sm:grid-cols-2"><div><div className="font-mono-ui text-[8px] uppercase tracking-widest text-muted-foreground">Prerequisites</div>{module.prerequisites?.length ? <ul className="mt-2 space-y-1">{module.prerequisites.map((prereq) => <li key={prereq} className="flex items-start gap-2 text-[10px]" data-testid={`text-prerequisite-${module.id}-${normalize(prereq)}`}><CircleDot size={12} className="mt-0.5 shrink-0 text-primary"/>{modules.find((candidate) => candidate.id === prereq)?.title ?? prereq}</li>)}</ul> : <p className="mt-2 text-[10px] text-muted-foreground">No prerequisites listed.</p>}</div><div><div className="font-mono-ui text-[8px] uppercase tracking-widest text-muted-foreground">Resource & cost</div><div className="mt-2 text-[10px] font-semibold">{module.provider}</div><p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">{module.costNote || 'Check the provider for current costs and availability.'}</p>{module.url && <a href={module.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary underline underline-offset-4" data-testid={`link-module-resource-${module.id}`}>Visit learning resource <ExternalLink size={12}/></a>}</div></div>{module.sdgTargets?.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">{module.sdgTargets.map((target) => <span key={target} className="rounded-full border border-border bg-card px-2 py-1 text-[8px] text-muted-foreground" data-testid={`tag-module-sdg-${module.id}-${normalize(target)}`}>{target}</span>)}</div>}</div>}</Card></article>;
      })}</div>}
    <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4 text-[10px] leading-relaxed text-muted-foreground" data-testid="note-pathway-caveat"><CircleHelp size={14} className="mr-2 inline text-primary"/>Providers and links are listed as supplied. Confirm course details, accessibility, and cost before enrolling.</div>
  </div>;
}
function EmptyState({ title, description, icon }: { title: string; description: string; icon: ReactNode }) { return <div className="rounded-2xl border border-dashed border-border bg-card/55 px-6 py-12 text-center" data-testid="state-empty"><div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">{icon}</div><div className="font-display text-[17px] font-bold">{title}</div><p className="mx-auto mt-1 max-w-md text-[11px] text-muted-foreground">{description}</p></div>; }

function SignalsPage() {
  const { signals, loadingSignals, signalsError, refetchSignals, roles, trends, trendsLoading, trendsError, trendsRefreshing, refreshTrends } = useApp();
  const { t } = useSettings();
  const [category, setCategory] = useState('All signals');
  const [query, setQuery] = useState('');
  const categories = ['All signals', ...Array.from(new Set(signals.map((signal) => signal.category).filter(Boolean)))];
  const visible = signals.filter((signal) => (category === 'All signals' || signal.category === category) && `${signal.title} ${signal.summary} ${signal.sourceName} ${signal.geography}`.toLowerCase().includes(query.toLowerCase()));
  const publishedDate = (date: string) => { const parsed = new Date(date); return Number.isNaN(parsed.valueOf()) ? date : new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(parsed); };
  return <div className="page-enter">
    <PageHeading eyebrow={t.cp.oneEyebrow} title={t.cp.oneTitle} description={t.cp.oneSub} right={<div className="flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-3 py-2 text-[9px] font-semibold text-foreground"><span className="h-1.5 w-1.5 rounded-full bg-accent"/>{t.signals.badge}</div>}/>
     <LiveTrendStrip snapshot={trends} roles={roles} isLoading={trendsLoading} isError={trendsError} isRefreshing={trendsRefreshing} onRefresh={refreshTrends}/>
     <Card className="mb-3 border-primary/10 bg-secondary/40" testId="card-signal-caveat"><div className="flex gap-3 p-4 sm:p-5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-primary"><FileText size={17}/></div><div><div className="text-[11px] font-semibold">{t.signals.contextTitle}</div><p className="mt-1 max-w-4xl text-[10px] leading-relaxed text-muted-foreground">{t.signals.contextBody}</p></div></div></Card>
     <p className="mb-5 font-mono-ui text-[9px] text-muted-foreground" data-testid="text-signal-review-date">{t.signals.reviewed}</p>
    {loadingSignals ? <LoadingState label="signals"/> : signalsError ? <ErrorState label="signals" retry={refetchSignals}/> : <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-1.5" data-testid="filter-signal-categories">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-lg px-3 py-2 text-[9px] font-semibold transition-colors ${category === item ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:text-foreground'}`} data-testid={`button-signal-category-${normalize(item)}`}>{item === 'All signals' ? t.signals.all : (t.signals.categoryMap[item] ?? item)}</button>)}</div><label className="relative block w-full sm:w-[220px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.signals.search} className="focus-ring h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-[10px] outline-none" aria-label="Search market signals" data-testid="input-search-signals"/></label></div>
      {!signals.length ? <EmptyState title={t.signals.noSignalsTitle} description={t.signals.noSignalsBody} icon={<Activity size={20}/>}/> : !visible.length ? <EmptyState title={t.signals.noViewTitle} description={t.signals.noViewBody} icon={<Search size={20}/>}/> :
      <div className="grid gap-4 xl:grid-cols-2" data-testid="list-market-signals">{visible.map((signal) => <SignalCard key={signal.id} signal={signal} publishedDate={publishedDate}/>)}</div>}
      <div className="mt-5 flex items-center gap-2 text-[9px] text-muted-foreground" data-testid="text-signal-count"><span className="font-mono-ui">{visible.length}</span> {t.signals.snapshots} {t.signals.shown} <span className="mx-1 text-border">·</span> {t.signals.notLive}</div>
    </>}
  </div>;
}
function SignalCard({ signal, publishedDate }: { signal: MarketSignal; publishedDate: (date: string) => string }) {
  const { t, lang } = useSettings();
  const bm = lang === 'bm' ? signalBm[signal.id] : undefined;
  return <Card className="overflow-hidden transition-colors hover:border-primary/35" testId={`card-signal-${signal.id}`}>
    <div className="p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-md bg-secondary px-2 py-1 font-mono-ui text-[8px] uppercase tracking-[.1em]">{t.signals.categoryMap[signal.category] ?? signal.category}</span><span className="flex items-center gap-1.5 text-[9px] text-muted-foreground"><span className={`h-1.5 w-1.5 rounded-full ${signal.live ? 'bg-[hsl(var(--chart-1))]' : 'bg-muted-foreground/50'}`}/>{signal.live ? t.signals.liveSource : t.signals.snapshot}</span></div>
      <h2 className="font-display mt-4 max-w-xl text-[18px] font-bold leading-snug tracking-[-.035em]" data-testid={`text-signal-title-${signal.id}`}>{bm?.title ?? signal.title}</h2>
      <div className="mt-4 flex items-end justify-between gap-4 border-y border-border/80 py-4"><div><div className="font-mono-ui text-[9px] uppercase tracking-[.13em] text-muted-foreground">{t.signals.reportedValue}</div><div className="mt-1 flex items-baseline gap-1"><span className="font-display text-[29px] font-bold tracking-[-.06em]" data-testid={`metric-signal-value-${signal.id}`}>{formatValue(signal.value)}</span><span className="text-[10px] text-muted-foreground">{bm?.unit ?? signal.unit}</span></div></div><div className="text-right"><div className="font-mono-ui text-[8px] uppercase tracking-[.13em] text-muted-foreground">{t.signals.period}</div><div className="mt-1 text-[10px] font-semibold" data-testid={`text-signal-period-${signal.id}`}>{signal.period}</div></div></div>
      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground" data-testid={`text-signal-summary-${signal.id}`}>{bm?.summary ?? signal.summary}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/70 pt-3 text-[9px]"><span className="flex items-center gap-1.5 text-foreground"><Users size={12} className="text-primary"/>{bm?.geography ?? signal.geography}</span><span className="flex items-center gap-1.5 text-muted-foreground"><Clock3 size={12}/>{publishedDate(bm?.published ?? signal.published)}</span></div>
      <div className="mt-3 rounded-lg bg-secondary/45 p-3 text-[9px] leading-relaxed text-muted-foreground" data-testid={`text-source-note-${signal.id}`}><span className="font-semibold text-foreground">{t.signals.sourceNote} · </span>{bm?.sourceNote ?? signal.sourceNote}</div>
      <div className="mt-4 flex items-center justify-between gap-3"><span className="text-[10px] font-semibold" data-testid={`text-source-name-${signal.id}`}>{signal.sourceName}</span>{signal.sourceUrl && <a href={signal.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-primary underline underline-offset-4" data-testid={`link-signal-source-${signal.id}`}>{t.signals.originalSource} <ExternalLink size={11}/></a>}</div>
    </div>
  </Card>;
}
function formatValue(value: number) { return Number.isFinite(Number(value)) ? new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(Number(value)) : String(value); }

export default App;
