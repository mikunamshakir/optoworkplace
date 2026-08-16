// ============================================================
// OPTO WORKPLACE — Neumorphic Edition — Application Logic
// ============================================================

function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("navOverlay").classList.toggle("active");
}

// ── State ──────────────────────────────────────────────────
const STATE_KEY = "Opto Workplace State v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    classInfo: {
      name: "My Class",
      teacher: "Teacher Name",
      subject: "Subject",
    },
    students: [],
    attendance: [],
    lectures: [],
    fees: [],
    timetable: [],
    nextRoll: 1,
  };
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

let state = loadState();

// ── Navigation ─────────────────────────────────────────────
const pageTitles = {
  dashboard: "Dashboard",
  students: "Students",
  attendance: "Mark Attendance",
  lectures: "Lecture Log",
  timetable: "Class Timetable",
  fees: "Fee Management",
  reports: "Export Reports",
};

function navigate(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  document
    .querySelector(`.nav-item[onclick="navigate('${page}')"]`)
    ?.classList.add("active");
  document.getElementById("pageTitle").textContent = pageTitles[page] || page;

  if (page === "dashboard") renderDashboard();
  if (page === "students") renderStudents();
  if (page === "attendance") renderAttendance();
  if (page === "lectures") renderLectureLog();
  if (page === "timetable") renderTimetable();
  if (page === "fees") renderFees();

  // close mobile sidebar after navigating
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("navOverlay").classList.remove("active");
}

// ── Dashboard ──────────────────────────────────────────────
function renderDashboard() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-PK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const todayLec = state.lectures.find((l) => l.date === today);
  const todayAtt = state.attendance.filter((a) => a.date === today);
  const totalStudents = state.students.length;

  let thisMonthLecs = state.lectures.filter((l) =>
    l.date.startsWith(today.slice(0, 7)),
  );
  let conducted = thisMonthLecs.filter((l) => l.status === "conducted").length;

  document.getElementById("dashStats").innerHTML = `
    <div class="stat-card"><div class="stat-label">Total Students</div><div class="stat-val">${totalStudents}</div></div>
    <div class="stat-card"><div class="stat-label">Lectures This Month</div><div class="stat-val">${conducted}</div><div class="stat-sub">of ${thisMonthLecs.length} logged</div></div>
    <div class="stat-card"><div class="stat-label">Today's Attendance</div><div class="stat-val">${todayAtt.length > 0 ? todayAtt[0].records.filter((r) => r.status === "present").length : "—"}</div><div class="stat-sub">present</div></div>
    <div class="stat-card"><div class="stat-label">Fees Collected</div><div class="stat-val">PKR ${state.fees
      .filter((f) => f.status === "paid")
      .reduce((s, f) => s + (+f.amount || 0), 0)
      .toLocaleString()}</div></div>
  `;

  document.getElementById("todayLecture").innerHTML = todayLec
    ? `<div><span class="badge ${todayLec.status === "conducted" ? "green" : todayLec.status === "holiday" ? "yellow" : "red"}">${todayLec.status}</span>
       <div style="margin-top:10px;font-size:13px"><b>${todayLec.subject}</b> — ${todayLec.topic || "No topic logged"}</div>
       ${todayLec.notes ? `<div style="font-size:12px;color:var(--text3);margin-top:5px">${todayLec.notes}</div>` : ""}</div>`
    : `<div class="empty-state" style="padding:20px"><div class="ico-big">📖</div>No lecture logged for today.<br><button class="btn primary sm" style="margin-top:12px" onclick="navigate('lectures')">Log Now</button></div>`;

  const todayAttRecord = state.attendance.find((a) => a.date === today);
  document.getElementById("quickAttSummary").innerHTML = todayAttRecord
    ? `<div>Present: <b>${todayAttRecord.records.filter((r) => r.status === "present").length}</b> &nbsp; Absent: <b>${todayAttRecord.records.filter((r) => r.status === "absent").length}</b> &nbsp; Leave: <b>${todayAttRecord.records.filter((r) => r.status === "leave").length}</b>
       <br><br><button class="btn sm" onclick="navigate('attendance')">View Details</button></div>`
    : `<div style="color:var(--text3)">No attendance marked for today.<br><br><button class="btn primary sm" onclick="navigate('attendance')">Mark Attendance</button></div>`;

  const recent = [
    ...state.lectures.slice(-3).reverse(),
    ...state.attendance.slice(-3).reverse(),
  ]
    .sort((a, b) => (b.date > a.date ? 1 : -1))
    .slice(0, 5);
  document.getElementById("recentActivity").innerHTML = recent.length
    ? recent
        .map(
          (
            r,
          ) => `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:12px;color:var(--text3);min-width:80px">${r.date}</span>
        <span style="flex:1;font-size:13px">${r.subject || "Attendance"} ${r.topic ? "— " + r.topic : ""}</span>
        ${r.status ? `<span class="badge ${r.status === "conducted" ? "green" : r.status === "holiday" ? "yellow" : "red"}">${r.status}</span>` : '<span class="badge blue">attendance</span>'}
      </div>`,
        )
        .join("")
    : `<div class="empty-state" style="padding:20px"><div class="ico-big">📭</div>No activity yet.</div>`;
}

