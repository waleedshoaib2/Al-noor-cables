# 🏭 Al Noor Cables

### Integrated Stock & Expense Management System

---

## 🔰 1. Project Overview

**Al Noor Cables** is a manufacturing management platform designed to streamline the **production, stock, and financial workflows** of a cable-manufacturing business.
The system integrates two major operational domains:

1. **Stock Management** – Tracks raw material (Copper, Silver) flow, processing, scrap, and finished goods.
2. **Expense Tracker** – Records and analyses day-to-day operational expenses, including kitchen, factory, and employee-related costs.

Together, these modules form a unified database-driven environment that supports daily reporting, transparency, and long-term optimization.

---

## 🧩 2. Core Objectives

* Automate inventory and production data collection.
* Minimize manual ledger work by synchronizing input/output and cost metrics.
* Provide daily, monthly, and annual analytics for decision-making.
* Maintain digital records for audits, client reporting, and operational compliance.
* Support the future integration of predictive AI modules (cost forecasting, yield optimization).

---

## 🧱 3. System Modules

### 🟩 Module A: Stock Management

#### 3.1 Purpose

To monitor raw-material intake, production output, and scrap handling across all product lines.

#### 3.2 Workflow Summary

1. **Login & Authentication**

   * Staff log in via password; access limited to assigned roles (Admin / Operator / Viewer).

2. **Material Intake**

   * Register new raw-material batches (Copper, Silver) with attributes: weight, grade, and supplier.
   * Each entry timestamped and assigned a unique Batch ID.

3. **Processing Phase**

   * Operator records each production cycle:

     * Input = Raw Material Weight
     * Output = Finished Product Weight
     * Scrap = Residue Waste Weight
   * The system auto-calculates **Yield Efficiency** and **Scrap Ratio**.

4. **Scrap Management**

   * Logs all generated scrap by type and value.
   * Scrap can be reused or sold, automatically adjusting inventory value.

5. **Daily Production Report**

   * Auto-generated end-of-day report showing:

     * Raw Material Used
     * Total Products Created
     * Scrap Generated
     * Customer Orders Fulfilled

6. **Customer Orders**

   * Pre-defined order database: Customer Name, Product Type, Quantity, Due Date.
   * Alerts raised when available stock < demand.

#### 3.3 Key Calculations

| Metric               | Formula                          | Purpose                    |
| -------------------- | -------------------------------- | -------------------------- |
| Yield Efficiency (%) | (Output ÷ Input) × 100           | Measures process quality   |
| Scrap Ratio (%)      | (Scrap ÷ Input) × 100            | Identifies material loss   |
| Inventory Value      | Σ(Product Weight × Market Price) | Determines financial worth |
| Daily Net Production | Output − Scrap                   | Measures true productivity |

#### 3.4 Reports Generated

* Daily Production Summary (auto-PDF + email)
* Scrap Utilization Report
* Customer Fulfillment Status
* Material Stock Ledger

---

### 🟥 Module B: Expense Tracker

#### 3.5 Purpose

To consolidate all cost-related data, simplify accounting, and monitor operational efficiency.

#### 3.6 Expense Types

1. **Kitchen Expenses**

   * Daily consumption logs (tea, snacks, staff meals).
   * Monthly summaries with cost-per-employee charts.

2. **Factory Expenses**

   * Maintenance, machinery, power bills, cleaning, consumables.
   * Links directly to the stock system for expense-per-unit analysis.

3. **Employee Management**

   * Salaries, bonuses, advances.
   * Payment mode tracking (cash / bank transfer / wallet).
   * Attendance integration for salary validation.

#### 3.7 Expense Flow

1. Input daily records per expense type.
2. System aggregates totals per day → month → quarter.
3. Auto-generated reports for management review.

#### 3.8 Expense Analytics

| Metric                  | Formula                              | Insight          |
| ----------------------- | ------------------------------------ | ---------------- |
| Total Monthly Expense   | Σ(Kitchen + Factory + Employee)      | Overall spending |
| Expense to Output Ratio | Total Expense ÷ Total Units Produced | Cost efficiency  |
| Average Salary          | Σ(Employee Salaries) ÷ Staff Count   | Payroll analysis |

---

## 🔗 4. Cross-Module Integration

| Relationship                      | Description                                                      |
| --------------------------------- | ---------------------------------------------------------------- |
| **Production ↔ Factory Expenses** | Machine usage and maintenance cost correlates with daily output. |
| **Scrap ↔ Expense Tracker**       | Scrap sales reduce total net expenses.                           |
| **Employee ↔ Production**         | Compare salary cost against output yield per employee.           |
| **Orders ↔ Expense**              | Profit margin = Order Revenue − Linked Production Cost.          |

---

## 🧮 5. Reporting & Dashboards

* **Daily Dashboard** – Input/Output graph, expense summary.
* **Monthly Summary** – Cumulative totals, efficiency trends, anomalies.
* **Quarterly Insights** – Predictive yield and expense projections.
* **PDF/CSV Exports** – For accounting or audit purposes.

---

## ⚙️ 6. Technical Concepts (Perplexity Space Mapping)

| Layer                   | Question Type | Sample Queries                                       |
| ----------------------- | ------------- | ---------------------------------------------------- |
| **Inventory Reasoning** | Descriptive   | “How much copper was processed this week?”           |
| **Expense Correlation** | Analytical    | “Does factory expense rise with scrap output?”       |
| **Causal Modeling**     | Diagnostic    | “Which machine contributes most to waste?”           |
| **Forecasting Layer**   | Predictive    | “Forecast next month’s silver demand.”               |
| **Optimization Layer**  | Prescriptive  | “Suggest resource allocation to reduce cost by 10%.” |

Each layer can be tied to embeddings or retrieval pipelines for AI-based reasoning and self-evaluation benchmarks.

---

## 🧠 7. Future Enhancements

* **Cloud Sync:** GCP / AWS for centralized reporting.
* **Barcode / QR Batch Tracking.**
* **AI Assistant:** Auto-summarize reports in natural language.
* **Predictive Maintenance:** Alert when scrap ratio exceeds baseline.
* **Dashboard Gamification:** Efficiency scores per operator.

---

## 📑 8. Documentation Checklist

1. Each page has an **ID + PDF Export**.
2. Navigation hierarchy: *Login → Dashboard → Stock → Expenses → Reports.*
3. Naming conventions:

   * Batch IDs: `ALN-YYYYMMDD-###`
   * Employee IDs: `EMP-####`
   * Report IDs: `RPT-YYYYMMDD`
4. Security: SHA-256 password hash, role-based authorization.
5. Backup: daily cloud snapshots, monthly archives.

---

## 🧭 9. Summary

**Al Noor Cables** digitizes the operational backbone of a cable-manufacturing business.
By connecting material flow, expense behavior, and performance analytics, it transforms raw operational data into actionable intelligence.
The system’s modular design makes it ready for RAG-based reasoning and future AI benchmarking.

---
