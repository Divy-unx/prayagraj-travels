export const STOPS = [
  'Civil Lines','Naini','Jhunsi','Phaphamau','Kareli','Chowk',
  'Bamrauli','Airport','Sangam','Allahabad University','Teliyarganj',
  'Mundera','High Court','Zero Road',
]

export const OPERATORS = [
  { id:'upsrtc', name:'UPSRTC', full:'Uttar Pradesh State Road Transport Corp', color:'#1A56DB', rating:4.1, reviews:'1.2K', discount:'20% off for Students', tags:['New Buses','Live Tracking'], css:'op-upsrtc' },
  { id:'pcb',    name:'Prayagraj City Bus', full:'PCB Smart Urban Transport', color:'#00B562', rating:4.3, reviews:'876', discount:'15% off with City Pass', tags:['New Buses','Bus Photos'], css:'op-pcb' },
  { id:'triveni',name:'Triveni Transport', full:'Triveni Roadways Pvt Ltd', color:'#D97706', rating:4.5, reviews:'2.1K', discount:'Extra ₹30 off on return trip', tags:['AC Premium','Safety Check'], css:'op-triveni' },
]

export const POPULAR_ROUTES = [
  { from:'Civil Lines', to:'Naini', fare:'₹15–₹25', duration:'35 min', icon:'🏛️' },
  { from:'Sangam', to:'Allahabad University', fare:'₹10–₹20', duration:'20 min', icon:'🏫' },
  { from:'Civil Lines', to:'Airport', fare:'₹25–₹40', duration:'50 min', icon:'✈️' },
  { from:'Chowk', to:'Jhunsi', fare:'₹15–₹30', duration:'40 min', icon:'🌉' },
  { from:'High Court', to:'Naini', fare:'₹20–₹35', duration:'45 min', icon:'⚖️' },
  { from:'Zero Road', to:'Bamrauli', fare:'₹15–₹25', duration:'30 min', icon:'🛣️' },
  { from:'Phaphamau', to:'Sangam', fare:'₹20–₹30', duration:'40 min', icon:'🕌' },
  { from:'Mundera', to:'Civil Lines', fare:'₹25–₹40', duration:'55 min', icon:'🏙️' },
]

export const BUS_TYPES = ['AC Sleeper','AC Seater','Non AC Seater','Deluxe','Mini Bus']

export const AMENITIES = [
  { icon:'❄️', label:'AC' },
  { icon:'🔌', label:'Charging Point' },
  { icon:'📡', label:'Live Tracking' },
  { icon:'💺', label:'Reclining Seats' },
  { icon:'🎥', label:'Entertainment' },
  { icon:'🛡️', label:'Sanitised' },
]

export const FAQS = [
  {
    category: 'Booking',
    items: [
      { q: 'How do I book a bus ticket on Prayagraj Travels?', a: 'Select your source and destination stops, choose a travel date, search for available buses, pick your preferred bus, select a seat, fill in passenger details, and confirm your booking. You\'ll receive a confirmation immediately.' },
      { q: 'Can I book tickets for someone else?', a: 'Yes. Simply enter the passenger\'s name and phone number in the booking form. The ticket will be issued in their name.' },
      { q: 'How far in advance can I book?', a: 'You can book up to 30 days in advance. We recommend booking early for popular routes, especially during festivals and holidays.' },
      { q: 'Is there a booking fee?', a: 'No hidden charges. The fare shown is the final amount you pay. No booking fees, no convenience charges.' },
    ]
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods are accepted?', a: 'We accept UPI (PhonePe, GPay, Paytm), debit/credit cards (Visa, Mastercard, RuPay), net banking, and wallet balance.' },
      { q: 'Is the payment gateway secure?', a: 'Yes. All transactions are encrypted with 256-bit SSL. We are PCI-DSS compliant and never store your card details.' },
      { q: 'Can I pay at the bus stop?', a: 'Currently, only online pre-booking is supported. This ensures your seat is reserved and avoids last-minute rush.' },
    ]
  },
  {
    category: 'Cancellation',
    items: [
      { q: 'What is the cancellation policy?', a: 'Cancellations made 2+ hours before departure receive a full refund. Cancellations within 2 hours receive 50% refund. No-shows receive no refund.' },
      { q: 'How long do refunds take?', a: 'Refunds are processed within 24–48 hours and credited to your original payment method within 3–5 business days.' },
      { q: 'How do I cancel my booking?', a: 'Go to My Bookings in your dashboard, find the booking you want to cancel, and click "Cancel Ticket". You can also call our support line.' },
    ]
  },
  {
    category: 'Tracking',
    items: [
      { q: 'How does live bus tracking work?', a: 'Our buses are equipped with GPS devices that update location every 30 seconds. Open Live Tracking in your booking to see real-time bus position.' },
      { q: 'Can I track a bus without a booking?', a: 'You can view the general bus route, but live GPS tracking requires an active booking for that bus.' },
      { q: 'What if the bus is delayed?', a: 'You\'ll receive an SMS and in-app notification if your bus is delayed by more than 10 minutes. ETA is updated in real time.' },
    ]
  },
]