// ── Students ───────────────────────────────────────────────
function renderStudents() {
  const q = (
    document.getElementById("studentSearch")?.value || ""
  ).toLowerCase();
  const filtered = state.students.filter(
    (s) => !q || s.name.toLowerCase().includes(q) || String(s.roll).includes(q),
  );
  const tbody = document.getElementById("studentTbody");
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:34px;color:var(--text3)">No students found. <a href="#" onclick="openModal('addStudent');return false;">Add one?</a></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered
    .map((s) => {
      const attPercent = calcAttPercent(s.id);
      const feeRec = state.fees
        .filter((f) => f.studentId === s.id)
        .sort((a, b) => (b.month > a.month ? 1 : -1))[0];
      return `<tr>
      <td><span class="badge gray">${s.roll}</span></td>
      <td><div style="display:flex;align-items:center;gap:9px">
        <div class="att-avatar" style="width:28px;height:28px;font-size:10px">${initials(s.name)}</div>
        <span style="font-weight:600">${s.name}</span>
      </div></td>
      <td>${s.contact || "—"}</td>
      <td>${s.email || "—"}</td>
      <td><span class="badge ${feeRec?.status === "paid" ? "green" : "red"}">${feeRec?.status || "unpaid"}</span></td>
      <td><span class="badge ${attPercent >= 75 ? "green" : attPercent >= 50 ? "yellow" : "red"}">${attPercent}%</span></td>
      <td><div style="display:flex;gap:6px">
        <button class="btn xs" onclick="editStudent('${s.id}')">Edit</button>
        <button class="btn xs danger" onclick="deleteStudent('${s.id}')">Del</button>
      </div></td>
    </tr>`;
    })
    .join("");
}

function calcAttPercent(sid) {
  let total = 0,
    present = 0;
  state.attendance.forEach((a) => {
    const r = a.records.find((r) => r.studentId === sid);
    if (r) {
      total++;
      if (r.status === "present") present++;
    }
  });
  return total ? Math.round((present / total) * 100) : 0;
}

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;
  state.students = state.students.filter((s) => s.id !== id);
  saveState();
  renderStudents();
}

function editStudent(id) {
  const s = state.students.find((s) => s.id === id);
  if (!s) return;
  openModal("editStudent", s);
}

// ── Attendance ─────────────────────────────────────────────
function renderAttendance() {
  const dateEl = document.getElementById("attDate");
  if (!dateEl.value) dateEl.value = new Date().toISOString().split("T")[0];
  const date = dateEl.value;
  const existing = state.attendance.find((a) => a.date === date);

  const list = document.getElementById("attList");
  if (!state.students.length) {
    list.innerHTML = `<div class="empty-state"><div class="ico-big">👥</div>Add students first to mark attendance.</div>`;
  } else {
    list.innerHTML = state.students
      .map((s) => {
        const rec = existing?.records.find((r) => r.studentId === s.id);
        const status = rec?.status || "";
        return `<div class="att-row" id="att-row-${s.id}">
        <div class="att-avatar">${initials(s.name)}</div>
        <div style="flex:1"><div class="att-name">${s.name}</div><div class="att-roll">Roll #${s.roll}</div></div>
        <div class="toggle-group">
          <button class="toggle-btn present ${status === "present" ? "active" : ""}" onclick="setAttStatus('${s.id}','present',this)">Present</button>
          <button class="toggle-btn absent ${status === "absent" ? "active" : ""}" onclick="setAttStatus('${s.id}','absent',this)">Absent</button>
          <button class="toggle-btn leave ${status === "leave" ? "active" : ""}" onclick="setAttStatus('${s.id}','leave',this)">Leave</button>
        </div>
      </div>`;
      })
      .join("");
  }

  const tbody = document.getElementById("attHistoryTbody");
  const sorted = [...state.attendance].sort((a, b) =>
    b.date > a.date ? 1 : -1,
  );
  tbody.innerHTML =
    sorted
      .map((a) => {
        const p = a.records.filter((r) => r.status === "present").length;
        const ab = a.records.filter((r) => r.status === "absent").length;
        const t = a.records.length;
        return `<tr><td>${a.date}</td><td>${a.subject || "—"}</td><td style="color:var(--success)">${p}</td><td style="color:var(--danger)">${ab}</td><td>${t}</td><td><span class="badge ${p / t >= 0.75 ? "green" : p / t >= 0.5 ? "yellow" : "red"}">${t ? Math.round((p / t) * 100) : 0}%</span></td></tr>`;
      })
      .join("") ||
    '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text3)">No attendance records yet.</td></tr>';
}

let tempAtt = {};

