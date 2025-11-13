import { useState, useRef } from 'react';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/Common/Button';
import EmployeeForm from '@/components/Employee/EmployeeForm';
import DailyPayoutForm from '@/components/Employee/DailyPayoutForm';
import { exportToPDF } from '@/utils/pdfExport';
import { format } from 'date-fns';
import type { Employee, DailyPayout } from '@/types';

export default function EmployeeManagement() {
  const { t, language } = useTranslation();
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const employees = useEmployeeStore((state) => state.employees);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee);
  const addDailyPayout = useEmployeeStore((state) => state.addDailyPayout);
  const updateDailyPayout = useEmployeeStore((state) => state.updateDailyPayout);
  const deleteDailyPayout = useEmployeeStore((state) => state.deleteDailyPayout);
  const getRemainingSalary = useEmployeeStore((state) => state.getRemainingSalary);

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingPayout, setEditingPayout] = useState<{ employee: Employee; payout: DailyPayout } | null>(null);
  const [selectedEmployeeForPayout, setSelectedEmployeeForPayout] = useState<Employee | null>(null);
  const reportSectionRef = useRef<HTMLDivElement>(null);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowEmployeeForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = (id: number) => {
    const employee = employees.find((e) => e.id === id);
    if (employee && window.confirm(`Are you sure you want to delete "${employee.name}"?`)) {
      deleteEmployee(id);
    }
  };

  const handleEmployeeSubmit = (data: any) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, data);
    } else {
      addEmployee(data);
    }
    setShowEmployeeForm(false);
    setEditingEmployee(null);
  };

  const handleAddPayout = (employee: Employee) => {
    setSelectedEmployeeForPayout(employee);
    setEditingPayout(null);
    setShowPayoutForm(true);
  };

  const handleEditPayout = (employee: Employee, payout: DailyPayout) => {
    setSelectedEmployeeForPayout(employee);
    setEditingPayout({ employee, payout });
    setShowPayoutForm(true);
  };

  const handleDeletePayout = (employeeId: number, payoutId: number) => {
    const employee = employees.find((e) => e.id === employeeId);
    const payout = employee?.dailyPayouts.find((p) => p.id === payoutId);
    if (payout && window.confirm(`Are you sure you want to delete this payout of ${payout.amount.toLocaleString()} PKR?`)) {
      deleteDailyPayout(employeeId, payoutId);
    }
  };

  const handlePayoutSubmit = (data: any) => {
    if (!selectedEmployeeForPayout) return;

    if (editingPayout) {
      updateDailyPayout(selectedEmployeeForPayout.id, editingPayout.payout.id, data);
    } else {
      addDailyPayout(selectedEmployeeForPayout.id, data);
    }
    setShowPayoutForm(false);
    setEditingPayout(null);
    setSelectedEmployeeForPayout(null);
  };

  // PDF Export handler
  const handleExportPDF = async () => {
    if (reportSectionRef.current) {
      await exportToPDF(
        'employees-report-section',
        `Employees_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        'Employee Management Report'
      );
    }
  };

  // Calculate totals
  const totalEmployees = employees.length;
  const totalSalary = employees.reduce((sum, e) => sum + e.totalSalary, 0);
  const totalPayouts = employees.reduce((sum, e) => sum + e.dailyPayouts.reduce((pSum, p) => pSum + p.amount, 0), 0);
  const totalRemaining = employees.reduce((sum, e) => sum + getRemainingSalary(e.id), 0);

  return (
    <div className="space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ur' ? 'ملازمین کا انتظام' : 'Employee Management'}
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
          <Button variant="primary" onClick={handleAddEmployee}>
            {language === 'ur' ? '+ ملازم شامل کریں' : '+ Add Employee'}
          </Button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">
          {language === 'ur' ? 'خلاصہ' : 'Summary'}
        </h2>
        <p className="text-sm mb-4 opacity-90">
          {language === 'ur' 
            ? 'یہ صفحہ ملازمین کی تنخواہوں اور روزانہ ادائیگیوں کو ٹریک کرنے کے لیے ہے۔ آپ ملازمین شامل کر سکتے ہیں، ان کی تنخواہیں مقرر کر سکتے ہیں، اور روزانہ ادائیگیاں ریکارڈ کر سکتے ہیں جو کل تنخواہ سے منہا کی جائیں گی۔'
            : 'This page is for tracking employee fixed salaries and daily payouts. You can add employees, set their salaries, and record daily payouts that will be deducted from their total salary.'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <p className="text-sm opacity-90">{language === 'ur' ? 'کل ملازمین' : 'Total Employees'}</p>
            <p className="text-2xl font-bold">{totalEmployees}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <p className="text-sm opacity-90">{language === 'ur' ? 'کل تنخواہ' : 'Total Salary'}</p>
            <p className="text-2xl font-bold">{totalSalary.toLocaleString()} PKR</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <p className="text-sm opacity-90">{language === 'ur' ? 'کل ادائیگیاں' : 'Total Payouts'}</p>
            <p className="text-2xl font-bold">{totalPayouts.toLocaleString()} PKR</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <p className="text-sm opacity-90">{language === 'ur' ? 'باقی تنخواہ' : 'Remaining Salary'}</p>
            <p className="text-2xl font-bold">{totalRemaining.toLocaleString()} PKR</p>
          </div>
        </div>
      </div>

      {/* Employees List */}
      <div id="employees-report-section" ref={reportSectionRef} className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {employees.length === 0
              ? (language === 'ur' ? 'کوئی ملازم نہیں ملا' : 'No employees found')
              : `${employees.length} ${language === 'ur' ? 'ملازم' : employees.length === 1 ? 'employee' : 'employees'}`}
          </h2>
          {employees.length > 0 && (
            <Button variant="secondary" onClick={handleExportPDF} className="no-print">
              📄 {language === 'ur' ? 'PDF برآمد کریں' : 'Export PDF'}
            </Button>
          )}
        </div>
        {employees.length === 0 ? (
          <p className="text-gray-500">
            {language === 'ur' ? 'ابھی تک کوئی ملازم شامل نہیں کیا گیا۔' : 'No employees added yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ur' ? 'نام' : 'Name'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ur' ? 'تنخواہ کی تاریخ' : 'Salary Date'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ur' ? 'کل تنخواہ' : 'Total Salary'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ur' ? 'کل ادائیگیاں' : 'Total Payouts'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ur' ? 'باقی تنخواہ' : 'Remaining Salary'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ur' ? 'اعمال' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => {
                  const remainingSalary = getRemainingSalary(employee.id);
                  const totalPayouts = employee.dailyPayouts.reduce((sum, p) => sum + p.amount, 0);
                  return (
                    <>
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(employee.salaryDate), 'dd/MM/yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.totalSalary.toLocaleString()} PKR
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {totalPayouts.toLocaleString()} PKR
                            {employee.dailyPayouts.length > 0 && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({employee.dailyPayouts.length} {language === 'ur' ? 'ادائیگیاں' : 'payouts'})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${remainingSalary > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {remainingSalary.toLocaleString()} PKR
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddPayout(employee)}
                              className="text-blue-600 hover:text-blue-900"
                              title={language === 'ur' ? 'روزانہ ادائیگی شامل کریں' : 'Add Daily Payout'}
                            >
                              💰
                            </button>
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title={language === 'ur' ? 'ترمیم' : 'Edit'}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="text-red-600 hover:text-red-900"
                              title={language === 'ur' ? 'حذف' : 'Delete'}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                      {employee.dailyPayouts.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-6 py-3">
                            <div className="text-xs font-semibold text-gray-600 mb-2">
                              {language === 'ur' ? 'روزانہ ادائیگیاں' : 'Daily Payouts'} ({employee.dailyPayouts.length}):
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
                                  <div className="flex gap-2 ml-auto">
                                    <button
                                      onClick={() => handleEditPayout(employee, payout)}
                                      className="text-indigo-600 hover:text-indigo-900"
                                      title={language === 'ur' ? 'ترمیم' : 'Edit'}
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeletePayout(employee.id, payout.id)}
                                      className="text-red-600 hover:text-red-900"
                                      title={language === 'ur' ? 'حذف' : 'Delete'}
                                    >
                                      🗑️
                                    </button>
                                  </div>
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
        )}
      </div>

      {/* Employee Form Modal */}
      <EmployeeForm
        isOpen={showEmployeeForm}
        onClose={() => {
          setShowEmployeeForm(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
        onSubmit={handleEmployeeSubmit}
      />

      {/* Daily Payout Form Modal */}
      {selectedEmployeeForPayout && (
        <DailyPayoutForm
          isOpen={showPayoutForm}
          onClose={() => {
            setShowPayoutForm(false);
            setEditingPayout(null);
            setSelectedEmployeeForPayout(null);
          }}
          payout={editingPayout?.payout || null}
          employeeName={selectedEmployeeForPayout.name}
          remainingSalary={getRemainingSalary(selectedEmployeeForPayout.id)}
          onSubmit={handlePayoutSubmit}
        />
      )}
    </div>
  );
}

