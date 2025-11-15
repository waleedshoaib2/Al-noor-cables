import { formatDate } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import { useProductStore } from '@/store/useProductStore';
import { useCustomerPurchaseStore } from '@/store/useCustomerPurchaseStore';
import type { ProductProduction } from '@/types';

interface ProductPrintViewProps {
  productions: ProductProduction[];
}

export default function ProductPrintView({ productions }: ProductPrintViewProps) {
  const { t, language } = useTranslation();
  const printDate = new Date().toLocaleString();
  const productStock = useProductStore((state) => state.stock);
  const purchases = useCustomerPurchaseStore((state) => state.purchases);
  const getTotalStock = useProductStore((state) => state.getTotalStock);
  
  const totalStock = getTotalStock();
  const availableProductsCount = Object.values(productStock).filter(stock => stock.bundles > 0).length;

  return (
    <div className="print-view p-8">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-800 pb-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Al Noor Cables</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          {language === 'ur' ? 'مصنوعات کی رپورٹ' : 'Products Report'}
        </h2>
        <div className="text-sm text-gray-600 mt-2">
          {language === 'ur' ? 'پرنٹ کی تاریخ:' : 'Printed on:'} {printDate}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'مصنوعات کی تعداد' : 'Number of Products'}
          </div>
          <div className="text-xl font-bold text-gray-900">{availableProductsCount}</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'دستیاب اسٹاک (بنڈلز میں)' : 'Available Stock (in bundles)'}
          </div>
          <div className="text-xl font-bold text-gray-900">{Math.round(totalStock.bundles)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {language === 'ur' ? 'مصنوعات کی تفصیلات' : 'Product Details'}
        </h3>
        <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'نام' : 'Name'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'نمبر' : 'Number'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'تارا' : 'Tara'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                {t('foot', 'product')}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                {t('bundles', 'product')}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'تاریخ' : 'Date'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'دستیاب (بنڈلز)' : 'Available (Bundles)'}
              </th>
            </tr>
          </thead>
          <tbody>
            {productions.map((production, index) => {
              const productPurchases = purchases.filter((p) => p.productProductionId === production.id);
              const totalPurchasedBundles = productPurchases.reduce((sum, p) => sum + p.quantityBundles, 0);
              const productStockData = productStock[production.productName] || { foot: 0, bundles: 0 };
              
              return (
                <tr key={production.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {production.productName}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {production.productNumber || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {production.productTara || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {production.quantityFoot > 0 ? Math.round(production.quantityFoot) : '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {production.quantityBundles > 0 ? Math.round(production.quantityBundles) : '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {formatDate(production.date)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {Math.round(productStockData.bundles)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <p>Al Noor Cables - {language === 'ur' ? 'مصنوعات کی رپورٹ' : 'Products Report'}</p>
        <p>{language === 'ur' ? 'تاریخ پیدائش:' : 'Generated on'} {printDate}</p>
      </div>
    </div>
  );
}

