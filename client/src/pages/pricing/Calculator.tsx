/**
 * MCR Pricing Calculator — Adapted to unified orange theme
 * Uses dailytask's CSS theme variables (mcr-card, mcr-input-group, etc.)
 */
import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const CAR_MODELS = ["Honda City Turbo", "Honda City eHEV", "Honda HR-V eHEV", "Toyota Yaris Ativ", "Toyota Fortuner"];
const DEPOSIT_OPTIONS = [2000, 3000, 5000, 10000];
const BOOKING_OPTIONS = [500, 1000, 2000];
const LATE_RETURN_RATES = [100, 200];

type RentMode = "daily" | "monthly";
type LangMode = "th" | "en";

interface PricingData {
  carModel: string;
  carModelCustom: string;
  rentMode: RentMode;
  rentalDays: number;
  rentalPricePerDay: number;
  rentalMonths: number;
  rentalPricePerMonth: number;
  lateReturnChecked: boolean;
  lateReturnHours: number;
  lateReturnMinutes: number;
  lateReturnRate: number;
  unknowReturnTime: boolean;
  outOfAreaChecked: boolean;
  outOfAreaProvince: string;
  outOfAreaDays: number;
  outOfAreaPricePerDay: number;
  pickupDropChecked: boolean;
  pickupDropLocation: string;
  pickupDropPrice: number;
  depositAmount: number;
  bookingAmount: number;
  langMode: LangMode;
}

const defaults: PricingData = {
  carModel: CAR_MODELS[0], carModelCustom: "", rentMode: "daily",
  rentalDays: 1, rentalPricePerDay: 0, rentalMonths: 1, rentalPricePerMonth: 0,
  lateReturnChecked: false, lateReturnHours: 0, lateReturnMinutes: 0, lateReturnRate: 100, unknowReturnTime: false,
  outOfAreaChecked: false, outOfAreaProvince: "", outOfAreaDays: 0, outOfAreaPricePerDay: 0,
  pickupDropChecked: false, pickupDropLocation: "", pickupDropPrice: 0,
  depositAmount: 2000, bookingAmount: 1000,
  langMode: "th",
};

