import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  LayoutGrid,
  LineChart,
  HandCoins,
  Clock,
  Trash2,
  Plus,
  CheckCircle2,
} from "lucide-react";

const AIBORDER_CSS = `
.ai-chip{ display:inline-block; padding:2px; border-radius:16px; background:linear-gradient(90deg,#22c55e,#14b8a6,#22c55e,#0ea5e9); background-size:300% 300%; animation:aiGlow 5s linear infinite }
.ai-chip .ai-inner{ display:inline-block; background:rgba(255,255,255,.06); border-radius:14px }
@keyframes aiGlow{ 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
`;

const FORM_DARK_CSS = `
:root{ color-scheme: dark; }
select{ background-color: rgba(255,255,255,.06); color:#e7eef5; border:1px solid rgba(216, 61, 61, 0.12); border-radius:12px; }
select:focus{ outline: none; box-shadow: 0 0 0 2px rgba(16,185,129,.35); }
select option{ background:#0b1420; color:#e7eef5; }
select optgroup{ background:#0b1420; color:#a8b3c3; }
select option::-webkit-scrollbar{ width:10px }
select option::-webkit-scrollbar-thumb{ background:rgba(255,255,255,.12); border-radius:8px }
`;

const BORDER_GRADIENT_CSS = `
@property --a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@keyframes spinBorder { to { --a: 360deg; } }

.border-anim{
  position:absolute; inset:0; pointer-events:none; z-index:5;
}

.border-anim::before{
  content:"";
  position:absolute; inset:1px;
  border-radius:25px;
  border: 2px solid transparent;
  border-image: conic-gradient(
    from var(--a),
    #22c55e, #14b8a6, #0ea5e9, #8b5cf6, #22c55e
  ) 1;
  animation: spinBorder 8s linear infinite;
}

.border-anim::after{
  content:"";
  position:absolute; inset:-6px;
  border-radius:31px;
  filter: blur(10px);
  opacity:.18;
  background:
    radial-gradient(closest-side, rgba(20,184,166,.25), transparent 70%),
    radial-gradient(closest-side, rgba(14,165,233,.20), transparent 70%);
}
`;

const NAV_GRADIENT_CSS = `
@keyframes navSlide {
  0%   { background-position: 0% 0; }
  100% { background-position: -200% 0; }
}

.nav-chip{ position:relative; overflow:hidden; border-radius:1rem; }

.nav-active-surface{
  position:absolute; inset:0; z-index:0; border-radius:inherit;
  background: linear-gradient(90deg,
    #22c55e 0%,
    #14b8a6 25%,
    #0ea5e9 50%,
    #8b5cf6 75%,
    #22c55e 100%);
  background-size: 200% 100%;
  animation: navSlide 6s linear infinite;
  filter: saturate(1.05);
}

.nav-label{ position:relative; z-index:1; }
`;

const NAV_ANIM_CSS = `
@keyframes navSlide { 0%{background-position:0% 0} 100%{background-position:-200% 0} }

.nav-chip{ position:relative; overflow:visible; border-radius:1rem }

.nav-active-surface{
  position:absolute; inset:0; z-index:0; border-radius:inherit;
  background: linear-gradient(90deg, var(--c1), var(--c2) 33%, var(--c3) 66%, var(--c4));
  background-size:200% 100%;
  animation: navSlide var(--speed,6s) linear infinite;
  filter:saturate(1.05)
}

.nav-hover-border{
  position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background: linear-gradient(90deg, var(--c1), var(--c2) 33%, var(--c3) 66%, var(--c4));
  background-size:200% 100%;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  padding:2px; opacity:0; transition:opacity .18s ease;
}
.nav-chip:hover .nav-hover-border,
.nav-chip:focus-visible .nav-hover-border{
  opacity:1; animation: navSlide var(--speed,6s) linear infinite;
}

.nav-hover-underline{
  position:absolute; left:12%; right:12%; bottom:-8px; height:3px;
  border-radius:999px; pointer-events:none; opacity:0; transform:scaleX(.85);
  background: linear-gradient(90deg, var(--c1), var(--c2) 33%, var(--c3) 66%, var(--c4));
  background-size:200% 100%;
  box-shadow:0 0 10px rgba(14,165,233,.25);
  transition:opacity .18s ease, transform .18s ease;
}
.nav-chip:hover .nav-hover-underline,
.nav-chip:focus-visible .nav-hover-underline{
  opacity:1; transform:scaleX(1); animation: navSlide var(--speed,6s) linear infinite;
}

@media (prefers-reduced-motion: reduce){
  .nav-active-surface, .nav-hover-border, .nav-hover-underline{
    animation:none; background-position:50% 0
  }
}

.nav-label{ position:relative; z-index:1 }
`;

const BRAND = { name: "MRM Ar Condicionado", accentFrom: "#0a0758ff", accentTo: "#010804ff" };

const NAV = [
  { id: "gerencial", label: "Gerencial", icon: LayoutGrid },
  { id: "realizar", label: "Realizar Orçamento", icon: Clock },
  { id: "lancamentos", label: "Lançamentos", icon: HandCoins },
  { id: "precificacao", label: "Precificação", icon: LineChart },
] as const;

type Dia = "1/4" | "3/8" | "1/2" | "5/8" | "3/4" | "7/8" | "1-5/8";
const DIAS: Dia[] = ["1/4","3/8","1/2","5/8","3/4","7/8","1-5/8"];
const BTU_OPTIONS: { label: string; l: Dia; s: Dia }[] = [
  { label: "9000 BTUs",  l: "1/4", s: "3/8" },
  { label: "12000 BTUs", l: "1/4", s: "3/8" },
  { label: "18000 BTUs", l: "1/4", s: "1/2" },
  { label: "22000 BTUs", l: "1/4", s: "1/2" },
  { label: "24000 BTUs", l: "1/4", s: "5/8" },
  { label: "30000 BTUs", l: "3/8", s: "5/8" },
  { label: "36000 BTUs", l: "3/8", s: "5/8" },
  { label: "48000 BTUs", l: "3/8", s: "3/4" },
  { label: "60000 BTUs", l: "3/8", s: "3/4" },
  { label: "72000 BTUs", l: "7/8", s: "1-5/8" },
];

type Prices = {
  cobre: Record<Dia, number>;
  isol: Record<Dia, number>;
  pp: number;
  corrugada: number;
  caixa: number;
  dreno: number;
  fitaPVC: number;
  custoCobre: Record<Dia, number>;
  custoIsol: Record<Dia, number>;
  custoPP: number;
  custoCorrugada: number;
  custoCaixa: number;
  custoDreno: number;
  custoFitaPVC: number;
};

const DEFAULT_PRICES: Prices = {
  cobre: { "1/4":240, "3/8":360, "1/2":480, "5/8":630, "3/4":815, "7/8":0, "1-5/8":0 },
  isol:  { "1/4":40,  "3/8":40,  "1/2":45,  "5/8":55,  "3/4":65,  "7/8":0, "1-5/8":0 },
  pp: 10,
  corrugada: 2.5,
  caixa: 25,
  dreno: 50,
  fitaPVC: 3.5,
  custoCobre: { "1/4":120, "3/8":180, "1/2":240, "5/8":315, "3/4":407.5, "7/8":0, "1-5/8":0 },
  custoIsol:  { "1/4":20,  "3/8":20,  "1/2":22.5,"5/8":27.5,"3/4":32.5, "7/8":0, "1-5/8":0 },
  custoPP: 5,
  custoCorrugada: 1.25,
  custoCaixa: 12.5,
  custoDreno: 25,
  custoFitaPVC: 1.75,
};

function normalizePrices(p: any): Prices {
  const out: Prices = {
    cobre: { ...DEFAULT_PRICES.cobre, ...(p?.cobre || {}) },
    isol:  { ...DEFAULT_PRICES.isol,  ...(p?.isol  || {}) },
    pp: Number(p?.pp ?? DEFAULT_PRICES.pp),
    corrugada: Number(p?.corrugada ?? DEFAULT_PRICES.corrugada),
    caixa: Number(p?.caixa ?? DEFAULT_PRICES.caixa),
    dreno: Number(p?.dreno ?? DEFAULT_PRICES.dreno),
    fitaPVC: Number(p?.fitaPVC ?? DEFAULT_PRICES.fitaPVC),
    custoCobre: { ...DEFAULT_PRICES.custoCobre, ...(p?.custoCobre || {}) },
    custoIsol:  { ...DEFAULT_PRICES.custoIsol,  ...(p?.custoIsol  || {}) },
    custoPP: Number(p?.custoPP ?? DEFAULT_PRICES.custoPP),
    custoCorrugada: Number(p?.custoCorrugada ?? DEFAULT_PRICES.custoCorrugada),
    custoCaixa: Number(p?.custoCaixa ?? DEFAULT_PRICES.custoCaixa),
    custoDreno: Number(p?.custoDreno ?? DEFAULT_PRICES.custoDreno),
    custoFitaPVC: Number(p?.custoFitaPVC ?? DEFAULT_PRICES.custoFitaPVC),
  };
  DIAS.forEach((d) => {
    out.cobre[d] = Number(out.cobre[d] ?? 0);
    out.isol[d]  = Number(out.isol[d] ?? 0);
    out.custoCobre[d] = Number(out.custoCobre[d] ?? Math.round(out.cobre[d]/2));
    out.custoIsol[d]  = Number(out.custoIsol[d] ?? Math.round(out.isol[d]/2));
  });
  return out;
}

type InfraPoint = {
  id: string; nome: string; btu: string; metros: number; ppMetros: number; maoObra: number;
  corrugada?: boolean; caixa?: boolean; dreno?: boolean; maoObraOutro?: number;
};

function pricePerMeterCobre(dia: Dia, prices: Prices){ return (prices.cobre[dia] || 0) / 15; }
function pricePerMeterIsol(dia: Dia, prices: Prices){ return (prices.isol[dia] || 0) / 16; }
function costPerMeterCobre(dia: Dia, prices: Prices){ return (prices.custoCobre[dia] || 0) / 15; }
function costPerMeterIsol(dia: Dia, prices: Prices){ return (prices.custoIsol[dia] || 0) / 16; }

function corrugadaVendaPM(_spec: {l:Dia; s:Dia}, prices:Prices){ return Number(prices.corrugada ?? 0); }
function corrugadaCustoPM(_spec: {l:Dia; s:Dia}, prices:Prices){ return Number(prices.custoCorrugada ?? 0); }

function computeResumo(pontos: InfraPoint[], prices: Prices){
  let cobre=0, isolamento=0, pp=0, corrugada=0, caixa=0, dreno=0, maoDeObra=0, fat=0, fitaPVC=0;
  pontos.forEach(p=>{
    const spec = BTU_OPTIONS.find(b=>b.label===p.btu) || BTU_OPTIONS[0];
    const m = Number(p.metros||0);
    const ppm = Number(p.ppMetros||0);
    const cobrePM = pricePerMeterCobre(spec.l, prices) + pricePerMeterCobre(spec.s, prices);
    const isolPM  = pricePerMeterIsol(spec.l, prices)  + pricePerMeterIsol(spec.s, prices);
    const cobreCM = costPerMeterCobre(spec.l, prices)  + costPerMeterCobre(spec.s, prices);
    const isolCM  = costPerMeterIsol(spec.l, prices)   + costPerMeterIsol(spec.s, prices);

    cobre += m*cobrePM; fat += m*(cobrePM - cobreCM);
    isolamento  += m*isolPM;  fat += m*(isolPM - isolCM);
    pp    += ppm*prices.pp; fat += ppm*(prices.pp - prices.custoPP);
    fitaPVC += m * Number(prices.fitaPVC ?? 0);
    fat += m * (Number(prices.fitaPVC ?? 0) - Number(prices.custoFitaPVC ?? 0));

    if(p.corrugada){
      const venda = m * corrugadaVendaPM(spec, prices);
      const custo = m * corrugadaCustoPM(spec, prices);
      corrugada += venda; fat += (venda - custo);
    }
    if(p.caixa){ caixa += prices.caixa; fat += (prices.caixa - prices.custoCaixa); }
    if(p.dreno){ dreno += prices.dreno; fat += (prices.dreno - prices.custoDreno); }

    const mo = (p.maoObraOutro ?? p.maoObra) || 0;
    maoDeObra += mo;
    fat += mo;
  });
  const total = cobre+isolamento+pp+corrugada+caixa+dreno+maoDeObra+fitaPVC;
  return {
    total, totalNota: total*1.15, totalDesc: total*0.95, totalFat: fat,
    categorias: { cobre, isolamento, pp, corrugada, caixa, dreno, maoDeObra, fitaPVC }
  };
}

