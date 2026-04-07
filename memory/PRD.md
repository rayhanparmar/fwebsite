# Shree Mother Gold & Diamond Jewellery - B2B Platform PRD

## Original Problem Statement
Build a premium B2B jewellery platform for Shree Mother Gold and Diamond Jewellery serving retailers only.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + React Router v7
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: JWT Bearer tokens with bcrypt password hashing
- **Design**: Cormorant Garamond headings, Manrope body, green accents (#359E58, #4AB868, #6CC284)

## User Personas
1. **Admin (Owner)** - jaysachetijs@gmail.com - manages retailers, products, enquiries
2. **Retailer** - registers, gets approved by admin, browses catalogue, places enquiries

## Core Requirements (Static)
- Gated access: Only approved retailers can browse products
- 16 product categories × 30 products = 480 products
- Product customization: Metal, Purity, Stone, Diamond Quality/Color, Size
- 22KT purity auto-locks to Yellow Gold
- Enquiry cart for bulk enquiries
- Customisation request workflow
- Admin panel for retailer approval and product management

## What's Been Implemented (2026-04-07)
- [x] Full homepage with hero, features, process steps, stats, CTA
- [x] JWT auth with retailer registration & approval flow
- [x] Admin panel with tabs: Overview, Retailers, Products, Enquiries, Customisations
- [x] Product catalogue with 16 category grid
- [x] Product listing (30 per category) with star ratings
- [x] Product detail with 3-image slider and 6 customization dropdowns
- [x] Enquiry cart (add/remove/submit)
- [x] Customisation request page with CAD workflow explanation
- [x] About page with company story
- [x] Contact page with form, WhatsApp, phone, email
- [x] Footer with company info and quick links
- [x] 480 products seeded with stock images
- [x] Mobile-responsive design

## Mocked Features
- Email notifications (logged to console, not sent)
- Product images (stock placeholders, admin can replace via admin panel)

## Prioritized Backlog
### P0 (Critical)
- Real email integration (SendGrid/Resend) for enquiry notifications
- Real product image uploads via object storage

### P1 (Important)
- Product search/filter by stone type, metal, weight, style
- Enquiry status tracking (pending → processing → completed)
- Password reset flow
- WhatsApp order notification

### P2 (Nice to have)
- Product bulk import via CSV
- Analytics dashboard for admin
- Retailer order history
- PDF enquiry confirmation generation

## Next Tasks
1. Integrate email service for enquiry notifications
2. Set up object storage for product image uploads
3. Add product filtering on catalogue page
4. Add enquiry status management in admin panel