function setAttStatus(sid, status, btn) {
  tempAtt[sid] = status;
  const row = document.getElementById("att-row-" + sid);
  row
    .querySelectorAll(".toggle-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function markAllPresent() {
  state.students.forEach((s) => {
    tempAtt[s.id] = "present";
    const row = document.getElementById("att-row-" + s.id);
    if (row) {
      row
        .querySelectorAll(".toggle-btn")
        .forEach((b) => b.classList.remove("active"));
      row.querySelector(".toggle-btn.present").classList.add("active");
    }
  });
}

function saveAttendance() {
  const date = document.getElementById("attDate").value;
  const subject = document.getElementById("attSubject").value || "General";
  if (!date) return alert("Please select a date.");
  const records = state.students.map((s) => ({
    studentId: s.id,
    status: tempAtt[s.id] || "absent",
  }));
  const idx = state.attendance.findIndex((a) => a.date === date);
  if (idx >= 0) state.attendance[idx] = { date, subject, records };
  else state.attendance.push({ date, subject, records });
  tempAtt = {};
  saveState();
  renderAttendance();
  alert("Attendance saved!");
}

// ── Lectures ───────────────────────────────────────────────
let calMonth = new Date();

function renderLectureLog() {
  const lecDateEl = document.getElementById("lecDate");
  if (!lecDateEl.value)
    lecDateEl.value = new Date().toISOString().split("T")[0];
  renderLectureTable();
  renderCalendar();
}

function renderLectureTable() {
  const sorted = [...state.lectures].sort((a, b) => (b.date > a.date ? 1 : -1));
  document.getElementById("lectureTbody").innerHTML =
    sorted
      .map(
        (l) => `
    <tr>
      <td>${l.date}</td>
      <td>${l.subject || "—"}</td>
      <td>${l.topic || "—"}</td>
      <td><span class="badge ${l.status === "conducted" ? "green" : l.status === "holiday" ? "yellow" : "red"}">${l.status}</span></td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.notes || "—"}</td>
      <td><button class="btn xs danger" onclick="deleteLecture('${l.id}')">Del</button></td>
    </tr>`,
      )
      .join("") ||
    '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text3)">No lectures logged yet.</td></tr>';
}

function saveLecture() {
  const date = document.getElementById("lecDate").value;
  const subject = document.getElementById("lecSubject").value;
  const topic = document.getElementById("lecTopic").value;
  const status = document.getElementById("lecStatus").value;
  const notes = document.getElementById("lecNotes").value;
  if (!date || !subject) return alert("Date and subject are required.");
  const existing = state.lectures.findIndex(
    (l) => l.date === date && l.subject === subject,
  );
  const entry = {
    id: Date.now().toString(),
    date,
    subject,
    topic,
    status,
    notes,
    logged: new Date().toISOString(),
  };
  if (existing >= 0) state.lectures[existing] = entry;
  else state.lectures.push(entry);
  saveState();
  renderLectureTable();
  renderCalendar();
  document.getElementById("lecTopic").value = "";
  document.getElementById("lecNotes").value = "";
}

function deleteLecture(id) {
  state.lectures = state.lectures.filter((l) => l.id !== id);
  saveState();
  renderLectureTable();
  renderCalendar();
}

function switchLecTab(tab, el) {
  document.getElementById("lecTabLog").style.display =
    tab === "log" ? "block" : "none";
  document.getElementById("lecTabCalendar").style.display =
    tab === "calendar" ? "block" : "none";
  document
    .querySelectorAll("#page-lectures .tab")
    .forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  if (tab === "calendar") renderCalendar();
}

function changeCalMonth(dir) {
  calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + dir, 1);
  renderCalendar();
}

function renderCalendar() {
  const yr = calMonth.getFullYear();
  const mo = calMonth.getMonth();
  document.getElementById("calMonthLabel").textContent =
    calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const todayStr = new Date().toISOString().split("T")[0];
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  let html = days.map((d) => `<div class="cal-head">${d}</div>`).join("");
  for (let i = 0; i < firstDay; i++)
    html += `<div class="cal-day empty"></div>`;
  let conducted = 0,
    notConducted = 0,
    holiday = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const lecs = state.lectures.filter((l) => l.date === dateStr);
    const hasC = lecs.some((l) => l.status === "conducted");
    const hasN = lecs.some((l) => l.status === "not-conducted");
    const hasH = lecs.some((l) => l.status === "holiday");
    if (hasC) conducted++;
    if (hasN) notConducted++;
    if (hasH) holiday++;
    const cls = hasC
      ? "conducted"
      : hasN
        ? "not-conducted"
        : hasH
          ? "holiday"
          : "";
    const isToday = dateStr === todayStr;
    const tooltip = lecs.length ? lecs.map((l) => l.subject).join(", ") : "";
    html += `<div class="cal-day ${cls} ${isToday ? "today" : ""}" title="${tooltip}">
      <span style="font-size:12px">${d}</span>
      ${hasC ? '<div class="dot green"></div>' : hasN ? '<div class="dot red"></div>' : hasH ? '<div class="dot yellow"></div>' : ""}
    </div>`;
  }
  document.getElementById("calGrid").innerHTML = html;
  document.getElementById("calStatC").textContent = conducted;
  document.getElementById("calStatN").textContent = notConducted;
  document.getElementById("calStatH").textContent = holiday;
}

