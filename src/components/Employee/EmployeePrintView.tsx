import { useTranslation } from '@/hooks/useTranslation';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import type { Employee } from '@/types';
import { format } from 'date-fns';

interface EmployeePrintViewProps {
  employees: Employee[];
}

export default function EmployeePrintView({ employees }: EmployeePrintViewProps) {
  const { t, language } = useTranslation();
  const getRemainingSalary = useEmployeeStore((state) => state.getRemainingSalary);
  const printDate = new Date().toLocaleString();

  // Calculate totals
  const totalEmployees = employees.length;
  const totalSalary = employees.reduce((sum, e) => sum + e.totalSalary, 0);
  const totalPayouts = employees.reduce((sum, e) => sum + e.dailyPayouts.reduce((pSum, p) => pSum + p.amount, 0), 0);
  const totalRemaining = employees.reduce((sum, e) => sum + getRemainingSalary(e.id), 0);

  return (
    <div className="print-view p-8">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-800 pb-4" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Al Noor Cables</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          {language === 'ur' ? 'ملازمین کی رپورٹ' : 'Employees Report'}
        </h2>
        <div className="text-sm text-gray-600 mt-2">
          {language === 'ur' ? 'پرنٹ کی تاریخ:' : 'Printed on:'} {printDate}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل ملازمین' : 'Total Employees'}
          </div>
          <div className="text-xl font-bold text-gray-900">{totalEmployees}</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل تنخواہ' : 'Total Salary'}
          </div>
          <div className="text-xl font-bold text-gray-900">{totalSalary.toLocaleString()} PKR</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'کل ادائیگیاں' : 'Total Payouts'}
          </div>
          <div className="text-xl font-bold text-gray-900">{totalPayouts.toLocaleString()} PKR</div>
        </div>
        <div className="border border-gray-300 p-3">
          <div className="text-sm text-gray-600">
            {language === 'ur' ? 'باقی تنخواہ' : 'Remaining Salary'}
          </div>
          <div className="text-xl font-bold text-gray-900">{totalRemaining.toLocaleString()} PKR</div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {language === 'ur' ? 'ملازمین کی تفصیلات' : 'Employee Details'}
        </h3>
        <table className="w-full border-collapse border border-gray-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'نام' : 'Name'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'تنخواہ کی تاریخ' : 'Salary Date'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'کل تنخواہ' : 'Total Salary'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'کل ادائیگیاں' : 'Total Payouts'}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'باقی تنخواہ' : 'Remaining Salary'}
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => {
              const remainingSalary = getRemainingSalary(employee.id);
              const totalPayouts = employee.dailyPayouts.reduce((sum, p) => sum + p.amount, 0);
              return (
                <>
                  <tr key={employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 font-semibold">
                      {employee.name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                      {format(new Date(employee.salaryDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                      {employee.totalSalary.toLocaleString()} PKR
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                      {totalPayouts.toLocaleString()} PKR
                      {employee.dailyPayouts.length > 0 && (
                        <span className="text-xs text-gray-600 ml-1">
                          ({employee.dailyPayouts.length} {language === 'ur' ? 'ادائیگیاں' : 'payouts'})
                        </span>
                      )}
                    </td>
                    <td className={`border border-gray-300 px-3 py-2 text-sm font-semibold ${remainingSalary > 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {remainingSalary.toLocaleString()} PKR
                    </td>
                  </tr>
                  {employee.dailyPayouts.length > 0 && (
                    <tr className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td colSpan={5} className="border border-gray-300 px-3 py-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">
                          {language === 'ur' ? 'روزانہ ادائیگیاں:' : 'Daily Payouts:'}
                        </div>
                        <div className="space-y-1">
                          {employee.dailyPayouts.map((payout) => (
                            <div key={payout.id} className="text-xs text-gray-600 flex items-center gap-2">
                              <span>{format(new Date(payout.date), 'dd/MM/yyyy')}</span>
                              <span>•</span>
                              <span className="font-medium">{payout.amount.toLocaleString()} PKR</span>
                              {payout.notes && (
                                <>
                                  <span>•</span>
                                  <span className="text-gray-500">{payout.notes}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center" dir={language === 'ur' ? 'rtl' : 'ltr'}>
        <p>Al Noor Cables - {language === 'ur' ? 'ملازمین کی رپورٹ' : 'Employees Report'}</p>
        <p>{language === 'ur' ? 'تاریخ پیدائش:' : 'Generated on'} {printDate}</p>
      </div>
    </div>
  );
}

