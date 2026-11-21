# URBAN DRIVER (अर्बन ड्राइवर)
### *Your Car. Your Trusted Driver. Your Family’s Peace of Mind.*

Urban Driver is a full-stack, senior-friendly, and family-connected driver-booking web application. It enables vehicle owners to hire verified professional drivers to drive their own personal vehicles for hospital visits, daily errands, and recurring journeys, with consent-based remote family coordination.

---

## 🌟 The 6 Core Product Differentiators

1. **Senior Citizen Mode (वरिष्ठ नागरिक मोड):**
   - High-contrast UI with large font sizes (20px+) and large touch targets (48px+).
   - Instant 1-click toggle between **English** and **हिन्दी (Hindi)**.
   - Browser Web Speech API text-to-speech audio feedback and speech recognition.
   - 1-tap booking for saved medical and routine destinations (Apollo Clinic, Manipal Hospital, Temple, Market).
   - Prominent 1-tap Safe Arrival Confirmation button (*"हाँ, मैं सुरक्षित पहुँच गया हूँ"*).

2. **Family Guardian Dashboard:**
   - Authorised adult children can remotely manage and monitor journeys for parents in another city.
   - Granular permissions: View trips, Book trips, Pay remotely, Receive SMS/app arrival alerts, Contact support.
   - Complete consent-driven architecture: vehicle owners can revoke permissions at any moment.

3. **Trusted Driver Circle (विश्वसनीय ड्राइवर मंडल):**
   - Save familiar, vetted drivers whom the senior passenger trusts.
   - Priority matching for recurring doctor visits, dialysis schedules, and temple trips.
   - Automatic fallback suggestions if the preferred driver is unavailable.

4. **Arrival Confirmation & Exception Alerts:**
   - A journey is not closed until the senior passenger or guardian confirms safe arrival.
   - Missing confirmation triggers escalating watchdog reminders to family guardians and operations administrators.

5. **Rule-Based Vehicle-Fit Driver Matching:**
   - Deterministic matching engine verifies transmission compatibility (Manual vs. Automatic), fuel type/EV certification, vehicle size clearance, and service area.
   - Displays transparent match scores (e.g., *"Automatic Transmission Expert"*, *"EV Certified Specialist"*, *"Trusted Family Circle"*). No black-box AI claims.

6. **Assisted Phone & WhatsApp Concierge Desk:**
   - 24/7 Toll-Free helpline (`1800 555 0199`) and automated WhatsApp click-to-chat integration (`+91 98765 43210`).
   - Operator intake desk allowing administrators to enter and dispatch bookings on behalf of senior callers.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-username/urban-driver.git
