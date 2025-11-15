import { useState, useRef, useMemo } from 'react';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useProductStore } from '@/store/useProductStore';
import { useCustomerPurchaseStore } from '@/store/useCustomerPurchaseStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import ReportPrintView from '@/components/Report/ReportPrintView';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

type ReportType = 'daily' | 'monthly' | 'annual';
type ReportCategory = 'all' | 'raw-materials' | 'processed-materials' | 'products' | 'purchases' | 'expenses';

export default function Reports() {
  const { t, language } = useTranslation();
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [reportCategory, setReportCategory] = useState<ReportCategory>('all');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState<string>(format(new Date(), 'yyyy'));
  
  // Item-specific selection
  const [selectedRawMaterialType, setSelectedRawMaterialType] = useState<string>('all');
  const [selectedProcessedMaterialName, setSelectedProcessedMaterialName] = useState<string>('all');
  const [selectedProductName, setSelectedProductName] = useState<string>('all');
  
  const reportSectionRef = useRef<HTMLDivElement>(null);

  // Get data from stores
  const rawMaterials = useRawMaterialStore((state) => state.rawMaterials);
  const processedMaterials = useProcessedRawMaterialStore((state) => state.processedMaterials);
  const productions = useProductStore((state) => state.productions);
  const purchases = useCustomerPurchaseStore((state) => state.purchases);
  const expenses = useExpenseStore((state) => state.expenses);
  const customers = useCustomerStore((state) => state.customers);
  const getAllProcessedMaterialNames = useProcessedRawMaterialStore((state) => state.getAllProcessedMaterialNames);
  const getAllProductNames = useProductStore((state) => state.getAllProductNames);

  // Get unique values for dropdowns
  const rawMaterialTypes = useMemo(() => {
    const types = new Set(rawMaterials.map(m => m.materialType));
    return Array.from(types).sort();
  }, [rawMaterials]);

  const processedMaterialNames = useMemo(() => {
    return getAllProcessedMaterialNames().sort();
  }, [getAllProcessedMaterialNames]);

  const productNames = useMemo(() => {
    return getAllProductNames().sort();
  }, [getAllProductNames]);

  // Calculate date ranges
  const getDateRange = () => {
    if (reportType === 'daily') {
      const date = new Date(selectedDate);
      return { start: startOfDay(date), end: endOfDay(date) };
    } else if (reportType === 'monthly') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      return { start: startOfMonth(date), end: endOfMonth(date) };
    } else {
      const year = parseInt(selectedYear);
      return { start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 11, 31)) };
    }
  };

  const { start, end } = getDateRange();

  // Filter data based on date range, category, and item selection
  const filteredRawMaterials = useMemo(() => {
    return rawMaterials.filter((m) => {
      if (reportCategory !== 'all' && reportCategory !== 'raw-materials') return false;
      if (m.date < start || m.date > end) return false;
      if (selectedRawMaterialType !== 'all' && m.materialType !== selectedRawMaterialType) return false;
      return true;
    });
  }, [rawMaterials, reportCategory, start, end, selectedRawMaterialType]);

  const filteredProcessedMaterials = useMemo(() => {
    return processedMaterials.filter((m) => {
      if (reportCategory !== 'all' && reportCategory !== 'processed-materials') return false;
      if (m.date < start || m.date > end) return false;
      if (selectedProcessedMaterialName !== 'all' && m.name !== selectedProcessedMaterialName) return false;
      return true;
    });
  }, [processedMaterials, reportCategory, start, end, selectedProcessedMaterialName]);

  const filteredProductions = useMemo(() => {
    return productions.filter((p) => {
      if (reportCategory !== 'all' && reportCategory !== 'products') return false;
      if (p.date < start || p.date > end) return false;
      if (selectedProductName !== 'all' && p.productName !== selectedProductName) return false;
      return true;
    });
  }, [productions, reportCategory, start, end, selectedProductName]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (reportCategory !== 'all' && reportCategory !== 'purchases') return false;
      const purchaseDate = new Date(p.date);
      return purchaseDate >= start && purchaseDate <= end;
    });
  }, [purchases, reportCategory, start, end]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (reportCategory !== 'all' && reportCategory !== 'expenses') return false;
      return e.date >= start && e.date <= end;
    });
  }, [expenses, reportCategory, start, end]);

  // Calculate detailed statistics
  const rawMaterialStats = useMemo(() => {
    const stats: Record<string, { total: number; batches: number; avgPerBatch: number }> = {};
    filteredRawMaterials.forEach(m => {
      if (!stats[m.materialType]) {
        stats[m.materialType] = { total: 0, batches: 0, avgPerBatch: 0 };
      }
      stats[m.materialType].total += m.quantity;
      stats[m.materialType].batches += 1;
    });
    Object.keys(stats).forEach(type => {
      stats[type].avgPerBatch = stats[type].batches > 0 ? stats[type].total / stats[type].batches : 0;
    });
    return stats;
  }, [filteredRawMaterials]);

  const processedMaterialStats = useMemo(() => {
    const stats: Record<string, { 
      totalInput: number; 
      totalOutput: number; 
      totalBundles: number; 
      batches: number;
      avgWeightPerBundle: number;
    }> = {};
    filteredProcessedMaterials.forEach(m => {
      if (!stats[m.name]) {
        stats[m.name] = { totalInput: 0, totalOutput: 0, totalBundles: 0, batches: 0, avgWeightPerBundle: 0 };
      }
      stats[m.name].totalInput += m.inputQuantity;
      stats[m.name].totalOutput += m.outputQuantity;
      stats[m.name].totalBundles += m.numberOfBundles;
      stats[m.name].batches += 1;
    });
    Object.keys(stats).forEach(name => {
      stats[name].avgWeightPerBundle = stats[name].totalBundles > 0 
        ? stats[name].totalOutput / stats[name].totalBundles 
        : 0;
    });
    return stats;
  }, [filteredProcessedMaterials]);

  const productStats = useMemo(() => {
    const stats: Record<string, { 
      totalFoot: number; 
      totalBundles: number; 
      batches: number;
      avgFootPerBatch: number;
    }> = {};
    filteredProductions.forEach(p => {
      if (!stats[p.productName]) {
        stats[p.productName] = { totalFoot: 0, totalBundles: 0, batches: 0, avgFootPerBatch: 0 };
      }
      stats[p.productName].totalFoot += p.quantityFoot;
      stats[p.productName].totalBundles += p.quantityBundles;
      stats[p.productName].batches += 1;
    });
    Object.keys(stats).forEach(name => {
      stats[name].avgFootPerBatch = stats[name].batches > 0 
        ? stats[name].totalFoot / stats[name].batches 
        : 0;
    });
    return stats;
  }, [filteredProductions]);

  // Calculate totals
  const totalRawMaterials = filteredRawMaterials.reduce((sum, m) => sum + m.quantity, 0);
  const totalProcessedMaterials = filteredProcessedMaterials.reduce((sum, m) => sum + m.outputQuantity, 0);
  const totalProductsFoot = filteredProductions.reduce((sum, p) => sum + p.quantityFoot, 0);
  const totalProductsBundles = filteredProductions.reduce((sum, p) => sum + p.quantityBundles, 0);
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + (p.price || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalPurchases - totalExpenses;

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  const getReportTitle = () => {
    const typeLabels = {
      daily: language === 'ur' ? 'روزانہ رپورٹ' : 'Daily Report',
      monthly: language === 'ur' ? 'ماہانہ رپورٹ' : 'Monthly Report',
      annual: language === 'ur' ? 'سالانہ رپورٹ' : 'Annual Report',
    };
    return typeLabels[reportType];
  };

  const getPeriodLabel = () => {
    if (reportType === 'daily') {
      return format(new Date(selectedDate), language === 'ur' ? 'dd MMMM, yyyy' : 'MMMM dd, yyyy');
    } else if (reportType === 'monthly') {
      return format(new Date(selectedMonth + '-01'), language === 'ur' ? 'MMMM yyyy' : 'MMMM yyyy');
    } else {
      return selectedYear;
    }
  };

  // Reset item selection when category changes
  const handleCategoryChange = (category: ReportCategory) => {
    setReportCategory(category);
    setSelectedRawMaterialType('all');
    setSelectedProcessedMaterialName('all');
    setSelectedProductName('all');
  };

  return (
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center no-print">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'ur' ? 'پیشہ ورانہ رپورٹس' : 'Professional Reports'}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={toggleLanguage}
            className="text-sm"
            title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
          >
            {language === 'en' ? '🇵🇰 اردو' : '🇬🇧 English'}
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 no-print">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          {language === 'ur' ? 'رپورٹ فلٹرز' : 'Report Filters'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ur' ? 'رپورٹ کی قسم' : 'Report Type'}
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
            >
              <option value="daily">{language === 'ur' ? 'روزانہ' : 'Daily'}</option>
              <option value="monthly">{language === 'ur' ? 'ماہانہ' : 'Monthly'}</option>
              <option value="annual">{language === 'ur' ? 'سالانہ' : 'Annual'}</option>
            </select>
          </div>

          {/* Report Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ur' ? 'زمرہ' : 'Category'}
            </label>
            <select
              value={reportCategory}
              onChange={(e) => handleCategoryChange(e.target.value as ReportCategory)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
            >
              <option value="all">{language === 'ur' ? 'تمام' : 'All'}</option>
              <option value="raw-materials">{language === 'ur' ? 'خام مال' : 'Raw Materials'}</option>
              <option value="processed-materials">{language === 'ur' ? 'پروسیسڈ مال' : 'Processed Materials'}</option>
              <option value="products">{language === 'ur' ? 'مصنوعات' : 'Products'}</option>
              <option value="purchases">{language === 'ur' ? 'خریداری' : 'Purchases'}</option>
              <option value="expenses">{language === 'ur' ? 'اخراجات' : 'Expenses'}</option>
            </select>
          </div>

          {/* Date/Month/Year Selector */}
          {reportType === 'daily' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'ur' ? 'تاریخ' : 'Date'}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
              />
            </div>
          )}

          {reportType === 'monthly' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'ur' ? 'مہینہ' : 'Month'}
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
              />
            </div>
          )}

          {reportType === 'annual' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'ur' ? 'سال' : 'Year'}
              </label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                min="2020"
                max="2100"
                className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
              />
            </div>
          )}
        </div>

        {/* Item-specific filters */}
        {reportCategory === 'raw-materials' && rawMaterialTypes.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ur' ? 'خام مال کی قسم منتخب کریں' : 'Select Raw Material Type'}
            </label>
            <select
              value={selectedRawMaterialType}
              onChange={(e) => setSelectedRawMaterialType(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full md:w-1/3 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
            >
              <option value="all">{language === 'ur' ? 'تمام اقسام' : 'All Types'}</option>
              {rawMaterialTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )}

        {reportCategory === 'processed-materials' && processedMaterialNames.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ur' ? 'پروسیس شدہ مواد منتخب کریں' : 'Select Processed Material'}
            </label>
            <select
              value={selectedProcessedMaterialName}
              onChange={(e) => setSelectedProcessedMaterialName(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full md:w-1/3 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
            >
              <option value="all">{language === 'ur' ? 'تمام مواد' : 'All Materials'}</option>
              {processedMaterialNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}

        {reportCategory === 'products' && productNames.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ur' ? 'مصنوعات منتخب کریں' : 'Select Product'}
            </label>
            <select
              value={selectedProductName}
              onChange={(e) => setSelectedProductName(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full md:w-1/3 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
            >
              <option value="all">{language === 'ur' ? 'تمام مصنوعات' : 'All Products'}</option>
              {productNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Print Button */}
        <div className="mt-6">
          <Button variant="primary" onClick={handlePrint} className="px-6 py-3 text-lg font-semibold no-print">
            🖨️ {language === 'ur' ? 'پرنٹ' : 'Print'}
          </Button>
        </div>
      </div>

      {/* Report Summary */}
      <div id="reports-section" ref={reportSectionRef} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 no-print">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{getReportTitle()}</h2>
          <p className="text-lg text-gray-600">{getPeriodLabel()}</p>
          {reportCategory === 'raw-materials' && selectedRawMaterialType !== 'all' && (
            <p className="text-md text-gray-500 mt-1">
              {language === 'ur' ? `مواد کی قسم: ${selectedRawMaterialType}` : `Material Type: ${selectedRawMaterialType}`}
            </p>
          )}
          {reportCategory === 'processed-materials' && selectedProcessedMaterialName !== 'all' && (
            <p className="text-md text-gray-500 mt-1">
              {language === 'ur' ? `مواد: ${selectedProcessedMaterialName}` : `Material: ${selectedProcessedMaterialName}`}
            </p>
          )}
          {reportCategory === 'products' && selectedProductName !== 'all' && (
            <p className="text-md text-gray-500 mt-1">
              {language === 'ur' ? `مصنوعات: ${selectedProductName}` : `Product: ${selectedProductName}`}
            </p>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(reportCategory === 'all' || reportCategory === 'raw-materials') && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
              <div className="text-sm font-semibold text-orange-700 mb-2">
                {language === 'ur' ? 'کل خام مال' : 'Total Raw Materials'}
              </div>
              <div className="text-3xl font-bold text-orange-900">{totalRawMaterials.toFixed(2)} kgs</div>
              <div className="text-xs text-orange-600 mt-2">
                {filteredRawMaterials.length} {language === 'ur' ? 'بیچز' : 'batches'}
              </div>
            </div>
          )}
          {(reportCategory === 'all' || reportCategory === 'processed-materials') && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
              <div className="text-sm font-semibold text-blue-700 mb-2">
                {language === 'ur' ? 'کل پروسیسڈ مال' : 'Total Processed Materials'}
              </div>
              <div className="text-3xl font-bold text-blue-900">{totalProcessedMaterials.toFixed(2)} kgs</div>
              <div className="text-xs text-blue-600 mt-2">
                {filteredProcessedMaterials.length} {language === 'ur' ? 'بیچز' : 'batches'}
              </div>
            </div>
          )}
          {(reportCategory === 'all' || reportCategory === 'products') && (
            <>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
                <div className="text-sm font-semibold text-green-700 mb-2">
                  {language === 'ur' ? 'کل مصنوعات (فٹ)' : 'Total Products (Foot)'}
                </div>
                <div className="text-3xl font-bold text-green-900">{totalProductsFoot.toFixed(2)}</div>
                <div className="text-xs text-green-600 mt-2">
                  {filteredProductions.length} {language === 'ur' ? 'پروڈکشنز' : 'productions'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border-2 border-emerald-200">
                <div className="text-sm font-semibold text-emerald-700 mb-2">
                  {language === 'ur' ? 'کل مصنوعات (بنڈلز)' : 'Total Products (Bundles)'}
                </div>
                <div className="text-3xl font-bold text-emerald-900">{totalProductsBundles.toFixed(2)}</div>
                <div className="text-xs text-emerald-600 mt-2">
                  {filteredProductions.length} {language === 'ur' ? 'پروڈکشنز' : 'productions'}
                </div>
              </div>
            </>
          )}
          {(reportCategory === 'all' || reportCategory === 'purchases') && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
              <div className="text-sm font-semibold text-purple-700 mb-2">
                {language === 'ur' ? 'کل خریداری' : 'Total Purchases'}
              </div>
              <div className="text-3xl font-bold text-purple-900">{formatCurrency(totalPurchases)}</div>
              <div className="text-xs text-purple-600 mt-2">
                {filteredPurchases.length} {language === 'ur' ? 'خریداری' : 'purchases'}
              </div>
            </div>
          )}
          {(reportCategory === 'all' || reportCategory === 'expenses') && (
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200">
              <div className="text-sm font-semibold text-red-700 mb-2">
                {language === 'ur' ? 'کل اخراجات' : 'Total Expenses'}
              </div>
              <div className="text-3xl font-bold text-red-900">{formatCurrency(totalExpenses)}</div>
              <div className="text-xs text-red-600 mt-2">
                {filteredExpenses.length} {language === 'ur' ? 'خرچ' : 'expenses'}
              </div>
            </div>
          )}
          {reportCategory === 'all' && (
            <div className={`bg-gradient-to-br p-6 rounded-xl border-2 ${netProfit >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'}`}>
              <div className={`text-sm font-semibold mb-2 ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {language === 'ur' ? 'خالص منافع' : 'Net Profit'}
              </div>
              <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {formatCurrency(netProfit)}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Statistics by Item */}
        {reportCategory === 'raw-materials' && Object.keys(rawMaterialStats).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ur' ? 'مواد کی قسم کے لحاظ سے تفصیلات' : 'Statistics by Material Type'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(rawMaterialStats).map(([type, stats]) => (
                <div key={type} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">{type}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'کل مقدار:' : 'Total Quantity:'}</span>
                      <span className="font-semibold">{stats.total.toFixed(2)} kgs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'بیچز:' : 'Batches:'}</span>
                      <span className="font-semibold">{stats.batches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'اوسط فی بیچ:' : 'Avg per Batch:'}</span>
                      <span className="font-semibold">{stats.avgPerBatch.toFixed(2)} kgs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportCategory === 'processed-materials' && Object.keys(processedMaterialStats).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ur' ? 'مواد کے لحاظ سے تفصیلات' : 'Statistics by Material'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(processedMaterialStats).map(([name, stats]) => (
                <div key={name} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">{name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'کل ان پٹ:' : 'Total Input:'}</span>
                      <span className="font-semibold">{stats.totalInput.toFixed(2)} kgs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'کل آؤٹ پٹ:' : 'Total Output:'}</span>
                      <span className="font-semibold">{stats.totalOutput.toFixed(2)} kgs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'کل بنڈلز:' : 'Total Bundles:'}</span>
                      <span className="font-semibold">{stats.totalBundles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'بیچز:' : 'Batches:'}</span>
                      <span className="font-semibold">{stats.batches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'اوسط وزن فی بنڈل:' : 'Avg Weight/Bundle:'}</span>
                      <span className="font-semibold">{stats.avgWeightPerBundle.toFixed(2)} kgs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportCategory === 'products' && Object.keys(productStats).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ur' ? 'مصنوعات کے لحاظ سے تفصیلات' : 'Statistics by Product'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(productStats).map(([name, stats]) => (
                <div key={name} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">{name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'کل فٹ:' : 'Total Foot:'}</span>
                      <span className="font-semibold">{stats.totalFoot.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'کل بنڈلز:' : 'Total Bundles:'}</span>
                      <span className="font-semibold">{stats.totalBundles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'پروڈکشنز:' : 'Productions:'}</span>
                      <span className="font-semibold">{stats.batches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ur' ? 'اوسط فٹ فی پروڈکشن:' : 'Avg Foot/Production:'}</span>
                      <span className="font-semibold">{stats.avgFootPerBatch.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Tables */}
        {(reportCategory === 'all' || reportCategory === 'raw-materials') && filteredRawMaterials.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ur' ? 'خام مال کی تفصیلات' : 'Raw Materials Details'}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'بیچ آئی ڈی' : 'Batch ID'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'قسم' : 'Type'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'سپلائر' : 'Supplier'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'مقدار' : 'Quantity'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'تاریخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRawMaterials.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6">{m.batchId}</td>
                      <td className="py-3 px-6">{m.materialType}</td>
                      <td className="py-3 px-6">{m.supplier}</td>
                      <td className="py-3 px-6 font-semibold">{m.quantity.toFixed(2)} kgs</td>
                      <td className="py-3 px-6">{formatDate(m.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(reportCategory === 'all' || reportCategory === 'processed-materials') && filteredProcessedMaterials.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ur' ? 'پروسیس شدہ مواد کی تفصیلات' : 'Processed Materials Details'}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'نام' : 'Name'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'قسم' : 'Type'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'ان پٹ' : 'Input'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'آؤٹ پٹ' : 'Output'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'بنڈلز' : 'Bundles'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'بیچ آئی ڈی' : 'Batch ID'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'تاریخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProcessedMaterials.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6 font-semibold">{m.name}</td>
                      <td className="py-3 px-6">{m.materialType}</td>
                      <td className="py-3 px-6">{m.inputQuantity.toFixed(2)} kgs</td>
                      <td className="py-3 px-6 font-semibold">{m.outputQuantity.toFixed(2)} kgs</td>
                      <td className="py-3 px-6">{m.numberOfBundles}</td>
                      <td className="py-3 px-6">{m.batchId}</td>
                      <td className="py-3 px-6">{formatDate(m.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(reportCategory === 'all' || reportCategory === 'products') && filteredProductions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ur' ? 'مصنوعات کی تفصیلات' : 'Products Details'}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'مصنوعات' : 'Product'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'پروسیس شدہ مواد' : 'Processed Material'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'فٹ' : 'Foot'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'بنڈلز' : 'Bundles'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'بیچ آئی ڈی' : 'Batch ID'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'تاریخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProductions.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6 font-semibold">{p.productName}</td>
                      <td className="py-3 px-6">{p.processedMaterialName}</td>
                      <td className="py-3 px-6 font-semibold">{p.quantityFoot.toFixed(2)}</td>
                      <td className="py-3 px-6">{p.quantityBundles}</td>
                      <td className="py-3 px-6">{p.batchId}</td>
                      <td className="py-3 px-6">{formatDate(p.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(reportCategory === 'all' || reportCategory === 'purchases') && filteredPurchases.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ur' ? 'خریداری کی تفصیلات' : 'Purchases Details'}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'گاہک' : 'Customer'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'مصنوعات' : 'Product'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'مقدار' : 'Quantity'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'قیمت' : 'Price'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'تاریخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6">{p.customerId}</td>
                      <td className="py-3 px-6">{p.productName}</td>
                      <td className="py-3 px-6">{p.quantityBundles.toFixed(2)}</td>
                      <td className="py-3 px-6 font-semibold">{formatCurrency(p.price || 0)}</td>
                      <td className="py-3 px-6">{formatDate(p.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(reportCategory === 'all' || reportCategory === 'expenses') && filteredExpenses.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ur' ? 'اخراجات کی تفصیلات' : 'Expenses Details'}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'عنوان' : 'Title'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'قسم' : 'Category'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'رقم' : 'Amount'}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{language === 'ur' ? 'تاریخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6">{e.title}</td>
                      <td className="py-3 px-6">{e.category || '-'}</td>
                      <td className="py-3 px-6 font-semibold text-red-600">{formatCurrency(e.amount)}</td>
                      <td className="py-3 px-6">{formatDate(e.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No data message */}
        {((reportCategory === 'raw-materials' && filteredRawMaterials.length === 0) ||
          (reportCategory === 'processed-materials' && filteredProcessedMaterials.length === 0) ||
          (reportCategory === 'products' && filteredProductions.length === 0) ||
          (reportCategory === 'purchases' && filteredPurchases.length === 0) ||
          (reportCategory === 'expenses' && filteredExpenses.length === 0)) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {language === 'ur' ? 'منتخب فلٹرز کے لیے کوئی ڈیٹا نہیں ملا' : 'No data found for selected filters'}
            </p>
          </div>
        )}
      </div>

      {/* Print View - Only visible when printing */}
      <div className="print-view" style={{ display: 'none' }}>
        <ReportPrintView
          reportType={reportType}
          reportCategory={reportCategory}
          selectedDate={selectedDate}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedRawMaterialType={selectedRawMaterialType}
          selectedProcessedMaterialName={selectedProcessedMaterialName}
          selectedProductName={selectedProductName}
          filteredRawMaterials={filteredRawMaterials}
          filteredProcessedMaterials={filteredProcessedMaterials}
          filteredProductions={filteredProductions}
          filteredPurchases={filteredPurchases}
          filteredExpenses={filteredExpenses}
          rawMaterialStats={rawMaterialStats}
          processedMaterialStats={processedMaterialStats}
          productStats={productStats}
          totalRawMaterials={totalRawMaterials}
          totalProcessedMaterials={totalProcessedMaterials}
          totalProductsFoot={totalProductsFoot}
          totalProductsBundles={totalProductsBundles}
          totalPurchases={totalPurchases}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
          customers={customers}
        />
      </div>
    </div>
  );
}
