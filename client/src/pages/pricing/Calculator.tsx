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
  outOfAreaChecked: boolean;
  outOfAreaProvince: string;
  outOfAreaDays: number;
  outOfAreaPricePerDay: number;
  pickupDropChecked: boolean;
  pickupDropLocation: string;
  pickupDropPrice: number;
  depositAmount: number;
  bookingAmount: number;
}

const defaults: PricingData = {
  carModel: CAR_MODELS[0], carModelCustom: "", rentMode: "daily",
  rentalDays: 1, rentalPricePerDay: 0, rentalMonths: 1, rentalPricePerMonth: 0,
  lateReturnChecked: false, lateReturnHours: 0, lateReturnMinutes: 0, lateReturnRate: 100,
  outOfAreaChecked: false, outOfAreaProvince: "", outOfAreaDays: 0, outOfAreaPricePerDay: 0,
  pickupDropChecked: false, pickupDropLocation: "", pickupDropPrice: 0,
  depositAmount: 2000, bookingAmount: 1000,
};

export default function Calculator() {
  const [data, setData] = useState<PricingData>({ ...defaults });
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const displayCarModel = data.carModelCustom || data.carModel;
  const formatNumber = (num: number): string => num.toLocaleString("th-TH");

  const { total, remaining, rentalCost, rentalLabel } = (() => {
    let cost = data.rentMode === "monthly"
      ? data.rentalMonths * data.rentalPricePerMonth
      : data.rentalDays * data.rentalPricePerDay;
    const label = data.rentMode === "monthly"
      ? `${data.rentalMonths} เดือน`
      : `${data.rentalDays} วัน`;
    let t = cost;
    if (data.lateReturnChecked) t += (data.lateReturnHours + data.lateReturnMinutes / 60) * data.lateReturnRate;
    if (data.outOfAreaChecked) t += data.outOfAreaDays * data.outOfAreaPricePerDay;
    if (data.pickupDropChecked) t += data.pickupDropPrice;
    t += data.depositAmount;
    return { total: t, remaining: t - data.bookingAmount, rentalCost: cost, rentalLabel: label };
  })();

  const generateOutputText = (): string => {
    let output = `🚗 ${displayCarModel || "รถ"}\n\n`;
    output += `💰 ค่าเช่า ${rentalLabel} = ${formatNumber(rentalCost)} บาท\n`;
    if (data.lateReturnChecked && (data.lateReturnHours > 0 || data.lateReturnMinutes > 0)) {
      const h = data.lateReturnHours + data.lateReturnMinutes / 60;
      let s = ""; if (data.lateReturnHours > 0 && data.lateReturnMinutes > 0) s = `${data.lateReturnHours} ชั่วโมง ${data.lateReturnMinutes} นาที`; else if (data.lateReturnHours > 0) s = `${data.lateReturnHours} ชั่วโมง`; else s = `${data.lateReturnMinutes} นาที`;
      output += `⏰ คืนรถเกินเวลา ${s} = ${formatNumber(h * data.lateReturnRate)} บาท\n`;
    }
    if (data.outOfAreaChecked && data.outOfAreaDays > 0) output += `📍 ใช้งานนอกพื้นที่ (${data.outOfAreaProvince || "จังหวัด"}) ${data.outOfAreaDays} วัน = ${formatNumber(data.outOfAreaDays * data.outOfAreaPricePerDay)} บาท\n`;
    if (data.pickupDropChecked && data.pickupDropPrice > 0) output += `🚘 รับ-คืนรถนอกสถานที่ (${data.pickupDropLocation || "สถานที่"}) = ${formatNumber(data.pickupDropPrice)} บาท\n`;
    output += `🔒 เงินประกันความเสียหาย ${formatNumber(data.depositAmount)} บาท (คืนเต็มจำนวนตอนคืนรถ)\n\n`;
    output += `👉 รวมทั้งหมด ${formatNumber(total)} บาท\n\n`;
    output += `📌 การชำระเงิน\n• โอนจอง ${formatNumber(data.bookingAmount)} บาท\n• ส่วนที่เหลือ ${formatNumber(remaining)} บาท ชำระวันรับรถเท่านั้นค่ะคุณลูกค้า\n\n`;
    output += `⚠️ คิวรถมีจำนวนจำกัด และราคาอาจมีการเปลี่ยนแปลง\nแนะนำจองล่วงหน้าเพื่อยืนยันสิทธิ์นะคะ 😊`;
    return output;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateOutputText());
      setCopied(true);
      toast.success("คัดลอกแล้ว");
      setTimeout(() => setCopied(false), 1500);
    } catch { toast.error("คัดลอกไม่สำเร็จ"); }
  };

  const toggleAccordion = (s: string) => setExpandedAccordion(expandedAccordion === s ? null : s);

  return (
    <div className="space-y-4">
      {/* Reset button */}
      <div className="flex justify-end">
        <button onClick={() => { setData({ ...defaults }); setExpandedAccordion(null); }} className="px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors text-sm">
          🔄 รีเซ็ต
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">📋 ข้อมูลการเช่า</h2>

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
            { key: "lateReturn", label: "⏰ คืนรถเกินเวลา", checked: data.lateReturnChecked, content: (
              <div className="grid grid-cols-2 gap-3">
                <div className="mcr-input-group"><label className="mcr-label">ชั่วโมง</label><input type="number" min="0" value={data.lateReturnHours} onChange={(e) => setData((p) => ({ ...p, lateReturnHours: parseInt(e.target.value) || 0 }))} onFocus={(e) => e.target.select()} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground" /></div>
                <div className="mcr-input-group"><label className="mcr-label">นาที</label><select value={data.lateReturnMinutes} onChange={(e) => setData((p) => ({ ...p, lateReturnMinutes: parseInt(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground"><option value="0">0</option><option value="30">30</option></select></div>
                <div className="col-span-2 mcr-input-group"><label className="mcr-label">อัตราค่า/ชั่วโมง</label><select value={data.lateReturnRate} onChange={(e) => setData((p) => ({ ...p, lateReturnRate: parseInt(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground">{LATE_RETURN_RATES.map((r) => (<option key={r} value={r}>{formatNumber(r)}</option>))}</select></div>
              </div>
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
                  <input type="checkbox" checked={checked} onChange={() => { setData((p) => ({ ...p, [key === "lateReturn" ? "lateReturnChecked" : key === "outOfArea" ? "outOfAreaChecked" : "pickupDropChecked"]: !checked } as any)); if (!checked) setExpandedAccordion(key); }} />
                  <span className="font-semibold text-foreground">{label}</span>
                </label>
                <ChevronDown size={20} className={`transition-transform ${expandedAccordion === key ? "rotate-180" : ""}`} />
              </button>
              {checked && expandedAccordion === key && (<div className="px-4 py-3 bg-muted border-t border-border">{content}</div>)}
            </div>
          ))}

          {/* Deposit */}
          <div className="mcr-card">
            <h3 className="font-semibold text-foreground mb-3">🔒 เงินประกันรถ</h3>
            <div className="flex gap-2 flex-wrap">
              {DEPOSIT_OPTIONS.map((a) => (<button key={a} onClick={() => setData((p) => ({ ...p, depositAmount: a }))} className={`px-3 py-2 rounded-lg font-semibold transition-all ${data.depositAmount === a ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{formatNumber(a)}</button>))}
            </div>
          </div>

          {/* Booking */}
          <div className="mcr-card">
            <h3 className="font-semibold text-foreground mb-3">💳 ส่วนจองล่วงหน้า</h3>
            <div className="flex gap-2 flex-wrap">
              {BOOKING_OPTIONS.map((a) => (<button key={a} onClick={() => setData((p) => ({ ...p, bookingAmount: a }))} className={`px-3 py-2 rounded-lg font-semibold transition-all ${data.bookingAmount === a ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{formatNumber(a)}</button>))}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">📄 ตัวอย่างข้อความ</h2>
          <div className="mcr-card bg-primary/5 border-2 border-primary/20">
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{generateOutputText()}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/10 rounded-lg p-4 text-center"><p className="text-sm text-muted-foreground mb-1">รวมทั้งหมด</p><p className="text-2xl font-bold text-primary">{formatNumber(total)}</p><p className="text-xs text-muted-foreground">บาท</p></div>
            <div className="bg-green-500/10 rounded-lg p-4 text-center"><p className="text-sm text-muted-foreground mb-1">ส่วนที่เหลือ</p><p className="text-2xl font-bold text-green-600">{formatNumber(remaining)}</p><p className="text-xs text-muted-foreground">บาท</p></div>
          </div>
        </div>
      </div>

      {/* Copy button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="max-w-lg lg:max-w-5xl xl:max-w-7xl mx-auto">
          <button onClick={handleCopy} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? "คัดลอกแล้ว" : "📋 Copy ข้อความ"}
          </button>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
}
