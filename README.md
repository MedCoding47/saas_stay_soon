# PawFinds — Pet Adoption SaaS

## Latest Update: Vet Dashboard Redesign + PetCareRecommendations

### What's new (commit `735fa16` → now)

#### Backend
- **`PetCareRecommendation` entity** — vets can add product care tips with target species/age range
- **Public vet endpoint enhanced** — returns full doctor info: name, email, profile picture, lat/lng, formation, **2 latest advices**, all recommendations
- **Vet profile response enhanced** — now includes `UserName`, `UserEmail`, `ProfilePictureUrl` from the User entity

#### Frontend
- **Bento-grid vet dashboard** — animated 3-column grid layout (avatar center, info around)
- **Doctors public page** (`/doctors`) — lists all vets with embedded Google Maps, advices, recommendations
- **Navbar** — "Adopted" replaced with "Doctors" link
- **Advice tab** — fully working (add modal + delete button)
- **Recommendations tab** — vets can add/delete product care tips
- **Bookings tab** — Confirm/Cancel/Complete buttons
- **shadcn UI components** — Card, Badge, Avatar, BentoGridShowcase added

### Database Migration Required

This update adds a new table `PetCareRecommendations`. To apply the migration:

```bash
cd PawFindsBackend/PawFinds.Api
dotnet ef database update
```

The migration file is:
`PawFindsBackend/PawFinds.Infrastructure/Migrations/20260518152726_AddPetCareRecommendations.cs`

If you are cloning fresh, just run the backend — all migrations apply automatically on startup.

### How to Reset the Database

Run the SQL script against your `PawFindsDb`:

```sql
-- Run reset_db.sql in SQL Server Management Studio
-- Then restart the backend to re-seed
```

### Updated Credentials

| Role | Email | Password |
|---|---|---|
| SuperAdmin | `superadmin@pawfinds.com` | `Super@123` |
| Enterprise | `enterprise@pawfinds.com` | `Temp@9ca6fb5a!` |
| Client | `client@pawfinds.com` | `Client@123` |
| Vet | `vet@pawfinds.com` | `Temp@268a4a5c!` |

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
