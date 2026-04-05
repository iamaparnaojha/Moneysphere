<<<<<<< HEAD
# Finance Dashboard

A modern, interactive finance dashboard built with React, TypeScript, and Tailwind CSS. Track your financial activity with beautiful visualizations, role-based access control, and comprehensive insights.

## 🚀 Features

### Core Functionality
- **Dashboard Overview**: Real-time financial summary with key metrics
- **Transaction Management**: View, filter, sort, and manage transactions
- **Data Visualizations**: Interactive charts for balance trends and spending patterns
- **Role-Based UI**: Switch between Viewer and Admin roles
- **Financial Insights**: Smart recommendations and spending analysis

### Advanced Features
- **Dark Mode**: Toggle between light and dark themes
- **Data Persistence**: Automatic local storage integration
- **Export Functionality**: Download data as JSON
- **Responsive Design**: Works seamlessly on all screen sizes
- **Smooth Animations**: Modern UI with Framer Motion

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context API with useReducer
- **Build Tool**: Create React App

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finance-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Usage

### Dashboard Overview
- **Summary Cards**: View total balance, income, expenses, and monthly net
- **Balance Trend Chart**: Track your balance over time
- **Category Spending**: Visual breakdown of expenses by category
- **Monthly Overview**: Compare income vs expenses for the current month

### Transaction Management
- **View Transactions**: See all transactions with details
- **Search**: Find transactions by description or category
- **Filter**: Filter by type (income/expense) or category
- **Sort**: Sort by date, amount, or category
- **Admin Actions**: Add, edit, or delete transactions (Admin role only)

### Role-Based Access
- **Viewer Role**: Read-only access to all data
- **Admin Role**: Full access including transaction management
- Switch roles using the dropdown in the header

### Insights & Recommendations
- **Highest Spending Category**: Identify your biggest expense area
- **Savings Rate**: Track your saving performance
- **Average Transaction**: Understand typical transaction amounts
- **Monthly Comparison**: See how you're doing compared to previous months
- **Smart Recommendations**: Get personalized financial advice

## 🎨 Design Features

### UI/UX
- **Modern Design**: Clean, professional interface
- **Dark Mode**: Eye-friendly dark theme
- **Responsive Layout**: Adapts to all screen sizes
- **Smooth Animations**: Subtle micro-interactions
- **Hover Effects**: Interactive feedback

### Accessibility
- **Semantic HTML**: Proper structure and meaning
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Compatible with assistive technologies
- **Color Contrast**: WCAG compliant color schemes

## 📊 Data Structure

### Transaction Model
```typescript
interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
}
```

### Categories
- Income: Salary, Freelance, Investment, Other
- Expenses: Rent, Groceries, Utilities, Internet, Entertainment, Dining, Transportation, Shopping, Healthcare

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS with custom configuration:
- Custom color palette for light/dark themes
- Extended animations and transitions
- Responsive breakpoints

### State Management
Uses React Context API with:
- Centralized state management
- Local storage persistence
- Optimistic updates
- Computed values (financial summaries, insights)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The build folder contains static files ready for deployment to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

## 🧪 Development

### Available Scripts
- `npm start`: Development server
- `npm test`: Run tests
- `npm run build`: Production build
- `npm run eject`: Eject from Create React App (one-way operation)

### Project Structure
```
src/
├── components/          # React components
│   ├── dashboard/      # Dashboard-specific components
│   ├── transactions/   # Transaction management
│   ├── insights/       # Insights and recommendations
│   ├── layout/         # Layout components
│   └── ui/            # Reusable UI components
├── context/           # React Context for state management
├── data/              # Mock data and constants
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── styles/            # Global styles and CSS
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - React chart library
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide](https://lucide.dev/) - Beautiful icon library

## 📞 Support

For support, please open an issue on the GitHub repository or contact the development team.

---

Built with ❤️ for modern financial tracking
=======
# Financial-dashboard
>>>>>>> 4bdc5b131537ad79b8d1dfbcff0ba6edf5b2d29b
