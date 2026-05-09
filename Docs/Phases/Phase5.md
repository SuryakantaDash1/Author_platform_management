OVERVIEW
──────────────────────────────────────────────────

Phase 5 introduces the Royalty Calculator — a public-facing interactive tool on the landing page that lets prospective authors estimate their royalty earnings before publishing. All calculation parameters (paper prices, MSP%, MRP%, royalty %, selling expenses) are configured exclusively by Super Admin. The calculator supports three book types: Paperback, E-Book, and Magazine.

Prerequisite: Phase 1 deployed (admin auth exists).




1. ROYALTY CALCULATOR — PUBLIC PAGE (LANDING PAGE)
──────────────────────────────────────────────────

A two-step interactive widget embedded in the HomePage, visible to all visitors without login.



1.1 Tab Navigation

Tab      | Book Type    | Notes
-------- | ------------ | ----------------------------------------
Paperback | Physical book | Uses paper config + printing cost logic
E-Book   | Digital only  | No printing cost; royalty from MRP only
Magazine | Physical      | Uses paper config; separate paper sizes



1.2 Step 1 — Book Details Form

All fields are the same layout (2-column grid). Fields differ slightly by tab.


  PAPERBACK & MAGAZINE (Step 1)

  Field                         | Type        | Source
  ----------------------------- | ----------- | ----------------------------------------
  Select Book Size              | Dropdown    | From admin config (paper sizes)
  Book Paper Quality            | Dropdown    | From admin config (paper names)
  Enter Book Pages              | Number input | User input
  Printing Cost (Auto Calculate)| Read-only   | = Pages × Price Per Page (from config)
  Minimum Selling Price (MSP)   | Read-only   | = Printing Cost × (1 + MSP%/100), rounded
  Book MRP (Input)              | Number input | Must be ≥ MSP × (1 + MRP%/100)

  Note: "Printing Cost" and "MSP" auto-fill live as user types pages. MRP field shows placeholder "Higher {MRP%}% from MSP".


  E-BOOK (Step 1)

  Field                         | Type        | Source
  ----------------------------- | ----------- | ----------------------------------------
  Book MRP                      | Number input | User input (no printing cost logic)

  E-Book has no paper or page inputs. Only MRP is entered.


Button: "Get Result" → validates inputs → moves to Step 2.



1.3 Step 2 — Royalty Results

  Field                               | Type       | Calculation
  ----------------------------------- | ---------- | --------------------------------------------------
  Royalty on Offline Distributor Selling | Read-only | = MRP × (RoyaltyFromMRP% - OfflineExpenses%) / 100
  Royalty on Online Selling           | Read-only  | = MRP × (RoyaltyFromMRP% - OnlineExpenses%) / 100
  Enter Estimate Unit Selling         | Number input | User input
  Estimate Royalty (Auto Calculate)   | Read-only  | = EstimateUnits × avg(OfflineRoyaltyPerUnit, OnlineRoyaltyPerUnit)

  E-Book Step 2: Only "Royalty on Online Selling" and "Estimate Royalty" shown (no offline row).

Buttons: "Get free Consultation" (links to /author/signup or contact section) | "Back" (returns to Step 1 with values preserved).



1.4 Calculation Logic (Frontend — Display Only)

All values displayed in Step 2 are for estimation only. No backend call is made for the calculation — only to fetch config on page load.

  PrintingCost     = pages × pricePerPage
                     (pricePerPage looked up from config by bookSize + paperQuality)

  MSP              = Math.ceil(PrintingCost × (1 + mspPercent / 100))

  MRP_minimum      = Math.ceil(MSP × (1 + mrpPercent / 100))
                     (user-entered MRP must be ≥ MRP_minimum; show warning if below)

  RoyaltyPerUnit_Offline = MRP × (royaltyFromMrpPercent - offlineExpensesPercent) / 100

  RoyaltyPerUnit_Online  = MRP × (royaltyFromMrpPercent - onlineExpensesPercent) / 100

  EstimateRoyalty  = estimateUnits × ((RoyaltyPerUnit_Offline + RoyaltyPerUnit_Online) / 2)

  E-Book:
  RoyaltyPerUnit_Online  = MRP × (royaltyFromMrpPercent - onlineExpensesPercent) / 100
  EstimateRoyalty        = estimateUnits × RoyaltyPerUnit_Online




2. SUPER ADMIN — CALCULATOR CONFIGURATION PAGE
──────────────────────────────────────────────────

A dedicated page accessible only to Super Admin under Admin Settings or a new "Calculator Config" route.



2.1 Paper Configuration Section (Paperback & Magazine)

Admin can define multiple paper types. Each row:

  Field              | Type   | Notes
  ------------------ | ------ | ------------------------------------------
  Paper Name         | Text   | e.g. "Regular", "Glossy", "Matte"
  Paper Size         | Text   | e.g. "A4", "A5", "6×9 inch"
  Price Per Page     | Number | In Rs (e.g. 1.50 per page)

  "  + Add Paper" button adds a new row. Rows can be deleted individually.
  Minimum 1 row required.
  Each (Paper Name + Paper Size) combination must be unique.



2.2 Pricing Rules Section (Global — applies to all book types)

  Field                           | Type   | Notes
  ------------------------------- | ------ | ------------------------------------------
  Minimum Selling Price (MSP) %   | Number | Markup % applied over Printing Cost
  Book MRP %                      | Number | Minimum % above MSP that MRP must be set
  Royalty from MRP %              | Number | Author's royalty as % of MRP
  Offline Selling Expenses %      | Number | Deducted from royalty for offline channel
  Online Selling Expenses %       | Number | Deducted from royalty for online channel



