import React, { useState } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';

const CAR_MODELS = [
  'Honda City Turbo',
  'Honda City eHEV',
  'Honda HR-V eHEV',
  'Toyota Yaris Ativ',
  'Toyota Fortuner',
  'Hyundai H1',
  'Mitsubishi Xpander',
  'BYD Seal 5 DM-I',
];

interface PricingData {
  carModel: string;
  carModelCustom: string;
  rentalDays: number;
  rentalPricePerDay: number;
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

const DEPOSIT_OPTIONS = [1000, 2000, 3000, 5000, 10000];
const BOOKING_OPTIONS = [500, 1000, 2000, 3000];
const LATE_RETURN_RATES = [100, 200];

export default function Home() {
  const [data, setData] = useState<PricingData>({
    carModel: CAR_MODELS[0],
    carModelCustom: '',
    rentalDays: 1,
    rentalPricePerDay: 0,
    lateReturnChecked: false,
    lateReturnHours: 0,
    lateReturnMinutes: 0,
    lateReturnRate: 100,
    outOfAreaChecked: false,
    outOfAreaProvince: '',
    outOfAreaDays: 0,
    outOfAreaPricePerDay: 0,
    pickupDropChecked: false,
    pickupDropLocation: '',
    pickupDropPrice: 0,
    depositAmount: 2000,
    bookingAmount: 1000,
  });

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  // Get display car model (custom if provided, otherwise dropdown selection)
  const displayCarModel = data.carModelCustom || data.carModel;

  // Format number with Thai locale (adds commas)
  const formatNumber = (num: number): string => {
    return num.toLocaleString('th-TH');
  };

  // Calculate totals
  const calculateTotals = () => {
    let total = data.rentalDays * data.rentalPricePerDay;

    if (data.lateReturnChecked) {
      const totalLateHours = data.lateReturnHours + (data.lateReturnMinutes / 60);
      total += totalLateHours * data.lateReturnRate;
    }

    if (data.outOfAreaChecked) {
      total += data.outOfAreaDays * data.outOfAreaPricePerDay;
    }

    if (data.pickupDropChecked) {
      total += data.pickupDropPrice;
    }

    total += data.depositAmount;

    return {
      total,
      remaining: total - data.bookingAmount,
    };
  };

  const calculateResult = calculateTotals();
  const total = calculateResult.total;
  const remaining = calculateResult.remaining;

  // Generate output text
  const generateOutputText = (): string => {
    let output = '';

    // Car model
    output += `🚗 ${displayCarModel || 'รถ'}\n\n`;

    // Rental
    const rentalCost = data.rentalDays * data.rentalPricePerDay;
    output += `💰 ค่าเช่า ${data.rentalDays} วัน = ${formatNumber(rentalCost)} บาท\n`;

    // Late return
    if (data.lateReturnChecked && (data.lateReturnHours > 0 || data.lateReturnMinutes > 0)) {
      const totalLateHours = data.lateReturnHours + (data.lateReturnMinutes / 60);
      const lateCost = totalLateHours * data.lateReturnRate;
      let lateTimeStr = '';
      if (data.lateReturnHours > 0 && data.lateReturnMinutes > 0) {
        lateTimeStr = `${data.lateReturnHours} ชั่วโมง ${data.lateReturnMinutes} นาที`;
      } else if (data.lateReturnHours > 0) {
        lateTimeStr = `${data.lateReturnHours} ชั่วโมง`;
      } else {
        lateTimeStr = `${data.lateReturnMinutes} นาที`;
      }
      output += `⏰ คืนรถเกินเวลา ${lateTimeStr} = ${formatNumber(lateCost)} บาท\n`;
    }

    // Out of area
    if (data.outOfAreaChecked && data.outOfAreaDays > 0) {
      const outAreaCost = data.outOfAreaDays * data.outOfAreaPricePerDay;
      output += `📍 ใช้งานนอกพื้นที่ (${data.outOfAreaProvince || 'จังหวัด'}) ${data.outOfAreaDays} วัน = ${formatNumber(outAreaCost)} บาท\n`;
    }

    // Pickup/Drop
    if (data.pickupDropChecked && data.pickupDropPrice > 0) {
      output += `🚘 รับ-คืนรถนอกสถานที่ (${data.pickupDropLocation || 'สถานที่'}) = ${formatNumber(data.pickupDropPrice)} บาท\n`;
    }

    // Deposit
    output += `🔒 เงินประกันความเสียหาย ${formatNumber(data.depositAmount)} บาท (คืนเต็มจำนวนตอนคืนรถ)\n\n`;

    // Total
    output += `👉 รวมทั้งหมด ${formatNumber(total)} บาท\n\n`;

    // Payment breakdown
    output += `📌 การชำระเงิน\n`;
    output += `• โอนจอง ${formatNumber(data.bookingAmount)} บาท\n`;
    output += `• ส่วนที่เหลือ ${formatNumber(remaining)} บาท ชำระวันรับรถเท่านั้นค่ะคุณลูกค้า\n\n`;

    // Footer
    output += `⚠️ คิวรถมีจำนวนจำกัด และราคาอาจมีการเปลี่ยนแปลง\n`;
    output += `แนะนำจองล่วงหน้าเพื่อยืนยันสิทธิ์นะคะ 😊`;

    return output;
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      const text = generateOutputText();
      await navigator.clipboard.writeText(text);
      setToastMessage('คัดลอกแล้ว');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle input change
  const handleInputChange = (key: keyof PricingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // Handle number input focus (select all)
  const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // Toggle accordion
  const toggleAccordion = (section: string) => {
    setExpandedAccordion(expandedAccordion === section ? null : section);
  };

  // Reset all data
  const handleReset = () => {
    setData({
      carModel: CAR_MODELS[0],
      carModelCustom: '',
      rentalDays: 1,
      rentalPricePerDay: 0,
      lateReturnChecked: false,
      lateReturnHours: 0,
      lateReturnMinutes: 0,
      lateReturnRate: 100,
      outOfAreaChecked: false,
      outOfAreaProvince: '',
      outOfAreaDays: 0,
      outOfAreaPricePerDay: 0,
      pickupDropChecked: false,
      pickupDropLocation: '',
      pickupDropPrice: 0,
      depositAmount: 2000,
      bookingAmount: 1000,
    });
    setExpandedAccordion(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/manus-storage/mcr-logo_08b591ea.png" alt="MCR Logo" className="h-12 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">MCR Pricing</h1>
                <p className="text-xs text-gray-500">Calculator</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium transition-colors text-sm"
              title="รีเซ็ตข้อมูลทั้งหมด"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📋 ข้อมูลการเช่า</h2>

            {/* Car Model - Dropdown with Custom Input */}
            <div className="mcr-input-group">
              <label className="mcr-label">🚗 รุ่นรถ</label>
              <div className="space-y-2">
                <select
                  value={data.carModel}
                  onChange={(e) => {
                    handleInputChange('carModel', e.target.value);
                    handleInputChange('carModelCustom', '');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer"
                >
                  {CAR_MODELS.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  <option value="custom">---กรอกรุ่นรถอื่น---</option>
                </select>
                {data.carModel === 'custom' && (
                  <input
                    type="text"
                    placeholder="กรอกรุ่นรถของคุณ"
                    value={data.carModelCustom}
                    onChange={(e) => handleInputChange('carModelCustom', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                )}
              </div>
            </div>

            {/* Rental Section */}
            <div className="mcr-card border-l-4 border-l-accent">
              <h3 className="font-semibold text-gray-900 mb-3">💰 ค่าเช่า (บังคับ)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="mcr-input-group">
                  <label className="mcr-label">จำนวนวัน</label>
                  <input
                    type="number"
                    min="1"
                    value={data.rentalDays}
                    onChange={(e) => handleInputChange('rentalDays', parseInt(e.target.value) || 1)}
                    onFocus={handleNumberInputFocus}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>
                <div className="mcr-input-group">
                  <label className="mcr-label">ราคา/วัน (บาท)</label>
                  <input
                    type="number"
                    min="0"
                    value={data.rentalPricePerDay}
                    onChange={(e) => handleInputChange('rentalPricePerDay', parseInt(e.target.value) || 0)}
                    onFocus={handleNumberInputFocus}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Additional Services - Accordion */}
            <div className="space-y-2">
              {/* Late Return Accordion */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleAccordion('lateReturn')}
                  className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1 text-left">
                    <input
                      type="checkbox"
                      checked={data.lateReturnChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleInputChange('lateReturnChecked', e.target.checked);
                      }}
                      className="cursor-pointer"
                    />
                    <span className="font-semibold text-gray-900">⏰ คืนรถเกินเวลา</span>
                  </label>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${expandedAccordion === 'lateReturn' ? 'rotate-180' : ''}`}
                  />
                </button>
                {data.lateReturnChecked && expandedAccordion === 'lateReturn' && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-3">
                    <div className="mcr-input-group">
                      <label className="mcr-label">ชั่วโมง</label>
                      <input
                        type="number"
                        min="0"
                        value={data.lateReturnHours}
                        onChange={(e) => handleInputChange('lateReturnHours', parseInt(e.target.value) || 0)}
                        onFocus={handleNumberInputFocus}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                      />
                    </div>
                    <div className="mcr-input-group">
                      <label className="mcr-label">นาที</label>
                      <select
                        value={data.lateReturnMinutes}
                        onChange={(e) => handleInputChange('lateReturnMinutes', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer"
                      >
                        <option value="0">0</option>
                        <option value="30">30</option>
                      </select>
                    </div>
                    <div className="col-span-2 mcr-input-group">
                      <label className="mcr-label">อัตราค่า/ชั่วโมง (บาท)</label>
                      <select
                        value={data.lateReturnRate}
                        onChange={(e) => handleInputChange('lateReturnRate', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer"
                      >
                        {LATE_RETURN_RATES.map(rate => (
                          <option key={rate} value={rate}>{formatNumber(rate)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Out of Area Accordion */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleAccordion('outOfArea')}
                  className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1 text-left">
                    <input
                      type="checkbox"
                      checked={data.outOfAreaChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleInputChange('outOfAreaChecked', e.target.checked);
                      }}
                      className="cursor-pointer"
                    />
                    <span className="font-semibold text-gray-900">📍 ใช้งานนอกพื้นที่</span>
                  </label>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${expandedAccordion === 'outOfArea' ? 'rotate-180' : ''}`}
                  />
                </button>
                {data.outOfAreaChecked && expandedAccordion === 'outOfArea' && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-3">
                    <div className="mcr-input-group">
                      <label className="mcr-label">จังหวัด</label>
                      <input
                        type="text"
                        placeholder="เช่น ชลบุรี"
                        value={data.outOfAreaProvince}
                        onChange={(e) => handleInputChange('outOfAreaProvince', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="mcr-input-group">
                        <label className="mcr-label">จำนวนวัน</label>
                        <input
                          type="number"
                          min="0"
                          value={data.outOfAreaDays}
                          onChange={(e) => handleInputChange('outOfAreaDays', parseInt(e.target.value) || 0)}
                          onFocus={handleNumberInputFocus}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                        />
                      </div>
                      <div className="mcr-input-group">
                        <label className="mcr-label">ราคา/วัน (บาท)</label>
                        <input
                          type="number"
                          min="0"
                          value={data.outOfAreaPricePerDay}
                          onChange={(e) => handleInputChange('outOfAreaPricePerDay', parseInt(e.target.value) || 0)}
                          onFocus={handleNumberInputFocus}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pickup/Drop Accordion */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleAccordion('pickupDrop')}
                  className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1 text-left">
                    <input
                      type="checkbox"
                      checked={data.pickupDropChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleInputChange('pickupDropChecked', e.target.checked);
                      }}
                      className="cursor-pointer"
                    />
                    <span className="font-semibold text-gray-900">🚘 รับ-คืนรถนอกสถานที่</span>
                  </label>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${expandedAccordion === 'pickupDrop' ? 'rotate-180' : ''}`}
                  />
                </button>
                {data.pickupDropChecked && expandedAccordion === 'pickupDrop' && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-3">
                    <div className="mcr-input-group">
                      <label className="mcr-label">สถานที่</label>
                      <input
                        type="text"
                        placeholder="เช่น สนามบิน"
                        value={data.pickupDropLocation}
                        onChange={(e) => handleInputChange('pickupDropLocation', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                      />
                    </div>
                    <div className="mcr-input-group">
                      <label className="mcr-label">ค่าบริการ (บาท)</label>
                      <input
                        type="number"
                        min="0"
                        value={data.pickupDropPrice}
                        onChange={(e) => handleInputChange('pickupDropPrice', parseInt(e.target.value) || 0)}
                        onFocus={handleNumberInputFocus}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-white text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Deposit Section */}
            <div className="mcr-card">
              <h3 className="font-semibold text-gray-900 mb-3">🔒 เงินประกันรถ</h3>
              <div className="flex gap-2 flex-wrap">
                {DEPOSIT_OPTIONS.map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleInputChange('depositAmount', amount)}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                      data.depositAmount === amount
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formatNumber(amount)}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking Amount Section */}
            <div className="mcr-card">
              <h3 className="font-semibold text-gray-900 mb-3">💳 ส่วนจองล่วงหน้า</h3>
              <div className="flex gap-2 flex-wrap">
                {BOOKING_OPTIONS.map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleInputChange('bookingAmount', amount)}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                      data.bookingAmount === amount
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formatNumber(amount)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📄 ตัวอย่างข้อความ</h2>
            <div className="mcr-card bg-orange-50 border-2 border-accent">
              <div className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {generateOutputText()}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-100 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">รวมทั้งหมด</p>
                <p className="text-2xl font-bold text-orange-600">{formatNumber(total)}</p>
                <p className="text-xs text-gray-500">บาท</p>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">ส่วนที่เหลือ</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(remaining)}</p>
                <p className="text-xs text-gray-500">บาท</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Copy Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 p-4">
        <div className="container">
          <button
            onClick={handleCopy}
            className="w-full bg-accent hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {showToast ? <Check size={20} /> : <Copy size={20} />}
            {showToast ? 'คัดลอกแล้ว' : '📋 Copy ข้อความ'}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg animate-fade-in-out">
          {toastMessage}
        </div>
      )}

      {/* Spacer for sticky button */}
      <div className="h-20" />
    </div>
  );
}