cd urban-driver
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*Note: Urban Driver comes with an **interactive In-Memory & LocalStorage Demo Engine**. It runs and functions 100% out-of-the-box without requiring external database or payment credentials.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm start
```

---

## 👥 Demo Personas & Test Accounts

Urban Driver includes a floating **Demo Control Bar** (bottom-right corner) that lets mentors, investors, and testers switch between all 4 roles instantaneously:

| Role | Persona Name | Key Scenario / Responsibilities |
|---|---|---|
| **Senior Customer** | **Ramesh Sharma** | 74-yr-old Bengaluru resident. Owns Hyundai Creta (Auto). Uses Senior Citizen Mode in Hindi for Manipal Hospital visits. |
| **Family Guardian** | **Vikram Sharma** | Ramesh’s son living in Delhi. Books trips, pays remotely, and tracks father's hospital rides in real-time. |
| **Verified Driver** | **Suresh Kumar** | 8 yrs exp, 4.95 rating. Automatic & EV certified. Favorite driver in Ramesh’s Trusted Driver Circle. |
| **Operations Admin** | **Ananya Sen** | Operations Controller. Reviews pending driver documents, dispatches assisted calls, audits pricing, and tracks pilot KPIs. |

---

## 🔄 The 12 End-to-End Workflows

1. **Workflow 1: New Customer Onboarding**
   - Register at `/register` → Complete profile → Add vehicle (`/customer/vehicles`) → Browse verified drivers → Confirm booking.

2. **Workflow 2: Vehicle-Fit Driver Matching**
   - Select an EV or Manual car in `/customer/book` → Rule engine filters incompatible drivers → Transparent match score and capability badges displayed.

3. **Workflow 3: Senior Citizen Mode & Voice Readout**
   - Tap **Senior Mode** in the top navigation bar → Switch to Hindi → Large typography activates → Tap "स्क्रीन पढ़कर सुनाएं" for audio speech synthesis.

4. **Workflow 4: Family Guardian Booking & Remote Payment**
   - Switch to **Vikram Sharma** → Go to `/family/book` → Select father's Creta → Enter Manipal Hospital destination → Pay fare remotely → Father receives trip confirmation.

5. **Workflow 5: Trusted Driver Circle**
   - Go to `/customer/drivers` → Star driver Suresh Kumar → View in `/customer/trusted-drivers` → Tap "Request Preferred Driver" for 1-click booking.

6. **Workflow 6: Driver Verification Queue**
   - Switch to **Ananya Sen (Admin)** → Go to `/admin/verification` → Inspect Anand Patil's driving license scan → Add audit note → Tap **"Approve & Verify Driver"**.

7. **Workflow 7: Driver Trip Execution Lifecycle**
   - Switch to **Suresh Kumar (Driver)** → View assigned trip in `/driver/dashboard` → Tap **Mark En Route** → Tap **Arrived at Pickup** → Tap **Start Trip** → Tap **Complete Trip** → Status transitions to *Arrival Confirmation Pending*.

8. **Workflow 8: Delayed Arrival Exception Alert**
   - On the Demo Control Bar, tap **"Test Delay Alert"** → Watchdog simulates 30-min unconfirmed arrival → Guardian receives SMS/app alert → Admin incident report created.

9. **Workflow 9: Assisted Phone & WhatsApp Booking**
   - Open Assisted Booking modal via phone icon → Submit callback request → Go to `/admin/dashboard` → View request in Assisted Queue → Dispatch driver.

10. **Workflow 10: Customer Support & Complaint Handling**
    - Go to `/customer/support` → Raise ticket regarding hospital speed-breakers → Admin replies from `/admin/support` → Status updates to *Resolved*.

11. **Workflow 11: Recurring Journey Schedule**
    - Book driver with "Recurring Journey" checkbox checked (e.g., Mon, Wed, Fri dialysis appointments) → Manage recurring occurrences.

12. **Workflow 12: Payment Processing**
    - Choose Razorpay Test Mode or Guardian Pre-Pay in `/customer/book` → Gateway response verified server-side → Transaction ledger updated.

---

## 🗄️ Database Architecture (31 PostgreSQL Tables)

A production-grade SQL migration file is available at `supabase/schema.sql` containing all 31 tables, foreign keys, indexes, and Row Level Security (RLS) policies:

1. `profiles`
2. `user_roles`
3. `customers`
4. `drivers`
5. `driver_documents`
6. `driver_vehicle_capabilities`
7. `vehicles`
8. `saved_addresses`
9. `family_relationships`
10. `family_permissions`
11. `driver_favourites`
12. `bookings`
13. `recurring_bookings`
14. `booking_status_history`
15. `driver_availability`
16. `trip_locations`
17. `arrival_confirmations`
18. `notifications`
19. `payments`
20. `payment_transactions`
21. `pricing_rules`
22. `mobility_plans`
23. `customer_support_tickets`
24. `ticket_messages`
25. `incident_reports`
26. `driver_ratings`
27. `service_areas`
28. `assisted_booking_requests`
29. `institutional_leads`
30. `customer_feedback`
31. `audit_logs`

---

## 🛡️ Security, Privacy & Safety Disclaimers

- **Zero Automatic Access:** Family members only receive visibility after explicit customer invitation and consent.
- **Audit-Grade Verification:** Drivers are never verified solely by document upload; an administrator must review and record verification notes.
- **Disclaimer:** Urban Driver does not claim guaranteed insurance coverage or guarantee zero transit risk. Primary comprehensive insurance of the vehicle applies.
- **Privacy Policy:** Telematics tracking operates strictly during active trips and immediately terminates after safe arrival confirmation.

---

## 📄 License
Copyright © 2026 Urban Driver Technologies Pvt. Ltd. All rights reserved.
