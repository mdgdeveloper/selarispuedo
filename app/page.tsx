"use client";

import { BanknoteArrowDown, BanknoteArrowUp, Check, HouseHeart, PiggyBank, TriangleAlert, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

 export const formatoMoneda = (v: number) => {
    return v.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  }

export default function Home() {
  const [step, setStep] = useState<number>(1);
  const [precio, setPrecio] = useState<string>("");
  const [ingresos, setIngresos] = useState<string>("");
  const [deudas, setDeudas] = useState<string>("");
  const [ahorros, setAhorros] = useState<string>("");
  const [mostrarConsejos, setMostrarConsejos] = useState(false);

  // Detect mobile (client-side)
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth <= 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  function parseNumber(v: string) {
    const n = parseFloat(v.replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(n) ? n : 0;
  }



  function mortgagePayment(principal: number, annualRate = 0.035, years = 30) {
    if (principal <= 0) return 0;
    const r = annualRate / 12;
    const n = years * 12;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }

  function evaluate() {
    const P = parseNumber(precio);
    const I = parseNumber(ingresos);
    const D = parseNumber(deudas);
    const S = parseNumber(ahorros);

    if (I <= 0 || P <= 0) {
      return {
        verdict: "No viable",
        icon: <X />,
        color: "red",
        reason: "Ingresos o precio no válidos",
        monthlyMortgage: 0,
        dti: 1,
      };
    }

    const loan = Math.max(0, P - S);
    const monthlyMortgage = mortgagePayment(loan);
    const dti = (monthlyMortgage + D) / I; // ratio

    const required20 = P * 0.2;
    const required10 = P * 0.1;

    let verdict = "No viable";
    let color = "red";
    let icon = <X />;
    let reason = "No cumple criterios básicos";

    if (dti <= 0.35 && S >= required20) {
      verdict = "Viable";
      icon = <Check />
      color = "green";
      reason = "Pago mensual razonable y entrada suficiente";
    } else if (dti <= 0.45 && S >= required10) {
      verdict = "Justo";
      icon = <TriangleAlert />
      color = "amber";
      reason = "La operación es posible pero ajustada (DTI o entrada justo en límite)";
    } else {
      // Find main reason
      if (S < required10) {
        reason = `Ahorros insuficientes: tienes ${formatoMoneda(S)}, necesitas al menos ${formatoMoneda(required10)} (10%).`;
      } else if (dti > 0.45) {
        reason = `Relación deuda/ingreso alta: ${(dti * 100).toFixed(1)}% (ideal ≤ 35%).`;
      } else {
        reason = `Pago mensual estimado ${formatoMoneda(monthlyMortgage)} representa ${(monthlyMortgage / I * 100).toFixed(1)}% de tus ingresos.`;
      }
    }

    return { verdict, color, icon, reason, monthlyMortgage, dti };
  }

  const res = evaluate();

  const totalSteps = 4;

  function validateStep(s: number) {
    if (s === 1) return parseNumber(precio) > 0;
    if (s === 2) return parseNumber(ingresos) > 0;
    if (s === 3) return true; // deudas y ahorros optional (can be 0)
    return true;
  }

  function nextStep() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(totalSteps, s + 1));
  }

  function prevStep() {
    setStep((s) => Math.max(1, s - 1));
  }

  function resetAll() {
    setPrecio("");
    setIngresos("");
    setDeudas("");
    setAhorros("");
    setStep(1);
    setMostrarConsejos(false);
  }

  // If we already know the device is desktop, show the message
  if (isMobile === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full rounded-xl bg-white p-6 shadow text-center">
          <Image src="/images/logo.svg" alt="Selaris" width={48} height={48} className="mx-auto" />
          <h1 className="mt-4 text-lg font-semibold text-gray-900">Esta página solo puede ser accedida a través de teléfonos móviles</h1>
          <p className="mt-2 text-sm text-gray-600">Accede desde tu teléfono para usar la calculadora en su formato óptimo.</p>
        </div>
      </div>
    );
  }

  // While we are detecting (SSR -> client), render nothing to avoid flicker
  if (isMobile === null) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <main className="relative mx-auto max-w-4xl grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
        <a href="https://www.selaris.es" target="_blank" rel="noopener noreferrer" className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/90 p-2 shadow hover:scale-105 transition">
          <Image src="/images/logo.svg" alt="Selaris" width={28} height={28} />
          <span className="sr-only">Selaris</span>
        </a>
        {/* Left: Visual */}

        {/* Right: Wizard Card */}
        <div className="order-1 md:order-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 ring-1 ring-gray-100">
            {/* Step header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Paso {step} de {totalSteps}</div>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">{step === 1 ? 'Precio del inmueble' : step === 2 ? 'Ingresos netos mensuales' : step === 3 ? 'Deudas y Ahorros' : 'Resumen & Resultado'}</h3>

                <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-600" style={{ width: `${(step / totalSteps) * 100}%` }} />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700">{step}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="rounded-lg overflow-hidden relative mb-5">
                <Image
                  src={step === 1 ? "/images/house1.jpg" : step === 2 ? "/images/inside_house1.jpg" : step === 3 ? "/images/inside_house2.jpg" : "/images/houseF.jpg"}
                  alt="Banner"
                  width={1000}
                  height={300}
                  className="w-full h-36 object-cover rounded-lg transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute left-4 bottom-3 text-white">
                  <div className="text font-semibold drop-shadow">{step === 1 ? 'Accede a la vivienda de tus sueños' : step === 2 ? 'Tus ingresos' : step === 3 ? 'Deudas y ahorros' : 'Resumen final'}</div>
                  <div className="text-xs opacity-90 drop-shadow">{step === 1 ? 'Encuentra tu hipoteca ideal' : step === 2 ? 'Añade tus ingresos netos' : step === 3 ? 'Introduce tus deudas y ahorros' : 'Resultado y consejos'}</div>
                </div>
              </div>

              {step === 1 && (
                <label className="block">
                  <div className="flex items-center justify-between">
                    <div className=" text-gray-600 flex items-center gap-2 text-green-500"><HouseHeart className="text-green-500"/> Precio</div>
                    <div className="text-xs text-gray-400">Ej. 250000</div>
                  </div>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    <input inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej. 250000" className="placeholder:text-gray-400 placeholder:opacity-90 text-gray-900 pl-9 mt-1 w-full rounded-lg border p-3 text-lg shadow-sm focus:ring-2 focus:ring-sky-300" />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Introduce el precio total del inmueble que te gustaría comprar.</p>
                </label>
              )}

              {step === 2 && (
                <label className="block">
                  <div className="flex items-center justify-between">
                    <div className=" text-gray-600 flex items-center gap-2"><BanknoteArrowUp className="text-indigo-500"/> Ingresos</div>
                    <div className="text-xs text-gray-400">Mensuales netos</div>
                  </div>
                  <input inputMode="decimal" value={ingresos} onChange={(e) => setIngresos(e.target.value)} placeholder="Ej. 2000" className="placeholder:text-gray-400 placeholder:opacity-90 text-gray-900 mt-2 w-full rounded-lg border p-3 text-lg shadow-sm focus:ring-2 focus:ring-sky-300" />
                  <p className="mt-2 text-xs text-gray-500">Incluye salarios, ingresos recurrentes y pensiones.</p>
                </label>
              )}

              {step === 3 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <div className="flex items-center justify-between">
                      <div className=" text-gray-600 flex items-center gap-2 text-red-600"> <BanknoteArrowDown /> Deudas</div>
                      <div className="text-xs text-gray-400">Pagos mensuales</div>
                    </div>
                    <input inputMode="decimal" value={deudas} onChange={(e) => setDeudas(e.target.value)} placeholder="Ej. 300" className="placeholder:text-gray-400 placeholder:opacity-90 text-gray-900 mt-2 w-full rounded-lg border p-3 text-lg shadow-sm focus:ring-2 focus:ring-sky-300" />
                  </label>
                  <label className="block">
                    <div className="flex items-center justify-between">
                      <div className=" text-gray-600 flex items-center gap-2 text-green-600"> <PiggyBank /> Ahorros</div>
                      <div className="text-xs text-gray-400">Disponible ahora</div>
                    </div>
                    <input inputMode="decimal" value={ahorros} onChange={(e) => setAhorros(e.target.value)} placeholder="Ej. 30000" className="placeholder:text-gray-400 placeholder:opacity-90 text-gray-900 mt-2 w-full rounded-lg border p-3 text-lg shadow-sm focus:ring-2 focus:ring-sky-300" />
                  </label>
                  <p className="mt-2 text-xs text-gray-500 sm:col-span-2">Si no tienes ahorros, pon 0. Las deudas aumentan tu DTI y afectan la viabilidad.</p>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="rounded-lg border p-4 bg-gray-50">
                    <div className="text-xs text-gray-500">Resumen</div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700">
                      <div>
                        <div className="text-xs text-gray-500">Precio</div>
                        <div className="mt-1 font-medium">{formatoMoneda(parseNumber(precio))}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Ingresos</div>
                        <div className="mt-1 font-medium">{formatoMoneda(parseNumber(ingresos))}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Deudas</div>
                        <div className="mt-1 font-medium">{formatoMoneda(parseNumber(deudas))}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Ahorros</div>
                        <div className="mt-1 font-medium">{formatoMoneda(parseNumber(ahorros))}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-9/12">
                        <div className={`w-full flex flex-col items-center rounded-sm px-3 py-1 text-xl 
                          font-semibold ${res.color === "green" ? "bg-green-100 text-green-800" : res.color === "amber" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                          {res.icon} <span className="text-xl">{res.verdict}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-gray-500">Pago mensual</div>
                        <div className="mt-1 font-semibold text-gray-900">{formatoMoneda(res.monthlyMortgage)}</div>
                        <div className="text-xs text-gray-500">DTI {(res.dti * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="mt-2 border-gray-400 border rounded-xl p-3 bg-white">
                        <div className="text-sm text-gray-600">{res.reason}</div>

                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-600">¿Quieres ayuda para hacerlo viable?</div>
                    <div className="mt-3 ">
                      <Link href="https://www.selaris.es/hipoteca" className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] px-4 py-2 text-white shadow text-2xl">
                        <span className="text-xl font-semibold">Consigue un estudio gratuito</span>
                      </Link>
                    </div>
                    <div className="mt-2">
                    <button onClick={() => setMostrarConsejos(true)} className="rounded-full bg-white px-4 py-2 border text-xl text-gray-600">Ver sugerencias</button>

                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                onClick={prevStep}
                disabled={step === 1}
                aria-label="Volver"
                className={`flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full ${step === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border text-gray-700 shadow-sm'}`}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="sr-only">Volver</span>
              </button>

              <button
                onClick={() => { if (step < totalSteps) nextStep(); else setStep(4); }}
                aria-label={step < totalSteps ? "Siguiente" : "Ver resultado"}
                disabled={step < totalSteps && !validateStep(step)}
                className={`flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full ${step < totalSteps ? (validateStep(step) ? 'bg-blue-600 text-white shadow' : 'bg-blue-100 text-blue-300 cursor-not-allowed') : 'bg-blue-600 text-white shadow'}`}
              >
                {step < totalSteps ? (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
                <span className="sr-only">{step < totalSteps ? 'Siguiente' : 'Ver resultado'}</span>
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-400">Resultados orientativos: para una respuesta precisa consulta a un asesor financiero.</p>
          </div>
        </div>
      </main>

      {/* Suggestions modal-style panel (simple) */}
      {mostrarConsejos && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 text-gray-700">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMostrarConsejos(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold">Sugerencias rápidas</h4>
                <p className="mt-1 text-sm text-gray-600">Pequeños pasos para mejorar la viabilidad de una compra.</p>
              </div>
              <button onClick={() => setMostrarConsejos(false)} className="text-gray-400"><X/></button>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>🔸 Aumenta el ahorro objetivo al menos al 10–20% del precio.</li>
              <li>🔸 Reduce deudas recurrentes para mejorar la DTI.</li>
              <li>🔸 Negocia un tipo de interés más bajo o busca plazos flexibles.</li>
              <li>🔸 Valora ayudas o programas locales para comprar tu primera vivienda.</li>
            </ul>

            <div className="mt-6 flex gap-3">
              <a href="https://www.selaris.es/hipoteca" className="flex items-center gap-3 justify-center rounded-full bg-gradient-to-r from-[#06B6D4] to-[#2563EB] px-4 py-2 text-white">
  
                Pedir plan gratis
              </a>
              <button onClick={() => setMostrarConsejos(false)} className="flex-1 rounded-full bg-white border">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
