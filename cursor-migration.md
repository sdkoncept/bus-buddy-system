# Bus Buddy System - Migration from Lovable.dev

## Overview

This is a comprehensive bus fleet management system built with React, TypeScript, and Supabase. The application provides:

- **Fleet Management**: Bus tracking, maintenance, and inventory management
- **Booking System**: Ticket booking and passenger management
- **Driver Management**: Driver profiles, trips, incidents, and GPS tracking
- **Route & Schedule Management**: Bus routes and scheduling
- **Multi-role Access**: Admin, Staff, Driver, Mechanic, Passenger, Accounts, Storekeeper roles
- **Real-time Tracking**: GPS-based bus location tracking with Mapbox
- **Mobile Support**: Capacitor-based mobile app support

## Technology Stack

- **Frontend Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **UI Library**: shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL database, Auth, Edge Functions)
- **Maps**: Mapbox GL
- **Mobile**: Capacitor 8
- **PWA**: Vite PWA Plugin

## Project Structure

```
bus-buddy-system/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── booking/        # Booking-related components
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── driver/         # Driver-specific components
│   │   ├── inventory/      # Inventory management
│   │   ├── layout/         # Layout components (sidebar, etc.)
│   │   ├── maintenance/    # Maintenance components
│   │   ├── mechanic/       # Mechanic-specific components
│   │   ├── notifications/  # Notification components
│   │   ├── tracking/       # GPS tracking components
│   │   └── ui/             # shadcn/ui components
│   ├── contexts/           # React contexts (AuthContext)
│   ├── data/              # Sample/static data
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # Third-party integrations
│   │   └── supabase/      # Supabase client and types
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components (routes)
│   └── types/             # TypeScript type definitions
├── supabase/
│   ├── functions/         # Supabase Edge Functions
│   │   ├── create-driver-user/
│   │   ├── delete-driver-user/
│   │   ├── delete-user/
│   │   ├── get-mapbox-token/
│   │   ├── link-driver-account/
│   │   └── update-bus-location/
│   ├── migrations/        # Database migrations
│   └── config.toml        # Supabase configuration
├── public/                # Static assets
└── [config files]         # Vite, TypeScript, Tailwind, etc.
```

## Lovable Dependencies Identified

The following Lovable-specific dependencies were found and need to be removed:

1. **`lovable-tagger` package** - Development dependency used for component tagging
2. **Vite plugin import** - `componentTagger()` in `vite.config.ts`
3. **Capacitor App ID** - Contains Lovable-specific identifier
4. **README.md** - Contains Lovable-specific instructions

## Step-by-Step Migration Plan

### Step 1: Remove Lovable Tagger Dependency

**Action**: Remove the `lovable-tagger` package from `package.json` and remove its usage from `vite.config.ts`.

**Files to modify**:
- `package.json` - Remove `lovable-tagger` from devDependencies
- `vite.config.ts` - Remove import and plugin usage

### Step 2: Update Capacitor Configuration

**Action**: Replace the Lovable-specific app ID with a custom one.

**Files to modify**:
- `capacitor.config.ts` - Change `appId` to a custom identifier (e.g., `com.eagleline.fleet`)

### Step 3: Create Environment Variables File

**Action**: Create a `.env.local` file template for local development.

**Required environment variables**:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key

**Note**: For Supabase Edge Functions, you'll also need to set `MAPBOX_PUBLIC_TOKEN` as a secret in your Supabase project.

### Step 4: Update README.md

**Action**: Replace Lovable-specific instructions with local development setup instructions.

### Step 5: Install Dependencies and Verify

**Action**: Clean install dependencies and verify the project runs locally.

## Local Development Setup

### Prerequisites

- **Node.js** 18+ and npm (or bun/yarn/pnpm)
- **Supabase Account** - For backend services
- **Mapbox Account** (optional) - For map features

### Installation Steps

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd bus-buddy-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```

   **Getting your Supabase credentials**:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the "Project URL" for `VITE_SUPABASE_URL`
   - Copy the "anon public" key for `VITE_SUPABASE_PUBLISHABLE_KEY`

4. **Set up Supabase Edge Function secrets** (for Mapbox):
   
   If you're using the Mapbox integration, set the secret in Supabase:
   ```bash
   # Using Supabase CLI
   supabase secrets set MAPBOX_PUBLIC_TOKEN=your-mapbox-token-here
   
   # Or via Supabase Dashboard:
   # Go to Project Settings > Edge Functions > Secrets
   ```

5. **Run database migrations** (if needed):
   
   If you have a local Supabase instance or need to apply migrations:
   ```bash
   # Using Supabase CLI
   supabase db reset
   # or
   supabase migration up
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   # or
   bun dev
   ```

   The app should be available at `http://localhost:8080` (or the port specified in `vite.config.ts`).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Mobile App Development (Capacitor)

If you want to build the mobile app:

1. **Sync Capacitor**:
   ```bash
   npx cap sync
   ```

2. **Open in native IDE**:
   ```bash
   # Android
   npx cap open android
   
   # iOS
   npx cap open ios
   ```

## Key Features and Routes

### Authentication
- `/auth` - Login page
- `/auth/callback` - OAuth callback handler
- `/reset-password` - Password reset

