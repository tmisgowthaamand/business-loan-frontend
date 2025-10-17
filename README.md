# 🏦 Business Loan Portal

A comprehensive loan management system built with React, TypeScript, and modern web technologies. This application provides a complete solution for managing business loan applications, document verification, client shortlisting, and payment processing.

![Business Loan Portal](./public/generated-image.png)

## ✨ Features

### 🎯 Core Functionality
- **Public Loan Application Form** - Easy online application process
- **Document Management** - Upload, verify, and manage client documents
- **Client Shortlisting** - Streamlined client evaluation and selection
- **Payment Gateway Integration** - Secure payment processing
- **Staff Management** - Role-based access control and team management
- **Transaction Tracking** - Complete transaction history and monitoring
- **Real-time Notifications** - Instant updates for all activities

### 🔐 Authentication & Security
- **Role-based Access Control** - Admin and Employee roles
- **Secure Authentication** - JWT-based authentication system
- **Data Protection** - Encrypted data transmission and storage
- **CORS Protection** - Cross-origin request security

### 📱 User Experience
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Modern UI/UX** - Clean, intuitive interface with Tailwind CSS
- **Real-time Updates** - Live data synchronization
- **Offline Support** - Cached data for better performance
- **Multi-language Support** - i18n internationalization ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- Backend API server running

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Loan-frontend-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:5002
   VITE_APP_NAME=Business Loan Portal
   VITE_APP_ENVIRONMENT=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3001`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Header, Sidebar, Footer
│   ├── Loading/        # Loading screens and spinners
│   └── ui/             # Basic UI components
├── pages/              # Application pages
│   ├── Auth/           # Login and authentication
│   ├── Apply/          # Public loan application
│   ├── Dashboard/      # Main dashboard
│   ├── Enquiries/      # Enquiry management
│   ├── Documents/      # Document management
│   ├── Shortlist/      # Client shortlisting
│   ├── Cashfree/       # Payment gateway
│   ├── Staff/          # Staff management
│   └── Transactions/   # Transaction tracking
├── hooks/              # Custom React hooks
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── i18n/               # Internationalization files
```

## 🛠️ Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build
- **`npm run lint`** - Run ESLint
- **`npm test`** - Run tests

## 📦 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Heroicons** - Beautiful SVG icons

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **TypeScript** - Static type checking

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Manual Deployment
```bash
# Build the project
npm run build

# Upload the 'dist' folder to your hosting provider
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5002` |
| `VITE_APP_NAME` | Application name | `Business Loan Portal` |
| `VITE_APP_ENVIRONMENT` | Environment | `development` |
| `VITE_ENABLE_NOTIFICATIONS` | Enable notifications | `true` |
| `VITE_ENABLE_FILE_UPLOAD` | Enable file uploads | `true` |
| `VITE_ENABLE_PDF_VIEWER` | Enable PDF viewer | `true` |

### API Integration

The application connects to a NestJS backend API. Ensure the backend is running and accessible at the configured `VITE_API_URL`.

**Required API Endpoints:**
- `POST /api/enquiries` - Create loan applications
- `GET /api/enquiries` - Fetch enquiries
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents` - Fetch documents
- `POST /api/shortlist` - Create shortlist entries
- `GET /api/staff` - Fetch staff members
- `POST /api/transactions` - Create transactions

## 👥 User Roles

### Admin
- Full system access
- Staff management
- Transaction monitoring
- System configuration

### Employee
- Enquiry management
- Document verification
- Client shortlisting
- Limited access to sensitive data

## 📱 Pages & Features

### Public Pages
- **Home** (`/`) - Landing page
- **Apply** (`/apply`) - Loan application form
- **Login** (`/login`) - Authentication

### Protected Pages
- **Dashboard** (`/dashboard`) - Overview and statistics
- **Enquiries** (`/enquiries`) - Manage loan applications
- **Documents** (`/documents`) - Document upload and verification
- **Shortlist** (`/shortlist`) - Client shortlisting
- **Payment Gateway** (`/payment-gateway`) - Payment processing
- **Staff** (`/staff`) - Staff management (Admin only)
- **Transactions** (`/transactions`) - Transaction history (Admin only)

## 🔄 Data Flow

1. **Client Application** - Clients apply via `/apply` form
2. **Enquiry Management** - Staff review and process applications
3. **Document Verification** - Upload and verify required documents
4. **Client Shortlisting** - Select qualified clients
5. **Payment Processing** - Handle loan disbursements
6. **Transaction Tracking** - Monitor all financial activities

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update CSS variables in `src/index.css`
- Customize components in `src/components/`

### Branding
- Replace logo in `public/generated-image.png`
- Update favicon and meta tags in `index.html`
- Modify app name and description in environment variables

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues**
- Verify backend server is running
- Check `VITE_API_URL` in environment variables
- Ensure CORS is configured on backend

**Deployment Issues**
- Check build output in `dist/` folder
- Verify environment variables are set correctly
- Ensure all dependencies are installed

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🚀 What's Next?

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with more payment gateways
- [ ] AI-powered loan assessment
- [ ] Advanced reporting features

---

**Built with ❤️ for efficient loan management**