// ── Timetable ──────────────────────────────────────────────
const TT_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TT_TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

function renderTimetable() {
  const grid = document.getElementById("ttGrid");
  let html =
    `<div class="tt-head">Time</div>` +
    TT_DAYS.map((d) => `<div class="tt-head">${d}</div>`).join("");
  TT_TIMES.forEach((time) => {
    html += `<div class="tt-time">${time}</div>`;
    TT_DAYS.forEach((day) => {
      const slot = state.timetable.find(
        (s) => s.day === day && s.time === time,
      );
      if (slot) {
        html += `<div class="tt-cell filled ${slot.isBreak ? "break-cell" : ""}" onclick="openModal('editSlot','${day}','${time}')">
          <div class="sub">${slot.subject}</div>
          ${slot.teacher ? `<div class="tea">${slot.teacher}</div>` : ""}
          ${slot.room ? `<div class="tea">Room ${slot.room}</div>` : ""}
        </div>`;
      } else {
        html += `<div class="tt-cell" onclick="openModal('addSlot','${day}','${time}')">
          <div class="tea" style="color:var(--text3);font-size:12px">+</div>
        </div>`;
      }
    });
  });
  grid.innerHTML = html;
}

function clearTimetable() {
  if (!confirm("Clear entire timetable?")) return;
  state.timetable = [];
  saveState();
  renderTimetable();
}

// ── Fees ───────────────────────────────────────────────────
function renderFees() {
  renderFeeList();
  populateReceiptStudentSelect();
  renderFeeSummary();
  const now = new Date();
  document.getElementById("receiptMonth").value =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  document.getElementById("receiptNo").value =
    "RCP-" + Date.now().toString().slice(-6);
  updateReceiptPreview();
}

function renderFeeList() {
  const el = document.getElementById("feeList");
  if (!state.students.length) {
    el.innerHTML = `<div class="empty-state"><div class="ico-big">💳</div>No students yet.</div>`;
    return;
  }
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  el.innerHTML = state.students
    .map((s) => {
      const fee = state.fees.filter(
        (f) => f.studentId === s.id && f.month === thisMonth,
      )[0];
      return `<div class="fee-card">
      <div class="att-avatar">${initials(s.name)}</div>
      <div>
        <div style="font-weight:600;font-size:13px">${s.name}</div>
        <div style="font-size:11px;color:var(--text3)">Roll #${s.roll}</div>
      </div>
      <div style="font-size:12px;color:var(--text3)">${thisMonth}</div>
      <div class="fee-paid">
        <span class="badge ${fee?.status === "paid" ? "green" : "red"}">${fee?.status === "paid" ? `Paid — PKR ${fee.amount}` : "Unpaid"}</span>
      </div>
    </div>`;
    })
    .join("");
}

function populateReceiptStudentSelect() {
  const sel = document.getElementById("receiptStudent");
  sel.innerHTML =
    state.students
      .map(
        (s) => `<option value="${s.id}">${s.name} (Roll #${s.roll})</option>`,
      )
      .join("") || "<option>No students</option>";
}

function updateReceiptPreview() {
  const sid = document.getElementById("receiptStudent").value;
  const s = state.students.find((s) => s.id === sid);
  const month = document.getElementById("receiptMonth").value;
  const amount = document.getElementById("receiptAmount").value;
  const mode = document.getElementById("receiptMode").value;
  const rno = document.getElementById("receiptNo").value;
  const remarks = document.getElementById("receiptRemarks").value;
  const date = new Date().toLocaleDateString("en-PK");
  document.getElementById("receiptPreview").innerHTML = `
    <div class="r-title">${state.classInfo.name}</div>
    <div class="r-sub">Fee Receipt — ${state.classInfo.teacher}</div>
    <div class="r-row"><span>Receipt No.</span><span>${rno}</span></div>
    <div class="r-row"><span>Student</span><span>${s?.name || "—"}</span></div>
    <div class="r-row"><span>Roll No.</span><span>${s?.roll || "—"}</span></div>
    <div class="r-row"><span>Month</span><span>${month}</span></div>
    <div class="r-row"><span>Payment Mode</span><span>${mode}</span></div>
    <div class="r-row"><span>Date</span><span>${date}</span></div>
    ${remarks ? `<div class="r-row"><span>Remarks</span><span>${remarks}</span></div>` : ""}
    <div style="height:8px"></div>
    <div class="r-total"><span>Total Amount</span><span>PKR ${Number(amount || 0).toLocaleString()}</span></div>
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border2);font-size:10px;color:var(--text3);text-align:center">Thank you for timely payment</div>
  `;
}

function markFeePaid() {
  const sid = document.getElementById("receiptStudent").value;
  const month = document.getElementById("receiptMonth").value;
  const amount = document.getElementById("receiptAmount").value;
  const mode = document.getElementById("receiptMode").value;
  const rno = document.getElementById("receiptNo").value;
  if (!sid || !month) return alert("Select a student and month first.");
  const idx = state.fees.findIndex(
    (f) => f.studentId === sid && f.month === month,
  );
  const entry = {
    studentId: sid,
    month,
    amount,
    mode,
    rno,
    status: "paid",
    date: new Date().toISOString(),
  };
  if (idx >= 0) state.fees[idx] = entry;
  else state.fees.push(entry);
  saveState();
  renderFeeList();
  renderFeeSummary();
  alert("Fee marked as paid!");
}

