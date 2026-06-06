# Nino — Pet Adoption SaaS

A multi-tenant pet adoption platform (rebranded from PawFinds).  
Built with **ASP.NET Core (.NET 8)** + **React (Vite 6)** + **SQL Server**.

---

## How to Pull & Run on a New PC

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v18+ (tested with v22)
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) — Developer edition is fine
- **SQL Server Browser service** must be **running** (for named instance `.\SQLEXPRESS`)

### 2. Clone

```bash
git clone https://github.com/MedCoding47/saas_stay_soon.git
cd saas_stay_soon
```

### 3. Backend — .NET API

#### 3a. Check the connection string

Open `PawFindsBackend/PawFinds.Api/appsettings.json` and verify:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.\\SQLEXPRESS;Database=PawFindsDb;TrustServerCertificate=True;User Id=desarrollo;Password=123456;"
}
```

If your SQL Server uses a different instance name or auth mode, update accordingly.

#### 3b. Ensure SQL Server Browser is running

```powershell
# Check status
Get-Service MSSQL`$SQLEXPRESS
Start-Service MSSQL`$SQLEXPRESS

# SQL Browser (needed for named instances)
Get-Service SQLBrowser
Start-Service SQLBrowser
```

#### 3c. Restore & run

```powershell
cd PawFindsBackend/PawFinds.Api
dotnet restore
dotnet run --urls http://localhost:5000
```

The API will:
- Auto-create the database `PawFindsDb` and run migrations on first launch
- Seed 4 accounts (see Credentials below)
- Serve Swagger at `http://localhost:5000/swagger`

### 4. Frontend — React App

#### 4a. Fix npm registry (important!)

The lockfile may contain a private registry URL. Replace it with the public npm registry:

```powershell
cd pet/front
npm install
```

If you see `connect ETIMEDOUT` or `http://192.168.x.x` errors, edit `package-lock.json` and replace `http://192.168.1.189:8081/repository/npm-all/` with `https://registry.npmjs.org/` in all occurrences, then run `npm install` again.

#### 4b. Run

```powershell
npm run dev
```

Opens at `http://localhost:5173`. Vite proxies `/api` requests to `http://localhost:5000`.

### 5. Login Credentials

| Role | Email | Password |
|---|---|---|
| SuperAdmin | `superadmin@pawfinds.com` | `Super@123` |
| Enterprise (Shelter) | `enterprise@pawfinds.com` | `Enterprise@123` |
| Client | `client@pawfinds.com` | `Client@123` |
| Vet | `vet@pawfinds.com` | `Vet@123` |

---

## Features

### Public Pages

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Hero, stats, how-it-works, featured pets, testimonials, shelter CTA |
| Pet Browser | `/browse` | Search/filter pets (species, age, location, status), inline donation section |
| Pet Details | `/pets/:id` | Health/behavior tables, adoption fees, shelter info + map, accessories, similar pets |
| Doctors | `/doctors` | Vet directory with cards, booking modal, embedded map |
| Donate | `/donate` | One-time/monthly tiers with impact descriptions, PayPal payment, FAQ accordion |
| Guides | `/guides` | Species-specific educational guides (dog/cat/rabbit/bird/other) with care sections |
| Quiz (Adoption Flow) | `/adopt/:petId` | Pre-adoption questionnaire (lifestyle, home, experience, match preferences) |

### Auth

| Page | Route | Description |
|---|---|---|
| Role Selector | `/auth/role` | 3-card grid — Adopter / Shelter / Vet |
| Login (Client) | `/auth/login` | Split-screen layout |
| Login (Shelter) | `/auth/enterprise/login` | Organization login |
| Login (Vet) | `/auth/vet/login` | Vet login |
| Login (Admin) | `/auth/admin/login` | SuperAdmin login |
| Register | `/auth/register` | Client sign-up with confirm password |

### Dashboards

| Dashboard | Route | Description |
|---|---|---|
| Client | `/dashboard` | Profile, favorites, adoptions, give-up form |
| Vet | `/dashboard/vet` | Profile, advice articles, tips, booking requests |
| Enterprise | `/dashboard/enterprise` | Pet CRUD, catalog, adoption requests, company profile |
| SuperAdmin | `/dashboard/superadmin` | Overview (KPIs, charts, live activity), Users, Orgs, Requests |

