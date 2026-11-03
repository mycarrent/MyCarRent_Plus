/**
 * Merge Entries — รวมข้อมูลการจองจากข้อความ Line และใบยืนยันระบบ
 * Input 1: ข้อความแจ้งราคา/ชำระเงิน (Line format)
 * Input 2: ใบยืนยันการจองจากระบบ (Structured format)
 * Output: เอกสารรวมที่มีข้อมูลครบถ้วน
 */
import { useState } from "react";
import { Copy, Check, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MergeResult {
  customerName: string;
  customerPhone: string;
  carModel: string;
  licensePlate: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  rentalDays: string;
  lateReturnHours: string;
  lateReturnFee: string;
  pickupLocation: string;
  returnLocation: string;
  dailyRate: string;
  baseRental: string;
  lateFee: string;
  totalRental: string;
  deposit: string;
  bookingPaid: string;
  remainingDue: string;
  contractUrl: string;
  interestingPlacesUrl: string;
}

const EXAMPLE_INPUT_1 = `🚗 Toyota Camry Hybrid

💰 ค่าเช่า 3 วัน = 4,500 บาท
⏰ คืนรถเกินเวลา 2 ชั่วโมง = 200 บาท
🔒 เงินประกันรถ 3,000 บาท (คืนเต็มจำนวนตอนคืนรถ)

👉 รวมทั้งหมด 7,700 บาท

📌 ชำระเงิน
• โอนจองมาแล้ว 1,500 บาท
• ส่วนที่เหลือ 6,200 บาท ชำระวันรับรถเท่านั้นค่ะ

⚠️ คิวรถมีจำนวนจำกัด และราคาอาจมีการเปลี่ยนแปลง
แนะนำจองล่วงหน้าเพื่อยืนยันสิทธิ์นะคะ 😊`;

const EXAMPLE_INPUT_2 = `🤖 รายการด้านล่างเป็นเอกสารสรุปจากระบบอัตโนมัติ
กรุณาตรวจสอบรายละเอียดให้ครบถ้วน

---

📄 ใบยืนยันการจองรถเช่า (Car Rental Confirmation)
หมายเลขการจอง:: MR20260815
วันที่ออกเอกสาร:: 15/08/2026

---

👤 ข้อมูลลูกค้า
ชื่อ:: สมชาย ใจดี
เบอร์โทรศัพท์:: 0812345678

---

🚗 ข้อมูลรถ
รถ:: Toyota Camry Hybrid

---

📅 ระยะเวลาเช่า
วันที่รับรถ:: 20/08/2026 เวลา: 09:00
วันที่คืนรถ:: 23/08/2026 เวลา: 11:00
จำนวนวัน:: 3 วัน

สถานที่รับรถ:: สนามบินสุวรรณภูมิ
สถานที่คืนรถ:: สนามบินสุวรรณภูมิ

---

💰 รายละเอียดค่าเช่า
ค่าเช่าต่อวัน:: 1,500 บาท × 3 วัน
ค่าเช่าพื้นฐาน: 4,500 บาท
ค่าบริการเพิ่มเติม:: 0 บาท
ส่วนลด:: 0 บาท

👉 ค่าเช่ารวมทั้งหมด:: 4,500 บาท

---

💳 ข้อมูลการชำระเงิน

- ค่ามัดจำคิวรถ:: 1,500 บาท
- เงินประกันความเสียหาย:: 3,000 บาท (ได้คืนตอนคืนรถ)

💵 ยอดที่ต้องชำระวันรับรถ (รวมประกัน): 6,000 บาท

---

📑 สัญญาเช่า:
https://app.kpcrm.net/th/contract/abc123def456

---

⭐ สถานที่น่าสนใจ:
www.opl.to/mycarrent.bkk

---

⚠️ หากข้อมูลไม่ถูกต้อง แจ้งแอดมินได้เลยนะคะ`;

const EXAMPLE_OUTPUT = `---

👤 ข้อมูลลูกค้า
ชื่อ:: สมชาย ใจดี
เบอร์โทรศัพท์:: 0812345678

---

🚗 ข้อมูลรถ
รถ:: Toyota Camry Hybrid
ทะเบียน::

---

📅 ระยะเวลาเช่า
วันที่รับรถ:: 20/08/2026 เวลา: 09:00
วันที่คืนรถ:: 23/08/2026 เวลา: 11:00
จำนวนวัน:: 3 วัน
คืนรถเกินเวลา:: 2 ชั่วโมง

สถานที่รับรถ:: สนามบินสุวรรณภูมิ
สถานที่คืนรถ:: สนามบินสุวรรณภูมิ

---

💰 รายละเอียดค่าเช่า
ค่าเช่าต่อวัน:: 1,500 บาท × 3 วัน
คืนรถเกินเวลา:: 2 ชั่วโมง = 200 บาท

👉 ค่าเช่ารวมทั้งหมด:: 4,500 บาท

---

💳 ข้อมูลการชำระเงิน

- โอนจองมาแล้ว:: 1,500 บาท ✅
- เงินประกันความเสียหาย:: 3,000 บาท (ได้คืนตอนคืนรถ)

💵 ยอดที่ต้องชำระวันรับรถ (รวมประกัน): 6,000 บาท

---`;

function parseInput1(text: string): Partial<MergeResult> {
  const result: Partial<MergeResult> = {};

  // Car model
  const carMatch = text.match(/🚗\s*(.+)/);
  if (carMatch) result.carModel = carMatch[1].trim();

  // Rental days and price
  const rentalMatch = text.match(/💰\s*ค่าเช่า\s*(\d+)\s*วัน\s*=\s*([\d,]+)\s*บาท/);
  if (rentalMatch) {
    result.rentalDays = rentalMatch[1];
    result.baseRental = rentalMatch[2].replace(/,/g, '');
  }

  // Late return
  const lateMatch = text.match(/⏰\s*คืนรถเกินเวลา\s*(\d+)\s*ชั่วโมง\s*=\s*([\d,]+)\s*บาท/);
  if (lateMatch) {
    result.lateReturnHours = lateMatch[1];
    result.lateFee = lateMatch[2].replace(/,/g, '');
  }

  // Deposit
  const depositMatch = text.match(/🔒\s*เงินประกันร?ถ?\s*([\d,]+)\s*บาท/);
  if (depositMatch) {
    result.deposit = depositMatch[1].replace(/,/g, '');
  }

  // Total
  const totalMatch = text.match(/👉\s*รวมทั้งหมด\s*([\d,]+)\s*บาท/);
  if (totalMatch) {
    result.totalRental = totalMatch[1].replace(/,/g, '');
  }

  // Payment
  const paidMatch = text.match(/โอนจองมาแล้ว\s*([\d,]+)\s*บาท/);
  if (paidMatch) {
    result.bookingPaid = paidMatch[1].replace(/,/g, '');
  }

  const remainingMatch = text.match(/ส่วนที่เหลือ\s*([\d,]+)\s*บาท/);
  if (remainingMatch) {
    result.remainingDue = remainingMatch[1].replace(/,/g, '');
  }

  return result;
}

function parseInput2(text: string): Partial<MergeResult> {
  const result: Partial<MergeResult> = {};

  // Booking number
  const bookingMatch = text.match(/หมายเลขการจอง::\s*(.+)/);
  if (bookingMatch) result.contractUrl = bookingMatch[1].trim(); // reuse field for booking ref

  // Customer name
  const nameMatch = text.match(/ชื่อ::\s*(.+)/);
  if (nameMatch) result.customerName = nameMatch[1].trim();

  // Customer phone
  const phoneMatch = text.match(/เบอร์โทรศัพท์::\s*(.+)/);
  if (phoneMatch) result.customerPhone = phoneMatch[1].trim();

  // Car model
  const carMatch = text.match(/รถ::\s*(.+)/);
  if (carMatch) result.carModel = carMatch[1].trim();

  // Pickup date/time
  const pickupMatch = text.match(/วันที่รับรถ::\s*(.+?)\s*เวลา:\s*(.+?)(?:\n|$)/);
  if (pickupMatch) {
    result.pickupDate = pickupMatch[1].trim();
    result.pickupTime = pickupMatch[2].trim();
  }

  // Return date/time
  const returnMatch = text.match(/วันที่คืนรถ::\s*(.+?)\s*เวลา:\s*(.+?)(?:\n|$)/);
  if (returnMatch) {
    result.returnDate = returnMatch[1].trim();
    result.returnTime = returnMatch[2].trim();
  }

  // Rental days
  const daysMatch = text.match(/จำนวนวัน::\s*(.+)/);
  if (daysMatch) result.rentalDays = daysMatch[1].trim();

  // Pickup location
  const pickupLocMatch = text.match(/สถานที่รับรถ::\s*(.+)/);
  if (pickupLocMatch) result.pickupLocation = pickupLocMatch[1].trim();

  // Return location
  const returnLocMatch = text.match(/สถานที่คืนรถ::\s*(.+)/);
  if (returnLocMatch) result.returnLocation = returnLocMatch[1].trim();

  // Daily rate
  const dailyMatch = text.match(/ค่าเช่าต่อวัน::\s*([\d,]+)\s*บาท/);
  if (dailyMatch) result.dailyRate = dailyMatch[1].replace(/,/g, '');

  // Base rental
  const baseMatch = text.match(/ค่าเช่าพื้นฐาน:\s*([\d,]+)\s*บาท/);
  if (baseMatch) result.baseRental = baseMatch[1].replace(/,/g, '');

  // Total rental
  const totalMatch = text.match(/ค่าเช่ารวมทั้งหมด::\s*([\d,]+)\s*บาท/);
  if (totalMatch) result.totalRental = totalMatch[1].replace(/,/g, '');

  // Deposit
  const depositMatch = text.match(/เงินประกันความเสียหาย::\s*([\d,]+)\s*บาท/);
  if (depositMatch) result.deposit = depositMatch[1].replace(/,/g, '');

  // Booking paid
  const bookingPaidMatch = text.match(/ค่ามัดจำคิวรถ::\s*([\d,]+)\s*บาท/);
  if (bookingPaidMatch) result.bookingPaid = bookingPaidMatch[1].replace(/,/g, '');

  // Remaining due
  const remainingMatch = text.match(/ยอดที่ต้องชำระวันรับรถ\s*\([^)]+\):\s*([\d,]+)\s*บาท/);
  if (remainingMatch) result.remainingDue = remainingMatch[1].replace(/,/g, '');

  // Contract URL
  const contractMatch = text.match(/📑\s*สัญญาเช่า:\s*(https?:\/\/\S+)/);
  if (contractMatch) result.contractUrl = contractMatch[1].trim();

  // Interesting places URL
  const placesMatch = text.match(/⭐\s*สถานที่น่าสนใจ:\s*(https?:\/\/\S+)/);
  if (placesMatch) result.interestingPlacesUrl = placesMatch[1].trim();

  return result;
}

