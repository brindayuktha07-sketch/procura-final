/* =============================================================
   PROCURA — shared application state
   All three portals read/write this single object, so any
   change made by a Centre is immediately visible to Farmer and
   Officer views the next time those views render.
   ============================================================= */

const CROPS = ["Paddy", "Wheat", "Cotton", "Maize", "Groundnut", "Soybean"];
const CROP_EMOJI = { Paddy: "🌾", Wheat: "🌿", Cotton: "☁️", Maize: "🌽", Groundnut: "🥜", Soybean: "🫘" };
const PRODUCE_STAGES = [
  "Produce Submitted",
  "Waiting",
  "Quality Verification",
  "Produce Approved",
  "Payment Initiated",
  "Payment Transferred"
];
const OPERATING_STATUSES = ["OPEN", "BUSY", "HIGH CONGESTION", "TEMPORARILY CLOSED", "PROCUREMENT PAUSED"];
const CLOSED_STATUSES = ["TEMPORARILY CLOSED", "PROCUREMENT PAUSED"];

const State = {
  centres: [
    {
      id: "PC-TG-00427",
      password: "Procura@123",
      name: "ABC Procurement Centre",
      location: "Hyderabad",
      crops: ["Paddy"],
      capacity: 10000,
      received: 8700,
      baseQueue: 28,
      activeCounters: 2,
      avgServiceTime: 15,
      operatingStatus: "HIGH CONGESTION",
      servedToday: 62,
      farmers: []
    },
    {
      id: "PC-TG-00428",
      password: "Procura@456",
      name: "GreenField Procurement Centre",
      location: "Hyderabad",
      crops: ["Paddy"],
      capacity: 12000,
      received: 4200,
      baseQueue: 7,
      activeCounters: 4,
      avgServiceTime: 12,
      operatingStatus: "OPEN",
      servedToday: 35,
      farmers: []
    },
    {
      id: "PC-TG-00429",
      password: "Procura@789",
      name: "RuralAgri Procurement Centre",
      location: "Hyderabad",
      crops: ["Paddy", "Maize"],
      capacity: 8000,
      received: 6000,
      baseQueue: 15,
      activeCounters: 3,
      avgServiceTime: 15,
      operatingStatus: "BUSY",
      servedToday: 45,
      farmers: []
    }
  ],

  farmers: [
    { name: "Ravi Kumar", mobile: "9876543210", location: "Hyderabad", bookings: [] },
    { name: "Suresh Reddy", mobile: "9876543211", location: "Hyderabad", bookings: [] },
    { name: "Anitha Devi", mobile: "9876543212", location: "Hyderabad", bookings: [] },
    { name: "Mahesh Kumar", mobile: "9876543213", location: "Hyderabad", bookings: [] },
    { name: "Lakshmi", mobile: "9876543214", location: "Hyderabad", bookings: [] },
    { name: "Priya", mobile: "9876543215", location: "Hyderabad", bookings: [] }
  ],

  officer: { phone: "9000012345", password: "Officer@123" },

  paymentIssues: [],

  // small historical dataset used only for simple rule-based pattern calculations
  historicalData: [
    { date: "2026-08-28", hour: 9,  centreId: "PC-TG-00427", crop: "Paddy", arrived: 6, served: 5, queueSize: 12, activeCounters: 2, avgServiceTime: 15, received: 900 },
    { date: "2026-08-28", hour: 11, centreId: "PC-TG-00427", crop: "Paddy", arrived: 9, served: 6, queueSize: 20, activeCounters: 2, avgServiceTime: 15, received: 1400 },
    { date: "2026-08-29", hour: 9,  centreId: "PC-TG-00427", crop: "Paddy", arrived: 7, served: 6, queueSize: 15, activeCounters: 2, avgServiceTime: 15, received: 1000 },
    { date: "2026-08-29", hour: 11, centreId: "PC-TG-00427", crop: "Paddy", arrived: 10, served: 7, queueSize: 24, activeCounters: 2, avgServiceTime: 15, received: 1550 },
    { date: "2026-08-30", hour: 10, centreId: "PC-TG-00427", crop: "Paddy", arrived: 8, served: 6, queueSize: 22, activeCounters: 2, avgServiceTime: 15, received: 1200 },

    { date: "2026-08-28", hour: 9,  centreId: "PC-TG-00428", crop: "Paddy", arrived: 4, served: 4, queueSize: 4, activeCounters: 4, avgServiceTime: 12, received: 700 },
    { date: "2026-08-29", hour: 11, centreId: "PC-TG-00428", crop: "Paddy", arrived: 5, served: 5, queueSize: 6, activeCounters: 4, avgServiceTime: 12, received: 900 },
    { date: "2026-08-30", hour: 10, centreId: "PC-TG-00428", crop: "Paddy", arrived: 3, served: 3, queueSize: 5, activeCounters: 4, avgServiceTime: 12, received: 650 },
    { date: "2026-08-30", hour: 14, centreId: "PC-TG-00428", crop: "Paddy", arrived: 6, served: 5, queueSize: 8, activeCounters: 4, avgServiceTime: 12, received: 950 },

    { date: "2026-08-28", hour: 10, centreId: "PC-TG-00429", crop: "Paddy", arrived: 5, served: 4, queueSize: 12, activeCounters: 3, avgServiceTime: 15, received: 800 },
    { date: "2026-08-29", hour: 10, centreId: "PC-TG-00429", crop: "Maize", arrived: 4, served: 4, queueSize: 10, activeCounters: 3, avgServiceTime: 15, received: 600 },
    { date: "2026-08-30", hour: 11, centreId: "PC-TG-00429", crop: "Paddy", arrived: 6, served: 5, queueSize: 16, activeCounters: 3, avgServiceTime: 15, received: 950 }
  ],

  tokenCounter: 501,
  bookingCounter: 7001,
  issueCounter: 1024,

  // session
  currentFarmer: null,
  currentCentre: null,
  officerLoggedIn: false,

  // in-progress booking wizard
  selectedCrop: null,
  selectedCentreId: null
};

/* =============================================================
   UTILITIES
   ============================================================= */

const Utils = {
  round(n, d = 0) {
    const f = Math.pow(10, d);
    return Math.round(n * f) / f;
  },
  clamp(n, min, max) { return Math.max(min, Math.min(max, n)); },
  fmt(n) { return Number(n).toLocaleString("en-IN"); },
  slugStatus(s) { return s.toLowerCase().replace(/[^a-z]/g, ""); },
  toast(msg, type = "") {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.className = "toast " + type;
    el.classList.remove("hidden");
    clearTimeout(Utils._toastTimer);
    Utils._toastTimer = setTimeout(() => el.classList.add("hidden"), 3200);
  },
  todayISO() {
    return new Date().toISOString().slice(0, 10);
  },
  formatTime(date) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  },
  formatDate(ms) {
    if (!ms) return "—";
    return new Date(ms).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
  },
  generateSlots() {
    const slots = [];
    for (let h = 9; h < 13; h++) { slots.push(`${h}:00 - ${h}:30`); slots.push(`${h}:30 - ${h + 1}:00`); }
    for (let h = 14; h < 17; h++) { slots.push(`${h}:00 - ${h}:30`); slots.push(`${h}:30 - ${h + 1}:00`); }
    return slots;
  }
};

/* =============================================================
   CENTRE METRIC CALCULATIONS  (single source of truth)
   ============================================================= */

