// Mock data for the Community Admin Panel (Jain Patashala)
// Money is stored in paise internally and displayed in Indian lakh format.

export const community = {
  name: 'Shree Mahavir Jain Sangh',
  type: 'sangh',
  code: 'MAHAVIR24',
  principal: 'Rajesh Shah',
  giftWalletBalancePaise: 12_45_000_00, // ₹12,45,000.00
}

// Indian-format currency from paise -> "₹1,00,000"
export function formatINR(paise, { decimals = false } = {}) {
  const rupees = paise / 100
  return (
    '₹' +
    rupees.toLocaleString('en-IN', {
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    })
  )
}

export const points = (n) => n.toLocaleString('en-IN')

export const segments = ['Child', 'College', 'Working', 'Elder']

export const members = [
  { id: 'M-1042', name: 'Aarav Mehta', segment: 'Child', points: 3450, status: 'active', joined: '2026-02-11', phone: '98xxxxxx21' },
  { id: 'M-1043', name: 'Diya Jain', segment: 'College', points: 8210, status: 'active', joined: '2026-01-28', phone: '99xxxxxx08' },
  { id: 'M-1044', name: 'Kunal Sanghvi', segment: 'Working', points: 1200, status: 'active', joined: '2026-03-02', phone: '90xxxxxx55' },
  { id: 'M-1045', name: 'Meera Doshi', segment: 'Elder', points: 5600, status: 'active', joined: '2026-02-19', phone: '97xxxxxx14' },
  { id: 'M-1046', name: 'Rohan Shah', segment: 'College', points: 240, status: 'inactive', joined: '2026-03-22', phone: '88xxxxxx70' },
  { id: 'M-1047', name: 'Ananya Gandhi', segment: 'Child', points: 4900, status: 'active', joined: '2026-01-15', phone: '95xxxxxx33' },
  { id: 'M-1048', name: 'Vivaan Bhansali', segment: 'Working', points: 7650, status: 'active', joined: '2026-02-04', phone: '70xxxxxx91' },
]

export const activities = [
  { id: 'A-301', title: 'Recite the Namokar Mantra', mode: 'Self-declared', points: 50, segment: 'All', due: '2026-06-20', recurrence: 'Daily', status: 'live' },
  { id: 'A-302', title: 'Read a Tirthankara story', mode: 'Auto', points: 200, segment: 'Child', due: '2026-06-25', recurrence: 'None', status: 'live' },
  { id: 'A-303', title: 'Namaskar to parents', mode: 'Self-declared', points: 100, segment: 'All', due: '2026-06-18', recurrence: 'Daily', status: 'live' },
  { id: 'A-304', title: 'Attend temple Pratikraman', mode: 'Proof-based', points: 500, segment: 'Working', due: '2026-06-30', recurrence: 'Weekly', status: 'live' },
  { id: 'A-305', title: 'Finish reading Tattvartha Sutra ch.1', mode: 'Auto', points: 1000, segment: 'College', due: '2026-07-05', recurrence: 'None', status: 'draft' },
  { id: 'A-306', title: 'Help at community seva drive', mode: 'Proof-based', points: 750, segment: 'All', due: '2026-06-28', recurrence: 'None', status: 'live' },
]

export const approvals = [
  { id: 'C-9001', member: 'Diya Jain', activity: 'Attend temple Pratikraman', points: 500, submitted: '2026-06-15 09:12', note: 'Was at Dadar derasar this morning', proof: true },
  { id: 'C-9002', member: 'Vivaan Bhansali', activity: 'Help at community seva drive', points: 750, submitted: '2026-06-15 11:40', note: 'Food distribution at the sangh', proof: true },
  { id: 'C-9003', member: 'Meera Doshi', activity: 'Attend temple Pratikraman', points: 500, submitted: '2026-06-14 18:05', note: 'Evening samayik', proof: true },
  { id: 'C-9004', member: 'Aarav Mehta', activity: 'Help at community seva drive', points: 750, submitted: '2026-06-14 16:22', note: '', proof: true },
]

export const orders = [
  { id: 'ORD-5512', member: 'Diya Jain', type: 'Redemption', item: 'Brass Diya Set', qty: 1, target: 'Home', totalPaise: 1_20_000, status: 'Shipped', tracking: 'DLV89124' },
  { id: 'ORD-5513', member: '—', type: 'Bulk', item: 'Toy Lorry (event)', qty: 25, target: 'Community', totalPaise: 7_50_000, status: 'Confirmed', tracking: '—' },
  { id: 'ORD-5514', member: 'Meera Doshi', type: 'Redemption', item: 'Jain Story Book Set', qty: 1, target: 'Home', totalPaise: 45_000, status: 'Delivered', tracking: 'DLV88090' },
  { id: 'ORD-5515', member: 'Vivaan Bhansali', type: 'Redemption', item: 'Steel Tiffin', qty: 1, target: 'Home', totalPaise: 60_000, status: 'Packed', tracking: '—' },
  { id: 'ORD-5516', member: '—', type: 'Bulk', item: 'Notebook + Pen Kit', qty: 50, target: 'Community', totalPaise: 5_00_000, status: 'Placed', tracking: '—' },
]

export const walletTxns = [
  { id: 'WT-2201', type: 'topup', amountPaise: 5_00_000_00, ref: 'Razorpay rzp_8812', date: '2026-06-10', status: 'success' },
  { id: 'WT-2202', type: 'debit', amountPaise: 7_50_000, ref: 'ORD-5513 (bulk)', date: '2026-06-12', status: 'success' },
  { id: 'WT-2203', type: 'debit', amountPaise: 1_20_000, ref: 'ORD-5512 (redemption)', date: '2026-06-13', status: 'success' },
  { id: 'WT-2204', type: 'debit', amountPaise: 45_000, ref: 'ORD-5514 (redemption)', date: '2026-06-14', status: 'success' },
]

export const admins = [
  { name: 'Rajesh Shah', role: 'Principal', scope: 'Full', grantedBy: '—', since: '2026-01-05' },
  { name: 'Pooja Mehta', role: 'Admin', scope: 'Members, Activities', grantedBy: 'Rajesh Shah', since: '2026-01-20' },
  { name: 'Nilesh Doshi', role: 'Admin', scope: 'Approvals, Orders', grantedBy: 'Rajesh Shah', since: '2026-02-12' },
]

// 7-day engagement series for the dashboard chart
export const engagement = [
  { day: 'Mon', completions: 42 },
  { day: 'Tue', completions: 58 },
  { day: 'Wed', completions: 51 },
  { day: 'Thu', completions: 73 },
  { day: 'Fri', completions: 66 },
  { day: 'Sat', completions: 94 },
  { day: 'Sun', completions: 88 },
]