function renderFeeSummary() {
  const total = state.fees
    .filter((f) => f.status === "paid")
    .reduce((s, f) => s + (+f.amount || 0), 0);
  const count = state.fees.filter((f) => f.status === "paid").length;
  document.getElementById("feeSummaryStats").innerHTML = `
    <div class="stat-card"><div class="stat-label">Total Collected</div><div class="stat-val">PKR ${total.toLocaleString()}</div></div>
    <div class="stat-card"><div class="stat-label">Payments Recorded</div><div class="stat-val">${count}</div></div>
    <div class="stat-card"><div class="stat-label">Students Pending</div><div class="stat-val">${state.students.length - new Set(state.fees.filter((f) => f.status === "paid").map((f) => f.studentId)).size}</div></div>
  `;
  const sorted = [...state.fees].sort((a, b) => (b.date > a.date ? 1 : -1));
  document.getElementById("feeHistoryTbody").innerHTML =
    sorted
      .map((f) => {
        const s = state.students.find((s) => s.id === f.studentId);
        return `<tr>
      <td>${s?.name || "Unknown"}</td><td>${s?.roll || "—"}</td>
      <td>PKR ${Number(f.amount).toLocaleString()}</td><td>${f.month}</td>
      <td><span class="badge green">paid</span></td><td>${f.mode || "—"}</td>
    </tr>`;
      })
      .join("") ||
    '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text3)">No fee records yet.</td></tr>';
}

function switchFeeTab(tab, el) {
  document.getElementById("feeTabList").style.display =
    tab === "list" ? "block" : "none";
  document.getElementById("feeTabReceipt").style.display =
    tab === "receipt" ? "block" : "none";
  document.getElementById("feeTabSummary").style.display =
    tab === "summary" ? "block" : "none";
  document
    .querySelectorAll("#page-fees .tab")
    .forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  if (tab === "summary") renderFeeSummary();
}

// ── Modals ─────────────────────────────────────────────────
function openModal(type, ...args) {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalContent");
  overlay.classList.add("open");

  if (type === "addStudent") {
    content.innerHTML = `
      <h3>Add New Student</h3>
      <div class="form-grid">
        <div class="form-group"><label>Full Name *</label><input id="m_name" placeholder="Student name"></div>
        <div class="form-group"><label>Roll No.</label><input id="m_roll" type="number" value="${state.nextRoll}" placeholder="Auto"></div>
        <div class="form-group"><label>Contact</label><input id="m_contact" placeholder="Phone number"></div>
        <div class="form-group"><label>Email</label><input id="m_email" type="email" placeholder="Email address"></div>
        <div class="form-group"><label>Guardian Name</label><input id="m_guardian" placeholder="Parent/Guardian"></div>
        <div class="form-group"><label>Address</label><input id="m_address" placeholder="Address"></div>
      </div>
      <div class="modal-actions">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn primary" onclick="addStudent()">Add Student</button>
      </div>`;
  }

  if (type === "editStudent") {
    const s = args[0];
    content.innerHTML = `
      <h3>Edit Student</h3>
      <div class="form-grid">
        <div class="form-group"><label>Full Name *</label><input id="m_name" value="${s.name}"></div>
        <div class="form-group"><label>Roll No.</label><input id="m_roll" type="number" value="${s.roll}"></div>
        <div class="form-group"><label>Contact</label><input id="m_contact" value="${s.contact || ""}"></div>
        <div class="form-group"><label>Email</label><input id="m_email" value="${s.email || ""}"></div>
        <div class="form-group"><label>Guardian Name</label><input id="m_guardian" value="${s.guardian || ""}"></div>
        <div class="form-group"><label>Address</label><input id="m_address" value="${s.address || ""}"></div>
      </div>
      <div class="modal-actions">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn primary" onclick="saveEditStudent('${s.id}')">Save Changes</button>
      </div>`;
  }

  if (type === "setFee") {
    content.innerHTML = `
      <h3>Update Fee Status</h3>
      <div class="form-group" style="margin-bottom:12px"><label>Student</label>
        <select id="m_feeStudent">${state.students.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select>
      </div>
      <div class="form-group" style="margin-bottom:12px"><label>Month</label><input id="m_feeMonth" type="month"></div>
      <div class="form-group" style="margin-bottom:12px"><label>Amount (PKR)</label><input id="m_feeAmount" type="number" value="3000"></div>
      <div class="form-group" style="margin-bottom:12px"><label>Status</label>
        <select id="m_feeStatus"><option value="paid">Paid</option><option value="unpaid">Unpaid</option></select>
      </div>
      <div class="modal-actions">
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn primary" onclick="saveFeeRecord()">Save</button>
      </div>`;
    document.getElementById("m_feeMonth").value =
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  }

  if (type === "addSlot" || type === "editSlot") {
    const day = args[0] || "";
    const time = args[1] || "";
    const slot =
      type === "editSlot"
        ? state.timetable.find((s) => s.day === day && s.time === time)
        : null;
    content.innerHTML = `
      <h3>${type === "editSlot" ? "Edit" : "Add"} Timetable Slot</h3>
      <div class="form-grid">
        <div class="form-group"><label>Day</label>
          <select id="m_ttDay">${TT_DAYS.map((d) => `<option value="${d}" ${d === day ? "selected" : ""}>${d}</option>`).join("")}</select>
        </div>
        <div class="form-group"><label>Time</label>
          <select id="m_ttTime">${TT_TIMES.map((t) => `<option value="${t}" ${t === time ? "selected" : ""}>${t}</option>`).join("")}</select>
        </div>
        <div class="form-group"><label>Subject</label><input id="m_ttSub" value="${slot?.subject || ""}" placeholder="e.g. Mathematics"></div>
        <div class="form-group"><label>Teacher</label><input id="m_ttTeacher" value="${slot?.teacher || ""}" placeholder="Teacher name"></div>
        <div class="form-group"><label>Room</label><input id="m_ttRoom" value="${slot?.room || ""}" placeholder="Room no."></div>
        <div class="form-group"><label>Type</label>
          <select id="m_ttType"><option value="" ${!slot?.isBreak ? "selected" : ""}>Class</option><option value="break" ${slot?.isBreak ? "selected" : ""}>Break / Free</option></select>
        </div>
      </div>
      <div class="modal-actions">
        ${type === "editSlot" ? `<button class="btn danger" onclick="deleteSlot('${day}','${time}')">Remove</button>` : ""}
        <button class="btn" onclick="closeModal()">Cancel</button>
        <button class="btn primary" onclick="saveSlot('${day}','${time}')">Save Slot</button>
      </div>`;
  }
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById("modalOverlay")) closeModal();
}

