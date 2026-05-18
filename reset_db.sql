SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;

-- Reset all data for PawFindsDb
-- Clears everything so the DbSeeder re-seeds on next startup

DELETE FROM [dbo].[Messages]
DELETE FROM [dbo].[Conversations]
DELETE FROM [dbo].[Favorites]
DELETE FROM [dbo].[Adoptions]
DELETE FROM [dbo].[AdoptRequests]
DELETE FROM [dbo].[Products]
DELETE FROM [dbo].[Pets]
DELETE FROM [dbo].[ContactRequests]
DELETE FROM [dbo].[Advice]
DELETE FROM [dbo].[Notifications]
DELETE FROM [dbo].[Bookings]
DELETE FROM [dbo].[CompanyProfiles]
DELETE FROM [dbo].[VeterinaireProfiles]
DELETE FROM [dbo].[Users]
DELETE FROM [dbo].[Organizations]