export const TESTIMONIALS = [
  { name:'Aarav Sharma', role:'Student, Allahabad University', avatar:'AS', text:'Prayagraj Travels has completely changed how I commute. The live tracking feature means I never miss my bus. Booking is so easy — takes less than 2 minutes!', rating:5, route:'Civil Lines → Allahabad University' },
  { name:'Priya Verma', role:'Office Professional, Civil Lines', avatar:'PV', text:'I travel to Naini every day for work. The AC buses are extremely comfortable, and the mobile app makes booking seamless. Best travel service in the city.', rating:5, route:'Civil Lines → Naini' },
  { name:'Rajesh Kumar', role:'Businessman, Chowk', avatar:'RK', text:'The student discount is fantastic. I save over ₹500 every month. The Triveni Transport buses are very punctual and the drivers are professional.', rating:4, route:'Chowk → High Court' },
  { name:'Meera Tripathi', role:'Teacher, Jhunsi', avatar:'MT', text:'Excellent service. I appreciate how safe and well-maintained the buses are. The seat selection feature is very convenient — I always get a window seat!', rating:5, route:'Sangam → Civil Lines' },
  { name:'Vikram Singh', role:'Engineer, Phaphamau', avatar:'VS', text:'The refund process was smooth when I had to cancel a trip. Customer support was responsive and helpful. Truly a world-class local transport experience.', rating:4, route:'Airport → Civil Lines' },
]

export const STATS = [
  { label:'Daily Passengers', value:'50,000+', icon:'👥' },
  { label:'Bus Routes', value:'14 Stops', icon:'🗺️' },
  { label:'Active Buses', value:'100+', icon:'🚌' },
  { label:'Satisfied Customers', value:'98%', icon:'⭐' },
]

export const OFFERS = [
  { code:'FIRST50', title:'First Ride Flat 50% Off', desc:'New users get flat 50% off on their first booking. Use code at checkout.', discount:'50% OFF', validTill:'31 May 2026', color:'from-blue-600 to-blue-800', type:'New User' },
  { code:'STUDENT20', title:'Student Discount 20% Off', desc:'Show valid student ID at boarding to avail 20% off on all UPSRTC buses.', discount:'20% OFF', validTill:'31 Dec 2026', color:'from-emerald-600 to-emerald-800', type:'Students' },
  { code:'CITYPASS15', title:'City Pass 15% Off', desc:'Prayagraj City Bus commuters save 15% with the monthly City Pass.', discount:'15% OFF', validTill:'Ongoing', color:'from-purple-600 to-purple-800', type:'Regular' },
  { code:'RETURN30', title:'Return Trip ₹30 Off', desc:'Book return journey on Triveni Transport and save extra ₹30 automatically.', discount:'₹30 OFF', validTill:'30 Jun 2026', type:'Return', color:'from-amber-600 to-amber-800' },
  { code:'WEEKEND10', title:'Weekend Special 10% Off', desc:'Travel on weekends and enjoy extra 10% off on all routes.', discount:'10% OFF', validTill:'Every Weekend', color:'from-rose-600 to-rose-800', type:'Weekend' },
  { code:'MONSOON25', title:'Monsoon Special 25% Off', desc:'Beat the rains with comfortable AC buses at a special discount this season.', discount:'25% OFF', validTill:'30 Sep 2026', color:'from-cyan-600 to-cyan-800', type:'Seasonal' },
]