function formatNumber(num: string): string {
  const n = parseInt(num.replace(/,/g, '')) || 0;
  return n.toLocaleString('th-TH');
}

function generateOutput(data: MergeResult, licensePlate: string): string {
  const lines: string[] = [];

  lines.push('---');
  lines.push('');
  lines.push('👤 ข้อมูลลูกค้า');
  lines.push(`ชื่อ:: ${data.customerName}`);
  lines.push(`เบอร์โทรศัพท์:: ${data.customerPhone}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('🚗 ข้อมูลรถ');
  lines.push(`รถ:: ${data.carModel}`);
  lines.push(`ทะเบียน:: ${licensePlate}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('📅 ระยะเวลาเช่า');
  lines.push(`วันที่รับรถ:: ${data.pickupDate} เวลา: ${data.pickupTime}`);
  lines.push(`วันที่คืนรถ:: ${data.returnDate} เวลา: ${data.returnTime}`);
  lines.push(`จำนวนวัน:: ${data.rentalDays}`);
  if (data.lateReturnHours) {
    lines.push(`คืนรถเกินเวลา:: ${data.lateReturnHours} ชั่วโมง`);
  }
  lines.push(`สถานที่รับรถ:: ${data.pickupLocation}`);
  lines.push(`สถานที่คืนรถ:: ${data.returnLocation}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('💰 รายละเอียดค่าเช่า');
  lines.push(`ค่าเช่าต่อวัน:: ${formatNumber(data.dailyRate)} บาท × ${data.rentalDays} วัน`);
  if (data.lateReturnHours && data.lateFee) {
    lines.push(`คืนรถเกินเวลา:: ${data.lateReturnHours} ชั่วโมง = ${formatNumber(data.lateFee)} บาท`);
  }
  lines.push('');
  lines.push(`👉 ค่าเช่ารวมทั้งหมด:: ${formatNumber(data.totalRental)} บาท`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('💳 ข้อมูลการชำระเงิน');
  lines.push('');
  if (data.bookingPaid) {
    lines.push(`- โอนจองมาแล้ว:: ${formatNumber(data.bookingPaid)} บาท ✅`);
  }
  if (data.deposit) {
    lines.push(`- เงินประกันความเสียหาย:: ${formatNumber(data.deposit)} บาท (ได้คืนตอนคืนรถ)`);
  }
  lines.push('');
  if (data.remainingDue) {
    lines.push(`💵 ยอดที่ต้องชำระวันรับรถ (รวมประกัน): ${formatNumber(data.remainingDue)} บาท`);
  }
  lines.push('');
  lines.push('---');

  return lines.join('\n');
}

export default function MergeEntries() {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const handleMerge = () => {
    setProcessing(true);
    setTimeout(() => {
      const parsed1 = parseInput1(input1);
      const parsed2 = parseInput2(input2);

      // Merge: prefer input2 for structured data, input1 for additional fees
      const merged: MergeResult = {
        customerName: parsed2.customerName || '',
        customerPhone: parsed2.customerPhone || '',
        carModel: parsed2.carModel || parsed1.carModel || '',
        licensePlate: licensePlate,
        pickupDate: parsed2.pickupDate || '',
        pickupTime: parsed2.pickupTime || '',
        returnDate: parsed2.returnDate || '',
        returnTime: parsed2.returnTime || '',
        rentalDays: parsed2.rentalDays || parsed1.rentalDays || '',
        lateReturnHours: parsed1.lateReturnHours || '',
        lateReturnFee: parsed1.lateFee || '',
        pickupLocation: parsed2.pickupLocation || '',
        returnLocation: parsed2.returnLocation || '',
        dailyRate: parsed2.dailyRate || '',
        baseRental: parsed2.baseRental || parsed1.baseRental || '',
        lateFee: parsed1.lateFee || '',
        totalRental: parsed2.totalRental || parsed1.totalRental || '',
        deposit: parsed2.deposit || parsed1.deposit || '',
        bookingPaid: parsed2.bookingPaid || parsed1.bookingPaid || '',
        remainingDue: parsed2.remainingDue || parsed1.remainingDue || '',
        contractUrl: parsed2.contractUrl || '',
        interestingPlacesUrl: parsed2.interestingPlacesUrl || '',
      };

      const result = generateOutput(merged, licensePlate);
      setOutput(result);
      setProcessing(false);
      toast.success('รวมรายการสำเร็จ');
    }, 100);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('คัดลอกแล้ว');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('คัดลอกไม่สำเร็จ');
    }
  };

  const resetAll = () => {
    setInput1('');
    setInput2('');
    setLicensePlate('');
    setOutput('');
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">📄 รวมรายการ</h2>
        <button
          onClick={resetAll}
          className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors flex items-center gap-1"
        >
          <Loader2 size={14} /> รีเซ็ต
        </button>
      </div>

      {/* License Plate Input */}
      <div className="mcr-card border-l-4 border-l-primary">
        <label className="mcr-label">🚗 ทะเบียนรถ (จะนำไปใส่ในผลลัพธ์)</label>
        <input
          type="text"
          placeholder="เช่น กข1234 เชียงราย"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
          className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground font-mono text-lg"
          style={{ letterSpacing: '0.5px' }}
        />
        <p className="text-xs text-muted-foreground mt-1">
          กรอกทะเบียนรถก่อนกด "รวมรายการ" จะนำไปใส่ในช่อง "ทะเบียน" ของเอกสารผลลัพธ์
        </p>
      </div>

      {/* Input Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">💬 ข้อความที่ 1 (Line/แชท)</h3>
            <button
              onClick={() => setShowExamples(true)}
              className="text-xs text-primary hover:underline"
            >
              ดูตัวอย่าง
            </button>
          </div>
          <textarea
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            placeholder="วางข้อความแจ้งราคา/ชำระเงินที่นี่..."
            className="w-full h-64 px-3 py-2 rounded-lg border border-input bg-card text-foreground resize-y font-mono text-sm"
            rows={16}
          />
        </div>

        {/* Input 2 */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">📋 ข้อความที่ 2 (ใบยืนยันระบบ)</h3>
          <textarea
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            placeholder="วางใบยืนยันการจองจากระบบที่นี่..."
            className="w-full h-64 px-3 py-2 rounded-lg border border-input bg-card text-foreground resize-y font-mono text-sm"
            rows={16}
          />
        </div>
      </div>

      {/* Merge Button */}
      <div className="flex justify-center">
        <button
          onClick={handleMerge}
          disabled={processing}
          className="w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {processing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              กำลังประมวลผล...
            </>
          ) : (
            <>
              <FileText size={20} />
              รวมรายการ
            </>
          )}
        </button>
      </div>

      {/* Output Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">📄 ผลลัพธ์ (พร้อมคัดลอก)</h3>
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
              copied ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                คัดลอกแล้ว
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="mcr-card bg-primary/5 border-2 border-primary/20 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed p-2 font-mono">{output}</pre>
        </div>
      </div>

      {/* Examples Modal */}
      {showExamples && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card">
              <h3 className="text-lg font-bold">ตัวอย่างข้อมูลทดสอบ</h3>
              <button onClick={() => setShowExamples(false)} className="p-2 rounded-lg hover:bg-muted">✕</button>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <h4 className="font-semibold mb-2 text-orange-600">💬 ข้อความที่ 1 (Line/แชท)</h4>
                <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">{EXAMPLE_INPUT_1}</pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-emerald-600">📋 ข้อความที่ 2 (ใบยืนยันระบบ)</h4>
                <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">{EXAMPLE_INPUT_2}</pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-violet-600">📄 ผลลัพธ์ที่คาดหวัง</h4>
                <pre className="bg-primary/5 border border-primary/20 p-3 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">{EXAMPLE_OUTPUT}</pre>
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button onClick={() => setShowExamples(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}