const Metrics = {
  waitingEntries(centre) { return centre.farmers.filter(f => f.queueStatus === "waiting"); },
  processingEntries(centre) { return centre.farmers.filter(f => f.queueStatus === "processing"); },
  completedEntries(centre) { return centre.farmers.filter(f => f.queueStatus === "completed"); },

  totalQueue(centre) {
    return centre.baseQueue + this.waitingEntries(centre).length;
  },

  remaining(centre) {
    return Utils.clamp(centre.capacity - centre.received, 0, centre.capacity);
  },

  utilization(centre) {
    return Utils.clamp((centre.received / centre.capacity) * 100, 0, 100);
  },

  servedToday(centre) {
    return centre.servedToday + this.completedEntries(centre).length;
  },

  waitingTimeMinutes(centre) {
    const q = this.totalQueue(centre);
    if (centre.activeCounters <= 0) return null; // "Operations paused"
    return Utils.round((q / centre.activeCounters) * centre.avgServiceTime);
  },

  waitingTimeText(centre) {
    const wt = this.waitingTimeMinutes(centre);
    if (wt === null) return "Operations paused";
    if (wt <= 0) return "No wait";
    if (wt < 60) return `${wt} min`;
    return `${Math.floor(wt / 60)}h ${wt % 60}m`;
  },

  // Computed congestion (independent of the manually-set operatingStatus)
  congestionLevel(centre) {
    const q = this.totalQueue(centre);
    const util = this.utilization(centre);
    const wt = this.waitingTimeMinutes(centre) || 0;
    const score = (q / 30) * 0.45 + (util / 100) * 0.30 + (wt / 60) * 0.25;
    if (score >= 0.65) return "HIGH";
    if (score >= 0.35) return "MODERATE";
    return "LOW";
  },

  queueClassification(q) {
    if (q > 20) return "HIGH";
    if (q >= 10) return "MODERATE";
    return "LOW";
  },

  isBookable(centre) {
    return !CLOSED_STATUSES.includes(centre.operatingStatus) && this.remaining(centre) > 0;
  },

  // recommendation score — lower is better
  recommendationScore(centre) {
    const q = this.totalQueue(centre);
    const util = this.utilization(centre);
    const wt = this.waitingTimeMinutes(centre) ?? 999;
    return q * 1.2 + util * 0.5 + wt * 0.8;
  },

  statusClass(status) {
    return "status-" + Utils.slugStatus(status);
  }
};

function expectedPaymentDate(entry) {
  if (!entry.paymentSetAt || !entry.paymentDays) return null;
  return entry.paymentSetAt + entry.paymentDays * 24 * 60 * 60 * 1000;
}

/* =============================================================
   SHARED DATABASE (localStorage)
   PROCURA runs as static files with no backend, so localStorage
   acts as the shared "database": every mutating action saves a
   snapshot, and every other open tab listens for that change and
   re-renders. This is what keeps Farmer / Centre / Officer tabs
   connected to the same live data.
   ============================================================= */

const STORAGE_KEY = "procura_shared_state_v1";

const Storage = {
  snapshot() {
    return {
      centres: State.centres,
      farmers: State.farmers,
      paymentIssues: State.paymentIssues,
      historicalData: State.historicalData,
      tokenCounter: State.tokenCounter,
      bookingCounter: State.bookingCounter,
      issueCounter: State.issueCounter
    };
  },

  async save() {
    const snapshot = this.snapshot();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch (e) { /* storage unavailable */ }

    // Persist the same shared state to Supabase when configured.
    if (window.ProcuraCloud && window.ProcuraCloud.enabled) {
      try {
        await window.ProcuraCloud.save(snapshot);
      } catch (e) {
        console.warn("PROCURA cloud save failed:", e);
      }
    }
  },

  // Merge stored data into existing objects (rather than replacing arrays
  // outright) so any reference already held onto — e.g. State.currentCentre —
  // keeps pointing at the same object, now carrying the freshest data.
  async load(options = {}) {
    let data = null;

    // Prefer the cloud copy when Supabase is configured.
    if (window.ProcuraCloud && window.ProcuraCloud.enabled) {
      try {
        data = await window.ProcuraCloud.load();
      } catch (e) {
        console.warn("PROCURA cloud load failed; using local data:", e);
      }
    }

    // Fall back to localStorage if the cloud has no snapshot yet.
    if (!data) {
      let raw;
      try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { raw = null; }
      if (raw) {
        try { data = JSON.parse(raw); } catch (e) { data = null; }
      }
    }

    // First run: seed the cloud/local store with the built-in demo state.
    if (!data) {
      await this.save();
      return;
    }

    (data.centres || []).forEach(loaded => {
      const existing = State.centres.find(c => c.id === loaded.id);
      if (existing) Object.assign(existing, loaded);
    });
    (data.farmers || []).forEach(loaded => {
      const existing = State.farmers.find(f => f.mobile === loaded.mobile);
      if (existing) Object.assign(existing, loaded);
    });
    State.paymentIssues = data.paymentIssues || State.paymentIssues;
    State.historicalData = data.historicalData || State.historicalData;
    State.tokenCounter = data.tokenCounter ?? State.tokenCounter;
    State.bookingCounter = data.bookingCounter ?? State.bookingCounter;
    State.issueCounter = data.issueCounter ?? State.issueCounter;
  },

  // Re-render whichever screen is currently open so a change made in
  // another tab shows up immediately, without a manual refresh.
  refreshVisibleView() {
    const visible = id => !document.getElementById(id).classList.contains("hidden");
    if (visible("view-farmer-dash")) {
      const t = document.querySelector("#view-farmer-dash .tab-btn.active");
      if (t) FarmerUI.tab(t.dataset.tab);
    } else if (visible("view-centre-dash")) {
      const t = document.querySelector("#view-centre-dash .tab-btn.active");
      if (t) CentreUI.tab(t.dataset.tab);
    } else if (visible("view-officer-dash")) {
      const t = document.querySelector("#view-officer-dash .tab-btn.active");
      if (t) OfficerUI.tab(t.dataset.tab);
    } else if (visible("view-landing")) {
      Landing.render();
    }
  }
};

window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    Storage.load();
    Storage.refreshVisibleView();
  }
});

/* =============================================================
   ROUTER
   ============================================================= */

const Router = {
  go(view) {
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    document.getElementById("view-" + view).classList.remove("hidden");
    window.scrollTo(0, 0);
    if (view === "landing") Landing.render();
  }
};

/* =============================================================
   LANDING
   ============================================================= */

const Landing = {
  render() {
    const totalQ = State.centres.reduce((s, c) => s + Metrics.totalQueue(c), 0);
    const totalCap = State.centres.reduce((s, c) => s + c.capacity, 0);
    const totalRecv = State.centres.reduce((s, c) => s + c.received, 0);
    document.getElementById("strip-centres").textContent = State.centres.length;
    document.getElementById("strip-waiting").textContent = totalQ;
    document.getElementById("strip-capacity").textContent = Utils.round((totalRecv / totalCap) * 100) + "%";
  }
};

/* =============================================================
   AUTH
   ============================================================= */

const Auth = {
  loginFarmer(e) {
    e.preventDefault();
    const mobile = document.getElementById("farmerMobile").value.trim();
    const location = document.getElementById("farmerLocation").value.trim().toLowerCase();
    const farmer = State.farmers.find(f => f.mobile === mobile && f.location.toLowerCase() === location);
    if (!farmer) { Utils.toast("No matching farmer account found. Check the demo accounts below.", "warn"); return; }
    State.currentFarmer = farmer;
    Router.go("farmer-dash");
    FarmerUI.tab("f-overview");
  },

  loginCentre(e) {
    e.preventDefault();
    const id = document.getElementById("centreId").value.trim().toUpperCase();
    const pass = document.getElementById("centrePassword").value;
    const centre = State.centres.find(c => c.id === id && c.password === pass);
    if (!centre) { Utils.toast("Invalid centre ID or password.", "warn"); return; }
    State.currentCentre = centre;
    Router.go("centre-dash");
    CentreUI.tab("c-overview");
  },

  loginOfficer(e) {
    e.preventDefault();
    const phone = document.getElementById("officerPhone").value.trim();
    const pass = document.getElementById("officerPassword").value;
    if (phone !== State.officer.phone || pass !== State.officer.password) {
      Utils.toast("Invalid officer credentials.", "warn"); return;
    }
    State.officerLoggedIn = true;
    Router.go("officer-dash");
    OfficerUI.tab("o-overview");
  },

  logout() {
    State.currentFarmer = null;
    State.currentCentre = null;
    State.officerLoggedIn = false;
    State.selectedCrop = null;
    State.selectedCentreId = null;
    Router.go("landing");
  }
};