function runDevTests(){
  try{
    const n = normalizePrices({});
    DIAS.forEach(d=>{
      console.assert(n.cobre[d] >= n.custoCobre[d], 'cobre venda >= custo');
      console.assert(n.isol[d]  >= n.custoIsol[d], 'isol venda >= custo');
    });
    const spec = BTU_OPTIONS[0];
    const cobrePM = (n.cobre[spec.l]/15) + (n.cobre[spec.s]/15);
    const isolPM  = (n.isol[spec.l]/16)  + (n.isol[spec.s]/16);
    const sub = 6*cobrePM + 6*isolPM + 10*n.pp + 300;
    console.assert(Number.isFinite(sub), 'subtotal ok');
    const cobreCM = (n.custoCobre[spec.l]/15) + (n.custoCobre[spec.s]/15);
    const isolCM  = (n.custoIsol[spec.l]/16)  + (n.custoIsol[spec.s]/16);
    const fat = 6*(cobrePM-cobreCM) + 6*(isolPM-isolCM) + 10*(n.pp-n.custoPP);
    console.assert(fat >= 0, 'faturamento >= 0');
    console.assert(n.corrugada >= n.custoCorrugada, 'corrugada venda >= custo');
    const p1 = { id:'t1', nome:'P1', btu: BTU_OPTIONS[0].label, metros: 3, ppMetros: 5, maoObra: 300, corrugada: true, caixa: true, dreno: true } as any;
    const p2 = { id:'t2', nome:'P2', btu: BTU_OPTIONS[1].label, metros: 4, ppMetros: 2, maoObra: 300, corrugada: false, caixa: false, dreno: false } as any;
    const r1 = computeResumo([p1], n);
    const r2 = computeResumo([p1,p2], n);
    console.assert(r2.total >= r1.total, 'acréscimo com mais pontos');
    const r0 = computeResumo([], n);
    console.assert(r0.total === 0 && r0.totalFat === 0, 'resumo vazio');
    const onlyCorr = computeResumo([{ id:'t3', nome:'P3', btu: BTU_OPTIONS[0].label, metros: 2, ppMetros: 0, maoObra: 0, corrugada: true } as any], n);
    const expectedCorr = 2 * ((n.cobre[spec.l]/15)+(n.cobre[spec.s]/15));
    console.assert(Math.abs(onlyCorr.categorias.corrugada - expectedCorr) < 1e-6, 'corrugada usa valor do cobre');
    const withExtras = computeResumo([{ id:'t4', nome:'P4', btu: BTU_OPTIONS[0].label, metros: 0, ppMetros: 0, maoObra: 0, caixa: true, dreno: true } as any], n);
    console.assert(Math.abs(withExtras.categorias.caixa - n.caixa) < 1e-6, 'caixa somada');
    console.assert(Math.abs(withExtras.categorias.dreno - n.dreno) < 1e-6, 'dreno somado');
    console.log('✓ dev tests passed');
  }catch(e){ console.error('✗ dev tests failed', e); }
}
if (typeof window !== 'undefined' && !(window as any).__mrmDevTestsRun){
  (window as any).__mrmDevTestsRun = true; runDevTests();
}

function businessDaysBetween(a?: string | null, b?: string | null) {
  if (!a || !b) return null;
  const start = new Date(a);
  const end   = new Date(b);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  start.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  let days = 0;
  const dir = start <= end ? 1 : -1;
  const d = new Date(start);
  while ((dir === 1 && d <= end) || (dir === -1 && d >= end)) {
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) days++;
    d.setDate(d.getDate() + dir);
  }
  return Math.abs(days);
}

function businessDaysFromToday(target?: string | null) {
  if (!target) return null;
  const end = new Date(target);
  if (isNaN(end.getTime())) return null;
  const today = new Date();
  today.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  let d = new Date(today);
  let days = 0;
  const dir = d <= end ? 1 : -1;
  while ((dir === 1 && d < end) || (dir === -1 && d > end)) {
    d.setDate(d.getDate() + dir);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) days += dir;
  }
  return days;
}

export default function App() {
  const dark = true;
  const [route, setRoute] = useState("gerencial");
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [prices, setPrices] = useState<Prices>(() => {
    try {
      const raw = localStorage.getItem("mrm-prices");
      const parsed = raw ? JSON.parse(raw) : DEFAULT_PRICES;
      return normalizePrices(parsed);
    } catch { return DEFAULT_PRICES; }
  });
  useEffect(()=>{ try { localStorage.setItem("mrm-prices", JSON.stringify(prices)); } catch {} }, [prices]);

  return (
    <div className={dark ? "text-slate-100 bg-[#0d1220]" : "text-slate-100 bg-[#0d1220]"}
         style={{ minHeight: "100vh", backgroundImage: 'radial-gradient(1200px 300px at 20% -10%, rgba(255,255,255,.06), transparent), radial-gradient(1000px 400px at 110% 10%, rgba(16,185,129,.14), transparent)'}}
    >
      <style>{AIBORDER_CSS + FORM_DARK_CSS + BORDER_GRADIENT_CSS + NAV_GRADIENT_CSS}</style>

      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/0">
        <div className="mx-auto max-w-[1600px] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl shadow-lg" style={{ background: `linear-gradient(135deg, ${BRAND.accentFrom}, ${BRAND.accentTo})` }} />
            <div>
              <div className="text-lg font-extrabold tracking-tight">{BRAND.name}</div>
              <div className="text-[11px] text-slate-400 -mt-0.5">Sistema de Gestão</div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4">
        <div className="flex items-end justify-between gap-3 flex-wrap">
<motion.h1
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
  className="hidden sm:block text-4xl md:text-5xl font-extrabold tracking-tight"
>
  {NAV.find(n => n.id === route)?.label}
</motion.h1>

<div className="w-full md:w-auto">
  <div className="flex flex-wrap gap-2 justify-start">
    {NAV.map(({ id, label }) => {
      const active = route === id;
      return (
        <motion.button
          key={id}
          onClick={() => setRoute(id)}
          layout="position"
          className={`nav-chip px-4 py-2 rounded-2xl border ${
            active
              ? 'border-transparent text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]'
              : 'border-white/10 text-slate-100'
          } bg-white/5 hover:bg-white/10 basis-full sm:basis-auto`}
          style={{ contain: 'layout paint' }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 500, damping: 36, mass: 0.6 }}
        >
          {active && (
            <motion.div
              layoutId="nav-active"
              className="nav-active-surface"
              transition={{ type: 'spring', stiffness: 500, damping: 36, mass: 0.6 }}
            />
          )}
          <span className="nav-label font-semibold whitespace-nowrap">{label}</span>
        </motion.button>
      );
    })}
  </div>
</div>

        </div>
        <p className="mt-2 text-xs text-slate-400">Desenvolvido por rafaelmensen</p>
      </div>

<main className="mx-auto max-w-[1600px] px-4 pb-12 pt-3">
  {/* aqui está a borda animada BORDA animada borda animada: */}
  {/* <div className="relative rounded-[26px] mb-6 overflow-hidden"> */}
<div className="relative -mx-4 sm:mx-0 rounded-[26px] mb-6 overflow-hidden">

    <motion.div
      key={`surface-${route}`}
      layoutId={`surface-${route}`}
      className="absolute inset-0 rounded-[26px] border border-white/10"
      style={{ background: "rgba(255,255,255,0.04)" }}
      transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.6 }}
    />

    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
      preserveAspectRatio="none"
      style={{ transform: 'translateZ(0)' }}
    >
      <defs>

        <linearGradient id={`spinGrad-${route}`} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#22c55e"/>
          <stop offset="20%"  stopColor="#0ea5e9"/>
          <stop offset="40%"  stopColor="#8b5cf6"/>
          <stop offset="60%"  stopColor="#22c55e"/>
          <stop offset="80%"  stopColor="#0ea5e9"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
          <animateTransform
            attributeName="gradientTransform"
            type="rotate"
            from="0 .5 .5" to="360 .5 .5"
            dur="8s" repeatCount="indefinite"
          />
        </linearGradient>
      </defs>

      <rect
        x="0" y="0"
        width="100%" height="100%"
        rx="26" ry="26"
        fill="none"
        stroke={`url(#spinGrad-${route})`}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        shapeRendering="geometricPrecision"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>

    <AnimatePresence mode="wait">
      <motion.div
        key={route}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.22, ease: "easeOut", delay: 0.08 }}
className="relative z-10 p-2 sm:p-3 md:p-4"
      >
        {/* [NAVEGAÇÃO] GERENCIAL */}
{route === "gerencial" && <Gerencial itens={lancamentos} prices={prices} />}

        {/* [NAVEGAÇÃO] REALIZAR ORÇAMENTO */}
{route === "realizar" && (
          <RealizarOrcamento
            prices={prices}
            onSave={(orc) => {
              setLancamentos((prev) => [{ id: cryptoId(), ...orc }, ...prev]);
              setRoute("lancamentos");
            }}
          />
        )}

        {/* [NAVEGAÇÃO] LANÇAMENTOS */}
{route === "lancamentos" && (
          <Lancamentos
            itens={lancamentos}
            onDelete={(id) => setLancamentos((prev) => prev.filter((i) => i.id !== id))}
            onToggleAprovado={(id) =>
              setLancamentos((prev) =>
                prev.map((i) =>
                  i.id === id ? { ...i, status: i.status === "Aprovado" ? "Pendente" : "Aprovado" } : i
                )
              )
            }
            onSetPago={(id, val) =>
              setLancamentos((prev) => prev.map((i) => (i.id === id ? { ...i, pago: val } : i)))
            }
            onPatch={(id, patch) =>
              setLancamentos((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
            }
          />
        )}

        {/* [NAVEGAÇÃO] PRECIFICAÇÃO */}
{route === "precificacao" && <Precificacao prices={prices} onChange={setPrices} />}
      </motion.div>
    </AnimatePresence>
  </div>
</main>

    </div>
  );
}

