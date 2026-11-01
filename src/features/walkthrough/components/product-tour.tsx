"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity, ArrowRight, BookMarked, CalendarDays, Check, ChevronLeft,
  ChevronRight, ClipboardCheck, CreditCard, FileCheck2, GraduationCap,
  LayoutDashboard, LockKeyhole, LogOut, Menu, ShieldCheck,
  Sparkles, UserRound, WalletCards, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  tourSteps,
  type DemoPageId,
} from "@/features/walkthrough/data/demo-data";
import { TourPage } from "@/features/walkthrough/components/tour-pages";

type NavigationItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  page?: DemoPageId;
  locked?: { title: string; description: string };
};
type NavigationGroup = { group: string; items: NavigationItem[] };

const navigation: NavigationGroup[] = [
  { group: "Overview", items: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, page: "dashboard" as const },
    { id: "finance", label: "Finance & Accounts", icon: WalletCards, locked: { title: "Advanced Financial Insights", description: "Explore deeper financial analysis and planning capabilities in the complete Radora platform." } },
    { id: "ai-tutor", label: "AI Tutor", icon: Sparkles, locked: { title: "AI Tutor", description: "Radora’s student AI tutor supports personalized learning in the full platform." } },
  ] },
  { group: "Role dashboards", items: [
    { id: "teacher-dashboard", label: "Teacher dashboard", icon: GraduationCap, page: "teacher-dashboard" },
    { id: "student-dashboard", label: "Student dashboard", icon: UserRound, page: "student-dashboard" },
  ] },
  { group: "Academics", items: [
    { id: "attendance", label: "Attendance", icon: ClipboardCheck, page: "attendance" as const },
    { id: "exams", label: "Proctored Tests", icon: FileCheck2, page: "exams" as const },
    { id: "timetable", label: "Timetable", icon: CalendarDays, page: "timetable" as const },
  ] },
  { group: "School life", items: [
    { id: "events", label: "Events & Gallery", icon: CalendarDays, page: "events" as const },
    { id: "fees", label: "Fee Management", icon: CreditCard, page: "fees" as const },
    { id: "library", label: "Library", icon: BookMarked, page: "library" as const },
    { id: "notifications", label: "Notifications", icon: Activity, page: "notifications" as const },
  ] },
];

const welcomeTiles: { icon: LucideIcon; label: string }[] = [
  { icon: GraduationCap, label: "Student life" },
  { icon: Activity, label: "Daily operations" },
  { icon: WalletCards, label: "School finance" },
];

type LockedFeature = { title: string; description: string } | null;

const subscribeToDemoAccess = () => () => {};
const getDemoAccess = () => typeof window !== "undefined"
  && window.sessionStorage.getItem("radora_product_tour_access") === "confirmed";
const getServerDemoAccess = () => false;

