# PawFinds — Pet Adoption SaaS

## 🔧 Critical: DB Password Hash Fix (Jun 3, 2026)

The password hashes for `enterprise@pawfinds.com` and `vet@pawfinds.com` were **corrupted** in the database — they didn't match their expected passwords, causing "Invalid credentials" on login.

**Root cause**: The `PasswordHasher<TUser>` generated hashes that `VerifyHashedPassword` rejected for those 2 users during the initial seed. This was a data integrity issue in the local DB, not a code bug.

**Fixed by**: Running a C# tool that re-hashed fresh passwords with `PasswordHasher.HashPassword()` and updated the `PasswordHash` column for those 2 accounts.

### If You Pull / Clone Fresh

The seeder (`DbSeeder.cs`) will create all 4 users with correct hashes automatically on first run. **No action needed** — just start the API.

### If You Have an Existing DB with "Invalid Credentials"

Run this SQL to see if your hashes are broken:

```sql
-- Query your existing hashes (the PawFindsBackend repo has a hashcheck/ tool)
SELECT Email, LEFT(PasswordHash, 40) AS HashPrefix, Role FROM Users;
```

Then either:
- **Option A**: Drop and re-seed (loses all data):
  ```sql
  USE master;
  ALTER DATABASE PawFindsDb SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
  DROP DATABASE PawFindsDb;
  ```
  Then restart the API — it recreates + seeds fresh.

- **Option B**: Fix user passwords via the API's register-like logic (contact admin).

### Updated Credentials

| Role | Email | Password |
|---|---|---|
| SuperAdmin | `superadmin@pawfinds.com` | `Super@123` |
| Enterprise | `enterprise@pawfinds.com` | `Enterprise@123` |
| Client | `client@pawfinds.com` | `Client@123` |
| Vet | `vet@pawfinds.com` | `Vet@123` |

### Run the Project

**Backend** (PowerShell):
```powershell
cd PawFindsBackend/PawFinds.Api
dotnet run --urls http://localhost:5000
```

**Frontend** (PowerShell, separate terminal):
```powershell
cd pet/front
npm run dev
```

### Project Structure

```
PawFindsBackend/
├── PawFinds.Api/          # Controllers, Contracts
├── PawFinds.Application/  # Service interfaces, DTOs
├── PawFinds.Domain/       # Entities, Enums
└── PawFinds.Infrastructure/ # Services, EF Core, Migrations

pet/front/src/
├── api/                   # Axios client
├── components/
│   ├── layout/            # Navbar, Footer, AdminSidebar
│   ├── pets/              # PetCard, FilterBar, etc.
│   └── ui/                # Button, Card, Badge, Avatar, Modal, BentoGrid, etc.
├── hooks/                 # useAuth, usePets, etc.
├── pages/
│   ├── admin/             # SuperAdmin pages
│   ├── auth/              # Role-based logins
│   ├── client/            # Client dashboard
│   ├── doctors/           # Public doctors page (new)
│   ├── enterprise/        # Enterprise dashboard
│   ├── pets/              # Pet browser, details
│   ├── superadmin/        # SuperAdmin management
│   ├── veterinaire/       # Vet dashboard (redesigned)
│   └── swipe/             # Swipe mode
└── components/ui/         # Reusable UI library
    ├── Badge.jsx          # Hybrid: supports status + shadcn variant
    ├── Card.jsx           # Card, CardHeader, CardTitle, CardContent, etc.
    ├── avatar.jsx         # Avatar, AvatarImage, AvatarFallback
    └── bento-grid.jsx     # BentoGridShowcase animated 3-column grid
```

### Tech Stack

- **Backend**: .NET 8, EF Core, SQL Server, JWT, Clean Architecture
- **Frontend**: Vite 6, React 18, Tailwind CSS 3, Framer Motion, shadcn-style components
- **DB**: SQL Server (default instance `.`, database `PawFindsDb`)