export default function Calculator() {
  const [data, setData] = useState<PricingData>({ ...defaults });
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const displayCarModel = data.carModelCustom || data.carModel;
  const formatNumber = (num: number): string => num.toLocaleString("th-TH");

  const en = data.langMode === "en";
  const t = (th: string, eng: string) => en ? eng : th;

  const { total, remaining, rentalCost, rentalLabel } = (() => {
    let cost = data.rentMode === "monthly"
      ? data.rentalMonths * data.rentalPricePerMonth
      : data.rentalDays * data.rentalPricePerDay;
    const label = data.rentMode === "monthly"
      ? t(`${data.rentalMonths} เดือน`, `${data.rentalMonths} month${data.rentalMonths > 1 ? "s" : ""}`)
      : t(`${data.rentalDays} วัน`, `${data.rentalDays} day${data.rentalDays > 1 ? "s" : ""}`);
    let total = cost;
    if (data.lateReturnChecked) total += (data.lateReturnHours + data.lateReturnMinutes / 60) * data.lateReturnRate;
    if (data.outOfAreaChecked) total += data.outOfAreaDays * data.outOfAreaPricePerDay;
    if (data.pickupDropChecked) total += data.pickupDropPrice;
    total += data.depositAmount;
    return { total, remaining: total - data.bookingAmount, rentalCost: cost, rentalLabel: label };
  })();

  const generateOutputText = (): string => {
    let output = `🚗 ${displayCarModel || t("รถ", "Car")}\n\n`;
    output += t(
      `💰 ค่าเช่า ${rentalLabel} = ${formatNumber(rentalCost)} บาท`,
      `💰 Rental ${rentalLabel} = ${formatNumber(rentalCost)} THB`
    );
    if (data.unknowReturnTime) output += t(" (หากรับและคืนรถเวลาเดิม)", " (if same pick-up & return time)");
    output += "\n";

    if (data.lateReturnChecked && (data.lateReturnHours > 0 || data.lateReturnMinutes > 0)) {
      const h = data.lateReturnHours + data.lateReturnMinutes / 60;
      let s = ""; if (data.lateReturnHours > 0 && data.lateReturnMinutes > 0) s = t(`${data.lateReturnHours} ชั่วโมง ${data.lateReturnMinutes} นาที`, `${data.lateReturnHours}h ${data.lateReturnMinutes}m`); else if (data.lateReturnHours > 0) s = t(`${data.lateReturnHours} ชั่วโมง`, `${data.lateReturnHours}h`); else s = t(`${data.lateReturnMinutes} นาที`, `${data.lateReturnMinutes}m`);
      output += t(`⏰ คืนรถเกินเวลา ${s} = ${formatNumber(h * data.lateReturnRate)} บาท\n`, `⏰ Late return ${s} = ${formatNumber(h * data.lateReturnRate)} THB\n`);
    }
    if (data.outOfAreaChecked && data.outOfAreaDays > 0) {
      output += t(
        `📍 ใช้งานนอกพื้นที่ (${data.outOfAreaProvince || "จังหวัด"}) ${data.outOfAreaDays} วัน = ${formatNumber(data.outOfAreaDays * data.outOfAreaPricePerDay)} บาท\n`,
        `📍 Out of area (${data.outOfAreaProvince || "Province"}) ${data.outOfAreaDays} day${data.outOfAreaDays > 1 ? "s" : ""} = ${formatNumber(data.outOfAreaDays * data.outOfAreaPricePerDay)} THB\n`
      );
    }
    if (data.pickupDropChecked && data.pickupDropPrice > 0) {
      output += t(
        `🚘 รับ-คืนรถนอกสถานที่ (${data.pickupDropLocation || "สถานที่"}) = ${formatNumber(data.pickupDropPrice)} บาท\n`,
        `🚘 Pickup/Drop elsewhere (${data.pickupDropLocation || "Location"}) = ${formatNumber(data.pickupDropPrice)} THB\n`
      );
    }
    output += t(
      `🔒 เงินประกันความเสียหาย ${formatNumber(data.depositAmount)} บาท (คืนเต็มจำนวนตอนคืนรถ)\n\n`,
      `🔒 Security deposit ${formatNumber(data.depositAmount)} THB (fully refundable upon return)\n\n`
    );
    output += t(
      `👉 รวมทั้งหมด ${formatNumber(total)} บาท\n\n`,
      `👉 Total ${formatNumber(total)} THB\n\n`
    );
    output += t(
      `📌 การชำระเงิน\n• โอนจอง ${formatNumber(data.bookingAmount)} บาท\n• ส่วนที่เหลือ ${formatNumber(remaining)} บาท ชำระวันรับรถเท่านั้นค่ะคุณลูกค้า\n\n`,
      `📌 Payment\n• Booking deposit ${formatNumber(data.bookingAmount)} THB\n• Remaining ${formatNumber(remaining)} THB payable on pick-up day\n\n`
    );
    output += t(
      `⚠️ คิวรถมีจำนวนจำกัด และราคาอาจมีการเปลี่ยนแปลง\nแนะนำจองล่วงหน้าเพื่อยืนยันสิทธิ์นะคะ 😊`,
      `⚠️ Limited availability. Prices subject to change.\nAdvance booking recommended to secure your reservation 😊`
    );
    return output;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateOutputText());
      setCopied(true);
      toast.success(t("คัดลอกแล้ว", "Copied!"));
      setTimeout(() => setCopied(false), 1500);
    } catch { toast.error("คัดลอกไม่สำเร็จ"); }
  };

  const toggleAccordion = (s: string) => setExpandedAccordion(expandedAccordion === s ? null : s);

  return (
    <div className="space-y-4">
      {/* Top bar: Language toggle + Reset */}
      <div className="flex items-center justify-between">
        {/* Language toggle */}
        <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
          {(["th", "en"] as const).map((l) => (
            <button key={l} onClick={() => setData((p) => ({ ...p, langMode: l }))}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${data.langMode === l ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {l === "th" ? "🇹🇭 ไทย" : "🇬🇧 EN"}
            </button>
          ))}
        </div>
        <button onClick={() => { setData({ ...defaults }); setExpandedAccordion(null); }} className="px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors text-sm">
          {t("🔄 รีเซ็ต", "🔄 Reset")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("📋 ข้อมูลการเช่า", "📋 Rental Info")}</h2>

          {/* Car Model */}
          <div className="mcr-input-group">
            <label className="mcr-label">🚗 รุ่นรถ</label>
            <select value={data.carModel} onChange={(e) => { setData((p) => ({ ...p, carModel: e.target.value, carModelCustom: "" })); }} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground">
              {CAR_MODELS.map((m) => (<option key={m} value={m}>{m}</option>))}
              <option value="custom">---กรอกรุ่นรถอื่น---</option>
            </select>
            {data.carModel === "custom" && (
              <input type="text" placeholder="กรอกรุ่นรถของคุณ" value={data.carModelCustom} onChange={(e) => setData((p) => ({ ...p, carModelCustom: e.target.value }))} className="w-full px-3 py-2 mt-2 rounded-lg border border-input bg-card text-foreground" />
            )}
          </div>

          {/* Rental */}
          <div className="mcr-card border-l-4 border-l-primary">
            <h3 className="font-semibold text-foreground mb-3">💰 ค่าเช่า (บังคับ)</h3>
            {/* Daily/Monthly toggle */}
            <div className="flex gap-1 mb-3 bg-muted rounded-lg p-1">
              {(["daily", "monthly"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setData((p) => ({ ...p, rentMode: mode }))}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                    data.rentMode === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "daily" ? "📆 รายวัน" : "📅 รายเดือน"}
                </button>
              ))}
            </div>
            {data.rentMode === "daily" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="mcr-input-group"><label className="mcr-label">จำนวนวัน</label><input type="number" min="1" value={data.rentalDays} onChange={(e) => setData((p) => ({ ...p, rentalDays: parseInt(e.target.value) || 1 }))} onFocus={(e) => e.target.select()} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground" /></div>
                <div className="mcr-input-group"><label className="mcr-label">ราคา/วัน (บาท)</label><input type="number" min="0" value={data.rentalPricePerDay} onChange={(e) => setData((p) => ({ ...p, rentalPricePerDay: parseInt(e.target.value) || 0 }))} onFocus={(e) => e.target.select()} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground" /></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="mcr-input-group"><label className="mcr-label">จำนวนเดือน</label><input type="number" min="1" value={data.rentalMonths} onChange={(e) => setData((p) => ({ ...p, rentalMonths: parseInt(e.target.value) || 1 }))} onFocus={(e) => e.target.select()} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground" /></div>
                <div className="mcr-input-group"><label className="mcr-label">ราคา/เดือน (บาท)</label><input type="number" min="0" value={data.rentalPricePerMonth} onChange={(e) => setData((p) => ({ ...p, rentalPricePerMonth: parseInt(e.target.value) || 0 }))} onFocus={(e) => e.target.select()} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground" /></div>
              </div>
            )}
          </div>

          {/* Accordions */}
          {([
            { key: "lateReturn", label: t("⏰ คืนรถเกินเวลา", "⏰ Late Return"), checked: data.lateReturnChecked, content: (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="mcr-input-group"><label className="mcr-label">{t("ชั่วโมง", "Hours")}</label><input type="number" min="0" value={data.lateReturnHours} onChange={(e) => setData((p) => ({ ...p, lateReturnHours: parseInt(e.target.value) || 0 }))} onFocus={(e) => e.target.select()} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground" /></div>
                  <div className="mcr-input-group"><label className="mcr-label">{t("นาที", "Minutes")}</label><select value={data.lateReturnMinutes} onChange={(e) => setData((p) => ({ ...p, lateReturnMinutes: parseInt(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground"><option value="0">0</option><option value="30">30</option></select></div>
                </div>
                <div className="mcr-input-group"><label className="mcr-label">{t("อัตราค่า/ชั่วโมง", "Rate/Hour")}</label><select value={data.lateReturnRate} onChange={(e) => setData((p) => ({ ...p, lateReturnRate: parseInt(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground">{LATE_RETURN_RATES.map((r) => (<option key={r} value={r}>{formatNumber(r)}</option>))}</select></div>
              </div>
            )},
            { key: "unknowTime", label: t("❓ ไม่รู้เวลา", "❓ Unknown Time"), checked: data.unknowReturnTime, content: (
              <p className="text-sm text-muted-foreground">{t("หากรับและคืนรถเวลาเดิม ค่าเช่าคิดตามที่แจ้ง", "If same pick-up & return time, rental rate as quoted")}</p>
            )},
            { key: "outOfArea", label: "📍 ใช้งานนอกพื้นที่", checked: data.outOfAreaChecked, content: (
              <div className="space-y-3">
                <div className="mcr-input-group"><label className="mcr-label">จังหวัด</label><input type="text" placeholder="เช่น ชลบุรี" value={data.outOfAreaProvince} onChange={(e) => setData((p) => ({ ...p, outOfAreaProvince: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="mcr-input-group"><label className="mcr-label">จำนวนวัน</label><input type="number" min="0" value={data.outOfAreaDays} onChange={(e) => setData((p) => ({ ...p, outOfAreaDays: parseInt(e.target.value) || 0 }))} onFocus={(e) => e.target.select()} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground" /></div>
                  <div className="mcr-input-group"><label className="mcr-label">ราคา/วัน</label><input type="number" min="0" value={data.outOfAreaPricePerDay} onChange={(e) => setData((p) => ({ ...p, outOfAreaPricePerDay: parseInt(e.target.value) || 0 }))} onFocus={(e) => e.target.select()} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground" /></div>
                </div>
              </div>
            )},
            { key: "pickupDrop", label: "🚘 รับ-คืนรถนอกสถานที่", checked: data.pickupDropChecked, content: (
              <div className="grid grid-cols-2 gap-3">
                <div className="mcr-input-group"><label className="mcr-label">สถานที่</label><input type="text" placeholder="เช่น สนามบิน" value={data.pickupDropLocation} onChange={(e) => setData((p) => ({ ...p, pickupDropLocation: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground" /></div>
                <div className="mcr-input-group"><label className="mcr-label">ค่าบริการ</label><input type="number" min="0" value={data.pickupDropPrice} onChange={(e) => setData((p) => ({ ...p, pickupDropPrice: parseInt(e.target.value) || 0 }))} onFocus={(e) => e.target.select()} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground" /></div>
              </div>
            )},
          ] as const).map(({ key, label, checked, content }) => (
            <div key={key} className="border border-border rounded-lg overflow-hidden">
              <button onClick={() => toggleAccordion(key)} className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-muted transition-colors">
                <label className="flex items-center gap-3 cursor-pointer flex-1 text-left" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={checked} onChange={() => { const field = key === "lateReturn" ? "lateReturnChecked" : key === "outOfArea" ? "outOfAreaChecked" : key === "unknowTime" ? "unknowReturnTime" : "pickupDropChecked"; setData((p) => ({ ...p, [field]: !checked } as any)); if (!checked) setExpandedAccordion(key); }} />
                  <span className="font-semibold text-foreground">{label}</span>
                </label>
                <ChevronDown size={20} className={`transition-transform ${expandedAccordion === key ? "rotate-180" : ""}`} />
              </button>
              {checked && expandedAccordion === key && (<div className="px-4 py-3 bg-muted border-t border-border">{content}</div>)}
            </div>
          ))}

          {/* Deposit */}
          <div className="mcr-card">
            <h3 className="font-semibold text-foreground mb-3">🔒 เงินประกันความเสียหาย</h3>
            <div className="flex gap-2 flex-wrap">
              {DEPOSIT_OPTIONS.map((a) => (<button key={a} onClick={() => setData((p) => ({ ...p, depositAmount: a }))} className={`px-3 py-2 rounded-lg font-semibold transition-all ${data.depositAmount === a ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{formatNumber(a)}</button>))}
            </div>
          </div>

          {/* Booking */}
          <div className="mcr-card">
            <h3 className="font-semibold text-foreground mb-3">💳 เงินมัดจำเช่ารถ</h3>
            <div className="flex gap-2 flex-wrap">
              {BOOKING_OPTIONS.map((a) => (<button key={a} onClick={() => setData((p) => ({ ...p, bookingAmount: a }))} className={`px-3 py-2 rounded-lg font-semibold transition-all ${data.bookingAmount === a ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{formatNumber(a)}</button>))}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">{t("📄 ตัวอย่างข้อความ", "📄 Preview")}</h2>
          <div className="mcr-card bg-primary/5 border-2 border-primary/20">
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{generateOutputText()}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/10 rounded-lg p-4 text-center"><p className="text-sm text-muted-foreground mb-1">{t("รวมทั้งหมด", "Total")}</p><p className="text-2xl font-bold text-primary">{formatNumber(total)}</p><p className="text-xs text-muted-foreground">{t("บาท", "THB")}</p></div>
            <div className="bg-green-500/10 rounded-lg p-4 text-center"><p className="text-sm text-muted-foreground mb-1">{t("ส่วนที่เหลือ", "Remaining")}</p><p className="text-2xl font-bold text-green-600">{formatNumber(remaining)}</p><p className="text-xs text-muted-foreground">{t("บาท", "THB")}</p></div>
          </div>
        </div>
      </div>

      {/* Copy button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="max-w-lg lg:max-w-5xl xl:max-w-7xl mx-auto">
          <button onClick={handleCopy} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? t("คัดลอกแล้ว", "Copied!") : t("📋 Copy ข้อความ", "📋 Copy Text")}
          </button>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
}
