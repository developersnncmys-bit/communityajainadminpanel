# Jain Patashala — Community Admin Panel

Day-to-day operator panel for a single community (school / tuition / temple / sangh).
Built with **React + Vite + Tailwind CSS**. Theme: warm saffron / Jain gold.

## Run

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # production build to /dist
```

## Modules (per SOW §7.2)

- **Dashboard** — active members, points distributed, pending approvals, open orders, Gift Wallet, 7-day completions chart
- **Members** — list, segment filter (Child / College / Working / Elder), CSV import, invite
- **Activities** — assign from templates or custom; mode (Auto / Self-declared / Proof-based), points, recurrence, deadline
- **Approval Queue** — review proof-based completions, approve / reject
- **Gift Wallet** — prepaid balance, top-up (Razorpay), transaction history
- **Gift Orders** — redemption + bulk orders, home/community delivery, tracking
- **Reports** — engagement, points issued vs redeemed, most active members
- **Role & Access** — Principal grants/revokes Admin rights, audit log

> All money is held in **paise** internally and shown in Indian lakh format (₹1,00,000).
> Data is mocked in `src/data/mock.js` — wire to the Node/Express + MongoDB backend next.
