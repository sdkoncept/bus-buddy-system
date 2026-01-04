# Mapbox Token Setup - Quick Reference

## Your Mapbox Token
```
pk.eyJ1Ijoic2Rrb25jZXB0IiwiYSI6ImNtamtvaDNqejIzeHIzZ3F4bXo0bXN3MDgifQ.GAkm6kW5nBlWe8H8RbT0rg
```

## Add to Supabase Secrets

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/ccvjtchhcjzpiefrgbmk/settings/functions
2. Scroll down to **Secrets** section
3. Click **"Add a new secret"**
4. Enter:
   - **Name**: `MAPBOX_PUBLIC_TOKEN`
   - **Value**: `pk.eyJ1Ijoic2Rrb25jZXB0IiwiYSI6ImNtamtvaDNqejIzeHIzZ3F4bXo0bXN3MDgifQ.GAkm6kW5nBlWe8H8RbT0rg`
5. Click **Save**

### Method 2: Using Supabase CLI

```bash
npx supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ1Ijoic2Rrb25jZXB0IiwiYSI6ImNtamtvaDNqejIzeHIzZ3F4bXo0bXN3MDgifQ.GAkm6kW5nBlWe8H8RbT0rg --project-ref ccvjtchhcjzpiefrgbmk
```

(Requires authentication: `npx supabase login` first)

## Verify Setup

After adding the secret:

1. Go to Edge Functions → `get-mapbox-token`
2. Click **Invoke** or test with:
   ```bash
   curl https://ccvjtchhcjzpiefrgbmk.supabase.co/functions/v1/get-mapbox-token
   ```
3. Should return: `{"token":"pk.eyJ1Ijoic2Rrb25jZXB0IiwiYSI6ImNtamtvaDNqejIzeHIzZ3F4bXo0bXN3MDgifQ.GAkm6kW5nBlWe8H8RbT0rg"}`

## Test the Map

1. Refresh your application
2. Go to `/tracking` page
3. Map should now load! ✅
