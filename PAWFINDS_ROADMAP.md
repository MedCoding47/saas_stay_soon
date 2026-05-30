# PawFinds → Moroccan SaaS — Master Roadmap
> **Reference:** la-spa.fr (Société Protectrice des Animaux, France)  
> **Goal:** Match la-spa.fr's UX/UI quality and feature depth, adapted for Moroccan wellness/spa market  
> **Last updated:** May 2026

---

## 📍 Where We Are Now

### Tech Stack
| Layer | Current | Status |
|-------|---------|--------|
| Frontend | Vite 6 + React 18 + Tailwind CSS 3 | ✅ Running |
| Animations | Framer Motion + GSAP | ✅ Working |
| UI Library | shadcn-style (Card, Badge, Avatar, BentoGrid) | ✅ Working |
| Backend | .NET 8 ASP.NET Core Web API | ✅ Running |
| ORM | Entity Framework Core + SQL Server | ✅ Running |
| Auth | JWT + Role-based (4 roles) | ✅ Working |
| Architecture | Clean Architecture (Domain/Application/Infrastructure/API) | ✅ Solid |
| Multi-tenancy | Organizations table + OrganizationId on all entities | ✅ Done |

### Roles
| Role | Access |
|------|--------|
| `SuperAdmin` | Full platform control, create orgs, manage all |
| `Enterprise` | Manage own shelter/spa, pets, staff |
| `Veterinaire` | Manage profile, advice, bookings, recommendations |
| `Client` | Browse, adopt, book, message, favorites |

### Frontend Pages (current)
```
/                          → Landing (hero, stats, pets, locations, testimonials, how-it-works, CTA)
/pets                      → PetBrowser (grid + filters + pagination)
/pets/:id                  → PetDetails
/pets/adopted              → AdoptedPets
/swipe                     → SwipeMode (Tinder-style drag)
/doctors                   → Doctors (bento grid, maps, advice)
/login                     → RoleSelector
/login/organization        → OrgLogin
/login/veterinaire         → VetLogin
/login/client              → ClientLogin
/client/dashboard          → Client dashboard
/client/messages           → Messaging
/enterprise/dashboard      → Enterprise dashboard
/veterinaire/dashboard     → Vet dashboard
/superadmin/dashboard      → SuperAdmin panel
/superadmin/users/:id      → User detail
/superadmin/create-account → Create org/user
/superadmin/organizations/:id → Org detail
/admin                     → Admin login (legacy)
```

### Backend Controllers (current)
```
AuthController             → Register, Login, Me, UpdateProfile
PetsController             → CRUD pets (org-scoped)
AdoptionsController        → Apply, review, status transitions
AdoptedPetsController      → List adopted pets
VeterinaireController      → Profile, advice, recommendations, bookings
EnterpriseController       → Company profile, pets, bookings
OrganizationsController    → Invite users, manage org
SuperAdminController       → Create orgs, list users, platform stats
MessagesController         → Send/receive messages
ConversationsController    → List/get conversations
NotificationsController    → List, mark read
ContactController          → Contact form
PublicController           → Public companies + vets (no auth)
UploadController           → File/image upload
```

### Domain Entities (current)
```
User                       → OrganizationId, FullName, Email, Role, ProfilePictureUrl
Organization               → Name, Slug, Plan, IsActive
Pet                        → Name, Type, Breed, Age, Status, ImageUrl, OrganizationId
Booking                    → UserId, VeterinaireProfileId, PetId, BookingDate, Status
Adoption                   → PetId, AdopterId, Status, timeline
AdoptRequest               → PetId, UserId, Message, Status, ImageUrls
CompanyProfile             → UserId, CompanyName, Location, Phone, GoogleMapsUrl, Lat, Lng
VeterinaireProfile         → UserId, ClinicName, Location, Formation, Lat, Lng
Advice                     → VeterinaireProfileId, Title, Content
PetCareRecommendation      → VeterinaireProfileId, Title, Description, TargetSpecies, TargetAgeRange
Conversation               → PetHolderId, AdopterId, PetId
Message                    → ConversationId, SenderId, Content
Favorite                   → UserId, PetId
Notification               → UserId, Title, Message, IsRead
Product                    → OrganizationId, Name, Price, ImageUrl
ContactRequest             → Name, Email, Subject, Message
```

