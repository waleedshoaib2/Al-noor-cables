# Al-Noor Cables - Stock & Expense Management System

A production-ready Electron + React + TypeScript desktop application for managing stock inventory and expenses. **No database - all data stored in memory using Zustand.**

## Features

- **Authentication**: Simple login system (username: admin/user, password: alnoor)
- **Stock Management**: Full CRUD operations for products with categories
- **Sales Recording**: Track sales with automatic inventory updates
- **Expense Tracking**: Manage expenses with categories and statistics
- **Low Stock Alerts**: Automatic alerts for products below reorder level
- **Dashboard**: Overview with statistics and recent activity
- **Reports**: View stock, sales, and expense reports

## Tech Stack

- **Electron 28+**: Desktop application framework
- **React 18**: UI library
- **TypeScript 5.3+**: Type safety
- **Vite**: Build tool and dev server
- **Zustand**: State management (in-memory)
- **Tailwind CSS**: Styling
- **React Hook Form + Zod**: Form validation
- **React Router**: Routing
- **date-fns**: Date handling

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

Run the app in development mode:

```bash
npm run dev
```

This will:
1. Start the Vite dev server on http://localhost:5173
2. Launch Electron when the server is ready

### Building

Build the application for production:

```bash
# Build for current platform
npm run electron:build

# Build for specific platform
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
npm run build:all    # All platforms (from macOS)
```

This will:
1. Compile TypeScript
2. Build the React app
3. Build Electron
4. Create distributable packages in `release/` folder

**Output Files:**
- **Windows**: `Al-Noor Cables Setup x.x.x.exe` (NSIS installer)
- **macOS**: `Al-Noor Cables-x.x.x.dmg` (Disk image)
- **Linux**: `Al-Noor Cables-x.x.x.AppImage` (Portable app)

See `BUILD_INSTRUCTIONS.md` for detailed build and distribution guide.

## Default Login

- **Username**: `admin` or `user`
- **Password**: `alnoor`

## Project Structure

```
al-noor-cables/
├── electron/          # Electron main process
│   ├── main.ts       # Main process entry
│   └── preload.ts    # Preload script
├── src/              # React application
│   ├── components/   # React components
│   │   ├── Auth/     # Authentication components
│   │   ├── Stock/    # Stock management components
│   │   ├── Expense/  # Expense tracking components
│   │   ├── Layout/   # Layout components
│   │   └── Common/   # Common reusable components
│   ├── pages/        # Page components
│   ├── store/        # Zustand stores (state management)
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
└── package.json
```

## Data Storage

**All data is stored in memory using Zustand stores.** No database is used. Data will be lost when the application is closed.

### Seed Data

The application comes pre-loaded with:
- 2 users (admin, user)
- 5 product categories
- 10 sample products
- 8 expense categories
- 5 sample expenses
- 3 sample sales

## Features

### Stock Management
- Add, edit, delete products
- Search and filter products
- Sort by name, quantity, or price
- Low stock alerts
- Record sales with automatic inventory updates

### Expense Tracking
- Add, edit, delete expenses
- Filter by date range and category
- View statistics (today, week, month)
- Category-wise totals

### Dashboard
- Total products count
- Low stock alerts count
- Today's sales total
- This month's expenses total
- Recent sales and expenses
- Quick action buttons

### Reports
- Stock report (all products)
- Sales report (with date filtering)
- Expense report (with date filtering)

## License

MIT