export function ProductTour() {
  const router = useRouter();
  const authorized = useSyncExternalStore(subscribeToDemoAccess, getDemoAccess, getServerDemoAccess);
  const [activePage, setActivePage] = useState<DemoPageId>("dashboard");
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [tourActive, setTourActive] = useState(false);
  const [autoTour, setAutoTour] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [lockedFeature, setLockedFeature] = useState<LockedFeature>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentStep = tourSteps[tourIndex];
  const displayPage = tourActive && currentStep ? currentStep.page : activePage;

  useEffect(() => {
    if (!authorized) router.replace("/login");
  }, [authorized, router]);

  const isTarget = (id: string) => tourActive && currentStep?.id === id;

  const startTour = () => {
    setTourIndex(0);
    setActivePage("dashboard");
    setTourActive(true);
    setAutoTour(true);
    setWelcomeOpen(false);
  };

  const exitTour = () => {
    window.sessionStorage.removeItem("radora_product_tour_access");
    router.push("/login");
  };

  const finishTour = () => {
    if (currentStep) setActivePage(currentStep.page);
    setTourActive(false);
    setAutoTour(false);
  };

  const advanceTour = useCallback(() => {
    if (tourIndex >= tourSteps.length - 1) {
      setActivePage(currentStep?.page ?? "dashboard");
      setTourActive(false);
      setAutoTour(false);
      return;
    }
    setTourIndex((index) => Math.min(tourSteps.length - 1, index + 1));
  }, [currentStep, tourIndex]);

  useEffect(() => {
    if (!tourActive || !autoTour || !currentStep) return;
    const timer = window.setTimeout(advanceTour, 7000);
    return () => window.clearTimeout(timer);
  }, [advanceTour, autoTour, currentStep, tourActive, tourIndex]);

  useEffect(() => {
    if (!tourActive || !currentStep) return;
    const timer = window.setTimeout(() => {
      document.querySelector(`[data-tour="${currentStep.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [currentStep, tourActive]);

  useEffect(() => {
    if (!autoTour) return;
    const pauseOnUserScroll = () => setAutoTour(false);
    const pauseOnScrollKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        setAutoTour(false);
      }
    };
    window.addEventListener("wheel", pauseOnUserScroll, { passive: true });
    window.addEventListener("touchstart", pauseOnUserScroll, { passive: true });
    window.addEventListener("pointerdown", pauseOnUserScroll, { passive: true });
    window.addEventListener("keydown", pauseOnScrollKey);
    return () => {
      window.removeEventListener("wheel", pauseOnUserScroll);
      window.removeEventListener("touchstart", pauseOnUserScroll);
      window.removeEventListener("pointerdown", pauseOnUserScroll);
      window.removeEventListener("keydown", pauseOnScrollKey);
    };
  }, [autoTour]);

  const showLockedFeature = (title: string, description: string) => {
    setLockedFeature({ title, description });
    setMobileNavOpen(false);
  };

  const choosePage = (page: DemoPageId) => {
    setActivePage(page);
    setTourActive(false);
    setAutoTour(false);
    setMobileNavOpen(false);
  };

  if (!authorized) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="flex items-center gap-2 text-sm text-muted-foreground"><span className="size-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />Preparing your demo…</div></div>;
  }

  const sidebar = (mobile = false) => (
    <aside className={`flex h-full w-[264px] shrink-0 flex-col bg-sidebar text-sidebar-foreground ${mobile ? "" : "fixed inset-y-0 left-0 z-20 hidden border-r border-sidebar-border md:flex"}`}>
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border/70 px-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-md"><Sparkles className="size-4" /></div>
        <div className="min-w-0"><p className="text-sm font-semibold tracking-wide">Radora</p><p className="text-[10px] text-sidebar-foreground/55">Institution workspace</p></div>
        <Badge className="ml-auto border border-amber-300/20 bg-amber-400/15 text-[9px] font-semibold tracking-wider text-amber-200">DEMO</Badge>
      </div>

      <div className="border-b border-sidebar-border/70 px-4 py-3">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/70 px-3 py-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white">RA</div>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">Radora Academy</p><p className="truncate text-[10px] text-sidebar-foreground/55">Demo institution</p></div>
          <ShieldCheck className="size-4 text-emerald-300" />
        </div>
      </div>

      <nav aria-label="Demo pages" className="sidebar-scroll flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navigation.map((section) => <section key={section.group}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">{section.group}</p>
          <ul className="space-y-1">{section.items.map((item) => {
            const Icon = item.icon;
            const active = item.page === displayPage;
            const highlighted = isTarget(item.id);
            return <li key={item.id} data-tour={item.id} className={highlighted ? "relative z-30 rounded-lg ring-2 ring-indigo-300 ring-offset-2 ring-offset-sidebar" : ""}>
              <button type="button" aria-current={active ? "page" : undefined} aria-label={item.locked ? `${item.label}, locked` : item.label} onClick={() => item.locked ? showLockedFeature(item.locked.title, item.locked.description) : item.page && choosePage(item.page)} className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${active ? "bg-sidebar-accent text-white shadow-sm" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-white"}`}>
                <Icon className={`size-4 ${active ? "text-indigo-300" : item.locked ? "text-amber-300" : "text-sidebar-foreground/55"}`} /><span className="flex-1">{item.label}</span>{item.locked && <LockKeyhole aria-hidden="true" className="size-3.5 text-amber-300" />}{item.id === "notifications" && <span className="flex size-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-semibold text-white">2</span>}
              </button>
            </li>;
          })}</ul>
        </section>)}
      </nav>

      <div className="border-t border-sidebar-border/70 p-3">
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-indigo-300/10 bg-indigo-300/5 p-2.5"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-indigo-300" /><p className="text-[10px] leading-4 text-sidebar-foreground/60">Sample data only. This demo cannot change real school records.</p></div>
        <button type="button" onClick={exitTour} className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-xs font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-white"><LogOut className="size-4" /> Exit walkthrough</button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      {sidebar()}
      {mobileNavOpen && <div className="fixed inset-0 z-50 flex md:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileNavOpen(false)} /><div className="relative z-10 h-full shadow-2xl">{sidebar(true)}</div><button onClick={() => setMobileNavOpen(false)} aria-label="Close menu" className="relative z-10 ml-auto mt-3 mr-3 flex size-10 items-center justify-center rounded-full bg-white text-slate-800"><X className="size-5" /></button></div>}

      <div className="min-h-screen md:pl-[264px]">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur sm:px-5">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu className="size-5" /></Button>
          <div className="hidden items-center gap-2 text-sm sm:flex"><span className="text-muted-foreground">Radora</span><span className="text-muted-foreground/40">/</span><span className="font-medium">{pageTitle(displayPage)}</span></div>
          <Badge className="gap-1.5 border border-amber-300 bg-amber-50 text-[10px] font-semibold tracking-wider text-amber-800"><span className="size-1.5 rounded-full bg-amber-500" /> DEMO MODE</Badge>
          <span className="hidden text-xs text-muted-foreground lg:inline">Fictional sample data · changes stay in this session</span>
          <div className="ml-auto flex items-center gap-2">
            {!tourActive && <Button variant="outline" size="sm" onClick={startTour}><Sparkles className="mr-1.5 size-3.5" /> Guided tour</Button>}
            <Button variant="ghost" size="sm" onClick={exitTour} className="hidden text-muted-foreground sm:inline-flex">Exit <LogOut className="ml-2 size-3.5" /></Button>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 pb-48 sm:px-6 lg:px-8" aria-label="Radora product tour">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={displayPage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              <TourPage page={displayPage} onLock={(title, description) => showLockedFeature(title, description)} onNavigate={choosePage} isTarget={isTarget} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Dialog open={welcomeOpen} onOpenChange={(next) => setWelcomeOpen(next)}>
        <DialogContent showCloseButton={false} className="max-w-2xl overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-7 text-white sm:p-10">
            <div className="absolute -right-20 -top-24 size-72 rounded-full bg-violet-400/20 blur-3xl" /><div className="absolute -bottom-32 left-12 size-64 rounded-full bg-blue-400/10 blur-3xl" />
            <div className="relative"><Badge className="border border-white/20 bg-white/10 text-indigo-100"><Sparkles className="mr-1.5 size-3" /> PRODUCT WALKTHROUGH</Badge><h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome to Radora.</h1><p className="mt-3 max-w-lg text-sm leading-6 text-indigo-100/80 sm:text-base">One connected workspace for the people, learning and operations that keep a school moving.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">{welcomeTiles.map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-indigo-50"><Icon className="size-4 text-indigo-200" />{label}</div>)}</div>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"><Button variant="ghost" onClick={() => setWelcomeOpen(false)} className="text-sm text-muted-foreground">Skip introduction</Button><Button onClick={startTour} className="h-11 bg-indigo-600 px-5 text-white hover:bg-indigo-700">Start Tour <ArrowRight className="ml-2 size-4" /></Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!lockedFeature} onOpenChange={(open) => !open && setLockedFeature(null)}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl border-0 p-0 shadow-2xl">
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 px-6 py-6 text-white"><div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/10"><LockKeyhole className="size-5 text-amber-200" /></div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">Radora full platform</p><DialogTitle className="mt-2 text-2xl font-semibold text-white">Unlock the Full Radora Experience</DialogTitle></div>
          <div className="space-y-3 p-6"><Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800"><LockKeyhole className="mr-1.5 size-3" /> {lockedFeature?.title}</Badge><DialogDescription className="text-sm leading-6">This feature is available in the complete Radora platform. Connect with our team to explore its capabilities.</DialogDescription>{lockedFeature?.description && <p className="text-xs leading-5 text-muted-foreground">{lockedFeature.description}</p>}<DialogFooter className="pt-3"><Button variant="outline" onClick={() => setLockedFeature(null)}>Continue demo</Button><Button onClick={() => { setLockedFeature(null); window.location.assign("https://www.radora.tech/card.html"); }} className="bg-indigo-600 text-white hover:bg-indigo-700">Contact Radora <ArrowRight className="ml-2 size-4" /></Button></DialogFooter></div>
        </DialogContent>
      </Dialog>

      {tourActive && currentStep && <aside aria-label="Guided tour controls" className="fixed bottom-3 left-3 right-3 z-40 rounded-2xl border bg-background/95 p-4 shadow-[0_12px_50px_rgba(15,23,42,0.22)] backdrop-blur-md sm:bottom-5 sm:left-auto sm:right-6 sm:w-[min(440px,calc(100vw-304px))] sm:p-5">
        <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700"><Sparkles className="size-3.5" /></span><span className="text-xs font-semibold">Guided walkthrough</span></div><span className="text-xs text-muted-foreground">{tourIndex + 1} of {tourSteps.length}</span></div>
        <p className="mb-3 text-[10px] text-muted-foreground">{autoTour ? "Auto-playing · scroll to take control" : "Paused · you’re in control"}</p>
        <div role="progressbar" aria-label="Tour progress" aria-valuemin={0} aria-valuemax={tourSteps.length} aria-valuenow={tourIndex + 1} className="mb-4 flex gap-1.5">{tourSteps.map((step, index) => <span key={step.id} className={`h-1 flex-1 rounded-full ${index <= tourIndex ? "bg-indigo-600" : "bg-muted"}`} />)}</div>
        <h2 className="text-base font-semibold">{currentStep.title}</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">{currentStep.description}</p>
        <div className="mt-4 flex items-center justify-between"><Button variant="ghost" size="sm" onClick={finishTour} className="text-xs text-muted-foreground">Skip Tour</Button><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { setAutoTour(false); setTourIndex((index) => Math.max(0, index - 1)); }} disabled={tourIndex === 0}><ChevronLeft className="mr-1 size-4" /> Previous</Button>{tourIndex === tourSteps.length - 1 ? <Button size="sm" onClick={finishTour}>Finish Tour <Check className="ml-1 size-4" /></Button> : <Button size="sm" onClick={() => { setAutoTour(false); setTourIndex((index) => Math.min(tourSteps.length - 1, index + 1)); }}><ChevronRight className="mr-1 size-4" /> Next</Button>}</div></div>
      </aside>}
    </div>
  );
}

function pageTitle(page: DemoPageId) {
  return navigation.flatMap((section) => section.items).find((item) => item.page === page)?.label ?? "Dashboard";
}