---

## 🎯 Gap Analysis vs la-spa.fr

### Similarity Score: 68% overall

| Area | Score | Key gap |
|------|-------|---------|
| Tech Stack | 85% | No SSR/SEO |
| UX/UI Design | 55% | Dark palette vs warm, no map page |
| Feature Parity | 40% | No payment, no geolocation, no map embed |

### What we already nailed ✅
- React SPA + React Router + AnimatePresence (same as la-spa.fr)
- Scroll-aware sticky navbar (transparent → blur on scroll)
- Full-page hero with floating imagery and motion
- Card catalog with filter sidebar + pagination
- Stats counter section
- 4-column footer structure
- Multi-role auth (more advanced than la-spa.fr)
- Google Maps text cards with links
- Swipe mode (unique feature, no equivalent on la-spa.fr)
- Real-time messaging (unique, la-spa.fr doesn't have it)
- WhatsAppButton component exists (just not deployed)

---

## 🗺️ Step-by-Step Upgrade Plan

---

### STEP 1 — Color Palette (Moroccan Warm)
**Priority:** 🔴 Critical | **Effort:** 30 min | **Files:** `index.css`, `Landing.jsx`

**What:** Replace dark Tinder purple (`#0F0C29`) with warm Moroccan terracotta/cream palette.  
**Why:** la-spa.fr uses bright, emotionally warm colors. Wellness/hammam brand needs warmth.

**Claude Code Prompt:**
```
You are a senior UI engineer working on PawFinds (pet/front/src/).

TASK: Migrate the color palette from dark to warm Moroccan wellness.

In pet/front/src/index.css:
1. Change --sh-coral: #D85A30 → --sh-coral: #8B2500
2. Add --sh-cream: #F5E6D3
3. Add --sh-gold: #C8962A
4. Add --sh-terracotta: #A0522D
5. Keep all existing Tailwind color class names intact — only update CSS variable values

In pet/front/src/pages/Landing.jsx:
1. Change hero section background style from:
   `background: 'linear-gradient(135deg, #0F0C29, #302B63, #24243e)'`
   to:
   `background: 'linear-gradient(135deg, #2C1A0E, #6B2E15, #C8962A)'`
2. Change all other dark section backgrounds (#1A1A2E, #24243e) to:
   - Primary sections: `background: '#1C0F07'`
   - Alternate sections: `background: '#251208'`
3. The CTA section gradient stays coral/teal — just update coral value.

Do NOT change any component structure or logic. Colors only.
Run the dev server to verify no build errors.
```

---

### STEP 2 — Interactive Google Maps Page `/carte`
**Priority:** 🔴 Critical | **Effort:** 2–3 hours | **Files:** new `MapPage.jsx`, `App.jsx`

**What:** Full embedded Google Maps with pins for all partner companies and vets.  
**Why:** la-spa.fr's `/les-refuges-spa/` is their most-used page. Map + pins + info windows.

**Claude Code Prompt:**
```
You are a senior React engineer on PawFinds (pet/front/src/).

TASK: Create a full interactive Google Maps page at /carte.

1. Install: npm install @googlemaps/react-wrapper

2. Create pet/front/src/pages/map/MapPage.jsx:
   - Fetch GET /public/companies and GET /public/veterinaires on mount
   - Show a full-height Google Maps (height: calc(100vh - 64px)) centered on Morocco
     center: { lat: 31.7917, lng: -7.0926 }, zoom: 6
   - Place a custom marker for each company (use a terracotta/coral pin icon)
   - Place a different custom marker for each vet (use a teal pin icon)
   - On marker click → show a Google Maps InfoWindow containing:
     * Company/vet name (bold)
     * Location text
     * Phone number (if available)
     * "View on Maps →" link (using their googleMapsUrl)
   - Add a left sidebar (320px wide, scrollable) listing all locations as cards
     * Each card: name, location, phone, type badge (Shelter / Clinic)
     * Click a card → pan map to that marker and open its InfoWindow
   - Add a search input at top of sidebar to filter locations by name/city

3. Use the GOOGLE_MAPS_API_KEY from import.meta.env.VITE_GOOGLE_MAPS_KEY

4. Include Navbar and Footer. Match existing dark/coral color theme.

5. Add the route in App.jsx:
   <Route path="/carte" element={<MapPage />} />

6. Add "Carte" link in Navbar.jsx desktop links and mobile menu.

Use only plain JavaScript (no TypeScript). Follow existing component patterns.
```

---

### STEP 3 — Geolocation "Near Me" Search
**Priority:** 🔴 Critical | **Effort:** 1–2 hours | **Files:** `FilterBar.jsx`, `PetBrowser.jsx`, `PetsController.cs`, `PetQueryParameters.cs`

**What:** Browser GPS → filter pets by distance from user's location.  
**Why:** la-spa.fr does this for refuge finder. Essential for Moroccan city-based users.

**Claude Code Prompt:**
```
You are a senior full-stack engineer on PawFinds.

TASK: Add "Near me" geolocation filtering to pet search.

FRONTEND — pet/front/src/components/pets/FilterBar.jsx:
1. Add a "📍 Near me" button next to the Urgent toggle
2. On click: call navigator.geolocation.getCurrentPosition()
   - While loading: show spinner, disable button, text "Getting location..."
   - On success: add lat, lng, radius: 30 to filter state, button turns active/teal
   - On error: show small error text "Location access denied"
3. When geolocation is active: show "📍 Within 30km" chip with an X to clear it
4. Pass lat/lng/radius through onFilterChange as new filter keys

FRONTEND — pet/front/src/pages/pets/PetBrowser.jsx:
1. When filters.lat and filters.lng are set, append ?lat=XX&lng=YY&radius=30 to the GET /api/pets request
2. When geolocation filter is cleared, remove these params

BACKEND — PawFindsBackend/PawFinds.Application/Pets/PetQueryParameters.cs:
Add: double? Lat, double? Lng, int? RadiusKm (default 30)

BACKEND — PawFindsBackend/PawFinds.Infrastructure/Pets/PetService.cs:
In the GetPets method, after applying existing filters:
- If Lat/Lng/RadiusKm are provided, filter pets by their shelter's location
- Use Haversine formula in-memory (after DB query):
  double HaversineKm(double lat1, double lon1, double lat2, double lon2)
  const double R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.Sin(dLat/2)*Math.Sin(dLat/2) + Math.Cos(lat1*Math.PI/180)*Math.Cos(lat2*Math.PI/180)*Math.Sin(dLon/2)*Math.Sin(dLon/2);
  return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1-a));
- Sort results by distance ascending when geolocation is active
- Each pet result should include a distanceKm field in the DTO

Note: CompanyProfile has Lat/Lng columns already. Use those for distance calculation.
```

---

### STEP 4 — Booking Payment Flow (Stripe)
**Priority:** 🔴 Critical | **Effort:** 4–6 hours | **Files:** new `BookingFlow.jsx`, new `PaymentsController.cs`, new `Payment.cs`

**What:** Multi-step booking modal with Stripe payment. la-spa.fr equivalent of their donation flow.  
**Why:** No payment = no SaaS. This is the core revenue mechanism.

**Claude Code Prompt:**
```
You are a senior full-stack engineer on PawFinds.

TASK: Implement a complete multi-step booking + Stripe payment flow.

--- BACKEND ---

1. Create PawFindsBackend/PawFinds.Domain/Entities/Payment.cs:
public sealed class Payment : BaseEntity {
    public Guid BookingId { get; set; }
    public string StripePaymentIntentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "mad"; // Moroccan Dirham
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public Booking? Booking { get; set; }
}
public enum PaymentStatus { Pending=1, Succeeded=2, Failed=3, Refunded=4 }

2. Add Payment to AppDbContext and create migration:
   dotnet ef migrations add AddPayments

3. Create PawFindsBackend/PawFinds.Api/Controllers/PaymentsController.cs:
   - POST /api/payments/create-intent
     * Body: { bookingId: Guid, amount: decimal }
     * Creates Stripe PaymentIntent using Stripe.net
     * Saves Payment entity with status Pending
     * Returns: { clientSecret: string, paymentIntentId: string }
   - POST /api/payments/webhook (no [Authorize])
     * Validates Stripe-Signature header
     * On payment_intent.succeeded: update Payment.Status = Succeeded, Booking.Status = Confirmed
     * Returns 200 OK

4. Add to appsettings.json: "Stripe": { "SecretKey": "", "WebhookSecret": "" }
5. Install: dotnet add package Stripe.net

--- FRONTEND ---

6. Install: npm install @stripe/stripe-js @stripe/react-stripe-js react-datepicker

7. Create pet/front/src/components/booking/BookingFlow.jsx — a modal with 4 steps:

STEP 1 — Choose service
- Fetch available services from the vet/enterprise profile
- Show service cards (name, duration, price in MAD)
- Select one → proceed

STEP 2 — Pick date & time
- react-datepicker calendar (exclude past dates, exclude Sundays)
- Time slot buttons: 09:00, 10:00, 11:00, 14:00, 15:00, 16:00
- Selected slot highlights in coral

STEP 3 — Your details
- Name (pre-filled from user profile if logged in)
- Phone number
- Notes textarea (optional)
- "Review booking" button

STEP 4 — Payment
- Show booking summary (service, date, time, price)
- Stripe CardElement for card input
- "Pay [amount] MAD" button
- On success: show confirmation screen with booking reference

8. Add a "Book Now" button to:
   - VeterinaireProfile cards on /doctors page
   - The vet card in PetDetails (ShelterInfoCard area)
   
9. BookingFlow takes props: { vetId, vetName, isOpen, onClose }

Use existing Modal.jsx as the wrapper. Follow existing Button/Input component patterns.
Store Stripe publishable key in import.meta.env.VITE_STRIPE_PK.
```

---

### STEP 5 — Newsletter + Floating WhatsApp
**Priority:** 🟡 Medium | **Effort:** 45 min | **Files:** `Footer.jsx`, `WhatsAppButton.jsx`, new `NewsletterController.cs`

**What:** Email capture in footer + floating WhatsApp button (bottom-right).  
**Why:** la-spa.fr captures emails for re-engagement. WhatsApp is dominant in Morocco.

**Claude Code Prompt:**
```
You are a React + .NET engineer on PawFinds.

TASK: Add newsletter signup and activate floating WhatsApp button.

FRONTEND — pet/front/src/components/layout/Footer.jsx:
1. Add a newsletter row ABOVE the copyright line:
   <div style newsletter-row>
     <p>Stay updated on new pets & features</p>
     <div style="display:flex;gap:8px">
       <input type="email" placeholder="your@email.com" />
       <button>Subscribe</button>
     </div>
   </div>
   - On submit: POST to /api/newsletter { email }
   - On success: replace input with "✓ You're subscribed!" in teal
   - On error: show "Something went wrong" in coral
   - Match existing dark footer styles

2. Add social media icons row in the Contact column:
   Instagram, Facebook, WhatsApp, TikTok icons (use Lucide icons)
   Each links to href="#" for now (placeholder)

FRONTEND — pet/front/src/components/ui/WhatsAppButton.jsx:
Wrap the existing component to render as a fixed floating button:
   position: fixed, bottom: 24px, right: 24px, z-index: 9999
   - Green circle button (56px) with WhatsApp icon
   - On hover: expand to show "Chat with us" text
   - Links to: https://wa.me/212600000000 (placeholder number from env VITE_WHATSAPP_NUMBER)
Import and render it in Landing.jsx and PetBrowser.jsx (outside the page sections, before Footer).

BACKEND — create PawFindsBackend/PawFinds.Api/Controllers/NewsletterController.cs:
   POST /api/newsletter (no [Authorize]):
   - Body: { email: string }
   - Validate email format
   - Check for duplicate (return 200 if already subscribed, don't error)
   - Save to NewsletterSubscribers table
   
Create PawFindsBackend/PawFinds.Domain/Entities/NewsletterSubscriber.cs:
   { Id: Guid, Email: string, OrganizationId: Guid?, CreatedAt: DateTimeOffset, IsActive: bool }
Add to AppDbContext, create migration: dotnet ef migrations add AddNewsletterSubscribers
```

---

### STEP 6 — List/Map Toggle in PetBrowser
**Priority:** 🟡 Medium | **Effort:** 1–2 hours | **Files:** `PetBrowser.jsx`, new `PetMapView.jsx`

**What:** Toggle between grid view and map view in /pets catalog.  
**Why:** la-spa.fr's refuge page has a map toggle. Lets users discover by location.

**Claude Code Prompt:**
```
You are a React engineer on PawFinds (pet/front/src/).

TASK: Add a grid/map toggle view to PetBrowser.

1. In PetBrowser.jsx, add a view state: const [view, setView] = useState('grid')

2. Add a toggle button group in the top bar (next to sort dropdown):
   [⊞ Grid] [🗺 Map]
   Styled as pill toggle buttons — active one has coral background

3. Create pet/front/src/pages/pets/PetMapView.jsx:
   - Takes props: { pets } (the already-filtered pets array)
   - Renders a Google Maps embed (height: 600px, full width)
   - Centers on Morocco (lat: 31.7917, lng: -7.0926, zoom: 6)
   - Places a marker for each pet using its shelter's Lat/Lng (from pet.shelterLat, pet.shelterLng)
     If no lat/lng, skip that pet
   - On marker click → InfoWindow with:
     * Pet image (small, 60x60)
     * Pet name + breed
     * "View →" button that navigates to /pets/:id
   - If 0 pets have coordinates: show a "No location data available" message

4. In PetBrowser.jsx:
   - When view === 'grid': render existing PetCardGrid + Pagination (no change)
   - When view === 'map': render <PetMapView pets={paged} /> instead
   - Keep FilterSidebar visible in both views

5. Ensure VITE_GOOGLE_MAPS_KEY is used (same key as MapPage from Step 2).
```

---

### STEP 7 — Sticky Booking Widget on Detail Page
**Priority:** 🟡 Medium | **Effort:** 1 hour | **Files:** `PetDetails.jsx`, new `BookingWidget.jsx`

**What:** Sticky right-side widget on vet/shelter detail page with quick booking CTA.  
**Why:** la-spa.fr has a sticky "Contacter le refuge" widget on every establishment page.

**Claude Code Prompt:**
```
You are a React engineer on PawFinds (pet/front/src/).

TASK: Add a sticky booking widget to PetDetails and the Doctors page.

1. Create pet/front/src/components/booking/BookingWidget.jsx:
   Props: { vetId, vetName, price, services[] }
   
   Renders a card (width: 320px) with:
   - Vet/shelter name
   - Starting price (e.g. "From 150 MAD")
   - Service selector dropdown (if services prop provided)
   - Date quick-pick: today, tomorrow, +2 days as pill buttons
   - "Book appointment" button (coral, full width) → opens BookingFlow modal
   - "📞 Call" and "💬 Message" secondary buttons below
   
   Apply: position sticky, top: 88px (below navbar)

2. In pet/front/src/pages/pets/PetDetails.jsx:
   - Change layout to: <div style="display:grid; grid-template-columns: 1fr 320px; gap: 32px">
   - Left column: existing pet content
   - Right column: <BookingWidget vetId={pet.veterinaireProfileId} ... />
   - On mobile (< 768px): BookingWidget moves below the content (grid becomes 1 column)

3. In pet/front/src/pages/doctors/Doctors.jsx:
   - Each doctor card gets a "Book" button that opens BookingFlow modal
     passing the doctor's vetId and name

Wire BookingWidget to open the BookingFlow modal from Step 4.
```

---

### STEP 8 — Ratings & Reviews System
**Priority:** 🟢 Low | **Effort:** 3–4 hours | **Files:** new `Review.cs`, `ReviewsController.cs`, `RatingStars.jsx`

**What:** Star ratings on vet/shelter profiles after completed bookings.  
**Why:** la-spa.fr shows establishment quality. Trust signal for new users.

**Claude Code Prompt:**
```
You are a senior full-stack engineer on PawFinds.

TASK: Add a ratings and reviews system for vets and company profiles.

BACKEND:

1. Create PawFinds.Domain/Entities/Review.cs:
public sealed class Review : BaseEntity {
    public Guid AuthorId { get; set; }         // User who wrote it
    public Guid? VeterinaireProfileId { get; set; }
    public Guid? CompanyProfileId { get; set; }
    public Guid? BookingId { get; set; }       // optional: link to booking
    public int Rating { get; set; }            // 1-5
    public string? Comment { get; set; }
    public User? Author { get; set; }
    public VeterinaireProfile? VeterinaireProfile { get; set; }
    public CompanyProfile? CompanyProfile { get; set; }
}

2. Create ReviewsController.cs:
   - POST /api/reviews — [Authorize(Client)] — submit review
   - GET /api/reviews/vet/:vetId — public — list reviews for a vet (include avg rating)
   - GET /api/reviews/company/:companyId — public — list reviews for a company
   - DELETE /api/reviews/:id — [Authorize] — owner or SuperAdmin can delete

3. Update PublicController:
   - Add avgRating and reviewCount to the vet/company response objects

FRONTEND:

4. Create pet/front/src/components/ui/RatingStars.jsx:
   Props: { rating: number, max: 5, size: 'sm'|'md', interactive: bool, onChange }
   - Renders 5 star icons (filled/empty) using Lucide Star icon
   - If interactive=true: hover and click to set rating
   - Shows numeric rating next to stars (e.g. "4.8")

5. Add to Doctors.jsx:
   - Each doctor card shows average rating stars + review count
   - Below the bento grid: "Reviews" section with list of comments

6. Add to PetDetails.jsx:
   - In the ShelterInfoCard: show shelter average rating

7. After a booking is marked Completed:
   - Show a review prompt modal: "Rate your experience with [vet name]"
   - 1-5 stars selector + optional comment textarea
   - Submit to POST /api/reviews
```

---

### STEP 9 — SSR Migration to Next.js
**Priority:** 🟢 Low (long-term) | **Effort:** 1–2 days | **When:** After all features above are done

**What:** Migrate from Vite CRA to Next.js 14 App Router for SEO.  
**Why:** Both la-spa.fr and PawFinds currently show "You need JavaScript" to crawlers. Moroccan SEO requires indexed pages.

**Claude Code Prompt:**
```
You are a senior React/Next.js engineer.

TASK: Migrate PawFinds frontend from Vite + React to Next.js 14 App Router.

This is a large migration — do it file by file, starting with the most important pages.

PHASE 1 — Setup:
1. Create a new Next.js 14 project: npx create-next-app@latest pawfinds-next --app --no-typescript --tailwind
2. Copy pet/front/src/index.css → app/globals.css (keep all CSS variables and custom classes)
3. Copy pet/front/src/api/client.js → lib/api.js (update base URL to use NEXT_PUBLIC_API_URL)
4. Copy all components/ directory as-is — they are all client components, add 'use client' at top of each

PHASE 2 — Convert pages (one by one):
For each page, create app/[route]/page.jsx:
- Landing → app/page.jsx (add metadata export for SEO title/description)
- PetBrowser → app/pets/page.jsx (use client for filter state)
- PetDetails → app/pets/[id]/page.jsx (use generateMetadata for per-pet SEO)
- Doctors → app/doctors/page.jsx

PHASE 3 — SEO metadata:
Add to app/layout.jsx:
export const metadata = {
  title: 'PawFinds — Find Your Perfect Companion',
  description: 'Browse pets for adoption across Morocco. Connect with shelters and vets.',
  openGraph: { images: ['/images/og-image.jpg'] }
}

Add per-page metadata to PetDetails using generateMetadata async function.

PHASE 4 — API routes (replace /api calls):
Create app/api/revalidate/route.js for ISR revalidation.

Keep the .NET backend unchanged — Next.js just replaces the Vite frontend.
```

---

## 📋 Progress Tracker

| Step | Feature | Status | Notes |
|------|---------|--------|-------|
| 1 | Moroccan color palette | ⬜ TODO | ~30 min |
| 2 | Interactive map page `/carte` | ⬜ TODO | Needs Google Maps API key |
| 3 | Geolocation "near me" | ⬜ TODO | Uses existing CompanyProfile lat/lng |
| 4 | Booking + Stripe payment | ⬜ TODO | Needs Stripe account |
| 5 | Newsletter + WhatsApp button | ⬜ TODO | Fastest win |
| 6 | List/Map toggle in PetBrowser | ⬜ TODO | After Step 2 |
| 7 | Sticky booking widget | ⬜ TODO | After Step 4 |
| 8 | Ratings & reviews | ⬜ TODO | After Step 7 |
| 9 | Next.js SSR migration | ⬜ TODO | Last, long-term |

---

## 🔑 Environment Variables Needed

```env
# Frontend (pet/front/.env)
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
VITE_STRIPE_PK=pk_test_...
VITE_WHATSAPP_NUMBER=212600000000

# Backend (PawFindsBackend/PawFinds.Api/appsettings.json)
"Stripe": {
  "SecretKey": "sk_test_...",
  "WebhookSecret": "whsec_..."
},
"GoogleMaps": {
  "ApiKey": "..."
}
```

---

## 🏗️ Missing DB Tables (to create with migrations)

| Table | Step | Migration name |
|-------|------|----------------|
| `Payments` | Step 4 | `AddPayments` |
| `NewsletterSubscribers` | Step 5 | `AddNewsletterSubscribers` |
| `Reviews` | Step 8 | `AddReviews` |

---

## 💡 How to Use This File with Claude Code

1. Open Claude Code in your project root
2. Say: **"Read CLAUDE.md and PAWFINDS_ROADMAP.md then execute Step [N]"**
3. Claude Code will read both files, understand the full context, and implement exactly what the prompt says
4. After each step: update the Progress Tracker above (change `⬜ TODO` to `✅ DONE`)
5. Commit after each step: `git commit -m "feat: step N - [feature name]"`

### Recommended order for fastest visible impact:
**Step 5 → Step 1 → Step 2 → Step 3 → Step 4 → Step 6 → Step 7 → Step 8 → Step 9**

Start with Step 5 (newsletter + WhatsApp) — it's 45 minutes and makes the site feel alive.  
Then Step 1 (colors) — 30 minutes, completely transforms the look.  
Then Step 2 (map page) — first major feature that matches la-spa.fr.

---

*Generated from full code analysis of PawFinds repo + deep analysis of la-spa.fr architecture.*
