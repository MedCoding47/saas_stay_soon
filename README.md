# Nino — Pet Adoption SaaS

A multi-tenant pet adoption platform rebuilt with ASP.NET Core (.NET 8) + React.

---

## How to Pull & Run

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (local or remote)

### 2. Clone

```bash
git clone https://github.com/MedCoding47/saas_stay_soon.git
cd saas_stay_soon
```

### 3. Backend — .NET API

```powershell
cd PawFindsBackend/PawFinds.Api
dotnet restore
dotnet run --urls http://localhost:5000
```

The API will:
- Auto-create the database `PawFindsDb` on first run
- Seed 4 accounts (see Credentials below)

### 4. Frontend — React App

```powershell
cd pet/front
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### 5. Login Credentials

| Role | Email | Password |
|---|---|---|
| SuperAdmin | `superadmin@pawfinds.com` | `Super@123` |
| Enterprise (Shelter) | `enterprise@pawfinds.com` | `Enterprise@123` |
| Client | `client@pawfinds.com` | `Client@123` |
| Vet | `vet@pawfinds.com` | `Vet@123` |

---

## What's New — Full Redesign (June 2026)

Complete visual overhaul of every page with a consistent editorial design system.

| Page | What Changed |
|---|---|
| **Landing** | Rebranded PawFinds→Nino, new hero, stats, features, testimonials, shelter section |
| **Navbar + Footer** | Rebranded, clean dark/light layout |
| **Login Pages** (all 4) | Split-screen layout — left form (cream), right dark panel with role-specific visuals |
| **Role Selector** | 3-card grid (Adopter / Shelter / Veterinarian) |
| **Register** | Split-screen with confirm password validation |
| **Pet Browser** | Hero banner, inline filter sidebar with custom radios, pet cards, shelter section, donation tiers |
| **Pet Details** | 72px pet name, health/behavior tables, accessories strip, shelter info + map, similar pets, adoption fee cards |
| **Client Dashboard** | Tab pills, stat cards grid, data tables, request modals |
| **Vet Dashboard** | Dark profile card replacing gradient, bento-grid layout, tabbed advice/recommendations/bookings |
| **Enterprise Dashboard** | Pet CRUD grid, adoption requests table, catalog products, profile editing — all redesigned |
| **SuperAdmin Dashboard** | Users/Organizations/Settings tabs with data tables, role badges, create-account modal |
| **Doctors Page** | Hero banner, vet cards with avatar/tags/CTA, embedded map section |

### Design System

- **Background**: `#FAF7F2` (warm cream)
- **Text**: `#0D0D0D` (near-black), `#8c7e74` (muted)
- **Accent**: `coral` (#FF6B6B style)
- **Borders**: `#E8E0D8`
- **Cards**: white `rounded-3xl` with `border-[#E8E0D8]`, hover lift
- **Tab pills**: rounded-full, dark active / cream inactive
- **Typography**: `font-display font-black` for headings, `text-xs font-bold tracking-widest uppercase` for labels
- **Buttons**: `btn-dark` (filled), `btn-outline` (bordered), `btn-coral`
- **Tags**: `tag-coral`, `tag-teal`, `tag-outline`, `tag-dark`

---

## Tech Stack

- **Backend**: .NET 8, EF Core, SQL Server, JWT, Clean Architecture
- **Frontend**: Vite 6, React 18, Tailwind CSS 3, Framer Motion
- **Architecture**: PawFinds.Api → PawFinds.Application → PawFinds.Domain → PawFinds.Infrastructure

## Project Structure

```
PawFindsBackend/
├── PawFinds.Api/              # Controllers, Contracts
├── PawFinds.Application/      # Service interfaces, DTOs
├── PawFinds.Domain/           # Entities, Enums
└── PawFinds.Infrastructure/   # Services, EF Core, Migrations

pet/front/src/
├── api/                       # Axios client
├── components/
│   ├── layout/                # Navbar, Footer
│   ├── pets/                  # PetCard, FilterBar, etc.
│   └── ui/                    # Button, Card, Badge, Avatar, Modal, BentoGrid, etc.
├── pages/
│   ├── admin/                 # Admin login
│   ├── auth/                  # Role-based logins + RoleSelector
│   ├── client/                # Client dashboard + register
│   ├── doctors/               # Public doctors listing
│   ├── enterprise/            # Enterprise dashboard
│   ├── pets/                  # Pet browser + details
│   ├── superadmin/            # SuperAdmin dashboard
│   ├── veterinaire/           # Vet dashboard
│   └── swipe/                 # Swipe mode
└── hooks/                     # useAuth, usePets, etc.
```
