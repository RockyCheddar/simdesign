# Authentication System

This healthcare simulation app includes a complete authentication system with the following features:

## Features

- **Mock Authentication**: No backend required - uses hardcoded credentials for demo
- **Context-based State Management**: Global auth state using React Context
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **Role-based Access Control**: Support for admin, instructor, and student roles
- **Persistent Sessions**: Auth state stored in localStorage
- **Professional UI**: Healthcare-themed login page with responsive design

## Demo Credentials

```
Email: demo@simcase.ai
Password: demo123
Role: instructor
```

## Components

### AuthContext (`src/contexts/AuthContext.tsx`)
- Provides global authentication state
- Handles login/logout functionality
- Manages localStorage persistence
- Exports `useAuth()` hook for components

### LoginPage (`src/components/auth/LoginPage.tsx`)
- Professional login form with validation
- Healthcare-themed design
- Form handling with react-hook-form
- Loading states and error handling
- Demo credentials display

### ProtectedRoute (`src/components/auth/ProtectedRoute.tsx`)
- Wrapper component for protected pages
- Redirects to login if not authenticated
- Optional role-based access control
- Loading spinner during auth check

### UserMenu (`src/components/auth/UserMenu.tsx`)
- User profile dropdown in header
- Shows user info and role
- Logout functionality
- Responsive design

## Usage

### Protecting a Route
```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

### Role-based Protection
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

### Using Auth State
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Auth context and provider
├── components/auth/
│   ├── LoginPage.tsx           # Login form component
│   ├── ProtectedRoute.tsx      # Route protection wrapper
│   ├── UserMenu.tsx            # User dropdown menu
│   └── index.ts                # Auth components exports
├── utils/
│   └── auth.ts                 # Auth utilities and mock functions
├── types/
│   └── index.ts                # Auth types (User, AuthState, etc.)
└── app/
    ├── layout.tsx              # Root layout with AuthProvider
    ├── login/
    │   └── page.tsx            # Login page route
    └── page.tsx                # Protected main page
```

## Authentication Flow

1. **App Initialization**: AuthProvider checks localStorage for existing session
2. **Route Access**: ProtectedRoute checks authentication status
3. **Login Process**: User submits credentials → mock validation → save to localStorage
4. **Session Persistence**: Auth state maintained across browser sessions
5. **Logout**: Clear localStorage and reset auth state

## Customization

### Adding New Users
Edit the `MOCK_USERS` object in `src/utils/auth.ts`:

```typescript
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@simcase.ai': {
    password: 'admin123',
    user: {
      id: '2',
      email: 'admin@simcase.ai',
      name: 'Admin User',
      role: 'admin',
    },
  },
  // Add more users here
};
```

### Integrating Real Backend
Replace the mock functions in `src/utils/auth.ts` with actual API calls:

```typescript
export const authenticateUser = async (credentials: LoginCredentials): Promise<User | null> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (response.ok) {
    return await response.json();
  }
  
  return null;
};
```

## Security Notes

- This is a demo system with mock authentication
- Passwords are stored in plain text (for demo only)
- No actual security measures implemented
- For production, implement proper authentication with:
  - Encrypted password storage
  - JWT tokens or session management
  - HTTPS enforcement
  - Rate limiting
  - CSRF protection 