// WCAG 2.2 — Wizard "Comprar Pacote de Energia" (Modo Lite)
// Critérios cobertos:
//   1.3.1 Info and Relationships — <fieldset>/<legend> nas seleções de endereço e pagamento
//   1.4.4 Resize Text        — tipografia em rem; touch targets mínimos de 44px (WCAG 2.5.5)
//   2.4.3 Focus Order        — foco retorna ao topo do wizard a cada mudança de step
//   2.4.6 Headings and Labels — <h1> único por step via aria-live; fieldsets rotulados
//   4.1.2 Name, Role, Value  — radio implícito com <input type="radio"> e <label>
//   4.1.3 Status Messages    — aria-live="polite" anuncia mudança de step para leitores de tela
"use client";

import { useState, useEffect, useRef, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Home,
  Waves,
  Zap,
  Star,
  QrCode,
  CreditCard,
  Loader2,
  ShoppingCart,
  MapPin,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { LiteBottomNav } from "@/components/LiteBottomNav";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Package {
  id: string;
  name: string;
  kwh: number;
  price: number;
  popular: boolean;
  description: string;
}

interface Address {
  id: string;
  apelido: string;
  cep: string;
  numero: string;
  rua: string;
}

const PACKAGES: Package[] = [
  {
    id: "basico",
    name: "Pacote Básico",
    kwh: 50,
    price: 30.0,
    popular: false,
    description: "Ideal para uso individual ou fim de semana",
  },
  {
    id: "familia",
    name: "Pacote Família",
    kwh: 100,
    price: 55.0,
    popular: true,
    description: "Perfeito para casa com 3 a 5 pessoas",
  },
];

// ── Helper: formata BRL ───────────────────────────────────────────────────────
function brl(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

// ── Helper: salva no localStorage ─────────────────────────────────────────────
function savePurchase(pkg: Package, address: Address) {
  if (typeof window === "undefined") return;
  const key = "fluxo_lite_transactions";
  const now = new Date();

  const newEntry = {
    id: `txn-buy-${Date.now()}`,
    type: "compra",
    title: `${pkg.name} · ${pkg.kwh} kWh`,
    subtitle: `Agora, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} · ${address.apelido}`,
    amount: -pkg.price,
    date: now.toISOString(),
    dateLabel: `Hoje às ${now.getHours()} horas e ${now.getMinutes()} minutos`,
  };

  try {
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([newEntry, ...existing]));
  } catch {
    localStorage.setItem(key, JSON.stringify([newEntry]));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Endereço + Pacote
// ─────────────────────────────────────────────────────────────────────────────
function StepSelectPackage({
  savedAddresses,
  selectedAddress, setSelectedAddress,
  selectedPackage, setSelectedPackage,
  onContinue,
}: {
  savedAddresses: Address[];
  selectedAddress: string;
  setSelectedAddress: (v: string) => void;
  selectedPackage: string;
  setSelectedPackage: (v: string) => void;
  onContinue: () => void;
}) {
  const addrGroupId = useId();
  const pkgGroupId  = useId();

  return (
    <div className="flex flex-col gap-6 px-4 pb-28 pt-2">

      {/* ── Seleção de Endereço ───────────────────────────────────────────── */}
      <fieldset>
        <legend className="text-gray-500 text-[0.75rem] font-bold uppercase tracking-widest mb-3 px-1">
          Onde vai receber?
        </legend>

        {/* State: Lista Vazia vs Endereços Salvos */}
        {savedAddresses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-gray-900 text-[1.0625rem] font-bold mb-2">Nenhum endereço cadastrado</p>
            <p className="text-gray-500 text-[0.875rem] mb-5">Você precisa de um endereço para receber a energia.</p>
            <Link
              href="/perfil/enderecos"
              className="inline-flex items-center gap-2 bg-[#0e6641] hover:bg-[#0a5235] text-white font-bold text-[0.9375rem] py-3 px-5 rounded-xl transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2"
            >
              <Plus size={18} aria-hidden="true" />
              Cadastrar Endereço
            </Link>
          </div>
        ) : (
          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl overflow-x-auto snap-x" role="group" aria-labelledby={addrGroupId}>
            {savedAddresses.map(({ id, apelido, rua, numero }) => {
              const isSelected = selectedAddress === id;
              const Icon = apelido.toLowerCase().includes('casa') ? Home : MapPin;
              return (
                // WCAG 1.3.1: <label> + <input type="radio"> — não <div> com onClick
                <label
                  key={id}
                  htmlFor={`addr-${id}`}
                  className={`flex-1 min-w-[120px] flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl cursor-pointer transition-all snap-start
                    ${isSelected
                      ? "bg-white shadow-sm text-[#0e6641] border border-green-200"
                      : "text-gray-500 hover:bg-white/60"
                    }`}
                >
                  <input
                    type="radio"
                    id={`addr-${id}`}
                    name="address"
                    value={id}
                    checked={isSelected}
                    onChange={() => setSelectedAddress(id)}
                    className="sr-only"
                  />
                  <Icon size={20} aria-hidden="true" strokeWidth={isSelected ? 2.5 : 1.8} />
                  <span className="text-[0.75rem] font-bold text-center leading-tight whitespace-nowrap px-1">{apelido}</span>
                  <span className="text-[0.625rem] text-gray-400 text-center truncate w-full px-1">{rua}, {numero}</span>
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      {/* ── Seleção de Pacote ─────────────────────────────────────────────── */}
      <fieldset>
        <legend className="text-gray-500 text-[0.75rem] font-bold uppercase tracking-widest mb-3 px-1">
          Escolha seu pacote
        </legend>

        <div className="flex flex-col gap-3" role="group" aria-labelledby={pkgGroupId}>
          {PACKAGES.map((pkg) => {
            const isSelected = selectedPackage === pkg.id;
            return (
              <label
                key={pkg.id}
                htmlFor={`pkg-${pkg.id}`}
                className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                  ${isSelected
                    ? "border-[#0e6641] bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
              >
                <input
                  type="radio"
                  id={`pkg-${pkg.id}`}
                  name="package"
                  value={pkg.id}
                  checked={isSelected}
                  onChange={() => setSelectedPackage(pkg.id)}
                  className="sr-only"
                />

                {/* Ícone */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-[#0e6641]" : "bg-gray-100"}`}>
                  <Zap size={22} className={isSelected ? "text-white" : "text-gray-400"} aria-hidden="true" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-gray-900 text-[1rem] font-bold leading-tight">{pkg.name}</p>
                    {pkg.popular && (
                      <span className="flex items-center gap-1 bg-[#0e6641] text-white text-[0.5625rem] font-bold px-2 py-0.5 rounded-full">
                        <Star size={10} aria-hidden="true" />
                        Mais Popular
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-[0.8125rem] mt-0.5">{pkg.description}</p>
                  <p className="text-[#0e6641] text-[1.125rem] font-extrabold mt-1.5">
                    {brl(pkg.price)}
                    <span className="text-gray-400 text-[0.75rem] font-normal ml-1">· {pkg.kwh} kWh</span>
                  </p>
                </div>

                {/* Indicador de seleção */}
                <div
                  className={`w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all
                    ${isSelected ? "border-[#0e6641] bg-[#0e6641]" : "border-gray-300 bg-white"}`}
                  aria-hidden="true"
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* ── Botão Continuar ────────────────────────────────────────────────── */}
      <button
        onClick={onContinue}
        disabled={!selectedPackage || !selectedAddress}
        aria-disabled={!selectedPackage || !selectedAddress}
        className="w-full bg-[#0e6641] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-[1.0625rem] py-4 rounded-2xl transition-all
          active:scale-[0.98] shadow-sm shadow-green-900/20
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2"
      >
        Continuar
      </button>

      {!selectedPackage && (
        <p className="text-center text-gray-400 text-[0.75rem] -mt-3" aria-live="polite">
          Escolha um pacote para continuar
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Pagamento
// ─────────────────────────────────────────────────────────────────────────────
function StepPayment({
  pkg, address, paymentMethod, setPaymentMethod,
  onBack, onConfirm,
}: {
  pkg: Package;
  address: Address;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const payGroupId = useId();

  const methods = [
    {
      id: "pix",
      label: "PIX",
      detail: "Aprovação na hora, sem taxas",
      icon: QrCode,
      recommended: true,
    },
    {
      id: "cartao",
      label: "Cartão de Crédito",
      detail: "Final 4321 · Visa",
      icon: CreditCard,
      recommended: false,
    },
  ];

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-2">

      {/* ── Resumo do pedido ─────────────────────────────────────────────── */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <p className="text-gray-500 text-[0.6875rem] font-semibold uppercase tracking-wide mb-2">Resumo do pedido</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-900 text-[0.9375rem] font-bold">{pkg.name}</p>
            <p className="text-gray-500 text-[0.8125rem] mt-0.5">
              {pkg.kwh} kWh · {address.apelido}
            </p>
          </div>
          <p className="text-[#0e6641] text-[1.125rem] font-extrabold tabular-nums">{brl(pkg.price)}</p>
        </div>
      </div>

      {/* ── Seleção do Método ─────────────────────────────────────────────── */}
      <fieldset>
        <legend className="text-gray-500 text-[0.75rem] font-bold uppercase tracking-widest mb-3 px-1">
          Como você quer pagar?
        </legend>

        <div className="flex flex-col gap-3" role="group" aria-labelledby={payGroupId}>
          {methods.map(({ id, label, detail, icon: Icon, recommended }) => {
            const isSelected = paymentMethod === id;
            return (
              <label
                key={id}
                htmlFor={`pay-${id}`}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                  ${isSelected
                    ? "border-[#0e6641] bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
              >
                <input
                  type="radio"
                  id={`pay-${id}`}
                  name="payment"
                  value={id}
                  checked={isSelected}
                  onChange={() => setPaymentMethod(id)}
                  className="sr-only"
                />

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-[#0e6641]" : "bg-gray-100"}`}>
                  <Icon size={22} className={isSelected ? "text-white" : "text-gray-400"} aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-gray-900 text-[0.9375rem] font-bold">{label}</p>
                    {recommended && (
                      <span className="bg-[#0e6641] text-white text-[0.5625rem] font-bold px-2 py-0.5 rounded-full">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-[0.8125rem] mt-0.5">{detail}</p>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all
                    ${isSelected ? "border-[#0e6641] bg-[#0e6641]" : "border-gray-300 bg-white"}`}
                  aria-hidden="true"
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* ── Botão Confirmar ───────────────────────────────────────────────── */}
      <button
        onClick={onConfirm}
        disabled={!paymentMethod}
        aria-disabled={!paymentMethod}
        className="w-full bg-[#0e6641] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-[1.0625rem] py-4 rounded-2xl transition-all
          active:scale-[0.98] shadow-sm shadow-green-900/20
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2"
      >
        Confirmar Pagamento
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Processamento → Sucesso
// ─────────────────────────────────────────────────────────────────────────────
function StepSuccess({ pkg, address }: { pkg: Package; address: Address }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 pb-28 text-center gap-6">

      {/* Ícone de sucesso animado */}
      <div className="w-28 h-28 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center animate-in zoom-in duration-500">
        <CheckCircle2 size={56} className="text-[#0e6641]" aria-hidden="true" />
      </div>

      <div>
        <h2 className="text-gray-900 text-[1.375rem] font-extrabold leading-tight">Compra Concluída!</h2>
        <p className="text-gray-500 text-[0.9375rem] mt-2 leading-snug">
          Seu <strong className="text-gray-700">{pkg.name} ({pkg.kwh} kWh)</strong> foi adquirido para{" "}
          <strong className="text-gray-700">{address.apelido}</strong>.
        </p>
      </div>

      {/* Resumo final */}
      <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 flex justify-between items-center">
        <div className="text-left">
          <p className="text-gray-500 text-[0.6875rem] uppercase tracking-wide font-semibold">Total pago</p>
          <p className="text-[#0e6641] text-[1.5rem] font-extrabold tabular-nums mt-0.5">{brl(pkg.price)}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#0e6641] flex items-center justify-center" aria-hidden="true">
          <Zap size={22} className="text-white" />
        </div>
      </div>

      <p className="text-gray-400 text-[0.8125rem] leading-snug">
        A compra foi registrada no seu Extrato de Atividades.
      </p>

      {/* CTA final */}
      <Link
        href="/home"
        className="w-full flex items-center justify-center gap-2 bg-[#0e6641] text-white font-bold text-[1.0625rem] py-4 rounded-2xl
          active:scale-[0.98] shadow-sm shadow-green-900/20
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2"
      >
        <Home size={20} aria-hidden="true" />
        Voltar ao Início
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function ComprarPacote() {
  const router = useRouter();
  const stepAnnouncerId = useId();
  const headerRef = useRef<HTMLElement>(null);

  // ── Estado do Wizard ───────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Seleções ───────────────────────────────────────────────────────────────
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  
  // ── Endereços Salvos ─────────────────────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem("fluxo_lite_addresses");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedAddresses(parsed);
        if (parsed.length > 0) {
          setSelectedAddress(parsed[0].id); // Autoselect first address
        }
      }
    } catch {}
  }, []);

  // Objetos resolvidos
  const addressObj = savedAddresses.find((a) => a.id === selectedAddress);
  const packageObj = PACKAGES.find((p) => p.id === selectedPackage);

  // ── Rótulos de Step para aria-live ────────────────────────────────────────
  const stepLabels: Record<number, string> = {
    1: "Passo 1: Escolha o endereço e o pacote",
    2: "Passo 2: Método de Pagamento",
    3: "Passo 3: Compra Concluída",
  };

  // Rola para o topo e move foco ao mudar de step (WCAG 2.4.3)
  useEffect(() => {
    headerRef.current?.focus();
    headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  // ── Ações ──────────────────────────────────────────────────────────────────
  function goToStep2() {
    if (!selectedPackage || !selectedAddress) return;
    setCurrentStep(2);
  }

  function goBack() {
    if (currentStep === 2) setCurrentStep(1);
  }

  function confirmPayment() {
    if (!paymentMethod || !packageObj || !addressObj) return;
    setIsProcessing(true);

    // Simula 2s de processamento, depois persiste e avança
    setTimeout(() => {
      savePurchase(packageObj, addressObj);
      setIsProcessing(false);
      setCurrentStep(3);
    }, 2000);
  }

  // ── Configurações do Header por step ──────────────────────────────────────
  const headerConfig = {
    1: { title: "Comprar Energia",      showBack: true,  backFn: () => router.back() },
    2: { title: "Como você quer pagar?", showBack: true,  backFn: goBack },
    3: { title: "Compra Concluída",      showBack: false, backFn: () => {} },
  }[currentStep];

  // ── Indicador de Progresso ────────────────────────────────────────────────
  const TOTAL_STEPS = 3;

  return (
    <div className="flex flex-col h-full bg-[#f5f7f5]">

      {/* ── WCAG 4.1.3: Anúncio de mudança de step (invisível) ──────────── */}
      <div
        id={stepAnnouncerId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {stepLabels[currentStep]}
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      {/* tabIndex=-1 permite que o useEffect mova o foco programaticamente */}
      <header
        ref={headerRef}
        tabIndex={-1}
        className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 shrink-0 outline-none"
      >
        <div className="flex items-center gap-3">
          {headerConfig.showBack && (
            <button
              aria-label={currentStep === 2 ? "Voltar para seleção de pacote" : "Voltar"}
              onClick={headerConfig.backFn}
              className="text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] rounded-lg p-1 shrink-0"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-gray-900 text-[1.0625rem] font-extrabold leading-tight truncate">
              {headerConfig.title}
            </h1>
          </div>
          <div
            className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <ShoppingCart size={16} className="text-[#0e6641]" />
          </div>
        </div>

        {/* Barra de progresso — só nos steps 1 e 2 */}
        {currentStep < 3 && (
          <div className="mt-4" aria-hidden="true">
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-colors duration-300
                    ${i < currentStep ? "bg-[#0e6641]" : "bg-gray-200"}`}
                />
              ))}
            </div>
            <p className="text-gray-400 text-[0.6875rem] mt-1.5 font-semibold">
              Passo {currentStep} de {TOTAL_STEPS - 1}
            </p>
          </div>
        )}
      </header>

      {/* ── Corpo Scrollável ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* ── Tela de Processamento (overlay interno) ─────────────────────── */}
        {isProcessing && (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-5 pb-28"
            role="status"
            aria-live="polite"
            aria-label="Processando seu pagamento"
          >
            <div className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center">
              <Loader2 size={40} className="text-[#0e6641] animate-spin" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-gray-900 text-[1.125rem] font-bold">Processando...</p>
              <p className="text-gray-500 text-[0.875rem] mt-1">Aguarde, estamos confirmando seu pagamento</p>
            </div>
          </div>
        )}

        {/* ── Steps ──────────────────────────────────────────────────────── */}
        {!isProcessing && (
          <>
            {currentStep === 1 && isClient && (
              <StepSelectPackage
                savedAddresses={savedAddresses}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
                selectedPackage={selectedPackage}
                setSelectedPackage={setSelectedPackage}
                onContinue={goToStep2}
              />
            )}

            {currentStep === 2 && packageObj && addressObj && (
              <StepPayment
                pkg={packageObj}
                address={addressObj}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onBack={goBack}
                onConfirm={confirmPayment}
              />
            )}

            {currentStep === 3 && packageObj && addressObj && (
              <StepSuccess pkg={packageObj} address={addressObj} />
            )}
          </>
        )}
      </div>

      {/* ── Bottom Nav (oculta no step 3 para não distrair) ──────────────── */}
      {currentStep < 3 && <LiteBottomNav />}
    </div>
  );
}
