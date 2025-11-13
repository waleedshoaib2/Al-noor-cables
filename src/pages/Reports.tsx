import { useState, useRef } from 'react';
import { useRawMaterialStore } from '@/store/useRawMaterialStore';
import { useProcessedRawMaterialStore } from '@/store/useProcessedRawMaterialStore';
import { useProductStore } from '@/store/useProductStore';
import { useCustomerPurchaseStore } from '@/store/useCustomerPurchaseStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import { exportToPDF } from '@/utils/pdfExport';
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
  
  const reportSectionRef = useRef<HTMLDivElement>(null);

  // Get data from stores
  const rawMaterials = useRawMaterialStore((state) => state.rawMaterials);
  const processedMaterials = useProcessedRawMaterialStore((state) => state.processedMaterials);
  const productions = useProductStore((state) => state.productions);
  const purchases = useCustomerPurchaseStore((state) => state.purchases);
  const expenses = useExpenseStore((state) => state.expenses);
  const getTotalByPeriod = useExpenseStore((state) => state.getTotalByPeriod);

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

  // Filter data based on date range and category
  const filteredRawMaterials = rawMaterials.filter((m) => {
    if (reportCategory !== 'all' && reportCategory !== 'raw-materials') return false;
    return m.date >= start && m.date <= end;
  });

  const filteredProcessedMaterials = processedMaterials.filter((m) => {
    if (reportCategory !== 'all' && reportCategory !== 'processed-materials') return false;
    return m.date >= start && m.date <= end;
  });

  const filteredProductions = productions.filter((p) => {
    if (reportCategory !== 'all' && reportCategory !== 'products') return false;
    return p.date >= start && p.date <= end;
  });

  const filteredPurchases = purchases.filter((p) => {
    if (reportCategory !== 'all' && reportCategory !== 'purchases') return false;
    const purchaseDate = new Date(p.date);
    return purchaseDate >= start && purchaseDate <= end;
  });

  const filteredExpenses = expenses.filter((e) => {
    if (reportCategory !== 'all' && reportCategory !== 'expenses') return false;
    return e.date >= start && e.date <= end;
  });

  // Calculate totals
  const totalRawMaterials = filteredRawMaterials.reduce((sum, m) => sum + m.quantity, 0);
  const totalProcessedMaterials = filteredProcessedMaterials.reduce((sum, m) => sum + m.outputQuantity, 0);
  const totalProductsFoot = filteredProductions.reduce((sum, p) => sum + p.quantityFoot, 0);
  const totalProductsBundles = filteredProductions.reduce((sum, p) => sum + p.quantityBundles, 0);
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + (p.price || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalPurchases - totalExpenses;

  // PDF Export handler
  const handleExportPDF = async () => {
    if (reportSectionRef.current) {
      const reportTitle = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${reportCategory === 'all' ? 'All Categories' : reportCategory}`;
      await exportToPDF(
        'reports-section',
        `${reportType}_${reportCategory}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        reportTitle
      );
    }
  };

  const getReportTitle = () => {
    const typeLabels = {
      daily: language === 'ur' ? 'روزانہ رپورٹ' : 'Daily Report',
      monthly: language === 'ur' ? 'ماہانہ رپورٹ' : 'Monthly Report',
      annual: language === 'ur' ? 'سالانہ رپورٹ' : 'Annual Report',
    };
    return typeLabels[reportType];
  };

  return (
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ur' ? 'رپورٹس' : 'Reports'}
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

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">
          {language === 'ur' ? 'رپورٹس کا انتظام' : 'Reports Management'}
        </h2>
        <p className="text-white/90 leading-relaxed">
          {language === 'ur' 
            ? 'یہ صفحہ آپ کو روزانہ، ماہانہ اور سالانہ رپورٹس تیار کرنے کی سہولت فراہم کرتا ہے۔ آپ مختلف زمروں کے لیے رپورٹس فلٹر کر سکتے ہیں اور PDF کے طور پر برآمد کر سکتے ہیں۔'
            : 'This page allows you to generate daily, monthly, and annual reports. You can filter reports by different categories and export them as PDF.'}
        </p>
      </div>

      {/* Report Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'ur' ? 'رپورٹ فلٹرز' : 'Report Filters'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ur' ? 'رپورٹ کی قسم' : 'Report Type'}
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="daily">{language === 'ur' ? 'روزانہ' : 'Daily'}</option>
              <option value="monthly">{language === 'ur' ? 'ماہانہ' : 'Monthly'}</option>
              <option value="annual">{language === 'ur' ? 'سالانہ' : 'Annual'}</option>
            </select>
          </div>

          {/* Report Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ur' ? 'زمرہ' : 'Category'}
            </label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value as ReportCategory)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ur' ? 'تاریخ' : 'Date'}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          )}

          {reportType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ur' ? 'مہینہ' : 'Month'}
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          )}

          {reportType === 'annual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ur' ? 'سال' : 'Year'}
              </label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                min="2020"
                max="2100"
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          )}

          {/* Export Button */}
          <div className="flex items-end">
            <Button variant="primary" onClick={handleExportPDF} className="w-full">
              📄 {language === 'ur' ? 'PDF برآمد کریں' : 'Export PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div id="reports-section" ref={reportSectionRef} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getReportTitle()}</h2>
          <p className="text-gray-600">
            {reportType === 'daily' && format(new Date(selectedDate), 'MMMM dd, yyyy')}
            {reportType === 'monthly' && format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
            {reportType === 'annual' && selectedYear}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {(reportCategory === 'all' || reportCategory === 'raw-materials') && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'کل خام مال' : 'Total Raw Materials'}
              </div>
              <div className="text-2xl font-bold text-brand-orange">{totalRawMaterials.toFixed(2)} kgs</div>
            </div>
          )}
          {(reportCategory === 'all' || reportCategory === 'processed-materials') && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'کل پروسیسڈ مال' : 'Total Processed Materials'}
              </div>
              <div className="text-2xl font-bold text-brand-blue">{totalProcessedMaterials.toFixed(2)} kgs</div>
            </div>
          )}
          {(reportCategory === 'all' || reportCategory === 'products') && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">
                  {language === 'ur' ? 'کل مصنوعات (فٹ)' : 'Total Products (Foot)'}
                </div>
                <div className="text-2xl font-bold text-green-600">{totalProductsFoot.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">
                  {language === 'ur' ? 'کل مصنوعات (بنڈلز)' : 'Total Products (Bundles)'}
                </div>
                <div className="text-2xl font-bold text-green-600">{totalProductsBundles.toFixed(2)}</div>
              </div>
            </>
          )}
          {(reportCategory === 'all' || reportCategory === 'purchases') && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'کل خریداری' : 'Total Purchases'}
              </div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPurchases)}</div>
            </div>
          )}
          {(reportCategory === 'all' || reportCategory === 'expenses') && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'کل اخراجات' : 'Total Expenses'}
              </div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            </div>
          )}
          {reportCategory === 'all' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'خالص منافع' : 'Net Profit'}
              </div>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Tables */}
        {(reportCategory === 'all' || reportCategory === 'raw-materials') && filteredRawMaterials.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {language === 'ur' ? 'خام مال' : 'Raw Materials'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'بیچ آئی ڈی' : 'Batch ID'}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'قسم' : 'Type'}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'مقدار' : 'Quantity'}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'تاریخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRawMaterials.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{m.batchId}</td>
                      <td className="py-3 px-4">{m.materialType}</td>
                      <td className="py-3 px-4">{m.quantity.toFixed(2)} kgs</td>
                      <td className="py-3 px-4">{formatDate(m.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(reportCategory === 'all' || reportCategory === 'purchases') && filteredPurchases.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {language === 'ur' ? 'خریداری' : 'Purchases'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'گاہک' : 'Customer'}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'مصنوعات' : 'Product'}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'مقدار' : 'Quantity'}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'قیمت' : 'Price'}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'تاریخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{p.customerId}</td>
                      <td className="py-3 px-4">{p.productName}</td>
                      <td className="py-3 px-4">{p.quantityBundles.toFixed(2)}</td>
                      <td className="py-3 px-4">{formatCurrency(p.price || 0)}</td>
                      <td className="py-3 px-4">{formatDate(p.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(reportCategory === 'all' || reportCategory === 'expenses') && filteredExpenses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {language === 'ur' ? 'اخراجات' : 'Expenses'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'عنوان' : 'Title'}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'رقم' : 'Amount'}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{language === 'ur' ? 'تاریخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{e.title}</td>
                      <td className="py-3 px-4">{formatCurrency(e.amount)}</td>
                      <td className="py-3 px-4">{formatDate(e.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
