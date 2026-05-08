# CLAUDE.md

## Project Overview

This project is called **PawFinds**.

It is a pet adoption platform that I am converting into a SaaS.

Current stack:
- Backend: Laravel (located in `pet/bb`)
- Frontend: React (located in `pet/front`)
- Database: MySQL (will be migrated to SQL Server)

Goal:
- Rebuild backend using ASP.NET Core (.NET 8)
- Use SQL Server
- Transform into multi-tenant SaaS

---

## Current Backend (Laravel)

Location: `pet/bb`

Main features:
- Authentication (admin + client)
- Pet CRUD
- Adoption requests
- Notifications
- Messaging (partial)

Important issues:
- Schema mismatches (controllers ≠ migrations)
- Weak authorization (admin not protected properly)
- No multi-tenancy
- Messy structure (logic inside controllers)

---

## Target Architecture (.NET)

We are rebuilding backend using:

- ASP.NET Core Web API (.NET 8)
- Entity Framework Core
- SQL Server
- JWT Authentication
- Role-based Authorization

---

## Rules for Claude

When analyzing or generating code:

1. Always use ASP.NET Core (.NET 8), NOT Laravel
2. Do NOT generate Vue code (we use React)
3. Follow Clean Architecture:
   - Domain
   - Application
   - Infrastructure
   - API
4. Always include:
   - DTOs
   - Services
   - Proper validation
5. Respect SaaS structure:
   - organization_id in all tables
   - multi-tenant logic

---

## What I want from Claude

- Analyze Laravel code and explain logic
- Help rebuild features in .NET step by step
- Generate clean, production-ready architecture
- Identify bugs and missing features

---

## Important

Do NOT invent project structure.
Always analyze real files before answering.