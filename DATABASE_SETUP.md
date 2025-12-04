# MySQL Database Setup Instructions

## Prerequisites
You need MySQL installed and running on your system.

### Install MySQL (if not already installed)

**macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows:**
Download and install from: https://dev.mysql.com/downloads/installer/

## Database Setup

1. **Access MySQL:**
```bash
mysql -u root -p
```

2. **Create Database:**
```sql
CREATE DATABASE carpooling_db;
EXIT;
```

3. **Update `.env` file:**
Replace the DATABASE_URL with your actual MySQL credentials:
```
DATABASE_URL="mysql://YOUR_USERNAME:YOUR_PASSWORD@localhost:3306/carpooling_db"
```

## Run Migrations

Once MySQL is set up and the `.env` is configured:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

## Troubleshooting

- **Connection Error**: Verify MySQL is running: `brew services list` (macOS) or `sudo systemctl status mysql` (Linux)
- **Access Denied**: Check your MySQL username and password in `.env`
- **Database Not Found**: Make sure you created the `carpooling_db` database

## Next Steps

After successful migration, you can:
1. Use the Prisma client in API routes: `import { prisma } from '@/lib/prisma'`
2. Create API endpoints for CRUD operations
3. View data in Prisma Studio: `npx prisma studio`