function addStudent() {
  const name = document.getElementById("m_name").value.trim();
  if (!name) return alert("Name is required.");
  const roll = +document.getElementById("m_roll").value || state.nextRoll;
  const student = {
    id: Date.now().toString(),
    name,
    roll,
    contact: document.getElementById("m_contact").value,
    email: document.getElementById("m_email").value,
    guardian: document.getElementById("m_guardian").value,
    address: document.getElementById("m_address").value,
    added: new Date().toISOString(),
  };
  state.students.push(student);
  state.nextRoll = Math.max(...state.students.map((s) => +s.roll)) + 1;
  saveState();
  closeModal();
  renderStudents();
}

function saveEditStudent(id) {
  const s = state.students.find((s) => s.id === id);
  if (!s) return;
  s.name = document.getElementById("m_name").value.trim() || s.name;
  s.roll = +document.getElementById("m_roll").value || s.roll;
  s.contact = document.getElementById("m_contact").value;
  s.email = document.getElementById("m_email").value;
  s.guardian = document.getElementById("m_guardian").value;
  s.address = document.getElementById("m_address").value;
  saveState();
  closeModal();
  renderStudents();
}

function saveFeeRecord() {
  const sid = document.getElementById("m_feeStudent").value;
  const month = document.getElementById("m_feeMonth").value;
  const amount = document.getElementById("m_feeAmount").value;
  const status = document.getElementById("m_feeStatus").value;
  const idx = state.fees.findIndex(
    (f) => f.studentId === sid && f.month === month,
  );
  const entry = {
    studentId: sid,
    month,
    amount,
    status,
    date: new Date().toISOString(),
  };
  if (idx >= 0) state.fees[idx] = entry;
  else state.fees.push(entry);
  saveState();
  closeModal();
  renderFeeList();
  renderFeeSummary();
}

function saveSlot(origDay, origTime) {
  const day = document.getElementById("m_ttDay").value;
  const time = document.getElementById("m_ttTime").value;
  const subject = document.getElementById("m_ttSub").value;
  const teacher = document.getElementById("m_ttTeacher").value;
  const room = document.getElementById("m_ttRoom").value;
  const isBreak = document.getElementById("m_ttType").value === "break";
  if (!subject) return alert("Subject is required.");
  state.timetable = state.timetable.filter(
    (s) => !(s.day === origDay && s.time === origTime),
  );
  state.timetable = state.timetable.filter(
    (s) => !(s.day === day && s.time === time),
  );
  state.timetable.push({ day, time, subject, teacher, room, isBreak });
  saveState();
  closeModal();
  renderTimetable();
}

function deleteSlot(day, time) {
  state.timetable = state.timetable.filter(
    (s) => !(s.day === day && s.time === time),
  );
  saveState();
  closeModal();
  renderTimetable();
}

// ── PDF Export ─────────────────────────────────────────────
function getPDF() {
  const { jsPDF } = window.jspdf;
  return new jsPDF();
}

