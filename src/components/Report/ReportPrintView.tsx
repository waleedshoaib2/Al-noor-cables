import { formatDate, formatCurrency } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import type { RawMaterial, ProcessedRawMaterial, ProductProduction, CustomerPurchase, Expense } from '@/types';
import { format } from 'date-fns';

interface ReportPrintViewProps {
  reportType: 'daily' | 'monthly' | 'annual';
  reportCategory: 'all' | 'raw-materials' | 'processed-materials' | 'products' | 'purchases' | 'expenses';
  selectedDate?: string;
  selectedMonth?: string;
  selectedYear?: string;
  selectedRawMaterialType?: string;
  selectedProcessedMaterialName?: string;
  selectedProductName?: string;
  filteredRawMaterials: RawMaterial[];
  filteredProcessedMaterials: ProcessedRawMaterial[];
  filteredProductions: ProductProduction[];
  filteredPurchases: CustomerPurchase[];
  filteredExpenses: Expense[];
  rawMaterialStats: Record<string, { total: number; batches: number; avgPerBatch: number }>;
  processedMaterialStats: Record<string, { 
    totalInput: number; 
    totalOutput: number; 
    totalBundles: number; 
    batches: number;
    avgWeightPerBundle: number;
  }>;
  productStats: Record<string, { 
    totalFoot: number; 
    totalBundles: number; 
    batches: number;
    avgFootPerBatch: number;
  }>;
  totalRawMaterials: number;
  totalProcessedMaterials: number;
  totalProductsFoot: number;
  totalProductsBundles: number;
  totalPurchases: number;
  totalExpenses: number;
  netProfit: number;
  customers?: Array<{ id: number; name: string }>;
}