### Dashboard Routes (Protected)
- `/dashboard` - Main dashboard (all authenticated users)
- `/fleet` - Fleet management (admin)
- `/drivers` - Driver management (admin)
- `/routes` - Route management (admin, staff)
- `/schedules` - Schedule management (admin, staff, driver)
- `/bookings` - Booking management (admin, staff)
- `/tracking` - Real-time bus tracking (admin, staff, passenger)
- `/maintenance` - Maintenance records (admin, staff, mechanic)
- `/inventory` - Inventory management (admin, staff, storekeeper, mechanic)
- `/accounts` - Financial accounts (admin, accounts)
- `/customer-service` - Customer service (admin, staff)
- `/reports` - Reports (admin only)
- `/driver-app` - Driver mobile app interface (admin, driver)
- `/book` - Ticket booking (admin, staff, passenger)
- `/my-bookings` - User bookings (admin, passenger)

## Database

The project uses Supabase (PostgreSQL) with the following key features:
- Row Level Security (RLS) policies
- Edge Functions for serverless operations
- Real-time subscriptions
- Authentication and user management

Database migrations are located in `supabase/migrations/`.

## Supabase Edge Functions

The project includes several Edge Functions:
- `get-mapbox-token` - Retrieves Mapbox API token
- `update-bus-location` - Updates bus GPS location
- `create-driver-user` - Creates driver user accounts
- `delete-driver-user` - Deletes driver accounts
- `link-driver-account` - Links driver accounts
- `delete-user` - General user deletion
- `create-test-users` - Test user creation

## Troubleshooting

### Environment Variables Not Loading
- Ensure `.env.local` is in the root directory
- Restart the dev server after adding/changing environment variables
- Check that variable names start with `VITE_`

### Supabase Connection Issues
- Verify your Supabase URL and keys are correct
- Check that your Supabase project is active
- Ensure RLS policies allow your operations

### Mapbox Not Working
- Verify `MAPBOX_PUBLIC_TOKEN` is set in Supabase secrets
- Check that the `get-mapbox-token` edge function is deployed
- Verify the token has the correct scopes/permissions

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npm run lint`

## Setting Up a New Supabase Project

Since the original Lovable.dev Supabase project is not accessible, you'll need to create a new one.

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create an account)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `eagleline` (or your preferred name)
   - **Database Password**: Create a strong password and **save it**
   - **Region**: Choose the closest to your users
4. Click **"Create new project"** and wait (~2 minutes)

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open the file `supabase/setup/01_complete_schema.sql` from this project
4. Copy the **entire contents** and paste into the SQL Editor
5. Click **"Run"** (this creates all tables, functions, policies, and seed data)
6. Wait for completion (30-60 seconds)

### Step 3: Get Your API Keys

1. Go to **Settings > API** in your Supabase dashboard
2. Copy these values:

| Dashboard Field | Environment Variable |
|-----------------|---------------------|
| Project URL | `VITE_SUPABASE_URL` |
| anon public key | `VITE_SUPABASE_PUBLISHABLE_KEY` |

### Step 4: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

### Step 5: Create Your Admin User

1. Go to **Authentication > Users** in Supabase dashboard
2. Click **"Add user"** > **"Create new user"**
3. Enter your admin email and password
4. Check **"Auto Confirm User"**
5. Click **"Create user"**
6. Go to **SQL Editor** and run:

```sql
-- Replace with your actual admin email
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-admin-email@example.com'
);
```

### Step 6: Deploy Edge Functions (Optional)

For full functionality (driver management, etc.):

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (get project ref from Dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
supabase functions deploy
```

### Step 7: Set Edge Function Secrets

```bash
# For Mapbox maps (get token from mapbox.com)
supabase secrets set MAPBOX_PUBLIC_TOKEN=your-mapbox-token
```

Or set via Dashboard: **Settings > Edge Functions > Secrets**

### Step 8: Update Supabase Config

Edit `supabase/config.toml` and replace `YOUR_PROJECT_ID` with your actual project ID.

### Step 9: Start Development

```bash
npm run dev
```

Open http://localhost:8080 and log in with your admin account!

## Database Tables Reference

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (name, email, phone) |
| `user_roles` | Role assignments (admin, driver, passenger, etc.) |
| `buses` | Fleet vehicles |
| `drivers` | Driver records with license info |
| `driver_leaves` | Leave requests and approvals |
| `routes` | Bus routes |
| `route_stops` | Stops along routes |
| `stations` | Bus stations/terminals |
| `states` | Nigerian states (pre-populated) |
| `schedules` | Route schedules |
| `trips` | Trip instances |
| `bookings` | Passenger bookings |
| `payments` | Payment records |
| `bus_locations` | Real-time GPS tracking |
| `inventory_categories` | Parts categories |
| `inventory_items` | Spare parts inventory |
| `stock_requests` | Parts requests |
| `suppliers` | Parts suppliers |
| `maintenance_records` | Maintenance history |
| `job_cards` | Mechanic work orders |
| `vehicle_inspections` | Inspection records |
| `work_orders` | Work order assignments |
| `transactions` | Financial transactions |
| `payroll` | Driver payroll |
| `complaints` | Customer complaints |
| `incidents` | Driver incident reports |
| `notifications` | User notifications |

## User Roles

| Role | Access Level |
|------|-------------|
| `admin` | Full system access |
| `staff` | Operational access (routes, bookings, etc.) |
| `driver` | Own trips, passengers, incidents |
| `mechanic` | Maintenance, job cards, parts requests |
| `storekeeper` | Inventory management |
| `accounts` | Financial operations, payroll |
| `passenger` | Booking tickets, viewing trips |

## Next Steps

After migration:
1. ✅ Remove Lovable dependencies (completed)
2. ✅ Create new Supabase project (instructions above)
3. ✅ Run database schema
4. ✅ Create admin user
5. Deploy Edge Functions (optional, for driver creation)
6. Configure Mapbox token (optional, for maps)
7. Test all features in local development
8. Set up CI/CD pipeline for deployment
9. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