### API Endpoints (Backend)

| Endpoint | Description |
|---|---|
| `GET/POST /api/pets` | Pet CRUD with filtering |
| `GET /api/pets/{id}` | Single pet details with shelter info |
| `POST /api/adoptions` | Submit adoption request |
| `GET/POST /api/reviews` | Ratings & reviews |
| `GET /api/analytics/*` | SuperAdmin stats (6 endpoints) |
| `POST /api/payments/create-checkout` | Stripe donation checkout |
| `POST /api/newsletter` | Newsletter subscription |
| `GET/POST /api/appointments` | Vet booking |
| `POST /api/auth/*` | Auth (login, register, profile) |

---

## Design System

- **Background**: `#FAF7F2` (warm cream), `#0D0D0D` (ink black) for dark sections
- **Text**: `#0D0D0D` (near-black), `#8c7e74` (muted)
- **Accent**: Coral `#D85A30` → `#FF6B6B`
- **Borders**: `#E8E0D8`
- **Cards**: White `rounded-3xl` with `shadow-card`, hover lift
- **Tab pills**: `rounded-full`, dark active / cream inactive
- **Typography**: `font-display font-black` (Playfair Display) for headings
- **Labels**: `text-xs font-bold tracking-widest uppercase`
- **Animations**: Framer Motion (fade-up, staggered), GSAP (marquee)
- **Icons**: Emoji-based (no icon library)

## Tech Stack

- **Backend**: .NET 8, EF Core, SQL Server, JWT Bearer auth, Stripe.net, Clean Architecture
- **Frontend**: Vite 6, React 18, Tailwind CSS 3, Framer Motion, GSAP, i18next (EN/FR/AR)
- **Payments**: Stripe (PayPal fallback on frontend)

## Project Structure

```
PawFindsBackend/
├── PawFinds.Api/              # Controllers, DTOs, appsettings
├── PawFinds.Application/      # Service interfaces
├── PawFinds.Domain/           # Entities (Pet, Review, Appointment, etc.)
└── PawFinds.Infrastructure/   # EF Core DbContext, Migrations, Services

pet/front/src/
├── api/                       # Axios client config
├── components/
│   ├── layout/                # Navbar, Footer
│   ├── animations/            # PageTransition, AnimatedCounter
│   ├── pets/                  # PetCard, FilterBar, etc.
│   └── ui/                    # Button, Card, Badge, Modal, RatingStars, etc.
├── pages/
│   ├── admin/
│   ├── auth/                  # RoleSelector + 4 login pages + register
│   ├── client/                # Client dashboard
│   ├── doctors/               # Public vet listing + booking
│   ├── donate/                # Donation page
│   ├── enterprise/            # Shelter dashboard
│   ├── guides/                # Species care guides
│   ├── pets/                  # Pet browser + details
│   ├── superadmin/            # SuperAdmin dashboard
│   ├── veterinaire/           # Vet dashboard
│   └── swipe/                 # Swipe-to-adopt mode
├── i18n/                      # en.json, fr.json, ar.json
└── hooks/                     # useAuth, usePets, etc.
```

---

## Troubleshooting

### `connect ETIMEDOUT` on `npm install`
The lockfile references a private registry. Run:
```powershell
# Find & replace private registry URL
Get-ChildItem -Recurse -Filter "package-lock.json" | Select-String "192.168" -SimpleMatch
```
Replace `http://192.168.1.189:8081/repository/npm-all/` → `https://registry.npmjs.org/` in `package-lock.json`, then `npm install` again.

### `Cannot open database "PawFindsDb"`
The DB auto-creates on first `dotnet run`. Make sure SQL Server is running:
```powershell
Get-Service MSSQL`$SQLEXPRESS
```
If it's stopped: `Start-Service MSSQL`$SQLEXPRESS`

### SQL Browser service stopped
Named instance `.\SQLEXPRESS` needs SQL Browser running:
```powershell
Start-Service SQLBrowser
```

### `dotnet build` fails with missing packages
Run `dotnet restore` in the `PawFinds.Api` directory.

### Backend changes not reflecting
Stop `dotnet run` (Ctrl+C), run `dotnet build`, then `dotnet run` again.

### Frontend port conflict
Vite defaults to 5173. If busy, it auto-increments. Check terminal output for the actual URL.