function pdfHeader(doc, title) {
  doc.setFillColor(38, 43, 40);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(232, 196, 104);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("", 14, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text(title, 14, 20);
  doc.text(new Date().toLocaleDateString("en-PK"), 196, 20, { align: "right" });
  doc.setTextColor(0, 0, 0);
  return 38;
}

function pdfTable(doc, y, headers, rows, colWidths) {
  const pageW = 182;
  const x = 14;
  doc.setFillColor(240, 235, 214);
  doc.rect(x, y, pageW, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  let cx = x + 3;
  headers.forEach((h, i) => {
    doc.text(h, cx, y + 5.5);
    cx += colWidths[i];
  });
  y += 9;
  doc.setFont("helvetica", "normal");
  rows.forEach((row, ri) => {
    if (y > 270) {
      doc.addPage();
      y = pdfHeader(doc, "(continued)");
    }
    if (ri % 2 === 0) {
      doc.setFillColor(248, 247, 242);
      doc.rect(x, y, pageW, 8, "F");
    }
    cx = x + 3;
    row.forEach((cell, i) => {
      doc.text(String(cell || "").slice(0, 30), cx, y + 5.5);
      cx += colWidths[i];
    });
    y += 9;
  });
  return y;
}

function exportDailyReportPDF() {
  const date =
    document.getElementById("reportDate").value ||
    new Date().toISOString().split("T")[0];
  const doc = getPDF();
  let y = pdfHeader(doc, `Daily Report — ${date}`);
  const lecs = state.lectures.filter((l) => l.date === date);
  const att = state.attendance.find((a) => a.date === date);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Lectures", 14, y);
  y += 8;
  if (lecs.length) {
    y = pdfTable(
      doc,
      y,
      ["Subject", "Topic", "Status", "Notes"],
      lecs.map((l) => [l.subject, l.topic, l.status, l.notes]),
      [45, 55, 35, 47],
    );
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("No lectures logged.", 14, y);
    y += 8;
  }
  y += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Attendance", 14, y);
  y += 8;
  if (att) {
    const rows = att.records.map((r) => {
      const s = state.students.find((s) => s.id === r.studentId);
      return [s?.roll || "", s?.name || "Unknown", r.status];
    });
    y = pdfTable(doc, y, ["Roll", "Name", "Status"], rows, [25, 100, 57]);
    const p = att.records.filter((r) => r.status === "present").length;
    y += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Present: ${p}  Absent: ${att.records.length - p}  Total: ${att.records.length}`,
      14,
      y,
    );
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("No attendance recorded.", 14, y);
  }
  doc.save(`daily-report-${date}.pdf`);
}

function exportMonthlyCalPDF() {
  const monthInput = document.getElementById("reportMonth")?.value;
  const yr = monthInput ? +monthInput.split("-")[0] : calMonth.getFullYear();
  const mo = monthInput ? +monthInput.split("-")[1] - 1 : calMonth.getMonth();
  const label = new Date(yr, mo).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const doc = getPDF();
  let y = pdfHeader(doc, `Monthly Lecture Calendar — ${label}`);
  const lecs = state.lectures.filter((l) =>
    l.date.startsWith(`${yr}-${String(mo + 1).padStart(2, "0")}`),
  );
  const rows = lecs
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .map((l) => [l.date, l.subject, l.topic, l.status, l.notes]);
  y = pdfTable(
    doc,
    y,
    ["Date", "Subject", "Topic", "Status", "Notes"],
    rows,
    [28, 38, 40, 28, 48],
  );
  let c = lecs.filter((l) => l.status === "conducted").length,
    n = lecs.filter((l) => l.status === "not-conducted").length,
    h = lecs.filter((l) => l.status === "holiday").length;
  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Summary: Conducted=${c}  Not Conducted=${n}  Holiday=${h}`, 14, y);
  doc.save(`monthly-calendar-${yr}-${mo + 1}.pdf`);
}

function exportAttReportPDF() {
  const doc = getPDF();
  let y = pdfHeader(doc, "Attendance Report");
  const rows = state.students.map((s) => {
    let total = 0,
      present = 0;
    state.attendance.forEach((a) => {
      const r = a.records.find((r) => r.studentId === s.id);
      if (r) {
        total++;
        if (r.status === "present") present++;
      }
    });
    return [
      s.roll,
      s.name,
      present,
      total - present,
      total,
      total ? Math.round((present / total) * 100) + "%" : "—",
    ];
  });
  y = pdfTable(
    doc,
    y,
    ["Roll", "Name", "Present", "Absent", "Total", "%"],
    rows,
    [20, 60, 22, 22, 22, 22],
  );
  doc.save("attendance-report.pdf");
}

function exportFeeListPDF() {
  const month =
    document.getElementById("reportFeeMonth").value ||
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const doc = getPDF();
  let y = pdfHeader(doc, `Fee Submission List — ${month}`);
  const rows = state.students.map((s) => {
    const fee = state.fees.find(
      (f) => f.studentId === s.id && f.month === month,
    );
    return [
      s.roll,
      s.name,
      s.contact || "—",
      fee?.amount ? `PKR ${Number(fee.amount).toLocaleString()}` : "—",
      fee?.status || "Unpaid",
      "___________",
    ];
  });
  y = pdfTable(
    doc,
    y,
    ["Roll", "Name", "Contact", "Amount", "Status", "Signature"],
    rows,
    [20, 55, 35, 30, 22, 22],
  );
  y += 20;
  doc.setFontSize(9);
  doc.text(
    `Total Students: ${state.students.length}   Paid: ${state.fees.filter((f) => f.month === month && f.status === "paid").length}`,
    14,
    y,
  );
  doc.save(`fee-list-${month}.pdf`);
}

function exportStudentListPDF() {
  const doc = getPDF();
  let y = pdfHeader(doc, "Student Roster");
  const rows = state.students.map((s) => [
    s.roll,
    s.name,
    s.contact || "—",
    s.email || "—",
    s.guardian || "—",
    calcAttPercent(s.id) + "%",
  ]);
  y = pdfTable(
    doc,
    y,
    ["Roll", "Name", "Contact", "Email", "Guardian", "Att%"],
    rows,
    [20, 50, 35, 40, 30, 10],
  );
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Students: ${state.students.length}`, 14, y);
  doc.save("student-list.pdf");
}

function exportTimetablePDF() {
  const landscape = new window.jspdf.jsPDF({ orientation: "landscape" });
  let y = pdfHeader(landscape, "Class Timetable");
  const headers = ["Time", ...TT_DAYS];
  const colW = [22, 40, 40, 40, 40, 40, 40];
  let cx = 14;
  landscape.setFontSize(8);
  landscape.setFont("helvetica", "bold");
  landscape.setFillColor(38, 43, 40);
  landscape.rect(14, y, 269, 8, "F");
  landscape.setTextColor(232, 196, 104);
  headers.forEach((h, i) => {
    landscape.text(h, cx + 2, y + 5.5);
    cx += colW[i];
  });
  landscape.setTextColor(0, 0, 0);
  y += 9;
  TT_TIMES.forEach((time, ri) => {
    cx = 14;
    if (ri % 2 === 0) {
      landscape.setFillColor(248, 247, 242);
      landscape.rect(14, y, 269, 10, "F");
    }
    landscape.setFont("helvetica", "bold");
    landscape.text(time, cx + 2, y + 6.5);
    cx += colW[0];
    landscape.setFont("helvetica", "normal");
    TT_DAYS.forEach((day, di) => {
      const slot = state.timetable.find(
        (s) => s.day === day && s.time === time,
      );
      if (slot) {
        landscape.text(slot.subject.slice(0, 12), cx + 2, y + 5);
        if (slot.teacher)
          landscape.text(slot.teacher.slice(0, 12), cx + 2, y + 9.5);
      }
      cx += colW[di + 1];
    });
    y += 12;
  });
  landscape.save("timetable.pdf");
}

function exportReceiptPDF() {
  const sid = document.getElementById("receiptStudent").value;
  const s = state.students.find((s) => s.id === sid);
  const month = document.getElementById("receiptMonth").value;
  const amount = document.getElementById("receiptAmount").value;
  const mode = document.getElementById("receiptMode").value;
  const rno = document.getElementById("receiptNo").value;
  const remarks = document.getElementById("receiptRemarks").value;
  const doc = getPDF();
  doc.setFillColor(38, 43, 40);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(232, 196, 104);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(state.classInfo.name, 105, 16, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text("FEE RECEIPT", 105, 25, { align: "center" });
  doc.setTextColor(0, 0, 0);
  let y = 50;
  doc.setFontSize(10);
  const info = [
    ["Receipt No.", rno],
    ["Student Name", s?.name || "—"],
    ["Roll No.", s?.roll || "—"],
    ["Month", month],
    ["Payment Mode", mode],
    ["Date", new Date().toLocaleDateString("en-PK")],
  ];
  if (remarks) info.push(["Remarks", remarks]);
  info.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.text(k + ":", 30, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(v), 80, y);
    y += 9;
  });
  y += 5;
  doc.setFillColor(38, 43, 40);
  doc.rect(20, y, 170, 12, "F");
  doc.setTextColor(232, 196, 104);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Amount: PKR ${Number(amount).toLocaleString()}`, 105, y + 8, {
    align: "center",
  });
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your timely payment.\n THIS IS A SYSTEM GENERATED RECEIPT, HENCE REQUIRES NO SIGNATURE FOR ISSUANCE.", 105, y + 24, {
    align: "center",
  });
  doc.text("________________________", 50, y + 45);
  doc.text("________________________", 130, y + 45);
  doc.text("CASHIER \n  (STAMP BY BANK ONLY)", 58, y + 50);
  doc.text("ACCOUNTANT \n  (STAMP BY UNIVERSTY ONLY)", 135, y + 50);
  doc.save(`receipt-${s?.name || "student"}-${month}.pdf`);
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("attDate").value = today;
  document.getElementById("lecDate").value = today;
  document.getElementById("reportDate").value = today;
  const ym = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  document.getElementById("reportMonth").value = ym;
  document.getElementById("reportFeeMonth").value = ym;

  document.getElementById("attDate").addEventListener("change", () => {
    tempAtt = {};
    renderAttendance();
  });
});
