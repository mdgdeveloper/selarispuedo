import { formatoMoneda } from "@/app/page";
import Image from "next/image";

interface Props {
    step: number;
    res: {
        monthlyMortgage: number;
        dti: number;
        verdict: string;
        reason: string;
        color: "green" | "amber" | "red";
    }
}


const PuedoComprar = ({ step, res }: Props) => {

    return(
        <div className="order-2 md:order-1 md:pr-6">
          <div className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">¿Puedo comprar esta vivienda?</h2>
                <p className="mt-1 text-sm text-gray-600">Antes de enamorarte de una casa, comprueba si es viable.</p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-700">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 shadow-sm">
                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Pago mensual estimado
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 shadow-sm">
                    <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 10h18M3 6h18M3 14h10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Relación DTI
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white p-3 shadow">
                    <div className="text-xs text-gray-500">Pago mensual</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">{formatoMoneda(res.monthlyMortgage)}</div>
                  </div>

                  <div className="rounded-lg bg-white p-3 shadow">
                    <div className="text-xs text-gray-500">DTI</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">{(res.dti * 100).toFixed(1)}%</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className={`inline-flex items-center gap-3 rounded-full px-3 py-2 text-sm font-semibold ${res.color === "green" ? "bg-green-100 text-green-800" : res.color === "amber" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                    <span className="text-lg">{res.verdict}</span>
                    <span className="text-xs font-medium text-gray-600">{res.reason}</span>
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-500">Continúa con los controles de la derecha para avanzar.</div>
              </div>

              <div className="mt-4 rounded-lg overflow-hidden">
                <Image src={step === 1 ? "/images/house1.jpg" : step === 2 ? "/images/inside_house1.jpg" : step === 3 ? "/images/inside_house2.jpg" : "/images/flat1.jpg"} alt="Imagen" width={1000} height={400} className="w-full h-36 object-cover rounded-lg transition-opacity duration-300" />
              </div>
          </div>
        </div>
        </div>
    )
}

export default PuedoComprar;