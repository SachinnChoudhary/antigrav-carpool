# Complete Setup Guide

## Prerequisites
- ✅ Node.js installed
- ✅ MySQL installed and running
- ✅ Database created: `carpooling_db`

## Current Status

### ✅ Completed
1. **Database Setup**
   - MySQL 9.5.0 installed via Homebrew
   - Database `carpooling_db` created
   - Prisma 6.19.0 configured
   - All tables migrated (users, rides, bookings, reviews)

2. **API Routes Created**
   - `/api/auth/signup` - User registration
   - `/api/auth/login` - User authentication
   - `/api/rides` - Create & list rides
   - `/api/rides/[id]` - Get, update, delete specific ride
   - `/api/bookings` - Create & list bookings
   - `/api/bookings/[id]` - Update booking status
   - `/api/reviews` - Create & list reviews
   - `/api/users/[id]` - Get & update user profile

3. **Frontend Pages**
   - Login page (`/login`) - Connected to API
   - Signup page (`/signup`) - Connected to API
   - All other pages (Home, Search, Profile, etc.)

## ⚠️ Action Required: Restart Dev Server

The dev server needs to be restarted to load the new Prisma 6 client:

```bash
# 1. Stop the current server (Ctrl+C)
# 2. Start it again:
npm run dev
```

## Testing the Application

### 1. Test Signup
```bash
# Navigate to: http://localhost:3000/signup
# Fill in:
# - Name: Test User
# - Email: test@example.com
# - Password: password123
# Click "Create Account"
# Should redirect to login page
```

### 2. Test Login
```bash
# Navigate to: http://localhost:3000/login
# Fill in:
# - Email: test@example.com
# - Password: password123
# Click "Sign In"
# Should redirect to home page
```

### 3. Test API Directly (Optional)

**Create a ride:**
```bash
curl -X POST http://localhost:3000/api/rides \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": "YOUR_USER_ID",
    "from": "Delhi",
    "fromDetail": "Connaught Place",
    "to": "Mumbai",
    "toDetail": "Bandra",
    "date": "2025-11-25",
    "time": "10:00 AM",
    "seats": 3,
    "price": 1500
  }'
```

**Search rides:**
```bash
curl "http://localhost:3000/api/rides?from=Delhi&to=Mumbai"
```

## Database Management

### View Database in Browser
```bash
npx prisma studio
```
This opens a visual database browser at `http://localhost:5555`

### Run Migrations (if schema changes)
```bash
npx prisma migrate dev --name description_of_change
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

## Environment Variables

Current `.env` configuration:
```
DATABASE_URL="mysql://root:password@localhost:3306/carpooling_db"
```

## Troubleshooting

### "Unexpected token '<'" Error
- **Cause**: Dev server using old Prisma client
- **Fix**: Restart the dev server (see above)

### "Cannot connect to database"
- **Cause**: MySQL not running
- **Fix**: `brew services start mysql`

### "Table doesn't exist"
- **Cause**: Migrations not run
- **Fix**: `npx prisma migrate dev --name init`

### "Module not found: @prisma/client"
- **Cause**: Prisma client not generated
- **Fix**: `npx prisma generate`

## Next Steps

Once the dev server is restarted:

1. ✅ Test signup/login flow
2. ✅ Create test rides via API
3. ✅ Test booking creation
4. ✅ Add reviews
5. ✅ View all data in Prisma Studio

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   └── login/route.ts
│   │   ├── rides/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── bookings/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── reviews/route.ts
│   │   └── users/[id]/route.ts
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── ... (other pages)
├── lib/
│   └── prisma.ts
└── ...

prisma/
├── schema.prisma
└── migrations/
    └── 20251123121839_init/
        └── migration.sql
```

## Support

For API documentation, see: `API_DOCUMENTATION.md`
For database setup details, see: `DATABASE_SETUP.md`