function cryptoId(){
  return (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function Lancamentos({
  itens,
  onDelete,
  onToggleAprovado,
  onSetPago,
  onPatch,
}:{
  itens:any[];
  onDelete:(id:string)=>void;
  onToggleAprovado:(id:string)=>void;
  onSetPago:(id:string, val:boolean)=>void;
  onPatch:(id:string, patch:Partial<any>)=>void;
}) {
  const aprovados = itens.filter(i=>i.status==='Aprovado').length;
  const pendentes = itens.length - aprovados;

  const Btn = (props: { active?:boolean; danger?:boolean; onClick:()=>void; children:React.ReactNode; }) => (
    <button
      onClick={props.onClick}
      className={[
        "px-3 py-1 rounded-lg border text-sm transition-colors",
        props.active
          ? (props.danger ? "border-red-400 text-red-300 bg-red-500/10" : "border-emerald-400 text-emerald-300 bg-emerald-500/10")
          : "border-white/10 bg-white/5 hover:bg-white/10",
      ].join(" ")}
    >{props.children}</button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <div>{itens.length} lançamento(s)</div>
        <div className="flex gap-3">
          <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">Aprovados: {aprovados}</span>
          <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">Pendentes: {pendentes}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-3">
        {itens.map((o)=> {
          const resumo = o._resumo;
          const sub = Number(resumo?.total ?? o.total ?? 0);
          const fatMateriais = Number(resumo?.totalFat ?? 0);
const moOriginal = Number(resumo?.categorias?.maoDeObra ?? 0);

const pagoVal = typeof o.pagoValor === "number" ? o.pagoValor : undefined;
const extraMO  = o.pago && typeof pagoVal === "number" && pagoVal > sub ? (pagoVal - sub) : 0;
const moFinal  = moOriginal + (extraMO > 0 ? extraMO : 0);

const denom = (o.pago && typeof o.pagoValor === "number" && o.pagoValor > 0) ? o.pagoValor : sub;
const margemPct = denom > 0 ? (fatMateriais / denom) * 100 : 0;
const margemOk  = margemPct >= 60;

          const diasUteisAgCon   = businessDaysBetween(o.agendadoPara, o.concluidoEm);
          const diasUteisAteAgenda = businessDaysFromToday(o.agendadoPara);
          const precisaAviso7Dias  = typeof diasUteisAteAgenda === "number" && diasUteisAteAgenda > 7;

          return (
            <div key={o.id} className="rounded-[20px] border border-white/10 bg-white/5 p-3 sm:p-4"
>

              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleString()}</div>
                  <div className="mt-1 font-extrabold text-lg">{o.cliente || "Sem nome"}</div>
                  <div className="text-sm text-slate-300">{o.local || "—"}</div>
                </div>

                <div className="flex items-center gap-2">
                  {o.pago && (
                    <span className="px-2 py-1 rounded-full text-[11px] border border-emerald-400 text-emerald-300 bg-emerald-500/10">Pago</span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-[11px] border ${
                    o.status==='Aprovado'
                      ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                      : 'border-white/15 text-slate-300 bg-white/5'
                  }`}>{o.status || 'Pendente'}</span>
                  <button onClick={()=>onToggleAprovado(o.id)} className="rounded-lg p-2 bg-white/5 hover:bg-white/10" title={o.status==='Aprovado'?'Marcar como pendente':'Marcar como aprovado'}>
                    <CheckCircle2 className={o.status==='Aprovado' ? 'w-4 h-4 text-emerald-400' : 'w-4 h-4'} />
                  </button>
                  <button onClick={()=>onDelete(o.id)} className="rounded-lg p-2 bg-white/5 hover:bg-white/10" title="Excluir lançamento">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-2 font-bold flex items-center gap-2">
                <span>Topal (salvo): R$ {sub.toFixed(2)}</span>

                {o.pago && (
                  <span className="px-2 py-0.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs">
                    Pago: R$ {(typeof o.pagoValor === "number" ? o.pagoValor : sub).toFixed(2)}
                  </span>
                )}

                <span
                  className={[
                    "ml-auto px-2 py-0.5 rounded-md border text-xs",
                    o.comNota
                      ? (o.notaEmitida
                          ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/10"
                          : "text-amber-300  border-amber-500/40  bg-amber-500/10")
                      : "text-red-300   border-red-500/40   bg-red-500/10"
                  ].join(" ")}
                >
                  {o.comNota ? (o.notaEmitida ? "NF emitida" : "NF pendente") : "Sem nota"}
                </span>
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-slate-300">
                <div className="font-semibold mb-1">Resumo</div>

                {Array.isArray(o?.infra?.pontos) && o.infra.pontos.length ? (
                  <ul className="space-y-1">
                    {o.infra.pontos.map((pt:any, i:number)=> (
                      <li key={pt.id || i}>
                        <b>{pt.nome}</b> — {pt.btu}; cobre {pt.metros}m; PP {pt.ppMetros}m
                        {pt.corrugada ? ' • Corrugada' : ''}{pt.caixa ? ' • Caixa' : ''}{pt.dreno ? ' • Dreno' : ''}
                      </li>
                    ))}
                  </ul>
                ) : (<div>Nenhum ponto cadastrado.</div>)}

                {resumo && (
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                    <div>Cobre</div><div className="text-right">R$ {resumo.categorias.cobre.toFixed(2)}</div>
                    <div>Isolamento</div><div className="text-right">R$ {resumo.categorias.isolamento.toFixed(2)}</div>
                    <div>Cabo PP</div><div className="text-right">R$ {resumo.categorias.pp.toFixed(2)}</div>
                    <div>Corrugada</div><div className="text-right">R$ {resumo.categorias.corrugada.toFixed(2)}</div>
                    <div>Caixa POP</div><div className="text-right">R$ {resumo.categorias.caixa.toFixed(2)}</div>
                    <div>Dreno</div><div className="text-right">R$ {resumo.categorias.dreno.toFixed(2)}</div>
                    <div>Mão de obra</div><div className="text-right">R$ {moOriginal.toFixed(2)}</div>

                    <div className="col-span-2 border-t border-white/10" />
                    <div>Total</div><div className="text-right font-semibold">R$ {resumo.total.toFixed(2)}</div>
                    <div>Com Nota (+15%)</div><div className="text-right">R$ {resumo.totalNota.toFixed(2)}</div>
                    <div>Com desconto (-5%)</div><div className="text-right">R$ {resumo.totalDesc.toFixed(2)}</div>
                    <div>Faturamento (materiais)</div><div className="text-right">R$ {fatMateriais.toFixed(2)}</div>

                    <div className="col-span-2 flex items-center justify-between font-bold mt-1">
                      <span className={margemOk ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"}>
                        Margem de Lucro
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md border text-[13px] ${
                          margemOk
                            ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                            : "text-red-400 border-red-500/40 bg-red-500/10"
                        }`}
                        title="(Lucro materiais + M.O. final) ÷ Subtotal salvo"
                      >
                        {margemPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}

                {o.status === "Aprovado" && (
                  <div className="mt-3 space-y-3">

                    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="grid md:grid-cols-2 gap-2 items-start">
                        <div>
                          <div className="text-xs text-slate-300 mb-1">Agendar para</div>
                          <input
                            type="date"
                            value={o.agendadoPara || ""}
                            onChange={(e)=>onPatch(o.id, { agendadoPara: e.target.value })}
                            className="w-full rounded-md border border-white/10 bg-white/10 px-2 py-1 text-sm"
                          />
                          <div className="mt-1 text-[11px] text-amber-300">
                            ⚠ Agendar dentro de 7 dias úteis.
                            {precisaAviso7Dias && (
                              <span className="text-red-300 ml-1">(Atenção: {diasUteisAteAgenda} dias úteis)</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-300 mb-1">Concluir em</div>
                          <input
                            type="date"
                            value={o.concluidoEm || ""}
                            onChange={(e)=>onPatch(o.id, { concluidoEm: e.target.value, concluido: !!e.target.value })}
                            className="w-full rounded-md border border-white/10 bg-white/10 px-2 py-1 text-sm"
                          />
                          {diasUteisAgCon!=null && (
                            <div className="mt-1 text-[11px] text-slate-400">
                              Tempo entre agendado e concluído: <b>{diasUteisAgCon} dia(s) úteis</b>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-300">Com nota?</span>
                          <Btn active={!!o.comNota} onClick={()=>onPatch(o.id, { comNota: true })}>Sim</Btn>
                          <Btn danger={o.comNota===false} onClick={()=>onPatch(o.id, { comNota:false, notaEmitida:false })}>Não</Btn>
                        </div>

                        {o.comNota && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-300">Emitida?</span>
                            <Btn active={!!o.notaEmitida} onClick={()=>onPatch(o.id, { notaEmitida:true })}>Sim</Btn>
                            <Btn danger={o.notaEmitida===false} onClick={()=>onPatch(o.id, { notaEmitida:false })}>Não</Btn>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-300">Pago?</span>
                        <Btn
                          active={!!o.pago}
                          onClick={()=>{
                            onSetPago(o.id, true);
                            onPatch(o.id, { pago:true, pagoValor: typeof o.pagoValor==="number" ? o.pagoValor : sub });
                          }}
                        >Sim</Btn>
                        <Btn
                          danger={!o.pago}
                          onClick={()=>{
                            onSetPago(o.id, false);
                            onPatch(o.id, { pago:false, pagoValor:null });
                          }}
                        >Não</Btn>
                      </div>

                      {o.pago && (
                        <div className="mt-2 grid grid-cols-[auto_1fr] items-center gap-2">
                          <span className="text-xs text-slate-300">Quanto?</span>
                          <input
                            type="number"
                            step="0.01"
                            value={typeof o.pagoValor==="number" ? o.pagoValor : sub}
                            onChange={(e)=>onPatch(o.id, { pagoValor: parseFloat(e.target.value || "0") })}
                            className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-sm"
                          />
                          {typeof o.pagoValor==="number" && o.pagoValor > sub && (
                            <div className="col-span-2 text-[11px] text-amber-300">
                              Valor acima do total (+R$ {(o.pagoValor - sub).toFixed(2)}) foi considerado <b>mão de obra extra</b> para o cálculo da margem.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Gerencial({ itens, prices }:{ itens:any[]; prices:Prices }){
  const m = React.useMemo(()=>{
    const out = { total:0, faturamento:0, aprovados:0, pagos:0, pagoValor:0, nota15:0, desc5:0, sem:0, agendados:0, cobreM:0, ppM:0, corrM:0, caixas:0, drenos:0 } as any;
    itens.forEach(o=>{
      out.total += o.total || 0;
      if(o.status==='Aprovado') out.aprovados++;
      if(o.agendamento) out.agendados++;
      if(o.pago){ out.pagos++; out.pagoValor += Number(o.pagoValor || 0); if(o.pagamentoTipo==='nota15') out.nota15++; if(o.pagamentoTipo==='desc5') out.desc5++; if(o.pagamentoTipo==='sem') out.sem++; }
      const pts = o?.infra?.pontos || [];
      pts.forEach((p:any)=>{
        const spec = BTU_OPTIONS.find(b => b.label===p.btu) || BTU_OPTIONS[0];
        const mtrs = Number(p.metros||0);
        const ppm = Number(p.ppMetros||0);
        out.cobreM += mtrs*2;
        out.ppM += ppm;
        if(p.corrugada) out.corrM += mtrs;
        if(p.caixa) out.caixas += 1;
        if(p.dreno) out.drenos += 1;
        const vendaC = (prices.cobre[spec.l]/15 + prices.cobre[spec.s]/15) * mtrs;
        const custoC = (prices.custoCobre[spec.l]/15 + prices.custoCobre[spec.s]/15) * mtrs;
        const vendaI = (prices.isol[spec.l]/16 + prices.isol[spec.s]/16) * mtrs;
        const custoI = (prices.custoIsol[spec.l]/16 + prices.custoIsol[spec.s]/16) * mtrs;
        const vendaPP = ppm*prices.pp; const custoPP = ppm*prices.custoPP;
        const vendaCor = (p.corrugada? mtrs*corrugadaVendaPM(spec, prices) : 0); const custoCor = (p.corrugada? mtrs*corrugadaCustoPM(spec, prices) : 0);
        const vendaCx = (p.caixa? prices.caixa:0); const custoCx = (p.caixa? prices.custoCaixa:0);
        const vendaDr = (p.dreno? prices.dreno:0); const custoDr = (p.dreno? prices.custoDreno:0);
        out.faturamento += (vendaC-custoC)+(vendaI-custoI)+(vendaPP-custoPP)+(vendaCor-custoCor)+(vendaCx-custoCx)+(vendaDr-custoDr);
      });
    });
    out.qtd = itens.length;
    out.aceitacao = out.qtd? (out.aprovados/out.qtd*100) : 0;
    return out;
  }, [itens, prices]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {[{t:'Orçamentos',v:m.qtd},{t:'Aprovados',v:m.aprovados},{t:'Taxa de aceitação',v:m.aceitacao.toFixed(1)+'%'}].map((c,i)=> (
          <div key={i} className="relative overflow-hidden rounded-[20px]
 border border-white/10 bg-white/5 p-2 sm:p-3">
            <div className="absolute inset-0 -z-10 opacity-[.55]" style={{ background: `linear-gradient(135deg, ${BRAND.accentFrom}33, transparent 40%), linear-gradient(45deg, ${BRAND.accentTo}22, transparent 50%)` }} />
            <h3 className="text-lg font-extrabold">{c.t}</h3>
            <div className="mt-3 text-3xl font-extrabold">{c.v}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-[20px]
 border border-white/10 bg-white/5 p-4">
          <h3 className="text-lg font-extrabold">Valores</h3>
          <div className="mt-2 text-sm">Orçado total: <b>R$ {m.total.toFixed(2)}</b></div>
          <div className="mt-1 text-sm">Faturamento materiais: <b>R$ {m.faturamento.toFixed(2)}</b></div>
          <div className="mt-1 text-sm">Pago total: <b>R$ {m.pagoValor.toFixed(2)}</b> ({m.pagos} registro(s))</div>
          <div className="mt-1 text-xs text-slate-400">Pagos: Nota 15%: {m.nota15} • Desc 5%: {m.desc5} • Sem ajuste: {m.sem}</div>
        </div>
        <div className="relative overflow-hidden rounded-[20px]
 border border-white/10 bg-white/5 p-4">
          <h3 className="text-lg font-extrabold">Agenda</h3>
          <div className="mt-2 text-sm">Agendados: <b>{m.agendados}</b></div>
          <div className="mt-1 text-xs text-slate-400">Próximos 7 dias: (mock)</div>
        </div>
        <div className="relative overflow-hidden rounded-[20px]
 border border-white/10 bg-white/5 p-4">
          <h3 className="text-lg font-extrabold">Materiais</h3>
          <div className="mt-2 text-sm">Cobre (L+S): <b>{m.cobreM} m</b></div>
          <div className="mt-1 text-sm">Cabo PP: <b>{m.ppM} m</b></div>
          <div className="mt-1 text-sm">Corrugada: <b>{m.corrM} m</b></div>
          <div className="mt-1 text-sm">Caixa POP: <b>{m.caixas}</b> • Dreno: <b>{m.drenos}</b></div>
        </div>
      </div>
    </div>
  );
}

const RFQ_TYPES = [
  { id: "infra", label: "Infra Estrutura Ar Condicionado" },
  { id: "instalacao", label: "Instalação de Ar Condicionado" },
  { id: "gas", label: "Tubulação de Gás" },
  { id: "outros", label: "Outros" },
] as const;

function RealizarOrcamento({ prices, onSave }:{ prices:Prices; onSave:(orc:any)=>void }) {
  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);
  const [cliente, setCliente] = useState("");
  const [local, setLocal] = useState("");
  const [pontos, setPontos] = useState<InfraPoint[]>([]);
  const [telefone, setTelefone] = useState("");
  const [obs, setObs] = useState("");

  const toggleTipo = (id: string) => setTiposSelecionados([id]);

  const selectedTipo = tiposSelecionados[0] || null;

  const addPonto = () => setPontos(prev => ([...prev, {
    id: cryptoId(), nome: `Ponto ${prev.length + 1}`, btu: BTU_OPTIONS[0].label,
    metros: 3, ppMetros: 5, maoObra: 300, corrugada:false, caixa:false, dreno:false,
  }]));
  const updatePonto = (id:string, patch:Partial<InfraPoint>) => setPontos(arr => arr.map(pt => pt.id===id ? { ...pt, ...patch } : pt));
  const removePonto = (id:string) => setPontos(p => p.filter(pt => pt.id!==id));

const totais = useMemo(() => {

  let total=0, totalCobre=0, totalIsol=0, totalPP=0, totalMO=0, totalCorr=0, totalCx=0, totalDreno=0, totalFita=0, totalFat=0;

  pontos.forEach(p => {
  const spec = BTU_OPTIONS.find(b => b.label===p.btu) || BTU_OPTIONS[0];
  const metros = Number(p.metros ?? 0);
  const ppM    = Number(p.ppMetros ?? 0);

  const fita    = metros * Number(prices.fitaPVC ?? 0);
  const fitaFat = metros * (Number(prices.fitaPVC ?? 0) - Number(prices.custoFitaPVC ?? 0));

  const cobrePM = pricePerMeterCobre(spec.l, prices) + pricePerMeterCobre(spec.s, prices);
  const isolPM  = pricePerMeterIsol(spec.l, prices)  + pricePerMeterIsol(spec.s, prices);
  const cobreCM = costPerMeterCobre(spec.l, prices)  + costPerMeterCobre(spec.s, prices);
  const isolCM  = costPerMeterIsol(spec.l, prices)   + costPerMeterIsol(spec.s, prices);

  const cobre = metros * cobrePM;
  const isol  = metros * isolPM;
  const pp    = ppM * Number(prices.pp ?? 0);
  const mo    = Number(p.maoObraOutro ?? p.maoObra ?? 0);
  const corr  = p.corrugada ? metros * corrugadaVendaPM(spec, prices) : 0;
  const cx    = p.caixa ? Number(prices.caixa ?? 0) : 0;
  const dr    = p.dreno ? Number(prices.dreno ?? 0) : 0;

  const cobreFat = metros*(cobrePM - cobreCM);
  const isolFat  = metros*(isolPM  - isolCM);
  const ppFat    = ppM*(Number(prices.pp ?? 0) - Number(prices.custoPP ?? 0));
  const corrFat  = p.corrugada ? metros*(corrugadaVendaPM(spec, prices) - corrugadaCustoPM(spec, prices)) : 0;
  const cxFat    = p.caixa ? (Number(prices.caixa ?? 0) - Number(prices.custoCaixa ?? 0)) : 0;
  const drFat    = p.dreno ? (Number(prices.dreno ?? 0) - Number(prices.custoDreno ?? 0)) : 0;

  totalCobre += cobre; totalIsol += isol; totalPP += pp; totalMO += mo;
  totalCorr  += corr;  totalCx   += cx;   totalDreno += dr; totalFita += fita;

  total    += cobre + isol + pp + mo + corr + cx + dr + fita;
  totalFat += cobreFat + isolFat + ppFat + corrFat + cxFat + drFat + fitaFat;
});

  const toggleTipo = (id: string) => setTiposSelecionados([id]);

  const qtdPontos = pontos.length;
  const avgTotal = qtdPontos ? total / qtdPontos : 0;
  const avgNota  = qtdPontos ? (total * 1.15) / qtdPontos : 0;
  const avgDesc  = qtdPontos ? (total * 0.95) / qtdPontos : 0;

return {
  total, totalCobre, totalIsol, totalPP, totalMO, totalCorr, totalCx, totalDreno,
  totalFita,totalFat,
  totalNota: total*1.15, totalDesc: total*0.95,
  qtdPontos, avgTotal, avgNota, avgDesc
};

}, [pontos, prices]);

const { qtdPontos, avgTotal, avgNota, avgDesc } = totais;

const salvar = () => {
  const resumo = computeResumo(pontos, prices);

  const descricao = pontos.map((p, i) => {
    const spec = BTU_OPTIONS.find(b => b.label === p.btu) || BTU_OPTIONS[0];
    const extras: string[] = [];
    if (p.corrugada) extras.push("Corrugada");
    if (p.caixa) extras.push("Caixa POP");
    if (p.dreno) extras.push("Dreno");

    return [
      `Ponto ${i + 1} — ${p.nome}`,
      `BTU: ${p.btu} (L ${spec.l} + S ${spec.s})`,
      `Cobre: ${p.metros ?? 0} m`,
      `PP: ${p.ppMetros ?? 0} m`,
      `Mão de obra: R$ ${((p.maoObraOutro ?? p.maoObra) || 0).toFixed(2)}`,
      extras.length ? `Extras: ${extras.join(", ")}` : "Extras: —",
    ].join(" | ");
  }).join("\n");

  onSave({
    createdAt: new Date().toISOString(),
    cliente,
    local,
    tipos: tiposSelecionados.map(t => RFQ_TYPES.find(x => x.id === t)?.label || t),
    descricao,
    infra: { pontos },
    total: resumo.total,
    status: "Pendente",
    agendamento: null,
    pagamentoTipo: null,
    pago: false,
    pagoValor: null,
    _resumo: resumo,
  });
};

  return (
    <div className="space-y-6">

<div className="grid md:grid-cols-[2fr_220px] gap-3">

<div className="rounded-[20px] border border-white/10 bg-white/5 pt-2 pb-3 px-3 sm:pt-3 sm:pb-4 sm:px-4">

    <div className="grid md:grid-cols-3 gap-3">
      <div>
        <label className="text-xs text-slate-400">Cliente</label>
        <input
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Nome do cliente"
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px]"
        />
      </div>
      <div>
        <label className="text-xs text-slate-400">Telefone</label>
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(00) 00000-0000"
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px]"
        />
      </div>
      <div>
        <label className="text-xs text-slate-400">Localização</label>
        <input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Endereço / Cidade"
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px]"
        />
      </div>
    </div>

    <div className="mt-3">
      <label className="text-xs text-slate-400">Observações</label>
      <textarea
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        placeholder="Anotações gerais sobre o orçamento"
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px]"
      />
    </div>
  </div>

<div className="rounded-[20px]
 border border-white/10 bg-white/5 p-4 flex flex-col gap-2 items-end justify-start w-[220px]">

  <button
    onClick={salvar}
    className="px-6 py-2 rounded-xl font-semibold w-full text-white
               bg-emerald-600 hover:bg-emerald-500 focus:outline-none
               animate-pulse-green"
  >
    Salvar orçamento
  </button>

  <button
    onClick={() => {
      setCliente("");
      setTelefone("");
      setLocal("");
      setObs("");
      setPontos([]);
    }}
    className="px-6 py-2 rounded-xl font-semibold w-full text-slate-300
               border border-white/10 bg-gray-900 hover:bg-gray-800
               focus:outline-none"
  >
    Limpar
  </button>
</div>

<style>
{`
  @keyframes pulse-green {
    0%, 100% { background-color: rgb(5, 150, 105); }
    50%       { background-color: rgb(16, 185, 129); }
  }
  .animate-pulse-green {
    animation: pulse-green 1.8s ease-in-out infinite;
  }
`}
</style>

</div>

<div className="rounded-[20px]
 border border-white/10 bg-white/5 p-3 sm:p-4"
>
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-lg font-extrabold">Selecionar o Tipo de Orçamento</h3>
    <span className="text-xs text-slate-400"></span>
  </div>

  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
    {RFQ_TYPES.map((t) => {
      const active = tiposSelecionados.includes(t.id);
      return (
        <motion.button
          key={t.id}
          onClick={() => toggleTipo(t.id)}
          className={`rfq-chip relative overflow-hidden w-full min-w-0 px-4 py-2 rounded-2xl border
                      ${active
                        ? 'border-transparent text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]'
                        : 'border-white/10 text-slate-100'}
                      bg-white/5 hover:bg-white/10`}
          style={{ contain: 'layout paint' }}
          layout
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: active ? 1.02 : 1.01 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.6 }}
        >
          <AnimatePresence>
            {active && (
              <motion.div
                key="bg"
                className="absolute inset-0 nav-active-surface z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                aria-hidden
              />
            )}
          </AnimatePresence>

          <span className="relative z-10 font-semibold whitespace-nowrap text-center block">
            {t.label}
          </span>
        </motion.button>
      );
    })}
  </div>

  <style>{`
    .rfq-chip{ -webkit-tap-highlight-color: transparent; }
    .rfq-chip::after{
      content:"";
      position:absolute; inset:-20%;
      border-radius:inherit;
      pointer-events:none;
      background: radial-gradient(circle at center,
        rgba(34,197,94,.55),
        rgba(20,184,166,.35),
        rgba(14,165,233,.25),
        transparent 60%);
      transform: scale(0);
      opacity: 0;
    }
    .rfq-chip:active::after{
      animation: rfqPulse .45s ease-out forwards;
    }
    @keyframes rfqPulse{
      0%   { transform: scale(0);   opacity: .40; }
      100% { transform: scale(1.8); opacity: 0;   }
    }
  `}</style>
</div>

      {tiposSelecionados.length===0 && (
        <div className="rounded-[20px]
 border border-white/10 bg-white/5 p-6 text-center text-slate-300">Selecione o tipo de orçamento para começar.</div>
      )}

{ /* [REALIZAR > INSTALAÇÃO] Mesmas ferramentas do INFRA */ selectedTipo === "instalacao" && (
  <div className="rounded-[20px]
 border border-white/10 bg-white/5 p-3 sm:p-4"
>
    <div className="mb-3">
      <h3 className="text-lg font-extrabold">Instalação — Pontos</h3>
      <p className="text-xs text-slate-400">Selecione os pontos.</p>
    </div>

    <div className="flex items-center gap-2 mb-3">
      <div id="inst-add-wrap" className="relative w-full">
        <button
          onClick={() => {
            const el = document.getElementById("inst-add-wrap");
            el?.classList.add("delta-pos");
            setTimeout(() => el?.classList.remove("delta-pos"), 380);
            addPonto();
          }}
          className="btn-cta relative z-10 w-full rounded-[26px] border border-white/10 bg-white/5 hover:bg-white/10 py-3 flex items-center justify-center gap-2 shadow-sm overflow-hidden"
        >

          <span className="btn-ring" aria-hidden></span>

          <span className="btn-flash" aria-hidden></span>

          <span className="delta-left" aria-hidden></span>

          <span className="btn-text">Adicionar ponto</span>

          {pontos.length > 0 && (
            <span className="badge-count">
              <span className="badge-num">{pontos.length}</span>
            </span>
          )}
        </button>
      </div>
    </div>

    <style>{`
      @keyframes btnSlide{0%{background-position:0% 50%}100%{background-position:-200% 50%}}

      .btn-ring{
        position:absolute; inset:0; border-radius:26px; pointer-events:none;
        background: linear-gradient(90deg,#22c55e,#0ea5e9,#8b5cf6,#22c55e);
        background-size:200% 100%; animation: btnSlide 8s linear infinite;
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude; padding:2px;
      }
      .btn-cta{ transition: transform .06s ease }
      .btn-cta:active{ transform: scale(.985) }
      .btn-flash{
        position:absolute; inset:0; border-radius:26px; pointer-events:none;
        background: linear-gradient(90deg,#22c55e,#0ea5e9,#8b5cf6,#22c55e);
        background-size:200% 100%; opacity:0;
      }
      .btn-cta:active .btn-flash{ opacity:.22; animation: btnFlash .30s linear }
      .btn-cta:active .btn-ring{ animation: btnFlash .30s linear }
      @keyframes btnFlash{0%{background-position:0% 50%}100%{background-position:-200% 50%}}

      .btn-text{ color:#fff; font-weight:600; white-space:nowrap; animation: btnGlow 1.8s ease-in-out infinite }
      @keyframes btnGlow{
        0%,100%{ text-shadow:0 0 0 rgba(255,255,255,0) }
        50%{ text-shadow:0 0 8px rgba(255,255,255,.45), 0 0 16px rgba(255,255,255,.25) }
      }

      .badge-count{
        position:absolute; right:1rem; top:50%; transform:translateY(-50%);
      }
      .badge-num{
        font-weight:600; font-size:.9rem; color:rgba(255,255,255,.4);
        animation: badgeGlow 1.8s ease-in-out infinite;
      }
      @keyframes badgeGlow{
        0%,100%{ text-shadow:0 0 0 rgba(255,255,255,0) }
        50%{ text-shadow:0 0 6px rgba(255,255,255,.5), 0 0 12px rgba(255,255,255,.25) }
      }

      .delta-left{
        position:absolute; left:12px; top:50%; transform:translateY(-50%) scale(.6);
        width:22px; height:14px; border-radius:9999px; border:1px solid transparent;
        opacity:0; pointer-events:none;
      }

      #inst-add-wrap.delta-pos .delta-left{
        background: rgba(16,185,129,.18);
        border-color: rgba(16,185,129,.55);
        opacity:1; animation: bubblePop .35s ease-out;
      }
      #inst-add-wrap.delta-pos .delta-left::after{
        content:'+'; position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
        font-size:11px; color:#10b981; filter: drop-shadow(0 0 6px rgba(16,185,129,.35));
      }

      #inst-add-wrap.delta-neg .delta-left{
        background: rgba(239,68,68,.18);
        border-color: rgba(239,68,68,.55);
        opacity:1; animation: bubblePop .35s ease-out;
      }
      #inst-add-wrap.delta-neg .delta-left::after{
        content:'−'; position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
        font-size:11px; color:#ef4444; filter: drop-shadow(0 0 6px rgba(239,68,68,.35));
      }

      @keyframes bubblePop{
        0%{ transform:translateY(-50%) scale(.6); opacity:0 }
        60%{ transform:translateY(-50%) scale(1.1); opacity:1 }
        100%{ transform:translateY(-50%) scale(1); opacity:1 }
      }
    `}</style>

    <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-3">

{pontos.map((p) => {
  const spec = BTU_OPTIONS.find(b => b.label===p.btu) || BTU_OPTIONS[0];
  const cobrePM = pricePerMeterCobre(spec.l, prices) + pricePerMeterCobre(spec.s, prices);
  const isolPM  = pricePerMeterIsol(spec.l, prices) + pricePerMeterIsol(spec.s, prices);
  const cobreCM = costPerMeterCobre(spec.l, prices) + costPerMeterCobre(spec.s, prices);
  const isolCM  = costPerMeterIsol(spec.l, prices) + costPerMeterIsol(spec.s, prices);

  const mtrs = Number(p.metros ?? 0);
  const ppm  = Number(p.ppMetros ?? 0);

  const corr = p.corrugada ? mtrs * corrugadaVendaPM(spec, prices) : 0;
  const cx   = p.caixa ? Number(prices.caixa ?? 0) : 0;
  const dr   = p.dreno ? Number(prices.dreno ?? 0) : 0;
  const mo   = (p.maoObraOutro ?? p.maoObra) || 0;

  const valorFita = mtrs * Number(prices.fitaPVC ?? 0);

  const materiais =
    mtrs * cobrePM +
    mtrs * isolPM +
    ppm  * Number(prices.pp ?? 0) +
    corr + cx + dr +
    valorFita;

  const sub     = materiais + mo;
  const subNota = sub * 1.15;
  const subDesc = sub * 0.95;

  const fatCobre = mtrs*(cobrePM - cobreCM);
  const fatIsol  = mtrs*(isolPM  - isolCM);
  const fatPP    = ppm*(Number(prices.pp ?? 0) - Number(prices.custoPP ?? 0));
  const fatPVC   = mtrs*(Number(prices.fitaPVC ?? 0) - Number(prices.custoFitaPVC ?? 0));
  const fatCor   = p.corrugada ? mtrs*(corrugadaVendaPM(spec, prices) - corrugadaCustoPM(spec, prices)) : 0;
  const fatCx    = p.caixa ? (Number(prices.caixa ?? 0) - Number(prices.custoCaixa ?? 0)) : 0;
  const fatDr    = p.dreno ? (Number(prices.dreno ?? 0) - Number(prices.custoDreno ?? 0)) : 0;

  const fatTot   = fatCobre + fatIsol + fatPP + fatPVC + fatCor + fatCx + fatDr;

              return (
                <div key={p.id} className="rounded-[20px]
 border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      value={p.nome}
                      onChange={(e)=>updatePonto(p.id,{ nome: (e.target as HTMLInputElement).value })}
                      className="text-sm font-semibold bg-white/5 border border-white/10 rounded-lg px-2 py-1 w-[70%]"
                    />
                    <button onClick={()=>removePonto(p.id)} className="rounded-lg px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1 border border-white/10" title="remover ponto"><Trash2 className="w-3 h-3"/> remover</button>
                  </div>

                  <label className="block text-sm font-semibold mt-1">BTU / Capacidade</label>
                  <select value={p.btu} onChange={(e)=>updatePonto(p.id,{ btu:e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px]">
                    {BTU_OPTIONS.map(b => <option key={b.label} value={b.label}>{b.label}</option>)}
                  </select>
                  <div className="mt-1 text-xs text-slate-400">Tubulação {spec.l} e  {spec.s}</div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  </div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">

  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
    <div className="text-[11px] text-slate-400">Metros de Cobre</div>
    <div className="mt-1 flex items-center gap-2 sm:gap-3 step-controls">

      <div className="value-wrap relative shrink-0">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          value={Number.isFinite(p.metros) ? p.metros : 0}
          onChange={(e)=>{
            const val = parseFloat((e.target as HTMLInputElement).value);
            updatePonto(p.id,{ metros: Number.isFinite(val)? Math.max(0, Math.min(100, val)) : 0 });
          }}
          className="no-spin step-value value-pill text-lg sm:text-xl font-extrabold tabular-nums"
        />
        <span className="ghost ghost-minus">−</span>
        <span className="ghost ghost-plus">+</span>
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          type="button"
          aria-label="Diminuir metros"
          className="btn-step z-10"
          data-variant="minus"
          disabled={(Number.isFinite(p.metros)?p.metros:0) <= 0}
          onClick={()=>{
            const v = Number.isFinite(p.metros)? p.metros : 0;
            updatePonto(p.id, { metros: Math.max(0, Math.min(100, v - 1)) });
          }}
        >
          <span className="flash" aria-hidden />
          −
        </button>
        <button
          type="button"
          aria-label="Aumentar metros"
          className="btn-step z-10"
          data-variant="plus"
          disabled={(Number.isFinite(p.metros)?p.metros:0) >= 100}
          onClick={()=>{
            const v = Number.isFinite(p.metros)? p.metros : 0;
            updatePonto(p.id, { metros: Math.max(0, Math.min(100, v + 1)) });
          }}
        >
          <span className="flash" aria-hidden />
          +
        </button>
      </div>
    </div>
  </div>

  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
    <div className="text-[11px] text-slate-400">Cabo PP (m)</div>
    <div className="mt-1 flex items-center gap-2 sm:gap-3 step-controls">
      <div className="value-wrap relative shrink-0">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={200}
          value={Number.isFinite(p.ppMetros) ? p.ppMetros : 0}
          onChange={(e)=>{
            const val = parseFloat((e.target as HTMLInputElement).value);
            updatePonto(p.id,{ ppMetros: Number.isFinite(val)? Math.max(0, Math.min(200, val)) : 0 });
          }}
          className="no-spin step-value value-pill text-lg sm:text-xl font-extrabold tabular-nums"
        />
        <span className="ghost ghost-minus">−</span>
        <span className="ghost ghost-plus">+</span>
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          type="button"
          aria-label="Diminuir PP"
          className="btn-step z-10"
          data-variant="minus"
          disabled={(Number.isFinite(p.ppMetros)?p.ppMetros:0) <= 0}
          onClick={()=>{
            const v = Number.isFinite(p.ppMetros)? p.ppMetros : 0;
            updatePonto(p.id, { ppMetros: Math.max(0, Math.min(200, v - 1)) });
          }}
        >
          <span className="flash" aria-hidden />
          −
        </button>
        <button
          type="button"
          aria-label="Aumentar PP"
          className="btn-step z-10"
          data-variant="plus"
          disabled={(Number.isFinite(p.ppMetros)?p.ppMetros:0) >= 200}
          onClick={()=>{
            const v = Number.isFinite(p.ppMetros)? p.ppMetros : 0;
            updatePonto(p.id, { ppMetros: Math.max(0, Math.min(200, v + 1)) });
          }}
        >
          <span className="flash" aria-hidden />
          +
        </button>
      </div>
    </div>
  </div>
</div>

<style>{`
  @keyframes navSlide { 0%{background-position:0% 0} 100%{background-position:-200% 0} }
  @keyframes pulseUp   { 0%{transform:scale(1)} 40%{transform:scale(1.06)} 100%{transform:scale(1)} }
  @keyframes pulseDown { 0%{transform:scale(1)} 40%{transform:scale(.95)} 100%{transform:scale(1)} }

  .btn-step{
    position:relative; overflow:visible;
    width:2rem; height:2rem;
    display:inline-flex; align-items:center; justify-content:center;
    border-radius:.5rem; border:1px solid rgba(255,255,255,.10);
    background:rgba(255,255,255,.06);
    font-weight:700; line-height:1; user-select:none;
    transition:background .15s ease, border-color .15s ease, opacity .15s ease;
    -webkit-tap-highlight-color:transparent;
  }
  .btn-step .flash{
    position:absolute; inset:0; border-radius:inherit; pointer-events:none;
    background:linear-gradient(90deg, var(--c1), var(--c2) 33%, var(--c3) 66%, var(--c4));
    background-size:200% 100%;
    opacity:0; transition:opacity .18s ease; filter:saturate(1.05);
  }
  .btn-step[data-variant="minus"]{ --c1:#dc2626; --c2:#ef4444; --c3:#f43f5e; --c4:#dc2626; }
  .btn-step[data-variant="plus"] { --c1:#16a34a; --c2:#22c55e; --c3:#0ea5e9; --c4:#16a34a; }
  .btn-step[data-variant="minus"]:hover{ background:rgba(239,68,68,.16); border-color:rgba(239,68,68,.45); }
  .btn-step[data-variant="plus"]:hover { background:rgba(16,185,129,.18); border-color:rgba(16,185,129,.45); }
  .btn-step:active{ border-color:transparent; }
  .btn-step:active .flash{
    opacity:.95; animation:navSlide .7s linear;
    inset:-4px; border-radius:calc(.5rem + 4px);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);
  }
  .btn-step:active::before{
    content:""; position:absolute; inset:-8px; pointer-events:none;
    border-radius:calc(.5rem + 8px);
    background:linear-gradient(90deg, var(--c1), var(--c2) 33%, var(--c3) 66%, var(--c4));
    opacity:.28; filter:blur(10px);
  }
  .btn-step:disabled{ opacity:.45; cursor:not-allowed; }

  .value-pill{
    width:68px; padding:.35rem .55rem;
    border-radius:.6rem;
    border:1px solid rgba(255,255,255,.12);
    background:rgba(255,255,255,.06);
    color:#e7eef5; outline:none; text-align:left;
  }
  .value-pill:focus{ border-color:rgba(255,255,255,.22); background:rgba(255,255,255,.08); }

  .step-value{ transition:color .25s ease, transform .25s ease, box-shadow .25s ease; font-variant-numeric:tabular-nums; }
  .step-controls:has(.btn-step[data-variant="plus"]:active) .step-value{
    animation:pulseUp .28s ease-out; color:#d1fae5; box-shadow:0 0 0 2px rgba(16,185,129,.35) inset;
  }
  .step-controls:has(.btn-step[data-variant="minus"]:active) .step-value{
    animation:pulseDown .28s ease-out; color:#fecaca; box-shadow:0 0 0 2px rgba(239,68,68,.35) inset;
  }

  .ghost{
    position:absolute; left:calc(100% + .35rem); top:50%;
    transform:translateY(-50%) scale(.9);
    opacity:0; font-weight:800; font-size:1rem;
    transition:opacity .15s ease, transform .15s ease;
    text-shadow:0 0 6px rgba(0,0,0,.25);
  }
  .ghost-plus{ color:#34d399; }
  .ghost-minus{ color:#f87171; }
  .step-controls:has(.btn-step[data-variant="plus"]:active) .ghost-plus{ opacity:1; transform:translateY(-50%) scale(1.05); }
  .step-controls:has(.btn-step[data-variant="minus"]:active) .ghost-minus{ opacity:1; transform:translateY(-50%) scale(1.05); }

  @media (max-width: 420px){
    .btn-step{ width:1.75rem; height:1.75rem; }
    .value-pill{ width:56px; font-size:1rem; }

    .btn-step:active .flash{ inset:-2px; border-radius:calc(.5rem + 2px); }
    .btn-step:active::before{ inset:-6px; }
  }

  .no-spin::-webkit-outer-spin-button,.no-spin::-webkit-inner-spin-button{ -webkit-appearance:none; margin:0; }
  .no-spin{ -moz-appearance:textfield; }
`}</style>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">

  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
  <div className="text-[11px] text-slate-400">
    Cobre {spec.l} - {spec.s}
  </div>

  <div className="font-bold">R$ {(mtrs * cobrePM).toFixed(2)}</div>

  <div className="text-[11px] text-slate-400">(R$ {cobrePM.toFixed(2)}/m)</div>

  <div className="mt-2 text-[11px] text-slate-400 border-t border-white/10 pt-1">
    {spec.l} = R$ {(mtrs * pricePerMeterCobre(spec.l, prices)).toFixed(2)} <br />
    {spec.s} = R$ {(mtrs * pricePerMeterCobre(spec.s, prices)).toFixed(2)}
  </div>

<div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
  Lucro: <b className="text-amber-200">R$ {fatCobre.toFixed(2)}</b>
</div>
</div>

  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
  <div className="text-[11px] text-slate-400">Isolamento</div>

  <div className="font-bold">R$ {(mtrs * isolPM).toFixed(2)}</div>

  <div className="text-[11px] text-slate-400">(R$ {isolPM.toFixed(2)}/m)</div>

  <div className="mt-2 text-[11px] text-slate-400 border-t border-white/10 pt-1">
    {spec.l} = R$ {(mtrs * pricePerMeterIsol(spec.l, prices)).toFixed(2)} <br />
    {spec.s} = R$ {(mtrs * pricePerMeterIsol(spec.s, prices)).toFixed(2)}
  </div>

<div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
  Lucro: <b className="text-amber-200">R$ {fatIsol.toFixed(2)}</b>
</div>
</div>

<div className="rounded-xl border border-white/10 bg-white/5 p-2">
  <div className="text-[11px] text-slate-400">Cabo PP</div>
  <div className="font-bold">R$ {(ppm * Number(prices.pp ?? 0)).toFixed(2)}</div>
  <div className="text-[11px] text-slate-400">(R$ {(Number(prices.pp ?? 0)).toFixed(2)}/m)</div>

  <div className="mt-2 border-t border-white/10 pt-1">
    <div className="text-[11px] text-slate-400">Fita PVC</div>
    <div className="font-bold">R$ {(mtrs * Number(prices.fitaPVC ?? 0)).toFixed(2)}</div>

<div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
  Lucro: <b className="text-amber-200">R$ {(fatPP + fatPVC).toFixed(2)}</b>
</div>
  </div>

</div>

  <button
    onClick={()=>updatePonto(p.id,{ corrugada: !p.corrugada })}
    className={`rounded-xl border px-2 py-2 ${p.corrugada ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
  >
    <div className="font-semibold">Corrugada</div>
    <div>{p.corrugada ? `+ R$ ${(mtrs * corrugadaVendaPM(spec, prices)).toFixed(2)}` : '_____'} </div>
    <div className="text-[11px] text-slate-400">{`R$ ${corrugadaVendaPM(spec, prices).toFixed(2)}/m`}</div>

  {p.corrugada && (
    <div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
      Lucro: <b className="text-amber-200">R$ {fatCor.toFixed(2)}</b>
    </div>
  )}
  </button>

  <button
    onClick={()=>updatePonto(p.id,{ caixa: !p.caixa })}
    className={`rounded-xl border px-2 py-2 ${p.caixa ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
  >
    <div className="font-semibold">Caixa POP</div>
    <div>{p.caixa ? `+ R$ ${Number(prices.caixa || 0).toFixed(2)}` : '_____'} </div>
    <div className="text-[11px] text-slate-400">por ponto</div>

  {p.caixa && (
    <div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
      Lucro: <b className="text-amber-200">R$ {fatCx.toFixed(2)}</b>
    </div>
  )}
  </button>

  <button
    onClick={()=>updatePonto(p.id,{ dreno: !p.dreno })}
    className={`rounded-xl border px-2 py-2 ${p.dreno ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
  >
    <div className="font-semibold">Dreno</div>
    <div>{p.dreno ? `+ R$ ${Number(prices.dreno || 0).toFixed(2)}` : '_____'} </div>
    <div className="text-[11px] text-slate-400">por ponto</div>

  {p.dreno && (
    <div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
      Lucro: <b className="text-amber-200">R$ {fatDr.toFixed(2)}</b>
    </div>
  )}
  </button>
</div>

                  <div className="mt-3 text-sm">
                    <div className="text-[11px] text-slate-400 mb-1">Mão de obra (por ponto)</div>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={()=>updatePonto(p.id,{ maoObra: 300, maoObraOutro: undefined })}
                        className={`rounded-xl border px-2 py-2 ${p.maoObra===300 && p.maoObraOutro===undefined ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                        Nível 1<br/>R$ 300,00
                      </button>
                      <button
                        onClick={()=>updatePonto(p.id,{ maoObra: 350, maoObraOutro: undefined })}
                        className={`rounded-xl border px-2 py-2 ${p.maoObra===350 && p.maoObraOutro===undefined ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                        Nível 2<br/>R$ 350,00
                      </button>
                      <button
                        onClick={()=>updatePonto(p.id,{ maoObra: 400, maoObraOutro: undefined })}
                        className={`rounded-xl border px-2 py-2 ${p.maoObra===400 && p.maoObraOutro===undefined ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                        Nível 3<br/>R$ 400,00
                      </button>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
                        <div className="text-[11px] text-slate-400">Outro</div>
                        <input type="number" min={0} step={10} value={p.maoObraOutro ?? ''} placeholder="R$" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"
                          onChange={(e)=>{
                            const v = parseFloat((e.target as HTMLInputElement).value);
                            if(Number.isFinite(v)) updatePonto(p.id,{ maoObraOutro: v, maoObra: v });
                            else updatePonto(p.id,{ maoObraOutro: undefined });
                          }}
                        />
                      </div>
                    </div>
                  </div>

<div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2 text-sm">
  <div className="flex items-center justify-between">
    <span>Subtotal</span>
    <b>R$ {sub.toFixed(2)}</b>
  </div>
  <div className="flex items-center justify-between text-emerald-300/90">
    <span>Com Nota (+15%)</span>
    <b>R$ {subNota.toFixed(2)}</b>
  </div>
  <div className="flex items-center justify-between text-sky-300/90">
    <span>Com desconto (-5%)</span>
    <b>R$ {subDesc.toFixed(2)}</b>
  </div>

  <div className="mt-2 border-t border-white/10 pt-2 flex items-center justify-between text-amber-200">
    <span>Lucro (materiais)</span>
    <b>R$ {fatTot.toFixed(2)}</b>
  </div>

  <div className="flex items-center justify-between text-amber-300">
    <span>Mão de obra</span>
    <b>R$ {mo.toFixed(2)}</b>
  </div>

  <div className="flex items-center justify-between text-amber-400 font-bold">
    <span>Total Lucro + Mão de obra</span>
    <b>R$ {(fatTot + mo).toFixed(2)}</b>
  </div>

<div className="flex items-center justify-between font-bold">
  <span
    className={
      sub > 0
        ? ((fatTot + mo) / sub) * 100 >= 70
          ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
          : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
        : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
    }
  >
    Margem de Lucro
  </span>

  <b
    className={
      sub > 0
        ? ((fatTot + mo) / sub) * 100 >= 70
          ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
          : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
        : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
    }
  >
    {sub > 0 ? `${(((fatTot + mo) / sub) * 100).toFixed(2)}%` : "0%"}
  </b>
</div>

</div>

                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-[20px]
 border border-white/10 bg-white/5 p-3 flex flex-wrap gap-3 items-center justify-end">

  <div className="mr-auto text-sm">
    Pontos: <b>{qtdPontos}</b>
  </div>

<div className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-4 gap-1.5">
  {[
    ['Cobre',       totais.totalCobre],
    ['Isolamento',  totais.totalIsol],
    ['Cabo PP',     totais.totalPP],
    ['Fita PVC',    totais.totalFita],
    ['Corrugada',   totais.totalCorr],
    ['Caixa POP',   totais.totalCx],
    ['Dreno',       totais.totalDreno],
    ['Mão de obra', totais.totalMO],
  ].map(([label, valor]) => (
    <div
      key={label as string}
      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 flex items-center justify-between"
    >
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="text-[13px] font-semibold tabular-nums text-slate-300">
        R$ {(valor as number).toFixed(2)}
      </span>
    </div>
  ))}
</div>

<div className="w-full h-0" />

<div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">
  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between">
    <span className="text-sm">Total</span>
    <b className="text-lg font-extrabold tabular-nums">R$ {totais.total.toFixed(2)}</b>
  </div>

  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between">
    <span className="text-sm text-emerald-300/90">Com Nota (+15%)</span>
    <b className="text-lg font-extrabold text-emerald-300/90 tabular-nums">
      R$ {totais.totalNota.toFixed(2)}
    </b>
  </div>

  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between">
    <span className="text-sm text-sky-300/90">Com desconto (-5%)</span>
    <b className="text-lg font-extrabold text-sky-300/90 tabular-nums">
      R$ {totais.totalDesc.toFixed(2)}
    </b>
  </div>
</div>

  {qtdPontos > 1 && (
    <>
      <div className="w-full border-t border-white/10 my-1" />
      <div className="text-sm text-slate-300">Média por ponto:</div>
      <div className="text-sm font-extrabold">Subtotal: R$ {avgTotal.toFixed(2)}</div>
      <div className="text-sm font-extrabold text-emerald-300/90">Com Nota: R$ {avgNota.toFixed(2)}</div>
      <div className="text-sm font-extrabold text-sky-300/90">Com desconto: R$ {avgDesc.toFixed(2)}</div>
    </>
  )}

  <div className="w-full h-0" />

  <div className="text-lg font-extrabold text-amber-200">
    Lucro (materiais): R$ {totais.totalFat.toFixed(2)}
  </div>
  <div className="text-lg font-extrabold text-amber-300">
    Mão de obra: R$ {totais.totalMO.toFixed(2)}
  </div>
  <div className="text-lg font-extrabold text-amber-400">
    Total Lucro + Mão de obra: R$ {(totais.totalFat + totais.totalMO).toFixed(2)}
  </div>

  <div
    className={`text-lg font-extrabold ${
      totais.total > 0
        ? ((totais.totalFat + totais.totalMO) / totais.total) * 100 >= 60
          ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
          : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
        : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
    }`}
  >
    Margem de Lucro:{" "}
    {totais.total > 0
      ? `${(((totais.totalFat + totais.totalMO) / totais.total) * 100).toFixed(2)}%`
      : "0%"}
  </div>
</div>

        </div>
      )}

{tiposSelecionados.includes("infra") && (
  <div className="rounded-[20px]
 border border-white/10 bg-white/5 p-3 sm:p-4"
>
    <div className="mb-3">
      <h3 className="text-lg font-extrabold">Infra Estrutura — Pontos</h3>
      <p className="text-xs text-slate-400">Selecione os pontos.</p>
    </div>

    <div className="flex items-center gap-2 mb-3">
      <div id="infra-add-wrap" className="relative w-full">
        <button
          onClick={() => {
            const el = document.getElementById("infra-add-wrap");
            el?.classList.add("delta-pos");
            setTimeout(() => el?.classList.remove("delta-pos"), 380);
            addPonto();
          }}
          className="btn-cta relative z-10 w-full rounded-[26px] border border-white/10 bg-white/5 hover:bg-white/10 py-3 flex items-center justify-center gap-2 shadow-sm overflow-hidden"
        >

          <span className="btn-ring" aria-hidden></span>

          <span className="btn-flash" aria-hidden></span>

          <span className="delta-left" aria-hidden></span>

          <span className="btn-text">Adicionar ponto</span>

          {pontos.length > 0 && (
            <span className="badge-count">
              <span className="badge-num">{pontos.length}</span>
            </span>
          )}
        </button>
      </div>
    </div>

    <style>{`
      @keyframes btnSlide{0%{background-position:0% 50%}100%{background-position:-200% 50%}}

      .btn-ring{
        position:absolute; inset:0; border-radius:26px; pointer-events:none;
        background: linear-gradient(90deg,#22c55e,#0ea5e9,#8b5cf6,#22c55e);
        background-size:200% 100%; animation: btnSlide 8s linear infinite;
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude; padding:2px;
      }
      .btn-cta{ transition: transform .06s ease }
      .btn-cta:active{ transform: scale(.985) }
      .btn-flash{
        position:absolute; inset:0; border-radius:26px; pointer-events:none;
        background: linear-gradient(90deg,#22c55e,#0ea5e9,#8b5cf6,#22c55e);
        background-size:200% 100%; opacity:0;
      }
      .btn-cta:active .btn-flash{ opacity:.22; animation: btnFlash .30s linear }
      .btn-cta:active .btn-ring{ animation: btnFlash .30s linear }
      @keyframes btnFlash{0%{background-position:0% 50%}100%{background-position:-200% 50%}}

      .btn-text{ color:#fff; font-weight:600; white-space:nowrap; animation: btnGlow 1.8s ease-in-out infinite }
      @keyframes btnGlow{
        0%,100%{ text-shadow:0 0 0 rgba(255,255,255,0) }
        50%{ text-shadow:0 0 8px rgba(255,255,255,.45), 0 0 16px rgba(255,255,255,.25) }
      }

      .badge-count{
        position:absolute; right:1rem; top:50%; transform:translateY(-50%);
      }
      .badge-num{
        font-weight:600; font-size:.9rem; color:rgba(255,255,255,.4);
        animation: badgeGlow 1.8s ease-in-out infinite;
      }
      @keyframes badgeGlow{
        0%,100%{ text-shadow:0 0 0 rgba(255,255,255,0) }
        50%{ text-shadow:0 0 6px rgba(255,255,255,.5), 0 0 12px rgba(255,255,255,.25) }
      }

      .delta-left{
        position:absolute; left:12px; top:50%; transform:translateY(-50%) scale(.6);
        width:22px; height:14px; border-radius:9999px; border:1px solid transparent;
        opacity:0; pointer-events:none;
      }

      #infra-add-wrap.delta-pos .delta-left{
        background: rgba(16,185,129,.18);
        border-color: rgba(16,185,129,.55);
        opacity:1; animation: bubblePop .35s ease-out;
      }
      #infra-add-wrap.delta-pos .delta-left::after{
        content:'+'; position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
        font-size:11px; color:#10b981; filter: drop-shadow(0 0 6px rgba(16,185,129,.35));
      }

      #infra-add-wrap.delta-neg .delta-left{
        background: rgba(239,68,68,.18);
        border-color: rgba(239,68,68,.55);
        opacity:1; animation: bubblePop .35s ease-out;
      }
      #infra-add-wrap.delta-neg .delta-left::after{
        content:'−'; position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
        font-size:11px; color:#ef4444; filter: drop-shadow(0 0 6px rgba(239,68,68,.35));
      }

      @keyframes bubblePop{
        0%{ transform:translateY(-50%) scale(.6); opacity:0 }
        60%{ transform:translateY(-50%) scale(1.1); opacity:1 }
        100%{ transform:translateY(-50%) scale(1); opacity:1 }
      }
    `}</style>

    <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-3">



{pontos.map((p) => {
  const spec = BTU_OPTIONS.find(b => b.label===p.btu) || BTU_OPTIONS[0];
  const cobrePM = pricePerMeterCobre(spec.l, prices) + pricePerMeterCobre(spec.s, prices);
  const isolPM  = pricePerMeterIsol(spec.l, prices) + pricePerMeterIsol(spec.s, prices);
  const cobreCM = costPerMeterCobre(spec.l, prices) + costPerMeterCobre(spec.s, prices);
  const isolCM  = costPerMeterIsol(spec.l, prices) + costPerMeterIsol(spec.s, prices);

  const mtrs = Number(p.metros ?? 0);
  const ppm  = Number(p.ppMetros ?? 0);

  const corr = p.corrugada ? mtrs * corrugadaVendaPM(spec, prices) : 0;
  const cx   = p.caixa ? Number(prices.caixa ?? 0) : 0;
  const dr   = p.dreno ? Number(prices.dreno ?? 0) : 0;
  const mo   = (p.maoObraOutro ?? p.maoObra) || 0;

  const valorFita = mtrs * Number(prices.fitaPVC ?? 0);

  const materiais =
    mtrs * cobrePM +
    mtrs * isolPM +
    ppm  * Number(prices.pp ?? 0) +
    corr + cx + dr +
    valorFita;

  const sub     = materiais + mo;
  const subNota = sub * 1.15;
  const subDesc = sub * 0.95;

  const fatCobre = mtrs*(cobrePM - cobreCM);
  const fatIsol  = mtrs*(isolPM  - isolCM);
  const fatPP    = ppm*(Number(prices.pp ?? 0) - Number(prices.custoPP ?? 0));
  const fatPVC   = mtrs*(Number(prices.fitaPVC ?? 0) - Number(prices.custoFitaPVC ?? 0));
  const fatCor   = p.corrugada ? mtrs*(corrugadaVendaPM(spec, prices) - corrugadaCustoPM(spec, prices)) : 0;
  const fatCx    = p.caixa ? (Number(prices.caixa ?? 0) - Number(prices.custoCaixa ?? 0)) : 0;
  const fatDr    = p.dreno ? (Number(prices.dreno ?? 0) - Number(prices.custoDreno ?? 0)) : 0;

  const fatTot   = fatCobre + fatIsol + fatPP + fatPVC + fatCor + fatCx + fatDr;

              return (
                <div key={p.id} className="rounded-[20px]
 border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      value={p.nome}
                      onChange={(e)=>updatePonto(p.id,{ nome: (e.target as HTMLInputElement).value })}
                      className="text-sm font-semibold bg-white/5 border border-white/10 rounded-lg px-2 py-1 w-[70%]"
                    />
                    <button onClick={()=>removePonto(p.id)} className="rounded-lg px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1 border border-white/10" title="remover ponto"><Trash2 className="w-3 h-3"/> remover</button>
                  </div>

                  <label className="block text-sm font-semibold mt-1">BTU / Capacidade</label>
                  <select value={p.btu} onChange={(e)=>updatePonto(p.id,{ btu:e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px]">
                    {BTU_OPTIONS.map(b => <option key={b.label} value={b.label}>{b.label}</option>)}
                  </select>
                  <div className="mt-1 text-xs text-slate-400">Tubulação {spec.l} e  {spec.s}</div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  </div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">

  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
    <div className="text-[11px] text-slate-400">Metros de Cobre</div>
    <div className="mt-1 flex items-center gap-2 sm:gap-3 step-controls">

      <div className="value-wrap relative shrink-0">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          value={Number.isFinite(p.metros) ? p.metros : 0}
          onChange={(e)=>{
            const val = parseFloat((e.target as HTMLInputElement).value);
            updatePonto(p.id,{ metros: Number.isFinite(val)? Math.max(0, Math.min(100, val)) : 0 });
          }}
          className="no-spin step-value value-pill text-lg sm:text-xl font-extrabold tabular-nums"
        />
        <span className="ghost ghost-minus">−</span>
        <span className="ghost ghost-plus">+</span>
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          type="button"
          aria-label="Diminuir metros"
          className="btn-step z-10"
          data-variant="minus"
          disabled={(Number.isFinite(p.metros)?p.metros:0) <= 0}
          onClick={()=>{
            const v = Number.isFinite(p.metros)? p.metros : 0;
            updatePonto(p.id, { metros: Math.max(0, Math.min(100, v - 1)) });
          }}
        >
          <span className="flash" aria-hidden />
          −
        </button>
        <button
          type="button"
          aria-label="Aumentar metros"
          className="btn-step z-10"
          data-variant="plus"
          disabled={(Number.isFinite(p.metros)?p.metros:0) >= 100}
          onClick={()=>{
            const v = Number.isFinite(p.metros)? p.metros : 0;
            updatePonto(p.id, { metros: Math.max(0, Math.min(100, v + 1)) });
          }}
        >
          <span className="flash" aria-hidden />
          +
        </button>
      </div>
    </div>
  </div>

  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
    <div className="text-[11px] text-slate-400">Cabo PP (m)</div>
    <div className="mt-1 flex items-center gap-2 sm:gap-3 step-controls">
      <div className="value-wrap relative shrink-0">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={200}
          value={Number.isFinite(p.ppMetros) ? p.ppMetros : 0}
          onChange={(e)=>{
            const val = parseFloat((e.target as HTMLInputElement).value);
            updatePonto(p.id,{ ppMetros: Number.isFinite(val)? Math.max(0, Math.min(200, val)) : 0 });
          }}
          className="no-spin step-value value-pill text-lg sm:text-xl font-extrabold tabular-nums"
        />
        <span className="ghost ghost-minus">−</span>
        <span className="ghost ghost-plus">+</span>
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          type="button"
          aria-label="Diminuir PP"
          className="btn-step z-10"
          data-variant="minus"
          disabled={(Number.isFinite(p.ppMetros)?p.ppMetros:0) <= 0}
          onClick={()=>{
            const v = Number.isFinite(p.ppMetros)? p.ppMetros : 0;
            updatePonto(p.id, { ppMetros: Math.max(0, Math.min(200, v - 1)) });
          }}
        >
          <span className="flash" aria-hidden />
          −
        </button>
        <button
          type="button"
          aria-label="Aumentar PP"
          className="btn-step z-10"
          data-variant="plus"
          disabled={(Number.isFinite(p.ppMetros)?p.ppMetros:0) >= 200}
          onClick={()=>{
            const v = Number.isFinite(p.ppMetros)? p.ppMetros : 0;
            updatePonto(p.id, { ppMetros: Math.max(0, Math.min(200, v + 1)) });
          }}
        >
          <span className="flash" aria-hidden />
          +
        </button>
      </div>
    </div>
  </div>
</div>

<style>{`
  @keyframes navSlide { 0%{background-position:0% 0} 100%{background-position:-200% 0} }
  @keyframes pulseUp   { 0%{transform:scale(1)} 40%{transform:scale(1.06)} 100%{transform:scale(1)} }
  @keyframes pulseDown { 0%{transform:scale(1)} 40%{transform:scale(.95)} 100%{transform:scale(1)} }

  .btn-step{
    position:relative; overflow:visible;
    width:2rem; height:2rem;
    display:inline-flex; align-items:center; justify-content:center;
    border-radius:.5rem; border:1px solid rgba(255,255,255,.10);
    background:rgba(255,255,255,.06);
    font-weight:700; line-height:1; user-select:none;
    transition:background .15s ease, border-color .15s ease, opacity .15s ease;
    -webkit-tap-highlight-color:transparent;
  }
  .btn-step .flash{
    position:absolute; inset:0; border-radius:inherit; pointer-events:none;
    background:linear-gradient(90deg, var(--c1), var(--c2) 33%, var(--c3) 66%, var(--c4));
    background-size:200% 100%;
    opacity:0; transition:opacity .18s ease; filter:saturate(1.05);
  }
  .btn-step[data-variant="minus"]{ --c1:#dc2626; --c2:#ef4444; --c3:#f43f5e; --c4:#dc2626; }
  .btn-step[data-variant="plus"] { --c1:#16a34a; --c2:#22c55e; --c3:#0ea5e9; --c4:#16a34a; }
  .btn-step[data-variant="minus"]:hover{ background:rgba(239,68,68,.16); border-color:rgba(239,68,68,.45); }
  .btn-step[data-variant="plus"]:hover { background:rgba(16,185,129,.18); border-color:rgba(16,185,129,.45); }
  .btn-step:active{ border-color:transparent; }
  .btn-step:active .flash{
    opacity:.95; animation:navSlide .7s linear;
    inset:-4px; border-radius:calc(.5rem + 4px);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);
  }
  .btn-step:active::before{
    content:""; position:absolute; inset:-8px; pointer-events:none;
    border-radius:calc(.5rem + 8px);
    background:linear-gradient(90deg, var(--c1), var(--c2) 33%, var(--c3) 66%, var(--c4));
    opacity:.28; filter:blur(10px);
  }
  .btn-step:disabled{ opacity:.45; cursor:not-allowed; }

  .value-pill{
    width:68px; padding:.35rem .55rem;
    border-radius:.6rem;
    border:1px solid rgba(255,255,255,.12);
    background:rgba(255,255,255,.06);
    color:#e7eef5; outline:none; text-align:left;
  }
  .value-pill:focus{ border-color:rgba(255,255,255,.22); background:rgba(255,255,255,.08); }

  .step-value{ transition:color .25s ease, transform .25s ease, box-shadow .25s ease; font-variant-numeric:tabular-nums; }
  .step-controls:has(.btn-step[data-variant="plus"]:active) .step-value{
    animation:pulseUp .28s ease-out; color:#d1fae5; box-shadow:0 0 0 2px rgba(16,185,129,.35) inset;
  }
  .step-controls:has(.btn-step[data-variant="minus"]:active) .step-value{
    animation:pulseDown .28s ease-out; color:#fecaca; box-shadow:0 0 0 2px rgba(239,68,68,.35) inset;
  }

  .ghost{
    position:absolute; left:calc(100% + .35rem); top:50%;
    transform:translateY(-50%) scale(.9);
    opacity:0; font-weight:800; font-size:1rem;
    transition:opacity .15s ease, transform .15s ease;
    text-shadow:0 0 6px rgba(0,0,0,.25);
  }
  .ghost-plus{ color:#34d399; }
  .ghost-minus{ color:#f87171; }
  .step-controls:has(.btn-step[data-variant="plus"]:active) .ghost-plus{ opacity:1; transform:translateY(-50%) scale(1.05); }
  .step-controls:has(.btn-step[data-variant="minus"]:active) .ghost-minus{ opacity:1; transform:translateY(-50%) scale(1.05); }

  @media (max-width: 420px){
    .btn-step{ width:1.75rem; height:1.75rem; }
    .value-pill{ width:56px; font-size:1rem; }

    .btn-step:active .flash{ inset:-2px; border-radius:calc(.5rem + 2px); }
    .btn-step:active::before{ inset:-6px; }
  }

  .no-spin::-webkit-outer-spin-button,.no-spin::-webkit-inner-spin-button{ -webkit-appearance:none; margin:0; }
  .no-spin{ -moz-appearance:textfield; }
`}</style>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">

  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
  <div className="text-[11px] text-slate-400">
    Cobre {spec.l} - {spec.s}
  </div>

  <div className="font-bold">R$ {(mtrs * cobrePM).toFixed(2)}</div>

  <div className="text-[11px] text-slate-400">(R$ {cobrePM.toFixed(2)}/m)</div>

  <div className="mt-2 text-[11px] text-slate-400 border-t border-white/10 pt-1">
    {spec.l} = R$ {(mtrs * pricePerMeterCobre(spec.l, prices)).toFixed(2)} <br />
    {spec.s} = R$ {(mtrs * pricePerMeterCobre(spec.s, prices)).toFixed(2)}
  </div>

<div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
  Lucro: <b className="text-amber-200">R$ {fatCobre.toFixed(2)}</b>
</div>
</div>

  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
  <div className="text-[11px] text-slate-400">Isolamento</div>

  <div className="font-bold">R$ {(mtrs * isolPM).toFixed(2)}</div>

  <div className="text-[11px] text-slate-400">(R$ {isolPM.toFixed(2)}/m)</div>

  <div className="mt-2 text-[11px] text-slate-400 border-t border-white/10 pt-1">
    {spec.l} = R$ {(mtrs * pricePerMeterIsol(spec.l, prices)).toFixed(2)} <br />
    {spec.s} = R$ {(mtrs * pricePerMeterIsol(spec.s, prices)).toFixed(2)}
  </div>

<div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
  Lucro: <b className="text-amber-200">R$ {fatIsol.toFixed(2)}</b>
</div>
</div>

<div className="rounded-xl border border-white/10 bg-white/5 p-2">
  <div className="text-[11px] text-slate-400">Cabo PP</div>
  <div className="font-bold">R$ {(ppm * Number(prices.pp ?? 0)).toFixed(2)}</div>
  <div className="text-[11px] text-slate-400">(R$ {(Number(prices.pp ?? 0)).toFixed(2)}/m)</div>

  <div className="mt-2 border-t border-white/10 pt-1">
    <div className="text-[11px] text-slate-400">Fita PVC</div>
    <div className="font-bold">R$ {(mtrs * Number(prices.fitaPVC ?? 0)).toFixed(2)}</div>

<div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
  Lucro: <b className="text-amber-200">R$ {(fatPP + fatPVC).toFixed(2)}</b>
</div>
  </div>

</div>

  <button
    onClick={()=>updatePonto(p.id,{ corrugada: !p.corrugada })}
    className={`rounded-xl border px-2 py-2 ${p.corrugada ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
  >
    <div className="font-semibold">Corrugada</div>
    <div>{p.corrugada ? `+ R$ ${(mtrs * corrugadaVendaPM(spec, prices)).toFixed(2)}` : '_____'} </div>
    <div className="text-[11px] text-slate-400">{`R$ ${corrugadaVendaPM(spec, prices).toFixed(2)}/m`}</div>

  {p.corrugada && (
    <div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
      Lucro: <b className="text-amber-200">R$ {fatCor.toFixed(2)}</b>
    </div>
  )}
  </button>

  <button
    onClick={()=>updatePonto(p.id,{ caixa: !p.caixa })}
    className={`rounded-xl border px-2 py-2 ${p.caixa ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
  >
    <div className="font-semibold">Caixa POP</div>
    <div>{p.caixa ? `+ R$ ${Number(prices.caixa || 0).toFixed(2)}` : '_____'} </div>
    <div className="text-[11px] text-slate-400">por ponto</div>

  {p.caixa && (
    <div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
      Lucro: <b className="text-amber-200">R$ {fatCx.toFixed(2)}</b>
    </div>
  )}
  </button>

  <button
    onClick={()=>updatePonto(p.id,{ dreno: !p.dreno })}
    className={`rounded-xl border px-2 py-2 ${p.dreno ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
  >
    <div className="font-semibold">Dreno</div>
    <div>{p.dreno ? `+ R$ ${Number(prices.dreno || 0).toFixed(2)}` : '_____'} </div>
    <div className="text-[11px] text-slate-400">por ponto</div>

  {p.dreno && (
    <div className="mt-2 border-t border-white/10 pt-1 text-[11px] text-amber-300/90">
      Lucro: <b className="text-amber-200">R$ {fatDr.toFixed(2)}</b>
    </div>
  )}
  </button>
</div>

                  <div className="mt-3 text-sm">
                    <div className="text-[11px] text-slate-400 mb-1">Mão de obra (por ponto)</div>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={()=>updatePonto(p.id,{ maoObra: 300, maoObraOutro: undefined })}
                        className={`rounded-xl border px-2 py-2 ${p.maoObra===300 && p.maoObraOutro===undefined ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                        Nível 1<br/>R$ 300,00
                      </button>
                      <button
                        onClick={()=>updatePonto(p.id,{ maoObra: 350, maoObraOutro: undefined })}
                        className={`rounded-xl border px-2 py-2 ${p.maoObra===350 && p.maoObraOutro===undefined ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                        Nível 2<br/>R$ 350,00
                      </button>
                      <button
                        onClick={()=>updatePonto(p.id,{ maoObra: 400, maoObraOutro: undefined })}
                        className={`rounded-xl border px-2 py-2 ${p.maoObra===400 && p.maoObraOutro===undefined ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                        Nível 3<br/>R$ 400,00
                      </button>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
                        <div className="text-[11px] text-slate-400">Outro</div>
                        <input type="number" min={0} step={10} value={p.maoObraOutro ?? ''} placeholder="R$" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"
                          onChange={(e)=>{
                            const v = parseFloat((e.target as HTMLInputElement).value);
                            if(Number.isFinite(v)) updatePonto(p.id,{ maoObraOutro: v, maoObra: v });
                            else updatePonto(p.id,{ maoObraOutro: undefined });
                          }}
                        />
                      </div>
                    </div>
                  </div>

<div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2 text-sm">
  <div className="flex items-center justify-between">
    <span>Subtotal</span>
    <b>R$ {sub.toFixed(2)}</b>
  </div>
  <div className="flex items-center justify-between text-emerald-300/90">
    <span>Com Nota (+15%)</span>
    <b>R$ {subNota.toFixed(2)}</b>
  </div>
  <div className="flex items-center justify-between text-sky-300/90">
    <span>Com desconto (-5%)</span>
    <b>R$ {subDesc.toFixed(2)}</b>
  </div>

  <div className="mt-2 border-t border-white/10 pt-2 flex items-center justify-between text-amber-200">
    <span>Lucro (materiais)</span>
    <b>R$ {fatTot.toFixed(2)}</b>
  </div>

  <div className="flex items-center justify-between text-amber-300">
    <span>Mão de obra</span>
    <b>R$ {mo.toFixed(2)}</b>
  </div>

  <div className="flex items-center justify-between text-amber-400 font-bold">
    <span>Total Lucro + Mão de obra</span>
    <b>R$ {(fatTot + mo).toFixed(2)}</b>
  </div>

<div className="flex items-center justify-between font-bold">
  <span
    className={
      sub > 0
        ? ((fatTot + mo) / sub) * 100 >= 70
          ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
          : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
        : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
    }
  >
    Margem de Lucro
  </span>

  <b
    className={
      sub > 0
        ? ((fatTot + mo) / sub) * 100 >= 70
          ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
          : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
        : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
    }
  >
    {sub > 0 ? `${(((fatTot + mo) / sub) * 100).toFixed(2)}%` : "0%"}
  </b>
</div>

</div>

                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-[20px]
 border border-white/10 bg-white/5 p-3 flex flex-wrap gap-3 items-center justify-end">

  <div className="mr-auto text-sm">
    Pontos: <b>{qtdPontos}</b>
  </div>

<div className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-4 gap-1.5">
  {[
    ['Cobre',       totais.totalCobre],
    ['Isolamento',  totais.totalIsol],
    ['Cabo PP',     totais.totalPP],
    ['Fita PVC',    totais.totalFita],
    ['Corrugada',   totais.totalCorr],
    ['Caixa POP',   totais.totalCx],
    ['Dreno',       totais.totalDreno],
    ['Mão de obra', totais.totalMO],
  ].map(([label, valor]) => (
    <div
      key={label as string}
      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 flex items-center justify-between"
    >
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="text-[13px] font-semibold tabular-nums text-slate-300">
        R$ {(valor as number).toFixed(2)}
      </span>
    </div>
  ))}
</div>

<div className="w-full h-0" />

<div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">
  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between">
    <span className="text-sm">Total</span>
    <b className="text-lg font-extrabold tabular-nums">R$ {totais.total.toFixed(2)}</b>
  </div>

  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between">
    <span className="text-sm text-emerald-300/90">Com Nota (+15%)</span>
    <b className="text-lg font-extrabold text-emerald-300/90 tabular-nums">
      R$ {totais.totalNota.toFixed(2)}
    </b>
  </div>

  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between">
    <span className="text-sm text-sky-300/90">Com desconto (-5%)</span>
    <b className="text-lg font-extrabold text-sky-300/90 tabular-nums">
      R$ {totais.totalDesc.toFixed(2)}
    </b>
  </div>
</div>

  {qtdPontos > 1 && (
    <>
      <div className="w-full border-t border-white/10 my-1" />
      <div className="text-sm text-slate-300">Média por ponto:</div>
      <div className="text-sm font-extrabold">Subtotal: R$ {avgTotal.toFixed(2)}</div>
      <div className="text-sm font-extrabold text-emerald-300/90">Com Nota: R$ {avgNota.toFixed(2)}</div>
      <div className="text-sm font-extrabold text-sky-300/90">Com desconto: R$ {avgDesc.toFixed(2)}</div>
    </>
  )}

  <div className="w-full h-0" />

  <div className="text-lg font-extrabold text-amber-200">
    Lucro (materiais): R$ {totais.totalFat.toFixed(2)}
  </div>
  <div className="text-lg font-extrabold text-amber-300">
    Mão de obra: R$ {totais.totalMO.toFixed(2)}
  </div>
  <div className="text-lg font-extrabold text-amber-400">
    Total Lucro + Mão de obra: R$ {(totais.totalFat + totais.totalMO).toFixed(2)}
  </div>

  <div
    className={`text-lg font-extrabold ${
      totais.total > 0
        ? ((totais.totalFat + totais.totalMO) / totais.total) * 100 >= 60
          ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
          : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
        : "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
    }`}
  >
    Margem de Lucro:{" "}
    {totais.total > 0
      ? `${(((totais.totalFat + totais.totalMO) / totais.total) * 100).toFixed(2)}%`
      : "0%"}
  </div>
</div>

        </div>
      )}
    </div>
  );
}





















function Precificacao({ prices, onChange }:{ prices:Prices; onChange:(p:Prices)=>void }){
  const setCobre = (dia:Dia, v:number) => onChange({ ...prices, cobre: { ...prices.cobre, [dia]: v } });
  const setCobreC = (dia:Dia, v:number) => onChange({ ...prices, custoCobre: { ...prices.custoCobre, [dia]: v } });
  const setIsol  = (dia:Dia, v:number) => onChange({ ...prices, isol:  { ...prices.isol,  [dia]: v } });
  const setIsolC = (dia:Dia, v:number) => onChange({ ...prices, custoIsol:  { ...prices.custoIsol,  [dia]: v } });
  const setPP    = (v:number) => onChange({ ...prices, pp: v });
  const setPPC   = (v:number) => onChange({ ...prices, custoPP: v });
  const setCorr  = (v:number) => onChange({ ...prices, corrugada: v });
  const setCorrC = (v:number) => onChange({ ...prices, custoCorrugada: v });
  const setCx    = (v:number) => onChange({ ...prices, caixa: v });
  const setCxC   = (v:number) => onChange({ ...prices, custoCaixa: v });
  const setDreno = (v:number) => onChange({ ...prices, dreno: v });
  const setDrenoC= (v:number) => onChange({ ...prices, custoDreno: v });
  const reset    = () => onChange(DEFAULT_PRICES);
  const salvar   = () => { try { localStorage.setItem("mrm-prices", JSON.stringify(prices)); alert('Valores salvos'); } catch {} };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold">Precificação</h2>
        <div className="flex gap-2">
          <button onClick={salvar} className="px-3 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600">Salvar</button>
          <button onClick={reset} className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">Restaurar padrões</button>
        </div>
      </div>

      <div className="rounded-[20px]
 border border-white/10 bg-white/5 p-3 sm:p-4"
>
        <div className="flex items-center justify-between"><h3 className="text-lg font-extrabold">Cobre — preço por bobina (15m)</h3></div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
          {DIAS.map(d => {
            const cobreV = prices.cobre?.[d] ?? 0;
            const cobreC = prices.custoCobre?.[d] ?? Math.round(cobreV/2);
            return (
              <div key={d} className="rounded-[20px]
 border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-semibold">{d}</div>
                <div className="text-xs text-slate-400">Vendido (bobina)</div>
                <div className="mt-1 text-lg font-extrabold">R$ {cobreV.toFixed(2)}</div>
                <input type="range" min={0} max={1200} step={5} value={cobreV} onChange={(e)=>setCobre(d, parseFloat((e.target as HTMLInputElement).value))} className="w-full mt-2"/>
                <div className="mt-2 text-xs text-slate-400">(≈ R$ {(cobreV/15).toFixed(2)} por metro)</div>
                <div className="mt-3 text-xs text-slate-400">Comprado (custo) — bobina</div>
                <input type="number" min={0} step={1} value={cobreC} onChange={(e)=>setCobreC(d, parseFloat((e.target as HTMLInputElement).value)||0)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"/>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[20px]
 border border-white/10 bg-white/5 p-3 sm:p-4"
>
        <h3 className="text-lg font-extrabold mb-3">Isolamento — preço por bobina (tubo 2m)</h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-3">
          {DIAS.map(d => {
            const isolV = prices.isol?.[d] ?? 0;
            const isolC = prices.custoIsol?.[d] ?? Math.round(isolV/2);
            return (
              <div key={d} className="rounded-[20px]
 border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-semibold">{d}</div>
                <div className="text-xs text-slate-400">Vendido (bobina)</div>
                <div className="mt-1 text-lg font-extrabold">R$ {isolV.toFixed(2)}</div>
                <input type="range" min={0} max={200} step={1} value={isolV} onChange={(e)=>setIsol(d, parseFloat((e.target as HTMLInputElement).value))} className="w-full mt-2"/>
                <div className="mt-2 text-xs text-slate-400">(≈ R$ {(isolV/16).toFixed(2)} por metro)</div>
                <div className="mt-3 text-xs text-slate-400">Comprado (custo) — bobina</div>
                <input type="number" min={0} step={1} value={isolC} onChange={(e)=>setIsolC(d, parseFloat((e.target as HTMLInputElement).value)||0)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"/>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-[20px]
 border border-white/10 bg-white/5 p-3 sm:p-4"
>
          <h3 className="text-lg font-extrabold mb-3">Cabo PP — preço por metro</h3>
          <div className="flex items-center gap-4"><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-lg font-extrabold">R$ {(Number(prices.pp ?? 0)).toFixed(2)}</div><input type="range" min={1} max={50} step={1} value={Number(prices.pp ?? 0)} onChange={(e)=>setPP(parseFloat((e.target as HTMLInputElement).value))} className="w-full"/></div>
          <div className="mt-3 text-xs text-slate-400">Comprado (custo) — por metro</div>
          <input type="number" min={0} step={0.5} value={Number(prices.custoPP ?? 0)} onChange={(e)=>setPPC(parseFloat((e.target as HTMLInputElement).value)||0)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"/>
        </div>
        <div className="rounded-[20px]
 border border-white/10 bg-white/5 p-3 sm:p-4"
>
  <h3 className="text-lg font-extrabold mb-3">Fita PVC — preço por metro</h3>
  <div className="flex items-center gap-4">
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-lg font-extrabold">
      R$ {(Number(prices.fitaPVC ?? 0)).toFixed(2)}
    </div>
    <input
      type="range"
      min={0}
      max={20}
      step={0.1}
      value={Number(prices.fitaPVC ?? 0)}
      onChange={(e)=>onChange({ ...prices, fitaPVC: parseFloat((e.target as HTMLInputElement).value) })}
      className="w-full"
    />
  </div>
  <div className="mt-3 text-xs text-slate-400">Comprado (custo) — por metro</div>
  <input
    type="number"
    min={0}
    step={0.1}
    value={Number(prices.custoFitaPVC ?? 0)}
    onChange={(e)=>onChange({ ...prices, custoFitaPVC: parseFloat((e.target as HTMLInputElement).value) || 0 })}
    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"
  />
</div>

<div className="rounded-[20px]
 border border-white/10 bg-white/5 p-3 sm:p-4"
>
  <h3 className="text-lg font-extrabold mb-1">Corrugada — preço por metro</h3>
  <div className="text-xs text-slate-400 mb-3">
    Defina aqui o valor de venda (R$/m) e o custo (R$/m) da corrugada.
  </div>

  <div className="flex items-center gap-4">
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-lg font-extrabold">
      R$ {(Number(prices.corrugada ?? 0)).toFixed(2)}
    </div>
    <input
      type="range"
      min={0}
      max={100}
      step={0.5}
      value={Number(prices.corrugada ?? 0)}
      onChange={(e)=>setCorr(parseFloat((e.target as HTMLInputElement).value))}
      className="w-full"
    />
  </div>

  <div className="mt-3 text-xs text-slate-400">Comprado (custo) — por metro</div>
  <input
    type="number"
    min={0}
    step={0.5}
    value={Number(prices.custoCorrugada ?? 0)}
    onChange={(e)=>setCorrC(parseFloat((e.target as HTMLInputElement).value) || 0)}
    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"
  />
</div>

      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-[20px]
 border border-white/10 bg-white/5 p-3 sm:p-4"
>
          <h3 className="text-lg font-extrabold mb-3">Caixa POP — preço por ponto</h3>
          <div className="flex items-center gap-4"><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-lg font-extrabold">R$ {(Number(prices.caixa ?? 0)).toFixed(2)}</div><input type="range" min={0} max={200} step={5} value={Number(prices.caixa ?? 0)} onChange={(e)=>setCx(parseFloat((e.target as HTMLInputElement).value))} className="w-full"/></div>
          <div className="mt-3 text-xs text-slate-400">Comprado (custo) — por ponto</div>
          <input type="number" min={0} step={1} value={Number(prices.custoCaixa ?? 0)} onChange={(e)=>setCxC(parseFloat((e.target as HTMLInputElement).value)||0)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"/>
        </div>
        <div className="rounded-[20px]
 border border-white/10 bg-white/5 p-3 sm:p-4"
>
          <h3 className="text-lg font-extrabold mb-3">Dreno — preço por ponto</h3>
          <div className="flex items-center gap-4"><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-lg font-extrabold">R$ {(Number(prices.dreno ?? 0)).toFixed(2)}</div><input type="range" min={0} max={200} step={5} value={Number(prices.dreno ?? 0)} onChange={(e)=>setDreno(parseFloat((e.target as HTMLInputElement).value))} className="w-full"/></div>
          <div className="mt-3 text-xs text-slate-400">Comprado (custo) — por ponto</div>
          <input type="number" min={0} step={1} value={Number(prices.custoDreno ?? 0)} onChange={(e)=>setDrenoC(parseFloat((e.target as HTMLInputElement).value)||0)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"/>
        </div>
      </div>
    </div>
  );
}
