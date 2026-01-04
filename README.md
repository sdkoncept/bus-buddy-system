# EagleLine Fleet Management System

A comprehensive bus fleet management system with booking, tracking, maintenance, and multi-role access control.

## Features

- **Fleet Management**: Bus tracking, maintenance, and inventory management
- **Booking System**: Ticket booking and passenger management
- **Driver Management**: Driver profiles, trips, incidents, and GPS tracking
- **Route & Schedule Management**: Bus routes and scheduling
- **Multi-role Access**: Admin, Staff, Driver, Mechanic, Passenger, Accounts, Storekeeper roles
- **Real-time Tracking**: GPS-based bus location tracking with Mapbox
- **Mobile Support**: Capacitor-based mobile app support
- **PWA**: Progressive Web App support for offline functionality

## Technology Stack

- **Frontend**: React 18.3 + TypeScript
- **Build Tool**: Vite 5.4
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Maps**: Mapbox GL
- **Mobile**: Capacitor 8

## Prerequisites

- Node.js 18+ and npm (or bun/yarn/pnpm)
- Supabase account and project
- Mapbox account (optional, for map features)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bus-buddy-system
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

**Getting your Supabase credentials**:
1. Go to your Supabase project dashboard
2. Navigate to **Settings > API**
3. Copy the **Project URL** for `VITE_SUPABASE_URL`
4. Copy the **anon public** key for `VITE_SUPABASE_PUBLISHABLE_KEY`

### 4. Set Up Supabase Edge Function Secrets (Optional)

If you're using the Mapbox integration, set the secret in Supabase:

**Using Supabase CLI**:
```bash
supabase secrets set MAPBOX_PUBLIC_TOKEN=your-mapbox-token-here
```

**Using Supabase Dashboard**:
1. Go to **Project Settings > Edge Functions > Secrets**
2. Add `MAPBOX_PUBLIC_TOKEN` with your Mapbox token

### 5. Run Database Migrations (If Needed)

If you have a local Supabase instance or need to apply migrations:

```bash
# Using Supabase CLI
supabase db reset
# or
supabase migration up
```

### 6. Start the Development Server

```bash
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Mobile App Development (Capacitor)

### Sync Capacitor

```bash
npx cap sync
```

### Open in Native IDE

```bash
# Android
npx cap open android

# iOS
npx cap open ios
```

## Project Structure

```
src/
├── components/      # React components
│   ├── auth/       # Authentication
│   ├── booking/    # Booking components
│   ├── dashboard/  # Dashboard widgets
│   ├── driver/     # Driver components
│   ├── layout/     # Layout components
│   └── ui/         # shadcn/ui components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── integrations/   # Third-party integrations
│   └── supabase/  # Supabase client
├── pages/          # Page components (routes)
└── types/          # TypeScript types

supabase/
├── functions/      # Edge Functions
└── migrations/     # Database migrations
```

## Key Routes

- `/` - Landing page
- `/auth` - Login
- `/dashboard` - Main dashboard
- `/fleet` - Fleet management (admin)
- `/drivers` - Driver management (admin)
- `/routes` - Route management
- `/schedules` - Schedule management
- `/bookings` - Booking management
- `/tracking` - Real-time tracking
- `/maintenance` - Maintenance records
- `/inventory` - Inventory management
- `/driver-app` - Driver mobile interface

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Yes |

**Supabase Edge Function Secrets**:
- `MAPBOX_PUBLIC_TOKEN` - Mapbox API token (for map features)

## Troubleshooting

### Environment Variables Not Loading
- Ensure `.env.local` is in the root directory
- Restart the dev server after adding/changing variables
- Variable names must start with `VITE_`

### Supabase Connection Issues
- Verify your Supabase URL and keys are correct
- Check that your Supabase project is active
- Ensure RLS policies allow your operations

### Mapbox Not Working
- Verify `MAPBOX_PUBLIC_TOKEN` is set in Supabase secrets
- Check that the `get-mapbox-token` edge function is deployed
- Verify the token has correct scopes/permissions

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npm run lint`

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## License

[Add your license here]
# Test