2.3 E-Book Section (Separate config tab or sub-section)

  Field                           | Type   | Notes
  ------------------------------- | ------ | ------------------------------------------
  Royalty from MRP % (E-Book)     | Number | May differ from paperback royalty %
  Online Selling Expenses % (E-Book) | Number | Platform fee for digital books



2.4 Magazine Section

  Inherits paper config rows filtered to magazine-specific sizes.
  Magazine uses the same MSP%, MRP%, Royalty% as Paperback unless overridden.

  Field                           | Type   | Notes
  ------------------------------- | ------ | ------------------------------------------
  Override Royalty from MRP %     | Number | Optional — leave blank to use global value



2.5 Buttons

  "Save & Submit" — saves all configuration. If no config exists, creates it. Otherwise updates.
  Config is versioned — previous values stored in audit log (no edit = no deletion).



3. DATA MODEL
──────────────────────────────────────────────────



3.1 CalculatorConfig (MongoDB collection — single document)

  Field                     | Type             | Notes
  ------------------------- | ---------------- | ----------------------------------------
  paperConfigs              | Array of objects | [{ paperName, paperSize, pricePerPage }]
  mspPercent                | Number           | e.g. 50 (means 50% markup)
  mrpPercent                | Number           | e.g. 40 (MRP must be ≥ MSP + 40%)
  royaltyFromMrpPercent     | Number           | e.g. 30 (author gets 30% of MRP)
  offlineExpensesPercent    | Number           | e.g. 15
  onlineExpensesPercent     | Number           | e.g. 10
  ebookRoyaltyPercent       | Number           | e.g. 35
  ebookOnlineExpensesPercent| Number           | e.g. 10
  magazineRoyaltyOverride   | Number or null   | null = use royaltyFromMrpPercent
  updatedBy                 | String           | Admin ID
  updatedAt                 | Date             |

  Only one document exists (upserted on save). No delete operation.




4. API ENDPOINTS
──────────────────────────────────────────────────

  Module           | Method | Endpoint                            | Auth         | Description
  ---------------- | ------ | ----------------------------------- | ------------ | --------------------------------
  Calculator       | GET    | /api/public/calculator-config       | None (public)| Fetch config for public calculator
  Calculator       | GET    | /api/admin/calculator-config        | Super Admin  | Fetch config for admin edit form
  Calculator       | PUT    | /api/admin/calculator-config        | Super Admin  | Save / update full configuration




5. FRONTEND ROUTES & COMPONENTS
──────────────────────────────────────────────────

  Route / Component                              | Location        | Notes
  ---------------------------------------------- | --------------- | ----------------------------
  RoyaltyCalculator section in HomePage          | Public          | Embedded widget, no route change
  /admin/calculator-config                       | Admin           | New admin route
  AdminCalculatorConfig page                     | Admin           | Form for Super Admin
  calculatorService.ts                           | Frontend service | getPublicConfig(), getAdminConfig(), saveConfig()
  API_ENDPOINTS.CALCULATOR                       | endpoints.ts    | PUBLIC_CONFIG, ADMIN_CONFIG




6. ADMIN SIDEBAR & ROUTING CHANGES
──────────────────────────────────────────────────

  Add to Admin sidebar (under Settings group or standalone):
    "Calculator Config"  →  /admin/calculator-config
    Icon: Calculator icon (lucide-react)

  Add to App.tsx:
    <Route path="calculator-config" element={<AdminCalculatorConfig />} />

  Only Super Admin role can access — sub_admin sees the menu item greyed out or hidden.




7. UX DETAILS — PUBLIC CALCULATOR
──────────────────────────────────────────────────

  • Widget placed as a full-width section on the HomePage between the Features/Stats section and the Testimonials section.
  • Section heading: "Royalty Calculator" / subheading: "Estimate your royalty before publishing your book"
  • Left side: decorative author illustration (as shown in design)
  • Right side: form in a card with subtle border
  • Tab bar: Paperback | E-Book | Magazine — underline style, active tab bold
  • Inputs use floating-label or labelled border style (matches design screenshots)
  • Auto-calculated fields are read-only with grey background
  • MRP input validates in real-time; if below minimum shows inline warning: "MRP must be at least Rs {min}"
  • "Get Result" disabled until all required inputs are valid
  • Step transition: smooth fade/slide — Step 1 fades out, Step 2 fades in (no page reload)
  • "Get free Consultation" scrolls to the signup/contact section or navigates to /author/signup
  • If admin has never saved a config, calculator shows a placeholder message: "Calculator coming soon"




8. ADMIN UX DETAILS — CALCULATOR CONFIG PAGE
──────────────────────────────────────────────────

  • Page title: "Calculator Configuration"
  • Paper rows rendered in a 3-column grid (Paper Name | Paper Size | Price Per Page | Delete icon)
  • "+ Add Paper" button at bottom right of paper section adds a new blank row
  • Pricing rules section below paper section in a 3-column grid
  • Validation: all fields required before save; numeric fields must be positive numbers
  • On save: success toast "Calculator configuration saved"
  • On page load: existing config pre-filled if already configured




9. SYSTEM NOTIFICATIONS — PHASE 5
──────────────────────────────────────────────────

  Event                              | Recipient   | Channel
  ---------------------------------- | ----------- | --------
  Calculator config saved by admin   | Super Admin | Audit log only




10. OUT OF SCOPE — PHASE 5
──────────────────────────────────────────────────

  [OUT OF SCOPE] Saving user's calculator results / history
  [OUT OF SCOPE] PDF export of royalty estimate
  [OUT OF SCOPE] WhatsApp / email of estimate to user
  [OUT OF SCOPE] Advanced book cost breakdown (cover design, formatting fees in calculator)
  [OUT OF SCOPE] Currency selector (INR only)
  [OUT OF SCOPE] Sub Admin access to calculator config