export default function ReportPrintView({
  reportType,
  reportCategory,
  selectedDate,
  selectedMonth,
  selectedYear,
  selectedRawMaterialType,
  selectedProcessedMaterialName,
  selectedProductName,
  filteredRawMaterials,
  filteredProcessedMaterials,
  filteredProductions,
  filteredPurchases,
  filteredExpenses,
  rawMaterialStats,
  processedMaterialStats,
  productStats,
  totalRawMaterials,
  totalProcessedMaterials,
  totalProductsFoot,
  totalProductsBundles,
  totalPurchases,
  totalExpenses,
  netProfit,
  customers = [],
}: ReportPrintViewProps) {
  const { language } = useTranslation();
  const printDate = new Date().toLocaleString();

  const getReportTitle = () => {
    const typeLabels = {
      daily: language === 'ur' ? 'روزانہ رپورٹ' : 'Daily Report',
      monthly: language === 'ur' ? 'ماہانہ رپورٹ' : 'Monthly Report',
      annual: language === 'ur' ? 'سالانہ رپورٹ' : 'Annual Report',
    };
    return typeLabels[reportType];
  };

  const getPeriodLabel = () => {
    if (reportType === 'daily' && selectedDate) {
      return format(new Date(selectedDate), language === 'ur' ? 'dd MMMM, yyyy' : 'MMMM dd, yyyy');
    } else if (reportType === 'monthly' && selectedMonth) {
      return format(new Date(selectedMonth + '-01'), language === 'ur' ? 'MMMM yyyy' : 'MMMM yyyy');
    } else if (selectedYear) {
      return selectedYear;
    }
    return '';
  };

  const getCategoryLabel = () => {
    const labels = {
      all: language === 'ur' ? 'تمام' : 'All',
      'raw-materials': language === 'ur' ? 'خام مال' : 'Raw Materials',
      'processed-materials': language === 'ur' ? 'پروسیسڈ مال' : 'Processed Materials',
      products: language === 'ur' ? 'مصنوعات' : 'Products',
      purchases: language === 'ur' ? 'خریداری' : 'Purchases',
      expenses: language === 'ur' ? 'اخراجات' : 'Expenses',
    };
    return labels[reportCategory];
  };

  return (
    <div className="print-view p-8">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-800 pb-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Al Noor Cables</h1>
        <h2 className="text-2xl font-semibold text-gray-700">{getReportTitle()}</h2>
        <div className="text-sm text-gray-600 mt-2">
          {language === 'ur' ? 'پرنٹ کی تاریخ:' : 'Printed on:'} {printDate}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {language === 'ur' ? 'مدت:' : 'Period:'} {getPeriodLabel()}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {language === 'ur' ? 'زمرہ:' : 'Category:'} {getCategoryLabel()}
        </div>
        {selectedRawMaterialType && selectedRawMaterialType !== 'all' && (
          <div className="text-sm text-gray-600 mt-1">
            {language === 'ur' ? 'مواد کی قسم:' : 'Material Type:'} {selectedRawMaterialType}
          </div>
        )}
        {selectedProcessedMaterialName && selectedProcessedMaterialName !== 'all' && (
          <div className="text-sm text-gray-600 mt-1">
            {language === 'ur' ? 'مواد:' : 'Material:'} {selectedProcessedMaterialName}
          </div>
        )}
        {selectedProductName && selectedProductName !== 'all' && (
          <div className="text-sm text-gray-600 mt-1">
            {language === 'ur' ? 'مصنوعات:' : 'Product:'} {selectedProductName}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {language === 'ur' ? 'خلاصہ اعداد و شمار' : 'Summary Statistics'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(reportCategory === 'all' || reportCategory === 'raw-materials') && (
            <div className="border border-gray-300 p-3">
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'کل خام مال' : 'Total Raw Materials'}
              </div>
              <div className="text-xl font-bold text-gray-900">{Math.round(totalRawMaterials)} kgs</div>
              <div className="text-xs text-gray-500 mt-1">
                {filteredRawMaterials.length} {language === 'ur' ? 'بیچز' : 'batches'}
              </div>
            </div>
          )}
          {(reportCategory === 'all' || reportCategory === 'processed-materials') && (
            <div className="border border-gray-300 p-3">
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'کل پروسیسڈ مال' : 'Total Processed Materials'}
              </div>
              <div className="text-xl font-bold text-gray-900">{Math.round(totalProcessedMaterials)} kgs</div>
              <div className="text-xs text-gray-500 mt-1">
                {filteredProcessedMaterials.length} {language === 'ur' ? 'بیچز' : 'batches'}
              </div>
            </div>
          )}
          {(reportCategory === 'all' || reportCategory === 'products') && (
            <>
              <div className="border border-gray-300 p-3">
                <div className="text-sm text-gray-600">
                  {language === 'ur' ? 'کل مصنوعات (فٹ)' : 'Total Products (Foot)'}
                </div>
                <div className="text-xl font-bold text-gray-900">{Math.round(totalProductsFoot)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {filteredProductions.length} {language === 'ur' ? 'پروڈکشنز' : 'productions'}
                </div>
              </div>
              <div className="border border-gray-300 p-3">
                <div className="text-sm text-gray-600">
                  {language === 'ur' ? 'کل مصنوعات (بنڈلز)' : 'Total Products (Bundles)'}
                </div>
                <div className="text-xl font-bold text-gray-900">{Math.round(totalProductsBundles)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {filteredProductions.length} {language === 'ur' ? 'پروڈکشنز' : 'productions'}
                </div>
              </div>
            </>
          )}
          {(reportCategory === 'all' || reportCategory === 'purchases') && (
            <div className="border border-gray-300 p-3">
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'کل خریداری' : 'Total Purchases'}
              </div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(totalPurchases)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {filteredPurchases.length} {language === 'ur' ? 'خریداری' : 'purchases'}
              </div>
            </div>
          )}
          {(reportCategory === 'all' || reportCategory === 'expenses') && (
            <div className="border border-gray-300 p-3">
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'کل اخراجات' : 'Total Expenses'}
              </div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {filteredExpenses.length} {language === 'ur' ? 'خرچ' : 'expenses'}
              </div>
            </div>
          )}
          {reportCategory === 'all' && (
            <div className={`border border-gray-300 p-3 ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm text-gray-600">
                {language === 'ur' ? 'خالص منافع' : 'Net Profit'}
              </div>
              <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {formatCurrency(netProfit)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Statistics by Item */}
      {reportCategory === 'raw-materials' && Object.keys(rawMaterialStats).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {language === 'ur' ? 'مواد کی قسم کے لحاظ سے تفصیلات' : 'Statistics by Material Type'}
          </h3>
          <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'قسم' : 'Type'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'کل مقدار' : 'Total Quantity'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'بیچز' : 'Batches'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'اوسط فی بیچ' : 'Avg per Batch'}
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rawMaterialStats).map(([type, stats], index) => (
                <tr key={type} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{type}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(stats.total)} kgs
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {stats.batches}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(stats.avgPerBatch)} kgs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportCategory === 'processed-materials' && Object.keys(processedMaterialStats).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {language === 'ur' ? 'مواد کے لحاظ سے تفصیلات' : 'Statistics by Material'}
          </h3>
          <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'نام' : 'Name'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'کل ان پٹ' : 'Total Input'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'کل آؤٹ پٹ' : 'Total Output'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'بیچز' : 'Batches'}
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(processedMaterialStats).map(([name, stats], index) => (
                <tr key={name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(stats.totalInput)} kgs
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(stats.totalOutput)} kgs
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {stats.batches}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportCategory === 'products' && Object.keys(productStats).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {language === 'ur' ? 'مصنوعات کے لحاظ سے تفصیلات' : 'Statistics by Product'}
          </h3>
          <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'مصنوعات' : 'Product'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'کل فٹ' : 'Total Foot'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'کل بنڈلز' : 'Total Bundles'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'پروڈکشنز' : 'Productions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(productStats).map(([name, stats], index) => (
                <tr key={name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(stats.totalFoot)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(stats.totalBundles)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {stats.batches}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed Tables */}
      {(reportCategory === 'all' || reportCategory === 'raw-materials') && filteredRawMaterials.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {language === 'ur' ? 'خام مال کی تفصیلات' : 'Raw Materials Details'}
          </h3>
          <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'بیچ آئی ڈی' : 'Batch ID'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'قسم' : 'Type'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'سپلائر' : 'Supplier'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'مقدار' : 'Quantity'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'تاریخ' : 'Date'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRawMaterials.map((m, index) => (
                <tr key={m.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{m.batchId}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{m.materialType}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{m.supplier}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(m.quantity)} kgs
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {formatDate(m.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(reportCategory === 'all' || reportCategory === 'processed-materials') && filteredProcessedMaterials.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {language === 'ur' ? 'پروسیس شدہ مواد کی تفصیلات' : 'Processed Materials Details'}
          </h3>
          <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'نام' : 'Name'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'قسم' : 'Type'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'ان پٹ' : 'Input'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'آؤٹ پٹ' : 'Output'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'بنڈلز' : 'Bundles'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'تاریخ' : 'Date'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProcessedMaterials.map((m, index) => (
                <tr key={m.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{m.name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{m.materialType}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(m.inputQuantity)} kgs
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(m.outputQuantity)} kgs
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {m.numberOfBundles}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {formatDate(m.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(reportCategory === 'all' || reportCategory === 'products') && filteredProductions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {language === 'ur' ? 'مصنوعات کی تفصیلات' : 'Products Details'}
          </h3>
          <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'مصنوعات' : 'Product'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'پروسیس شدہ مواد' : 'Processed Material'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'فٹ' : 'Foot'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'بنڈلز' : 'Bundles'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'تاریخ' : 'Date'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProductions.map((p, index) => (
                <tr key={p.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{p.productName}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{p.processedMaterialName}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(p.quantityFoot)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(p.quantityBundles)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {formatDate(p.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(reportCategory === 'all' || reportCategory === 'purchases') && filteredPurchases.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {language === 'ur' ? 'خریداری کی تفصیلات' : 'Purchases Details'}
          </h3>
          <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'گاہک' : 'Customer'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'مصنوعات' : 'Product'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'مقدار' : 'Quantity'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'قیمت' : 'Price'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'تاریخ' : 'Date'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((p, index) => {
                const customer = customers.find(c => c.id === p.customerId);
                return (
                  <tr key={p.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                      {customer?.name || 'Unknown'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{p.productName}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                      {p.quantityBundles.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                      {formatCurrency(p.price || 0)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                      {formatDate(p.date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(reportCategory === 'all' || reportCategory === 'expenses') && filteredExpenses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {language === 'ur' ? 'اخراجات کی تفصیلات' : 'Expenses Details'}
          </h3>
          <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'عنوان' : 'Title'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'قسم' : 'Category'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'رقم' : 'Amount'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'تاریخ' : 'Date'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((e, index) => (
                <tr key={e.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{e.title}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{e.category || '-'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {formatCurrency(e.amount)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {formatDate(e.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <p>Al Noor Cables - {getReportTitle()}</p>
        <p>{language === 'ur' ? 'تاریخ پیدائش:' : 'Generated on'} {printDate}</p>
      </div>
    </div>
  );
}