/* =============================================================
   TAB HELPER (shared pattern for the 3 dashboards)
   ============================================================= */

function switchTab(sectionSelectorPrefix, navSelector, tabId, renderFn) {
  document.querySelectorAll(navSelector).forEach(b => b.classList.remove("active"));
  document.querySelector(`${navSelector}[data-tab="${tabId}"]`).classList.add("active");
  document.querySelectorAll(`.dash .tab-pane`).forEach(p => p.classList.add("hidden"));
  document.getElementById(tabId).classList.remove("hidden");
  renderFn();
}

/* =============================================================
   FARMER UI
   ============================================================= */

const FarmerUI = {
  tab(tabId) {
    const scope = document.getElementById("view-farmer-dash");
    scope.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    scope.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
    scope.querySelectorAll(".tab-pane").forEach(p => p.classList.add("hidden"));
    document.getElementById(tabId).classList.remove("hidden");

    if (tabId === "f-overview") this.renderOverview();
    if (tabId === "f-book") this.renderBook();
    if (tabId === "f-track") this.renderTrack();
  },

  activeBooking() {
    const f = State.farmer_ = State.currentFarmer;
    if (!f || f.bookings.length === 0) return null;
    // most recent booking that hasn't reached final stage, else the latest overall
    const open = [...f.bookings].reverse().find(b => this.findEntry(b) && this.findEntry(b).produceStage < 5);
    return open || f.bookings[f.bookings.length - 1];
  },

  findEntry(booking) {
    const centre = State.centres.find(c => c.id === booking.centreId);
    if (!centre) return null;
    return centre.farmers.find(e => e.bookingId === booking.bookingId);
  },

  renderOverview() {
    const f = State.currentFarmer;
    document.getElementById("fw-name").textContent = f.name;
    document.getElementById("fw-location").textContent = f.location;
    document.getElementById("fw-bookings-count").textContent = f.bookings.length;

    const booking = this.activeBooking();
    const entry = booking ? this.findEntry(booking) : null;
    document.getElementById("fw-payment-status").textContent = entry ? paymentStatusFor(entry) : "—";

    const bookingBox = document.getElementById("fw-current-booking");
    if (!booking || !entry) {
      bookingBox.innerHTML = `<p class="muted">No active booking. Head to "Book a Slot" to get started.</p>`;
    } else {
      const centre = State.centres.find(c => c.id === booking.centreId);
      bookingBox.innerHTML = `
        <div class="confirm-detail-grid">
          <div><span>Token</span><strong>${entry.token}</strong></div>
          <div><span>Centre</span><strong>${centre.name}</strong></div>
          <div><span>Crop</span><strong>${entry.crop}</strong></div>
          <div><span>Slot</span><strong>${entry.slot}</strong></div>
          <div><span>Queue Status</span><strong style="text-transform:capitalize">${entry.queueStatus}</strong></div>
          <div><span>Produce Status</span><strong>${stageLabel(entry.produceStage)}</strong></div>
        </div>
        ${entry.queueStatus === "waiting" && entry.arriveByLabel ? `<div class="recommend-reason" style="margin-top:14px;">${entry.arriveByLabel}</div>` : ""}`;
    }
  },

  renderBook() {
    const grid = document.getElementById("crop-grid");
    grid.innerHTML = CROPS.map(c => `
      <button class="crop-card ${State.selectedCrop === c ? "selected" : ""}" onclick="FarmerUI.pickCrop('${c}')">
        <span class="crop-emoji">${CROP_EMOJI[c]}</span>${c}
      </button>`).join("");

   document.getElementById("centre-recommend-area")
  .classList.toggle("hidden", !State.selectedCrop);

const slotArea = document.getElementById("slot-booking-area");
const confirmArea = document.getElementById("booking-confirm-area");

if (State.selectedCentreId) {
  slotArea.classList.remove("hidden");
} else {
  slotArea.classList.add("hidden");
}

if (State.bookingConfirmationVisible) {
  confirmArea.classList.remove("hidden");
} else {
  confirmArea.classList.add("hidden");
  confirmArea.innerHTML = "";
}

if (State.selectedCrop) this.renderCentreList();
     

    if (State.selectedCrop) this.renderCentreList();
  },

 pickCrop(crop) {
  State.selectedCrop = crop;
  State.selectedCentreId = null;
  State.bookingConfirmationVisible = false;

  document.getElementById("slot-booking-area").classList.add("hidden");
  document.getElementById("booking-confirm-area").classList.add("hidden");
  document.getElementById("booking-confirm-area").innerHTML = "";

  this.renderBook();
},

  renderCentreList() {
    const crop = State.selectedCrop;
    const list = State.centres.filter(c => c.crops.includes(crop));
    const ranked = list.slice().sort((a, b) => Metrics.recommendationScore(a) - Metrics.recommendationScore(b));
    const best = ranked.find(c => Metrics.isBookable(c));

    const container = document.getElementById("centre-list");
    if (list.length === 0) {
      container.innerHTML = `<p class="muted">No procurement centres currently accept ${crop}.</p>`;
      return;
    }

    container.innerHTML = ranked.map(centre => {
      const remaining = Metrics.remaining(centre);
      const util = Metrics.utilization(centre);
      const q = Metrics.totalQueue(centre);
      const wt = Metrics.waitingTimeText(centre);
      const congestion = Metrics.congestionLevel(centre);
      const bookable = Metrics.isBookable(centre);
      const isRecommended = best && centre.id === best.id;

      let reason = "";
      if (isRecommended) {
        const runnerUp = ranked.find(c => c.id !== centre.id && Metrics.isBookable(c));
        reason = `${centre.name} is recommended because it currently has ${congestion.toLowerCase()} congestion, ${Utils.fmt(remaining)} kg of remaining capacity and only ${q} farmers waiting — an estimated wait of about ${wt}` +
          (runnerUp ? `, the lowest combined load among centres accepting ${crop}.` : ".");
      }

      return `
        <div class="centre-card ${isRecommended ? "recommended" : ""}">
          <div class="centre-card-head">
            <div>
              <h3>${centre.name}</h3>
              <span class="centre-id">${centre.id} · ${centre.location}</span>
            </div>
            <span class="status-pill ${Metrics.statusClass(centre.operatingStatus)}">${centre.operatingStatus}</span>
          </div>
          ${isRecommended ? `<span class="recommended-badge">★ RECOMMENDED CENTRE</span>` : ""}
          ${isRecommended ? `<div class="recommend-reason">${reason}</div>` : ""}
          <div class="centre-metric-grid">
            <div class="mini-metric"><span>Distance</span><strong>${(2 + (centre.id.charCodeAt(centre.id.length - 1) % 9)).toFixed(1)} km</strong></div>
            <div class="mini-metric"><span>Remaining Capacity</span><strong>${Utils.fmt(remaining)} kg</strong></div>
            <div class="mini-metric"><span>Queue</span><strong>${q} farmers</strong></div>
            <div class="mini-metric"><span>Active Counters</span><strong>${centre.activeCounters}</strong></div>
            <div class="mini-metric"><span>Est. Waiting Time</span><strong>${wt}</strong></div>
            <div class="mini-metric"><span>Utilization</span><strong>${Utils.round(util)}%</strong></div>
          </div>
          <div class="bar-track"><div class="bar-fill ${util > 85 ? "danger" : util > 60 ? "warn" : ""}" style="width:${util}%"></div></div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px;">
            <span class="status-pill ${Metrics.statusClass(congestion)}">${congestion} CONGESTION</span>
            <button class="btn-primary" ${bookable ? "" : "disabled"} onclick="FarmerUI.selectCentre('${centre.id}')">
              ${bookable ? "Select This Centre" : (remaining <= 0 ? "Centre Full" : "Not Accepting Bookings")}
            </button>
          </div>
        </div>`;
    }).join("");
  },

  selectCentre(centreId) {
    State.selectedCentreId = centreId;
    document.getElementById("slot-booking-area").classList.remove("hidden");
    document.getElementById("booking-confirm-area").classList.add("hidden");
    this.renderSlotForm();
    document.getElementById("slot-booking-area").scrollIntoView({ behavior: "smooth" });
  },

  renderSlotForm() {
    const centre = State.centres.find(c => c.id === State.selectedCentreId);
    const slots = Utils.generateSlots();
    const panel = document.getElementById("slot-form-panel");
    panel.innerHTML = `
      <h2>Booking at ${centre.name}</h2>
      <div class="form-grid">
        <div class="field">
          <label>Date</label>
          <input type="date" id="bookDate" min="${Utils.todayISO()}" value="${Utils.todayISO()}">
        </div>
        <div class="field">
          <label>Time Slot</label>
          <select id="bookSlot">${slots.map(s => `<option value="${s}">${s}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label>Booking Type</label>
          <div class="radio-group">
            <div class="radio-chip selected" id="chip-single" onclick="FarmerUI.setBookingType('single')">Single</div>
            <div class="radio-chip" id="chip-group" onclick="FarmerUI.setBookingType('group')">Group</div>
          </div>
        </div>
        <div class="field hidden" id="groupSizeField">
          <label>Number of People in Group</label>
          <input type="number" id="groupSize" min="2" value="2">
        </div>
      </div>
      <button class="btn-primary" onclick="FarmerUI.confirmBooking()">Confirm Booking →</button>
    `;
    this.bookingType = "single";
  },

  setBookingType(type) {
    this.bookingType = type;
    document.getElementById("chip-single").classList.toggle("selected", type === "single");
    document.getElementById("chip-group").classList.toggle("selected", type === "group");
    document.getElementById("groupSizeField").classList.toggle("hidden", type !== "group");
  },


  confirmBooking() {
    const centre = State.centres.find(c => c.id === State.selectedCentreId);
    if (!Metrics.isBookable(centre)) {
      Utils.toast("This centre is no longer accepting bookings.", "warn");
      this.renderCentreList();
      return;
    }

    const date = document.getElementById("bookDate").value;
    const slotTime = document.getElementById("bookSlot").value;
    const crop = State.selectedCrop;
    const farmer = State.currentFarmer;
    const isGroup = this.bookingType === "group";
    const groupSize = isGroup ? Math.max(2, parseInt(document.getElementById("groupSize").value, 10) || 2) : 1;

    // Estimate wait based on the queue as it stands right now, before this
    // farmer (or group) is added to it — that's the load they'll wait behind.
    const waitMinutesAtBooking = Metrics.waitingTimeMinutes(centre);
    let arriveByLabel;
    if (waitMinutesAtBooking === null) {
      arriveByLabel = "Centre operations are currently paused — please check back before visiting.";
    } else {
      const arrivalDate = new Date(Date.now() + waitMinutesAtBooking * 60000);
      arriveByLabel = `Please be at the centre by ${Utils.formatTime(arrivalDate)}`;
    }

    const newTokens = [];
    for (let i = 0; i < groupSize; i++) {
      const token = "T" + (State.tokenCounter++);
      const bookingId = "BK-" + (State.bookingCounter++);
      newTokens.push(token);

      const entry = {
        bookingId, token,
        farmerMobile: farmer.mobile,
        farmerName: farmer.name,
        crop,
        slot: `${date} · ${slotTime} · ${isGroup ? `Group (${groupSize})` : "Single"}`,
        queueStatus: "waiting",
        measuredQty: null,
        grade: null,
        produceStage: -1, // token booked — produce not submitted at the centre yet
        paymentDelayed: false,
        paymentDays: null,
        paymentSetAt: null,
        arriveByLabel,
        createdAt: Date.now()
      };
      centre.farmers.push(entry);
      farmer.bookings.push({ bookingId, centreId: centre.id });
    }

    const panel = document.getElementById("booking-confirm-area");
    panel.classList.remove("hidden");
    panel.innerHTML = `
      <div class="confirm-card">
        <span class="muted">Booking Confirmed</span>
        ${isGroup
          ? `<div style="margin:14px 0;font-family:var(--font-display);font-size:22px;color:var(--green);">${newTokens.join(", ")}</div>
             <p class="muted">${groupSize} tokens issued for this group</p>`
          : `<div class="token-num">${newTokens[0]}</div>`}
        <p style="margin-top:10px;color:var(--amber);font-weight:600;">${arriveByLabel}</p>
        <div class="confirm-detail-grid">
          <div><span>Centre</span><strong>${centre.name}</strong></div>
          <div><span>Date</span><strong>${date}</strong></div>
          <div><span>Time</span><strong>${slotTime}</strong></div>
          <div><span>Crop</span><strong>${crop}</strong></div>
          <div><span>Est. Waiting Time</span><strong>${Metrics.waitingTimeText(centre)}</strong></div>
        </div>
      </div>`;
    panel.scrollIntoView({ behavior: "smooth" });

    Utils.toast(isGroup ? `${groupSize} tokens booked at ${centre.name}` : `Token ${newTokens[0]} booked at ${centre.name}`, "success");
    document.getElementById("slot-booking-area").classList.add("hidden");
    State.selectedCentreId = null;
    Storage.save();
  },

  renderTrack() {
    const f = State.currentFarmer;
    const container = document.getElementById("track-content");
    if (f.bookings.length === 0) {
      container.innerHTML = `<div class="panel"><p class="muted">You have no bookings yet.</p></div>`;
      return;
    }

    container.innerHTML = f.bookings.slice().reverse().map(b => {
      const centre = State.centres.find(c => c.id === b.centreId);
      const entry = this.findEntry(b);
      if (!entry) return "";
      const stage = entry.produceStage;

      const timeline = PRODUCE_STAGES.map((label, i) => {
        const cls = i < stage ? "done" : i === stage ? "active" : "";
        const icon = i < stage ? "✓" : i === stage ? "●" : "○";
        return `<div class="timeline-step ${cls}"><div class="dot">${icon}</div><div class="line"></div><div class="label">${label}</div></div>`;
      }).join("");

      const payStatus = paymentStatusFor(entry);
      const eta = expectedPaymentDate(entry);
      const now = Date.now();

      let paymentBlock = "";
      if (entry.paymentSetAt) {
        if (eta && now < eta) {
          paymentBlock = `
            <div class="recommend-reason" style="margin-top:16px;">
              Payment is expected to be credited by <strong>${Utils.formatDate(eta)}</strong>. You'll be able to report an issue if it hasn't arrived by then.
            </div>`;
        } else {
          paymentBlock = `
            <div class="recommend-reason" style="margin-top:16px;">
              Payment delayed? <button class="btn-secondary" style="margin-left:8px;" onclick="FarmerUI.openIssueForm('${entry.bookingId}')">Report an Issue</button>
            </div>
            <div id="issue-form-${entry.bookingId}"></div>`;
        }
      } else if (stage < 0) {
        paymentBlock = `<div class="recommend-reason" style="margin-top:16px;">Awaiting produce submission at the centre.</div>`;
      }

      return `
        <div class="panel">
          <div class="pane-head" style="margin-bottom:14px;">
            <div>
              <span class="eyebrow">${entry.token} · ${centre.name}</span>
              <h2 style="font-family:var(--font-display);font-size:19px;">${entry.crop}</h2>
            </div>
            <span class="status-pill ${Metrics.statusClass(payStatus)}">${payStatus}</span>
          </div>
          <div class="confirm-detail-grid" style="margin-bottom:18px;">
            <div><span>Slot</span><strong>${entry.slot}</strong></div>
            <div><span>Measured Quantity</span><strong>${entry.measuredQty !== null ? entry.measuredQty + " kg" : "Not yet submitted"}</strong></div>
            <div><span>Quality Grade</span><strong>${entry.grade || "—"}</strong></div>
            <div><span>Queue Status</span><strong style="text-transform:capitalize">${entry.queueStatus}</strong></div>
          </div>
          <div class="timeline">${timeline}</div>
          ${paymentBlock}
        </div>`;
    }).join("");
  },

  openIssueForm(bookingId) {
    const box = document.getElementById(`issue-form-${bookingId}`);
    box.innerHTML = `
      <div class="panel" style="margin-top:12px;">
        <h2>Report a Payment Issue</h2>
        <div class="form-grid">
          <div class="field"><label>Transaction ID</label><input id="issue-txn-${bookingId}" placeholder="e.g. TXN48213"></div>
          <div class="field"><label>Amount (₹)</label><input id="issue-amt-${bookingId}" type="number" placeholder="e.g. 18500"></div>
          <div class="field"><label>Expected Date</label><input id="issue-date-${bookingId}" type="date"></div>
        </div>
        <div class="field" style="margin-bottom:16px;"><label>Description</label><textarea id="issue-desc-${bookingId}" placeholder="Describe the issue"></textarea></div>
        <button class="btn-primary" onclick="FarmerUI.submitIssue('${bookingId}')">Submit Issue</button>
      </div>`;
  },

  submitIssue(bookingId) {
    const f = State.currentFarmer;
    const booking = f.bookings.find(b => b.bookingId === bookingId);
    const entry = this.findEntry(booking);
    const issueId = "PAY-" + (State.issueCounter++);

    State.paymentIssues.push({
      issueId,
      farmerName: f.name,
      centreName: State.centres.find(c => c.id === booking.centreId).name,
      transactionId: document.getElementById(`issue-txn-${bookingId}`).value || "—",
      amount: document.getElementById(`issue-amt-${bookingId}`).value || "—",
      expectedDate: document.getElementById(`issue-date-${bookingId}`).value || "—",
      description: document.getElementById(`issue-desc-${bookingId}`).value || "—",
      status: "Under Review"
    });

    entry.paymentDelayed = true;
    Utils.toast(`Issue ${issueId} submitted — Under Review`, "success");
    Storage.save();
    this.renderTrack();
  }
};

function paymentStatusFor(entry) {
  if (entry.produceStage >= 5) return "Payment Transferred";
  if (entry.produceStage === 4) return entry.paymentDelayed ? "Payment Delayed" : "Payment Initiated";
  return "Pending";
}

function stageLabel(stage) {
  return stage < 0 ? "Awaiting Produce Submission" : PRODUCE_STAGES[stage];
}

/* =============================================================
   CENTRE UI
   ============================================================= */

const CentreUI = {
  tab(tabId) {
    const scope = document.getElementById("view-centre-dash");
    scope.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    scope.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
    scope.querySelectorAll(".tab-pane").forEach(p => p.classList.add("hidden"));
    document.getElementById(tabId).classList.remove("hidden");

    if (tabId === "c-overview") this.renderOverview();
    if (tabId === "c-queue") this.renderQueue();
    if (tabId === "c-settings") this.renderSettings();
  },

  renderOverview() {
    const c = State.currentCentre;
    document.getElementById("cw-id").textContent = c.id;
    document.getElementById("cw-name").textContent = c.name;
    document.getElementById("cw-location").textContent = `${c.location} · ${c.crops.join(" + ")}`;
    const statusEl = document.getElementById("cw-status");
    statusEl.textContent = c.operatingStatus;
    statusEl.className = "status-pill " + Metrics.statusClass(c.operatingStatus);

    const remaining = Metrics.remaining(c);
    const util = Metrics.utilization(c);
    const totalQ = Metrics.totalQueue(c);
    const wt = Metrics.waitingTimeText(c);
    const congestion = Metrics.congestionLevel(c);

    document.getElementById("centre-metrics").innerHTML = `
      <div class="stat-card"><span class="stat-label">Total Capacity</span><strong>${Utils.fmt(c.capacity)} kg</strong></div>
      <div class="stat-card accent-green"><span class="stat-label">Received Today</span><strong>${Utils.fmt(c.received)} kg</strong></div>
      <div class="stat-card"><span class="stat-label">Remaining Capacity</span><strong>${Utils.fmt(remaining)} kg</strong></div>
      <div class="stat-card ${totalQ > 20 ? "accent-red" : totalQ >= 10 ? "accent-amber" : ""}"><span class="stat-label">Current Queue</span><strong>${totalQ}</strong></div>
      <div class="stat-card"><span class="stat-label">Farmers Served Today</span><strong>${Metrics.servedToday(c)}</strong></div>
      <div class="stat-card"><span class="stat-label">Active Counters</span><strong>${c.activeCounters}</strong></div>
      <div class="stat-card"><span class="stat-label">Capacity Utilization</span><strong>${Utils.round(util)}%</strong></div>
      <div class="stat-card"><span class="stat-label">Est. Waiting Time</span><strong>${wt}</strong></div>
      <div class="stat-card ${congestion === "HIGH" ? "accent-red" : congestion === "MODERATE" ? "accent-amber" : "accent-green"}"><span class="stat-label">Congestion</span><strong>${congestion}</strong></div>
    `;

    document.getElementById("c-capacity-fill").className = "bar-fill " + (util > 85 ? "danger" : util > 60 ? "warn" : "");
    document.getElementById("c-capacity-fill").style.width = util + "%";
    document.getElementById("c-capacity-text").textContent = `${Utils.fmt(c.received)} kg received of ${Utils.fmt(c.capacity)} kg capacity — ${Utils.fmt(remaining)} kg remaining.`;

    this.renderNowProcessing();
    this.renderPrediction();
  },

  renderNowProcessing() {
    const c = State.currentCentre;
    const box = document.getElementById("c-now-processing");
    const waitingCount = Metrics.waitingEntries(c).length;
    box.innerHTML = waitingCount > 0
      ? `<p class="muted">${waitingCount} farmer${waitingCount === 1 ? "" : "s"} waiting to submit produce.</p>
         <button class="btn-primary" style="margin-top:12px;" onclick="CentreUI.tab('c-queue')">Go to Farmer Queue →</button>`
      : `<p class="muted">No farmers currently waiting.</p>`;
  },

  renderPrediction() {
    const c = State.currentCentre;
    const box = document.getElementById("c-predicted");
    const rows = State.historicalData.filter(h => h.centreId === c.id);
    if (rows.length < 3) {
      box.innerHTML = `<p class="muted">Insufficient historical data for reliable prediction.</p>`;
      return;
    }
    const avgArrivals = Utils.round(rows.reduce((s, r) => s + r.arrived, 0) / rows.length, 1);
    const serviceRate = c.activeCounters > 0 ? Math.floor(60 / c.avgServiceTime) * c.activeCounters : 0;
    const predictedQueue = Math.max(0, Utils.round(Metrics.totalQueue(c) + avgArrivals - serviceRate));
    const predictedUtil = Utils.round(Utils.clamp(((c.received + avgArrivals * 22) / c.capacity) * 100, 0, 100));
    const risk = predictedQueue > 20 ? "HIGH" : predictedQueue >= 10 ? "MODERATE" : "LOW";

    box.innerHTML = `
      <div class="confirm-detail-grid">
        <div><span>Expected Arrivals (1hr)</span><strong>${avgArrivals}</strong></div>
        <div><span>Predicted Queue</span><strong>${predictedQueue}</strong></div>
        <div><span>Predicted Utilization</span><strong>${predictedUtil}%</strong></div>
        <div><span>Congestion Risk</span><strong>${risk}</strong></div>
      </div>`;
  },

  markNoShow(bookingId) {
    const c = State.currentCentre;
    const entry = c.farmers.find(f => f.bookingId === bookingId);
    entry.queueStatus = "no-show";
    if (this.openSubmissionId === bookingId) this.openSubmissionId = null;
    Utils.toast(`${entry.farmerName} marked as no-show.`);
    Storage.save();
    this.renderOverview();
    this.renderQueue();
  },

  // Ticking the "Produce Submitted" checkbox opens an inline form (right
  // below that row) asking for the measured quantity, grade, and how many
  // days until payment will be credited — all captured in one step.
  toggleSubmissionForm(bookingId, checkbox) {
    this.openSubmissionId = checkbox.checked ? bookingId : null;
    this.renderQueue();
  },

  confirmSubmission(bookingId) {
    const c = State.currentCentre;
    const entry = c.farmers.find(f => f.bookingId === bookingId);
    const qty = parseFloat(document.getElementById(`sub-qty-${bookingId}`).value);
    const grade = document.getElementById(`sub-grade-${bookingId}`).value;
    const daysInput = document.getElementById(`sub-days-${bookingId}`).value;
    const days = parseInt(daysInput, 10);

    if (isNaN(qty) || qty <= 0) { Utils.toast("Enter a valid measured quantity.", "warn"); return; }
    if (isNaN(days) || days < 0) { Utils.toast("Enter how many days until payment will be credited.", "warn"); return; }

    entry.measuredQty = qty;
    entry.grade = grade;
    entry.paymentDays = days;
    entry.paymentSetAt = Date.now();
    entry.queueStatus = "completed";
    entry.produceStage = 0; // Produce Submitted
    c.received = Utils.clamp(c.received + qty, 0, c.capacity);

    this.openSubmissionId = null;
    Utils.toast(`${entry.farmerName}'s produce recorded: ${qty} kg, ${grade}. Payment due in ${days} day${days === 1 ? "" : "s"}.`, "success");
    Storage.save();
    this.renderOverview();
    this.renderQueue();
  },

  cancelSubmissionForm() {
    this.openSubmissionId = null;
    this.renderQueue();
  },

  renderQueue() {
    const c = State.currentCentre;
    const tbody = document.getElementById("c-queue-tbody");
    if (c.farmers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">No farmer submissions yet.</div></td></tr>`;
      return;
    }

    const rows = [];
    c.farmers.slice().sort((a, b) => a.createdAt - b.createdAt).forEach(e => {
      let actions = "";
      if (e.queueStatus === "waiting") {
        actions = `
          <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
            <input type="checkbox" ${this.openSubmissionId === e.bookingId ? "checked" : ""} onchange="CentreUI.toggleSubmissionForm('${e.bookingId}', this)">
            Produce Submitted
          </label>
          <button class="btn-tiny danger" onclick="CentreUI.markNoShow('${e.bookingId}')">No-show</button>`;
      } else if (e.queueStatus === "completed") {
        actions = `
          <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--green);margin-right:8px;">
            <input type="checkbox" checked disabled> Submitted
          </label>
          <select onchange="CentreUI.setStage('${e.bookingId}', this.value)" style="background:var(--bg-alt);color:var(--text);border:1px solid var(--border);border-radius:7px;padding:5px 8px;font-size:12px;">
            ${PRODUCE_STAGES.map((s, i) => `<option value="${i}" ${i === e.produceStage ? "selected" : ""}>${s}</option>`).join("")}
          </select>
          ${e.paymentSetAt && expectedPaymentDate(e) > Date.now()
            ? `<button class="btn-tiny" style="margin-left:8px;" onclick="CentreUI.forceOverdue('${e.bookingId}')" title="Demo only — instantly makes this payment appear overdue so the Report an Issue option shows on the farmer's screen.">⏱ Force Overdue (Demo)</button>`
            : ""}`;
      } else {
        actions = `<span class="muted" style="font-size:12px;">—</span>`;
      }

      rows.push(`<tr>
        <td><strong>${e.token}</strong></td>
        <td>${e.farmerName}</td>
        <td>${e.crop}</td>
        <td>${e.measuredQty !== null ? e.measuredQty + " kg" : "—"}</td>
        <td style="font-size:12px;">${e.slot}</td>
        <td style="text-transform:capitalize;">${e.queueStatus}</td>
        <td style="font-size:12px;">${stageLabel(e.produceStage)}${e.paymentSetAt ? ` <span class="muted" style="font-size:11px;">(due ${Utils.formatDate(expectedPaymentDate(e))})</span>` : ""}</td>
        <td style="white-space:normal;">${actions}</td>
      </tr>`);

      if (e.queueStatus === "waiting" && this.openSubmissionId === e.bookingId) {
        rows.push(`<tr>
          <td colspan="8">
            <div class="panel" style="margin:0;background:var(--bg-alt);">
              <h2 style="font-size:14px;">Record ${e.farmerName}'s produce (${e.token})</h2>
              <div class="form-grid">
                <div class="field"><label>Measured Quantity (kg)</label><input type="number" id="sub-qty-${e.bookingId}" placeholder="e.g. 742"></div>
                <div class="field"><label>Quality Grade</label>
                  <select id="sub-grade-${e.bookingId}"><option>Grade A</option><option>Grade B</option><option>Grade C</option></select>
                </div>
                <div class="field"><label>Days Until Payment Credited</label><input type="number" id="sub-days-${e.bookingId}" min="0" placeholder="e.g. 7" value="7"></div>
              </div>
              <div style="display:flex;gap:10px;">
                <button class="btn-primary" onclick="CentreUI.confirmSubmission('${e.bookingId}')">✅ Confirm Submission</button>
                <button class="btn-secondary" onclick="CentreUI.cancelSubmissionForm()">Cancel</button>
              </div>
            </div>
          </td>
        </tr>`);
      }
    });

    tbody.innerHTML = rows.join("");
  },

  setStage(bookingId, stageIndex) {
    const c = State.currentCentre;
    const entry = c.farmers.find(f => f.bookingId === bookingId);
    entry.produceStage = parseInt(stageIndex, 10);
    if (entry.produceStage !== 4) entry.paymentDelayed = false;
    Utils.toast(`${entry.farmerName}: ${stageLabel(entry.produceStage)}`, "success");
    Storage.save();
    this.renderQueue();
  },

  // DEMO HELPER — backdates paymentSetAt so expectedPaymentDate() has already
  // passed, letting you show the farmer's "Report an Issue" button live
  // without waiting real days. Has no effect once the entry is genuinely due.
  forceOverdue(bookingId) {
    const c = State.currentCentre;
    const entry = c.farmers.find(f => f.bookingId === bookingId);
    entry.paymentSetAt = Date.now() - (entry.paymentDays + 1) * 24 * 60 * 60 * 1000;
    Utils.toast(`${entry.farmerName}'s payment now shows as overdue for demo purposes.`, "warn");
    Storage.save();
    this.renderQueue();
  },

  renderSettings() {
    const c = State.currentCentre;
    const box = document.getElementById("c-settings-form");
    box.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Quantity Received (kg)</label><input type="number" id="set-received" value="${c.received}"></div>
        <div class="field"><label>Current Queue (base, excl. active bookings)</label><input type="number" id="set-basequeue" value="${c.baseQueue}"></div>
        <div class="field"><label>Active Counters</label><input type="number" id="set-counters" value="${c.activeCounters}"></div>
        <div class="field"><label>Average Service Time (min)</label><input type="number" id="set-servicetime" value="${c.avgServiceTime}"></div>
        <div class="field"><label>Operating Status</label>
          <select id="set-status">${OPERATING_STATUSES.map(s => `<option ${s === c.operatingStatus ? "selected" : ""}>${s}</option>`).join("")}</select>
        </div>
      </div>
      <button class="btn-primary" onclick="CentreUI.saveSettings()">Save Changes</button>
    `;
  },

  saveSettings() {
    const c = State.currentCentre;
    c.received = Utils.clamp(parseFloat(document.getElementById("set-received").value) || 0, 0, c.capacity);
    c.baseQueue = Math.max(0, parseInt(document.getElementById("set-basequeue").value) || 0);
    c.activeCounters = Math.max(0, parseInt(document.getElementById("set-counters").value) || 0);
    c.avgServiceTime = Math.max(1, parseInt(document.getElementById("set-servicetime").value) || 1);
    c.operatingStatus = document.getElementById("set-status").value;
    Utils.toast("Centre data updated — all dashboards recalculated.", "success");
    Storage.save();
    this.renderOverview();
  }
};

/* =============================================================
   OFFICER UI
   ============================================================= */

const OfficerUI = {
  tab(tabId) {
    const scope = document.getElementById("view-officer-dash");
    scope.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    scope.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
    scope.querySelectorAll(".tab-pane").forEach(p => p.classList.add("hidden"));
    document.getElementById(tabId).classList.remove("hidden");

    if (tabId === "o-overview") this.renderOverview();
    if (tabId === "o-network") this.renderNetwork();
    if (tabId === "o-recommend") this.renderRecommendations();
    if (tabId === "o-predict") this.renderPredictions();
    if (tabId === "o-analytics") this.renderAnalytics();
    if (tabId === "o-payments") this.renderPayments();
  },

  renderOverview() {
    const centres = State.centres;
    const totalWaiting = centres.reduce((s, c) => s + Metrics.totalQueue(c), 0);
    const totalServed = centres.reduce((s, c) => s + Metrics.servedToday(c), 0);
    const totalCap = centres.reduce((s, c) => s + c.capacity, 0);
    const totalRecv = centres.reduce((s, c) => s + c.received, 0);
    const openCentres = centres.filter(c => !CLOSED_STATUSES.includes(c.operatingStatus)).length;
    const highCongestion = centres.filter(c => Metrics.congestionLevel(c) === "HIGH").length;
    const pendingIssues = State.paymentIssues.filter(i => i.status === "Under Review").length;

    document.getElementById("officer-stats").innerHTML = `
      <div class="stat-card"><span class="stat-label">Total Centres</span><strong>${centres.length}</strong></div>
      <div class="stat-card"><span class="stat-label">Open Centres</span><strong>${openCentres}</strong></div>
      <div class="stat-card ${highCongestion > 0 ? "accent-red" : ""}"><span class="stat-label">High Congestion Centres</span><strong>${highCongestion}</strong></div>
      <div class="stat-card"><span class="stat-label">Total Farmers Today</span><strong>${totalServed + totalWaiting}</strong></div>
      <div class="stat-card"><span class="stat-label">Total Farmers Waiting</span><strong>${totalWaiting}</strong></div>
      <div class="stat-card"><span class="stat-label">Total Produce Received</span><strong>${Utils.fmt(totalRecv)} kg</strong></div>
      <div class="stat-card"><span class="stat-label">Total Procurement Capacity</span><strong>${Utils.fmt(totalCap)} kg</strong></div>
      <div class="stat-card"><span class="stat-label">Overall Utilization</span><strong>${Utils.round((totalRecv / totalCap) * 100)}%</strong></div>
      <div class="stat-card ${pendingIssues > 0 ? "accent-amber" : ""}"><span class="stat-label">Pending Payment Issues</span><strong>${pendingIssues}</strong></div>
      <div class="stat-card"><span class="stat-label">Delayed Cases</span><strong>${State.paymentIssues.length}</strong></div>
    `;

    document.getElementById("o-waiting-headline").textContent = `${totalWaiting} Farmers Currently Waiting`;

    const maxQ = Math.max(...centres.map(c => Metrics.totalQueue(c)), 1);
    document.getElementById("o-crowd-compare").innerHTML = centres.map(c => {
      const q = Metrics.totalQueue(c);
      const level = Metrics.queueClassification(q);
      return `
        <div class="crowd-compare-row">
          <span class="name">${c.name}</span>
          <div class="bar-track"><div class="bar-fill ${level === "HIGH" ? "danger" : level === "MODERATE" ? "warn" : ""}" style="width:${(q / maxQ) * 100}%"></div></div>
          <span class="val">${q} · <span class="status-pill ${Metrics.statusClass(level)}" style="padding:3px 8px;">${level}</span></span>
        </div>`;
    }).join("");
  },

  renderNetwork() {
    const box = document.getElementById("o-network-cards");
    box.innerHTML = State.centres.map(c => {
      const remaining = Metrics.remaining(c);
      const util = Metrics.utilization(c);
      const q = Metrics.totalQueue(c);
      const wt = Metrics.waitingTimeText(c);
      const congestion = Metrics.congestionLevel(c);
      const needsAttention = congestion === "HIGH";

      return `
        <div class="network-card" style="${needsAttention ? "border-color:#7a2a2a;" : ""}">
          <div class="network-card-head">
            <div>
              <h3>${c.name} ${needsAttention ? `<span class="status-pill status-high" style="margin-left:8px;">NEEDS ATTENTION</span>` : ""}</h3>
              <span class="centre-id">${c.id} · ${c.location} · ${c.crops.join(" + ")}</span>
            </div>
            <span class="status-pill ${Metrics.statusClass(c.operatingStatus)}">${c.operatingStatus}</span>
          </div>
          <div class="centre-metric-grid">
            <div class="mini-metric"><span>Total Capacity</span><strong>${Utils.fmt(c.capacity)} kg</strong></div>
            <div class="mini-metric"><span>Remaining Capacity</span><strong>${Utils.fmt(remaining)} kg</strong></div>
            <div class="mini-metric"><span>Current Queue</span><strong>${q}</strong></div>
            <div class="mini-metric"><span>Active Counters</span><strong>${c.activeCounters}</strong></div>
            <div class="mini-metric"><span>Utilization</span><strong>${Utils.round(util)}%</strong></div>
            <div class="mini-metric"><span>Est. Waiting Time</span><strong>${wt}</strong></div>
          </div>
          <div class="bar-track"><div class="bar-fill ${util > 85 ? "danger" : util > 60 ? "warn" : ""}" style="width:${util}%"></div></div>
          <div style="margin-top:10px;"><span class="status-pill ${Metrics.statusClass(congestion)}">${congestion} CONGESTION</span></div>
        </div>`;
    }).join("");
  },

  renderRecommendations() {
    const box = document.getElementById("o-recommend-cards");
    const centres = State.centres;
    const overloaded = centres.filter(c => Metrics.congestionLevel(c) === "HIGH");

    if (overloaded.length === 0) {
      box.innerHTML = `<div class="rec-card"><p>No centres currently require redistribution. All centres are within healthy load levels.</p></div>`;
      return;
    }

    box.innerHTML = overloaded.map(source => {
      const alt = centres
        .filter(c => c.id !== source.id && c.crops.some(cr => source.crops.includes(cr)) && Metrics.isBookable(c))
        .sort((a, b) => Metrics.recommendationScore(a) - Metrics.recommendationScore(b))[0];

      if (!alt) {
        return `<div class="rec-card"><h3>${source.name} is approaching high congestion.</h3><p>No suitable alternate centre is currently available for redistribution.</p></div>`;
      }

      return `
        <div class="rec-card">
          <h3>${source.name} is approaching high congestion.</h3>
          <p>${alt.name} has ${Utils.fmt(Metrics.remaining(alt))} kg remaining capacity and only ${Metrics.totalQueue(alt)} farmers waiting. Consider redirecting upcoming farmers to ${alt.name}.</p>
          <div class="rec-actions">
            <button class="btn-primary" onclick="OfficerUI.acceptRecommendation('${source.id}','${alt.id}')">Accept Recommendation</button>
            <button class="btn-secondary" onclick="OfficerUI.overrideRecommendation()">Override</button>
          </div>
        </div>`;
    }).join("");
  },

  acceptRecommendation(sourceId, targetId) {
    const source = State.centres.find(c => c.id === sourceId);
    const target = State.centres.find(c => c.id === targetId);
    const shift = Math.min(5, source.baseQueue);
    source.baseQueue -= shift;
    target.baseQueue += shift;
    Utils.toast(`Redirected ${shift} upcoming farmers from ${source.name} to ${target.name}.`, "success");
    Storage.save();
    this.renderOverview();
    this.renderRecommendations();
  },

  overrideRecommendation() {
    Utils.toast("Recommendation overridden — no changes made.");
    this.renderRecommendations();
  },

  renderPredictions() {
    const box = document.getElementById("o-predict-cards");
    box.innerHTML = State.centres.map(c => {
      const rows = State.historicalData.filter(h => h.centreId === c.id);
      if (rows.length < 3) {
        return `<div class="rec-card"><h3>${c.name}</h3><p>Insufficient historical data for reliable prediction.</p></div>`;
      }
      const avgArrivals = Utils.round(rows.reduce((s, r) => s + r.arrived, 0) / rows.length, 1);
      const serviceRate = c.activeCounters > 0 ? Math.floor(60 / c.avgServiceTime) * c.activeCounters : 0;
      const predictedQueue = Math.max(0, Utils.round(Metrics.totalQueue(c) + avgArrivals - serviceRate));
      const predictedUtil = Utils.round(Utils.clamp(((c.received + avgArrivals * 22) / c.capacity) * 100, 0, 100));
      const risk = predictedQueue > 20 ? "HIGH" : predictedQueue >= 10 ? "MODERATE" : "LOW";
      const peakHour = rows.slice().sort((a, b) => b.queueSize - a.queueSize)[0].hour;

      return `
        <div class="rec-card">
          <h3>${c.name}</h3>
          <div class="centre-metric-grid" style="margin-top:12px;">
            <div class="mini-metric"><span>Expected Arrivals (1hr)</span><strong>${avgArrivals}</strong></div>
            <div class="mini-metric"><span>Predicted Queue</span><strong>${predictedQueue}</strong></div>
            <div class="mini-metric"><span>Predicted Utilization</span><strong>${predictedUtil}%</strong></div>
            <div class="mini-metric"><span>Predicted Peak</span><strong>~${peakHour}:00</strong></div>
            <div class="mini-metric"><span>Congestion Risk</span><strong>${risk}</strong></div>
          </div>
        </div>`;
    }).join("");
  },

  renderAnalytics() {
    const box = document.getElementById("o-analytics-content");
    const centres = State.centres;
    const maxCap = Math.max(...centres.map(c => c.capacity));
    const maxServed = Math.max(...centres.map(c => Metrics.servedToday(c)), 1);
    const maxWait = Math.max(...centres.map(c => Metrics.waitingTimeMinutes(c) || 0), 1);

    box.innerHTML = `
      <div class="panel">
        <h2>Produce Received by Centre</h2>
        ${centres.map(c => `
          <div class="analytics-row">
            <span class="name">${c.name}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${(c.received / maxCap) * 100}%"></div></div>
            <span class="val">${Utils.fmt(c.received)} kg</span>
          </div>`).join("")}
      </div>

      <div class="panel">
        <h2>Capacity Utilization</h2>
        ${centres.map(c => {
          const u = Metrics.utilization(c);
          return `<div class="analytics-row">
            <span class="name">${c.name}</span>
            <div class="bar-track"><div class="bar-fill ${u > 85 ? "danger" : u > 60 ? "warn" : ""}" style="width:${u}%"></div></div>
            <span class="val">${Utils.round(u)}%</span>
          </div>`;
        }).join("")}
      </div>

      <div class="panel">
        <h2>Farmers Served Today</h2>
        ${centres.map(c => `
          <div class="analytics-row">
            <span class="name">${c.name}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${(Metrics.servedToday(c) / maxServed) * 100}%"></div></div>
            <span class="val">${Metrics.servedToday(c)}</span>
          </div>`).join("")}
      </div>

      <div class="panel">
        <h2>Average Waiting Time</h2>
        ${centres.map(c => {
          const wt = Metrics.waitingTimeMinutes(c);
          return `<div class="analytics-row">
            <span class="name">${c.name}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${wt === null ? 0 : (wt / maxWait) * 100}%"></div></div>
            <span class="val">${Metrics.waitingTimeText(c)}</span>
          </div>`;
        }).join("")}
      </div>

      <div class="panel">
        <h2>Congestion Trends</h2>
        ${State.historicalData.length >= 6 ? `<p class="muted">Across recorded sessions, queues tend to build mid-morning (10–11 AM) and ease off after 1 PM, based on the available historical dataset.</p>` : `<p class="muted">Not enough data yet.</p>`}
      </div>

      <div class="panel">
        <h2>Payment Issues</h2>
        <p class="muted">${State.paymentIssues.length} issue(s) reported · ${State.paymentIssues.filter(i => i.status === "Under Review").length} pending review.</p>
      </div>
    `;
  },

  renderPayments() {
    const box = document.getElementById("o-payments-content");
    if (State.paymentIssues.length === 0) {
      box.innerHTML = `<div class="panel"><p class="muted">No payment issues reported.</p></div>`;
      return;
    }
    box.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Issue ID</th><th>Farmer</th><th>Centre</th><th>Transaction ID</th><th>Amount</th><th>Expected Date</th><th>Description</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${State.paymentIssues.map((i, idx) => `
              <tr>
                <td><strong>${i.issueId}</strong></td>
                <td>${i.farmerName}</td>
                <td>${i.centreName}</td>
                <td>${i.transactionId}</td>
                <td>₹${i.amount}</td>
                <td>${i.expectedDate}</td>
                <td style="white-space:normal;max-width:220px;">${i.description}</td>
                <td><span class="status-pill ${i.status === "Under Review" ? "status-moderate" : "status-low"}">${i.status}</span></td>
                <td>${i.status === "Under Review" ? `<button class="btn-tiny" onclick="OfficerUI.resolveIssue(${idx})">Mark Resolved</button>` : "—"}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  },

  resolveIssue(idx) {
    State.paymentIssues[idx].status = "Resolved";
    Utils.toast("Issue marked as resolved.", "success");
    Storage.save();
    this.renderPayments();
  }
};

/* =============================================================
   INIT
   ============================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  await Storage.load();
  Landing.render();

  // Keep different devices/tabs reasonably fresh without requiring a refresh.
  if (window.ProcuraCloud && window.ProcuraCloud.enabled) {
    setInterval(async () => {
      try {
        const cloud = await window.ProcuraCloud.load();
        if (!cloud) return;
        const before = JSON.stringify(Storage.snapshot());
        const current = JSON.stringify(cloud);
        if (before !== current) {
          await Storage.load({ silent: true });
          Storage.refreshVisibleView();
        }
      } catch (e) {
        console.warn("PROCURA cloud refresh failed:", e);
      }
    }, 5000);
  }
});
