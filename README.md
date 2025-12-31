# Burger House Bekaa - Restaurant Ordering System

A modern, responsive web application for ordering burgers, fries, and drinks online with delivery service.

## Project Description

Burger House Bekaa is a full-featured restaurant ordering system built with React and TypeScript. The application allows customers to browse menus, add items to cart, place orders, and receive digital receipts. It includes user authentication with separate admin and customer roles, making it a complete solution for restaurant management and online ordering.

## Features

- **User Authentication**: Login/Signup system with role-based access (Admin/Customer)
- **Menu Management**: Separate pages for Burgers, Fries, and Drinks with detailed item descriptions
- **Shopping Cart**: Add, remove, and update quantities of items
- **Order System**: Complete checkout process with digital receipt generation
- **Admin Dashboard**: View orders, revenue, and customer statistics
- **Delivery Information**: Comprehensive delivery details and tracking
- **Contact Page**: Location, phone, email, and operating hours for Bekaa, Lebanon
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Technologies Used

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Beautifully designed components
- **React Router** - Client-side routing
- **Lucide React** - Modern icon library
- **TanStack Query** - Data fetching and caching
- **Sonner** - Toast notifications

### Design System
- Custom color palette with warm restaurant theme
- HSL-based color variables for easy theming
- Custom gradients and shadows
- Responsive typography and spacing

## Pages

1. **Home (/)** - Landing page with hero section and menu preview
2. **About (/about)** - Restaurant story and values
3. **Menu - Burgers (/menu/burgers)** - Complete burger selection
4. **Menu - Fries (/menu/fries)** - Various fries options
5. **Menu - Drinks (/menu/drinks)** - Beverages and milkshakes
6. **Cart (/cart)** - Shopping cart and checkout
7. **Delivery (/delivery)** - Delivery information and process
8. **Contact (/contact)** - Contact form and location details
9. **Login (/login)** - User authentication
10. **Admin Dashboard (/admin)** - Order management (admin only)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd burger-house-bekaa
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:8080
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Demo Credentials

### Admin Access
- **Email**: admin@burgerhouse.com
- **Password**: admin123

### Regular User
- **Email**: Any valid email
- **Password**: Any password (minimum 6 characters)

## Project Structure

```
src/
├── assets/          # Images and static files
├── components/      # Reusable UI components
│   ├── ui/         # Shadcn UI components
│   ├── Footer.tsx
│   ├── MenuCard.tsx
│   └── Navbar.tsx
├── contexts/       # React contexts
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── data/           # Static data
│   └── menuData.ts
├── pages/          # Page components
│   ├── Index.tsx
│   ├── About.tsx
│   ├── MenuBurgers.tsx
│   ├── MenuFries.tsx
│   ├── MenuDrinks.tsx
│   ├── Cart.tsx
│   ├── Delivery.tsx
│   ├── Contact.tsx
│   ├── Login.tsx
│   ├── Admin.tsx
│   └── NotFound.tsx
├── lib/            # Utility functions
├── App.tsx         # Main app component
└── index.css       # Global styles and design tokens
```

## Key Features Implementation

### Authentication System
- Context-based authentication with local storage persistence
- Role-based access control (Admin/User)
- Protected admin routes
- Demo credentials for testing

### Shopping Cart
- Add/remove items functionality
- Quantity adjustment
- Real-time total calculation
- Persistent cart state using React Context

### Order Receipt
- Automatic order number generation
- Detailed order summary
- Date and time stamping
- Professional receipt layout

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly interface
- Optimized images

## Design System

The application uses a custom design system with semantic color tokens:

- **Primary**: Warm orange (#F56F3A) - Main brand color
- **Secondary**: Rich brown - Secondary surfaces
- **Accent**: Fresh green - Success states
- **Background**: Cream/white tones
- **Foreground**: Dark brown for text

All colors are defined in HSL format in `src/index.css` for easy customization.

## Screenshots

[Add screenshots of your application here]

1. Home Page
2. Menu Page
3. Shopping Cart
4. Order Receipt
5. Admin Dashboard

## Deployment

This project can be deployed to:
- GitHub Pages
- Vercel
- Netlify
- Any static hosting service

## Version Control

This project uses Git for version control with:
- Meaningful commit messages
- Feature branches
- Regular commits showing development progress

## Contact Information

**Restaurant Location**: Bekaa, Lebanon  
**Phone**: +961 8 XXX XXX  
**Email**: info@burgerhouse.com

## License

This project is created for educational purposes as part of a web development course.

## Contributors

[Add your name(s) here]

---

Built with ❤️ for Burger House Bekaa
