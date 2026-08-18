/**
 * BVCITS Student Portal Controller
 * Manages Dashboard, Attendance, Performance, CGPA, Coding Practice, Timetable, Notifications, and Logout
 */

(function (window) {
  'use strict';

  let activeCodingQuestion = null;
  let activeCodingLanguage = 'java';
  let activeDifficultyFilter = 'all';
  let activeTimetableDay = 'Today';
  let activeNotifCategory = 'all';

  function verifyStudentAccess() {
    if (!window.BVCITS_AUTH || !window.BVCITS_AUTH.requireAuth(['student', 'admin'])) {
      return false;
    }
    return true;
  }

  // Handle browser Back / Forward navigation and bfcache restoration
  window.addEventListener('pageshow', () => {
    verifyStudentAccess();
  });

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Guard route: student role required
    if (!verifyStudentAccess()) {
      return;
    }

    initStudentPortal();
  });

  // Global event delegation for all student logout buttons
  document.addEventListener('click', (e) => {
    const logoutBtn = e.target.closest('.logout-trigger');
    if (logoutBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (window.BVCITS_AUTH) {
        window.BVCITS_AUTH.logout();
      } else {
        sessionStorage.clear();
        localStorage.removeItem('BVCITS_AUTH_SESSION_V2');
        window.location.replace('portal-login.html');
      }
    }
  });

  function initStudentPortal() {
    const authUser = window.BVCITS_AUTH.getCurrentUser();
    const db = window.BVCITS_DB;

    // Fetch user and relational records
    const user = db.getUserById(authUser.id) || authUser;
    const attendance = db.getAttendanceForUser(user.id);
    const marks = db.getMarksForUser(user.id);
    const codeProgress = db.getCodingProgress(user.id);
    const questions = db.getCodingQuestions();
    const notifications = db.getNotifications(user.id);

    // Populate Topbar & Profile Info
    populateHeaderProfile(user, attendance, marks, codeProgress, notifications);

    // Setup Sidebar Navigation
    setupNavigation(user, attendance, marks, codeProgress, questions, notifications);

    // Render Initial Active View (Dashboard)
    renderDashboardOverview(user, attendance, marks, codeProgress, questions, notifications);

    // Setup Notification Bell Dropdown
    setupNotificationBell(user);
  }

  /* ==========================================================================
     Header & Profile Binding
     ========================================================================== */
  function populateHeaderProfile(user, attendance, marks, progress, notifications) {
    const topbarUserName = document.getElementById('topbarUserName');
    const topbarUserRole = document.getElementById('topbarUserRole');
    const topbarAvatar = document.getElementById('topbarAvatar');
    const attPill = document.getElementById('topbarAttendancePill');
    const cgpaPill = document.getElementById('topbarCgpaPill');
    const xpPill = document.getElementById('topbarXpPill');
    const notifBadge = document.getElementById('sidebarNotifBadge');
    const topNotifBadge = document.getElementById('notificationBadge');

    if (topbarUserName) topbarUserName.textContent = user.fullName;
    if (topbarUserRole) topbarUserRole.textContent = `${user.deptCode || user.department} • ${user.rollNo}`;
    if (topbarAvatar) {
      topbarAvatar.src = window.BVCITSPhotos.resolve(user);
      topbarAvatar.onerror = () => window.BVCITSPhotos.handleError(topbarAvatar, window.BVCITSPhotos.fallbackChain(user));
    }


    if (attPill) {
      attPill.innerHTML = `<span>📊 Att: <strong>${attendance.overall}%</strong></span>`;
      attPill.className = `stat-pill ${attendance.overall >= 75 ? 'attendance-good' : 'attendance-warn'}`;
    }
    if (cgpaPill) {
      cgpaPill.innerHTML = `<span>⭐ CGPA: <strong>${marks.cgpa || user.cgpa}</strong></span>`;
    }
    if (xpPill) {
      xpPill.innerHTML = `<span>⚡ <strong>${progress.totalXp} XP</strong></span>`;
    }

    const unreadCount = notifications.filter(n => n.unread).length;
    if (notifBadge) notifBadge.textContent = unreadCount || '0';
    if (topNotifBadge) {
      topNotifBadge.textContent = unreadCount;
      topNotifBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    // Bind Logout handlers
    const logoutBtns = document.querySelectorAll('.logout-trigger');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout from BVCITS Student Portal?')) {
          window.BVCITS_AUTH.logout();
        }
      });
    });

    // Mobile Sidebar toggle
    const mobileToggle = document.getElementById('mobileSidebarToggle');
    const sidebar = document.querySelector('.portal-sidebar');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }
  }

  /* ==========================================================================
     Sidebar Navigation Routing
     ========================================================================== */
  function setupNavigation(user, attendance, marks, progress, questions, notifications) {
    const navLinks = document.querySelectorAll('.sidebar-link[data-view]');
    const views = document.querySelectorAll('.portal-view');
    const pageTitle = document.getElementById('pageTitle');
    const breadcrumb = document.getElementById('currentBreadcrumb');

    const titlesMap = {
      'dashboard': 'Student Dashboard',
      'attendance': 'Attendance Status & Breakdown',
      'performance': 'Academic Marks & Performance Graph',
      'cgpa': 'CGPA & Credit Progression',
      'coding': 'Coding Practice Arena',
      'timetable': 'Class Schedule & Timetable',
      'notifications': 'Campus & Academic Notifications',
      'profile': 'Student Official Profile'
    };

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = link.getAttribute('data-view');

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        views.forEach(v => v.classList.remove('active'));
        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) targetView.classList.add('active');

        const title = titlesMap[viewId] || 'Student Portal';
        if (pageTitle) pageTitle.textContent = title;
        if (breadcrumb) breadcrumb.textContent = title;

        // Render target view content
        switch (viewId) {
          case 'dashboard':
            renderDashboardOverview(user, attendance, marks, progress, questions, notifications);
            break;
          case 'attendance':
            renderAttendanceView(user, attendance);
            break;
          case 'performance':
            renderPerformanceView(user, marks);
            break;
          case 'cgpa':
            renderCgpaView(user, marks);
            break;
          case 'coding':
            renderCodingPracticeView(user, progress, questions);
            break;
          case 'timetable':
            renderTimetableView(user);
            break;
          case 'notifications':
            renderNotificationsView(user);
            break;
          case 'profile':
            renderProfileView(user, attendance, marks, progress);
            break;
        }

        // Close mobile sidebar if open
        const sidebar = document.querySelector('.portal-sidebar');
        if (sidebar) sidebar.classList.remove('mobile-open');
      });
    });
  }

  function switchPortalView(viewId) {
    const link = document.querySelector(`.sidebar-link[data-view="${viewId}"]`);
    if (link) link.click();
  }

  /* ==========================================================================
     1. STUDENT DASHBOARD VIEW
     ========================================================================== */
  function renderDashboardOverview(user, attendance, marks, progress, questions, notifications) {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    const isAttWarn = attendance.overall < 75.0;
    const solvedCount = progress.problemsSolved || 0;
    const timetable = window.BVCITS_DB.getTimetableForUser(user.id, 'Monday');
    const todayClasses = (timetable && timetable.schedule && timetable.schedule['Monday']) || [];

    container.innerHTML = `
      <!-- Hero Banner with Profile Information -->
      <div class="dashboard-hero-banner">
        <div class="hero-student-profile">
          <div class="hero-avatar-wrap">
            ${window.BVCITSPhotos.imgTag(user, 'hero-avatar')}
            <span class="online-indicator" title="Student Session Active"></span>
          </div>
          <div class="hero-profile-meta">
            <h2>Welcome back, ${user.fullName}</h2>
            <div class="hero-tags-row">
              <span class="hero-tag">🎓 Roll No: <strong>${user.rollNo}</strong></span>
              <span class="hero-tag">🏛 Branch: <strong>${user.deptCode || user.department}</strong></span>
              <span class="hero-tag">📅 Year: <strong>${user.year}</strong></span>
              <span class="hero-tag">📍 Section: <strong>${user.section}</strong></span>
              <span class="hero-tag">⭐ CGPA: <strong>${marks.cgpa}</strong></span>
            </div>
            <div style="font-size:12px; color:rgba(255,255,255,0.85); margin-top:8px;">
              Mentor: <strong>${user.mentor}</strong> • ${user.placementStatus ? `Status: <strong style="color:var(--portal-gold-light);">${user.placementStatus}</strong>` : ''}
            </div>
          </div>
        </div>
        <div class="hero-quick-actions">
          <button type="button" class="hero-btn gold" id="heroCodingBtn">
            <span>⚔️ Enter Coding Practice</span>
          </button>
          <button type="button" class="hero-btn outline" id="heroTimetableBtn">
            <span>🗓️ View Timetable</span>
          </button>
        </div>
      </div>

      <!-- Key Metrics KPI Row -->
      <div class="grid-4" style="margin-bottom:24px;">
        <div class="portal-card kpi-card" onclick="document.querySelector('.sidebar-link[data-view=\\'attendance\\']').click();" style="cursor:pointer;">
          <div class="kpi-icon" style="background:#DCFCE7; color:#15803D;">📅</div>
          <div class="kpi-info">
            <div class="kpi-label">Overall Attendance</div>
            <div class="kpi-val" style="color:${isAttWarn ? '#DC2626' : '#15803D'};">${attendance.overall}%</div>
            <div class="kpi-sub">${isAttWarn ? '⚠️ Below 75% Requirement' : '✅ Good Standing (Req: 75%)'}</div>
          </div>
        </div>

        <div class="portal-card kpi-card" onclick="document.querySelector('.sidebar-link[data-view=\\'cgpa\\']').click();" style="cursor:pointer;">
          <div class="kpi-icon" style="background:#DBEAFE; color:#1D4ED8;">🎓</div>
          <div class="kpi-info">
            <div class="kpi-label">Current CGPA</div>
            <div class="kpi-val">${marks.cgpa}</div>
            <div class="kpi-sub">Scale of 10.0 (Autonomous)</div>
          </div>
        </div>

        <div class="portal-card kpi-card" onclick="document.querySelector('.sidebar-link[data-view=\\'performance\\']').click();" style="cursor:pointer;">
          <div class="kpi-icon" style="background:#F3E8FF; color:#7E22CE;">📈</div>
          <div class="kpi-info">
            <div class="kpi-label">Sem 5 SGPA</div>
            <div class="kpi-val">8.90</div>
            <div class="kpi-sub">5 Subjects Enrolled</div>
          </div>
        </div>

        <div class="portal-card kpi-card" onclick="document.querySelector('.sidebar-link[data-view=\\'coding\\']').click();" style="cursor:pointer;">
          <div class="kpi-icon" style="background:#FEF3C7; color:#B45309;">⚔️</div>
          <div class="kpi-info">
            <div class="kpi-label">Coding Score</div>
            <div class="kpi-val">${progress.totalXp} XP</div>
            <div class="kpi-sub">${solvedCount} Solved • 🔥 ${progress.streakDays}d Streak</div>
          </div>
        </div>
      </div>

      <!-- Attendance Shortage Alert if < 75% -->
      ${isAttWarn ? `
        <div class="attendance-warning-card" style="margin-bottom:24px;">
          <span style="font-size:26px;">⚠️</span>
          <div>
            <strong>ATTENDANCE SHORTAGE WARNING (< 75%):</strong> Your overall attendance is <strong>${attendance.overall}%</strong>, which is below the mandatory autonomous requirement of 75%. Please attend upcoming classes to avoid examination penalties.
          </div>
        </div>
      ` : ''}

      <!-- Grid 2 Columns: Attendance Summary + Today's Schedule -->
      <div class="grid-2" style="margin-bottom:24px;">
        <!-- Subject Attendance Summary Card -->
        <div class="portal-card">
          <div class="portal-card-header">
            <div class="card-title-group">
              <div class="card-icon-box maroon">📅</div>
              <div>
                <h3 class="card-title">Subject Attendance Quick Look</h3>
                <span class="card-subtitle">Current Semester Theory &amp; Labs</span>
              </div>
            </div>
            <button class="portal-btn outline sm" id="dashAttBtn">View All →</button>
          </div>

          <table class="attendance-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Attended / Total</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${attendance.subjects.slice(0, 4).map(sub => `
                <tr>
                  <td><strong>${sub.name}</strong></td>
                  <td>${sub.attended} / ${sub.totalClasses}</td>
                  <td>
                    <div style="font-weight:700; font-size:12.5px; color:${sub.percentage >= 75 ? 'var(--portal-green)' : 'var(--portal-red)'};">
                      ${sub.percentage}%
                    </div>
                    <div class="attendance-progress-bar-wrap">
                      <div class="attendance-progress-bar ${sub.percentage < 75 ? 'warn' : ''}" style="width:${sub.percentage}%;"></div>
                    </div>
                  </td>
                  <td>
                    <span class="attendance-badge ${sub.percentage >= 75 ? 'good' : 'warn'}">
                      ${sub.percentage >= 75 ? '✅ Good' : '⚠️ Shortage'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Today's Schedule Card -->
        <div class="portal-card">
          <div class="portal-card-header">
            <div class="card-title-group">
              <div class="card-icon-box gold">🗓️</div>
              <div>
                <h3 class="card-title">Today's Class Schedule</h3>
                <span class="card-subtitle">Live timetable for ${user.deptCode || user.department} - ${user.year} (${user.section})</span>
              </div>
            </div>
            <button class="portal-btn outline sm" id="dashTimetableBtn">Full Week →</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
            ${todayClasses.slice(0, 4).map((c, i) => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--portal-cream); border-radius:8px; border:1px solid var(--portal-border);">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div style="background:var(--portal-maroon); color:#fff; font-size:11px; font-weight:800; padding:4px 8px; border-radius:4px;">
                    P${c.period}
                  </div>
                  <div>
                    <div style="font-size:13px; font-weight:700; color:var(--portal-ink);">${c.subject}</div>
                    <div style="font-size:11.5px; color:var(--portal-ink-muted);">👨‍🏫 ${c.faculty} • 📍 ${c.room}</div>
                  </div>
                </div>
                <div style="font-size:12px; font-weight:700; color:var(--portal-maroon);">
                  ${c.time.split('–')[0].trim()}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Hook buttons
    const heroCoding = container.querySelector('#heroCodingBtn');
    const heroTimetable = container.querySelector('#heroTimetableBtn');
    const dashAtt = container.querySelector('#dashAttBtn');
    const dashTimetable = container.querySelector('#dashTimetableBtn');

    if (heroCoding) heroCoding.addEventListener('click', () => switchPortalView('coding'));
    if (heroTimetable) heroTimetable.addEventListener('click', () => switchPortalView('timetable'));
    if (dashAtt) dashAtt.addEventListener('click', () => switchPortalView('attendance'));
    if (dashTimetable) dashTimetable.addEventListener('click', () => switchPortalView('timetable'));
  }

  /* ==========================================================================
     2. ATTENDANCE VIEW
     ========================================================================== */
  function renderAttendanceView(user, attendance) {
    const container = document.getElementById('view-attendance');
    if (!container) return;

    const isWarn = attendance.overall < 75.0;
    const totalAttended = attendance.attendedClasses || attendance.subjects.reduce((sum, s) => sum + s.attended, 0);
    const totalHeld = attendance.totalClasses || attendance.subjects.reduce((sum, s) => sum + s.totalClasses, 0);
    const totalMissed = attendance.missedClasses || (totalHeld - totalAttended);

    // SVG Circular Gauge Calculations
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (attendance.overall / 100) * circumference;

    container.innerHTML = `
      <!-- Overall Attendance Header Banner -->
      <div class="attendance-overview-banner">
        <div class="attendance-gauge-wrap">
          <div class="circular-gauge">
            <svg class="gauge-svg" viewBox="0 0 110 110">
              <circle class="gauge-bg" cx="55" cy="55" r="${radius}"></circle>
              <circle class="gauge-fill ${isWarn ? 'warn' : ''}" cx="55" cy="55" r="${radius}"
                stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
            </svg>
            <div class="gauge-center-text">
              <span class="pct">${attendance.overall}%</span>
              <span class="lbl">Overall</span>
            </div>
          </div>

          <div>
            <h3 style="font-family:'Fraunces', serif; font-size:22px; color:var(--portal-maroon); margin:0 0 6px;">
              Semester Attendance Ledger
            </h3>
            <p style="font-size:13.5px; color:var(--portal-ink-soft); margin:0;">
              Total Classes: <strong>${totalHeld}</strong> | Attended: <strong style="color:var(--portal-green);">${totalAttended}</strong> | Absent: <strong style="color:var(--portal-red);">${totalMissed}</strong>
            </p>
          </div>
        </div>

        <div class="attendance-requirement-card">
          <span style="font-size:22px;">🏛</span>
          <div style="font-size:12.5px; color:#1E40AF;">
            <strong>Autonomous Rule:</strong> Minimum <strong>75%</strong> attendance required to qualify for Autonomous Semester End Examinations.
          </div>
        </div>
      </div>

      <!-- Warning card if shortage -->
      ${isWarn ? `
        <div class="attendance-warning-card" style="margin-bottom:24px;">
          <span style="font-size:26px;">⚠️</span>
          <div>
            <strong>ATTENDANCE SHORTAGE WARNING (< 75%):</strong> Your attendance in one or more subjects is below the required 75% threshold. Please meet your faculty advisor and maintain 100% attendance in upcoming classes.
          </div>
        </div>
      ` : ''}

      <!-- Subject-wise Attendance Table -->
      <div class="portal-card" style="margin-bottom:28px;">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box maroon">📚</div>
            <div>
              <h3 class="card-title">Subject-Wise Attendance Details</h3>
              <span class="card-subtitle">Breakdown of attended, missed, and percentage per course</span>
            </div>
          </div>
        </div>

        <table class="attendance-table">
          <thead>
            <tr>
              <th>Subject Code &amp; Name</th>
              <th>Faculty</th>
              <th>Total Classes</th>
              <th>Attended</th>
              <th>Absent</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Action Plan</th>
            </tr>
          </thead>
          <tbody>
            ${attendance.subjects.map(sub => {
              const shortfall = sub.percentage < 75.0 ? Math.ceil((0.75 * sub.totalClasses - sub.attended) / 0.25) : 0;
              return `
                <tr>
                  <td><strong>${sub.code} — ${sub.name}</strong></td>
                  <td><span style="font-size:12px; color:var(--portal-ink-muted);">${sub.faculty || 'Faculty In-Charge'}</span></td>
                  <td>${sub.totalClasses}</td>
                  <td><strong style="color:var(--portal-green);">${sub.attended}</strong></td>
                  <td><strong style="color:var(--portal-red);">${sub.missed}</strong></td>
                  <td>
                    <div style="font-weight:800; font-size:13.5px; color:${sub.percentage >= 75 ? 'var(--portal-green)' : 'var(--portal-red)'};">
                      ${sub.percentage}%
                    </div>
                    <div class="attendance-progress-bar-wrap">
                      <div class="attendance-progress-bar ${sub.percentage < 75 ? 'warn' : ''}" style="width:${sub.percentage}%;"></div>
                    </div>
                  </td>
                  <td>
                    <span class="attendance-badge ${sub.percentage >= 75 ? 'good' : 'warn'}">
                      ${sub.percentage >= 75 ? '✅ Good' : '⚠️ Shortage'}
                    </span>
                  </td>
                  <td style="font-size:12px; color:${shortfall > 0 ? '#DC2626' : '#15803D'}; font-weight:600;">
                    ${shortfall > 0 ? `Need ${shortfall} consecutive classes` : 'Requirement Fulfilled'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Visual Attendance Comparison Graph against 75% Line -->
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box gold">📊</div>
            <div>
              <h3 class="card-title">Subject Attendance Comparison vs 75% Requirement Line</h3>
              <span class="card-subtitle">Visual indicators across all theory and laboratory courses</span>
            </div>
          </div>
        </div>

        <div style="padding:16px 0; display:flex; flex-direction:column; gap:16px;">
          ${attendance.subjects.map(s => `
            <div>
              <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:4px;">
                <span>${s.code} — ${s.name}</span>
                <span style="color:${s.percentage >= 75 ? 'var(--portal-green)' : 'var(--portal-red)'};">${s.percentage}% (${s.attended}/${s.totalClasses})</span>
              </div>
              <div style="position:relative; width:100%; height:18px; background:#E2E8F0; border-radius:999px; overflow:hidden;">
                <!-- 75% Marker Line -->
                <div style="position:absolute; left:75%; top:0; bottom:0; width:3px; background:#1E293B; z-index:2;" title="75% Mandatory Attendance Line"></div>
                <div style="height:100%; width:${s.percentage}%; background:${s.percentage >= 75 ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #EF4444, #DC2626)'}; border-radius:999px;"></div>
              </div>
            </div>
          `).join('')}
          <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:var(--portal-ink-muted); margin-top:8px;">
            <div style="width:12px; height:12px; background:#1E293B; border-radius:2px;"></div>
            <span>Dark Vertical Marker indicates the UGC/Autonomous 75% Minimum Attendance Threshold</span>
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     3. ACADEMIC PERFORMANCE & MARKS VIEW
     ========================================================================== */
  function renderPerformanceView(user, marks) {
    const container = document.getElementById('view-performance');
    if (!container) return;

    const subjects = marks.currentSemesterSubjects || [];

    container.innerHTML = `
      <!-- Top Overview Cards -->
      <div class="grid-3" style="margin-bottom:28px;">
        <div class="cgpa-display-card">
          <div style="font-size:12px; text-transform:uppercase; color:var(--portal-gold-light); font-weight:800; letter-spacing:0.08em;">
            Current CGPA
          </div>
          <div class="cgpa-big-num">${marks.cgpa}</div>
          <div style="font-size:13px; color:#94A3B8;">${marks.classification || 'First Class with Distinction'}</div>
        </div>

        <div class="portal-card" style="display:flex; flex-direction:column; justify-content:center;">
          <div style="font-size:12px; text-transform:uppercase; color:var(--portal-ink-muted); font-weight:800;">
            Semester 5 SGPA
          </div>
          <div style="font-family:'Fraunces', serif; font-size:36px; font-weight:700; color:var(--portal-maroon); margin:6px 0;">
            8.90
          </div>
          <div style="font-size:12.5px; color:var(--portal-green); font-weight:700;">
            ▲ 0 Active Backlogs (All Clear)
          </div>
        </div>

        <div class="portal-card" style="display:flex; flex-direction:column; justify-content:center;">
          <div style="font-size:12px; text-transform:uppercase; color:var(--portal-ink-muted); font-weight:800;">
            Cumulative Credits
          </div>
          <div style="font-family:'Fraunces', serif; font-size:36px; font-weight:700; color:var(--portal-teal); margin:6px 0;">
            ${marks.totalCredits} / ${marks.maxCredits}
          </div>
          <div style="font-size:12.5px; color:var(--portal-ink-soft);">
            All Credits Cleared
          </div>
        </div>
      </div>

      <!-- Subject-wise Marks Table -->
      <div class="portal-card" style="margin-bottom:28px;">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box maroon">📝</div>
            <div>
              <h3 class="card-title">Subject-Wise Marks &amp; Examination Breakdown</h3>
              <span class="card-subtitle">Internal (30M) + Mid Exams + Assignment (10M) + End-Sem (70M)</span>
            </div>
          </div>
        </div>

        <table class="attendance-table">
          <thead>
            <tr>
              <th>Subject Code &amp; Title</th>
              <th>Internal (30M)</th>
              <th>Assignment (10M)</th>
              <th>Mid-1</th>
              <th>Mid-2</th>
              <th>Lab (50M)</th>
              <th>End-Sem (70M)</th>
              <th>Total Marks</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map(cs => `
              <tr>
                <td><strong>${cs.code} — ${cs.name}</strong></td>
                <td>${cs.internalMarks} / ${cs.maxInternal}</td>
                <td>${cs.assignmentMarks} / ${cs.maxAssignment}</td>
                <td>${cs.mid1}</td>
                <td>${cs.mid2}</td>
                <td>${cs.labMarks} / ${cs.maxLab}</td>
                <td><strong>${cs.endSem}</strong> / ${cs.maxEndSem}</td>
                <td><strong style="color:var(--portal-maroon); font-size:15px;">${cs.total}</strong> / 100</td>
                <td><span class="grade-badge-pill grade-${cs.grade === 'A+' ? 'Ap' : cs.grade}">${cs.grade} (${cs.gradePoint})</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- PERFORMANCE GRAPH (Visual Interactive SVG/CSS Bar Chart) -->
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box gold">📊</div>
            <div>
              <h3 class="card-title">Performance Graph — Subject Score vs Class Average vs Highest</h3>
              <span class="card-subtitle">Comparative visual distribution across all enrolled semester courses</span>
            </div>
          </div>
        </div>

        <div class="performance-chart-container" style="margin-top:20px; padding:20px 10px;">
          <div class="chart-bars-group" style="display:flex; justify-content:space-around; align-items:flex-end; height:240px; border-bottom:2px solid var(--portal-border); padding-bottom:10px;">
            ${subjects.map(cs => `
              <div style="display:flex; flex-direction:column; align-items:center; width:${Math.floor(80 / subjects.length)}%;">
                <div style="display:flex; align-items:flex-end; gap:6px; height:200px;">
                  <!-- Student Score Bar -->
                  <div style="width:24px; height:${cs.total * 2}px; background:linear-gradient(180deg, #7A1220 0%, #A62435 100%); border-radius:4px 4px 0 0; position:relative;" title="${cs.name} (Your Score): ${cs.total}/100">
                    <span style="position:absolute; top:-20px; left:50%; transform:translateX(-50%); font-size:11px; font-weight:800; color:var(--portal-maroon);">${cs.total}</span>
                  </div>

                  <!-- Class Average Bar -->
                  <div style="width:16px; height:${cs.classAvg * 2}px; background:#94A3B8; border-radius:3px 3px 0 0; position:relative;" title="${cs.name} (Class Average): ${cs.classAvg}/100">
                    <span style="position:absolute; top:-18px; left:50%; transform:translateX(-50%); font-size:10px; color:#64748B;">${cs.classAvg}</span>
                  </div>

                  <!-- Highest Score Bar -->
                  <div style="width:16px; height:${cs.highest * 2}px; background:#D9A227; border-radius:3px 3px 0 0; position:relative;" title="${cs.name} (Highest Score): ${cs.highest}/100">
                    <span style="position:absolute; top:-18px; left:50%; transform:translateX(-50%); font-size:10px; color:#B45309;">${cs.highest}</span>
                  </div>
                </div>

                <div style="margin-top:10px; font-size:11.5px; font-weight:700; text-align:center; color:var(--portal-ink);">
                  ${cs.code}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Chart Legend -->
          <div style="display:flex; justify-content:center; gap:24px; margin-top:20px; font-size:12.5px; font-weight:600;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:16px; height:16px; background:var(--portal-maroon); border-radius:3px;"></div>
              <span>Your Subject Marks</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:16px; height:16px; background:#94A3B8; border-radius:3px;"></div>
              <span>Class Average Marks</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:16px; height:16px; background:#D9A227; border-radius:3px;"></div>
              <span>Highest Score in Class</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     4. CGPA & CREDITS VIEW
     ========================================================================== */
  function renderCgpaView(user, marks) {
    const container = document.getElementById('view-cgpa');
    if (!container) return;

    const semesters = marks.semesters || [];

    container.innerHTML = `
      <div class="grid-3" style="margin-bottom:28px;">
        <div class="cgpa-display-card">
          <div style="font-size:12px; text-transform:uppercase; color:var(--portal-gold-light); font-weight:800; letter-spacing:0.08em;">
            Cumulative Grade Point Average
          </div>
          <div class="cgpa-big-num">${marks.cgpa}</div>
          <div style="font-size:13px; color:#94A3B8;">${marks.classification || 'First Class with Distinction'}</div>
        </div>

        <div class="portal-card" style="display:flex; flex-direction:column; justify-content:center;">
          <div style="font-size:12px; text-transform:uppercase; color:var(--portal-ink-muted); font-weight:800;">
            Total Earned Credits
          </div>
          <div style="font-family:'Fraunces', serif; font-size:36px; font-weight:700; color:var(--portal-maroon); margin:6px 0;">
            ${marks.totalCredits} / ${marks.maxCredits}
          </div>
          <div style="font-size:12.5px; color:var(--portal-green); font-weight:700;">
            72.5% Degree Requirements Completed
          </div>
        </div>

        <div class="portal-card" style="display:flex; flex-direction:column; justify-content:center;">
          <div style="font-size:12px; text-transform:uppercase; color:var(--portal-ink-muted); font-weight:800;">
            Active Backlogs
          </div>
          <div style="font-family:'Fraunces', serif; font-size:36px; font-weight:700; color:var(--portal-green); margin:6px 0;">
            0
          </div>
          <div style="font-size:12.5px; color:var(--portal-ink-soft);">
            All Semester Subjects Cleared on First Attempt
          </div>
        </div>
      </div>

      <!-- Semester-wise SGPA Progression Cards -->
      <div class="portal-card" style="margin-bottom:28px;">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box gold">📈</div>
            <div>
              <h3 class="card-title">Semester-Wise SGPA Progression &amp; Credits</h3>
              <span class="card-subtitle">Academic record across all semesters</span>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(${Math.max(1, semesters.length)}, 1fr); gap:16px; margin-top:16px;">
          ${semesters.map(sm => `
            <div style="background:var(--portal-cream); border:1px solid var(--portal-border); border-radius:12px; padding:18px 14px; text-align:center;">
              <div style="font-size:11px; font-weight:800; color:var(--portal-maroon); text-transform:uppercase;">${sm.sem}</div>
              <div style="font-family:'Fraunces', serif; font-size:30px; font-weight:700; color:var(--portal-ink); margin:6px 0;">${sm.gpa}</div>
              <div style="font-size:11.5px; color:var(--portal-ink-muted);">Credits: <strong>${sm.totalCredits}</strong></div>
              <div style="margin-top:10px;">
                <span class="attendance-badge good">${sm.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SGPA Progression Visual Chart -->
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box maroon">🎓</div>
            <div>
              <h3 class="card-title">Academic Progress &amp; Growth Trajectory</h3>
              <span class="card-subtitle">Continuous upward GPA trend from Semester 1 to Semester 5</span>
            </div>
          </div>
        </div>

        <div style="padding:20px 0;">
          <div style="display:flex; justify-content:space-around; align-items:flex-end; height:180px; border-bottom:2px solid var(--portal-border); padding-bottom:8px;">
            ${semesters.map(sm => `
              <div style="display:flex; flex-direction:column; align-items:center; width:60px;">
                <div style="width:36px; height:${(sm.gpa - 7.0) * 80 + 30}px; background:linear-gradient(180deg, #D9A227 0%, #B45309 100%); border-radius:4px 4px 0 0; position:relative;">
                  <span style="position:absolute; top:-20px; left:50%; transform:translateX(-50%); font-size:11.5px; font-weight:800; color:var(--portal-maroon);">${sm.gpa}</span>
                </div>
                <div style="margin-top:8px; font-size:12px; font-weight:700; color:var(--portal-ink);">${sm.sem}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     5. CODING PRACTICE (CODEQUEST ARENA) VIEW
     ========================================================================== */
  function renderCodingPracticeView(user, progress, questions) {
    const container = document.getElementById('view-coding');
    if (!container) return;

    let filteredQuestions = window.BVCITS_DB.getCodingQuestions(activeDifficultyFilter);
    if (!filteredQuestions.length) filteredQuestions = questions;

    if (!activeCodingQuestion || !filteredQuestions.some(q => q.id === activeCodingQuestion.id)) {
      activeCodingQuestion = filteredQuestions[0];
    }

    const totalXp = progress.totalXp || 0;
    const streak = progress.streakDays || 1;
    const solvedCount = progress.problemsSolved || 0;
    const solvedIds = progress.solvedQuestionIds || [];

    container.innerHTML = `
      <!-- CodeQuest Game HUD -->
      <div class="codequest-hud-banner">
        <div class="hud-top-row">
          <div class="hud-game-title">
            <div class="hud-logo-icon">⚔️</div>
            <div>
              <h2>CodeQuest Coding Arena</h2>
              <p>Solve programming challenges in Java, Python, C, C++, or JavaScript. Run tests, submit code, and earn XP!</p>
            </div>
          </div>

          <div class="hud-stats-grid">
            <div class="hud-stat-box">
              <div class="val">${totalXp} XP</div>
              <div class="lbl">Score</div>
            </div>
            <div class="hud-stat-box">
              <div class="val">${solvedCount}</div>
              <div class="lbl">Problems Solved</div>
            </div>
            <div class="hud-stat-box">
              <div class="val">🔥 ${streak}d</div>
              <div class="lbl">Active Streak</div>
            </div>
            <div class="hud-stat-box">
              <div class="val">${progress.accuracy}%</div>
              <div class="lbl">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Difficulty Filter Tabs -->
      <div class="portal-card" style="margin-bottom:18px; padding:12px 20px;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:12.5px; font-weight:700; color:var(--portal-ink-muted);">Difficulty Level:</span>
            <div class="code-diff-filters">
              <button type="button" class="diff-btn ${activeDifficultyFilter === 'all' ? 'active' : ''}" data-diff="all">All Problems (${questions.length})</button>
              <button type="button" class="diff-btn ${activeDifficultyFilter === 'easy' ? 'active' : ''}" data-diff="easy">🟢 Easy</button>
              <button type="button" class="diff-btn ${activeDifficultyFilter === 'medium' ? 'active' : ''}" data-diff="medium">🟡 Medium</button>
              <button type="button" class="diff-btn ${activeDifficultyFilter === 'hard' ? 'active' : ''}" data-diff="hard">🔴 Hard</button>
            </div>
          </div>

          <!-- Problem Selector Buttons -->
          <div style="display:flex; align-items:center; gap:8px; overflow-x:auto;" id="problemChipsContainer">
            ${filteredQuestions.map(q => {
              const isSolved = solvedIds.includes(q.id);
              const isSelected = activeCodingQuestion && activeCodingQuestion.id === q.id;
              return `
                <button type="button" class="portal-btn sm ${isSelected ? 'primary' : 'outline'}"
                        style="flex-shrink:0; border-color:${isSolved ? 'var(--portal-green)' : ''};"
                        data-qid="${q.id}">
                  <span>${isSolved ? '✅' : '⚡'} ${q.title}</span>
                  <span style="font-size:10px; opacity:0.8;">(+${q.xpReward} XP)</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Split-Screen Coding Arena Layout -->
      <div class="coding-arena-layout">
        <!-- LEFT: Problem Statement -->
        <div class="problem-desc-panel">
          <div class="problem-header">
            <div class="problem-title-row">
              <h3>${activeCodingQuestion.title}</h3>
              <span class="difficulty-badge difficulty-${activeCodingQuestion.difficulty.toLowerCase()}">
                ${activeCodingQuestion.difficulty}
              </span>
            </div>
            <div class="problem-meta-tags">
              <span class="problem-tag-chip">📁 Category: ${activeCodingQuestion.category}</span>
              <span class="problem-tag-chip">⚡ XP Reward: +${activeCodingQuestion.xpReward} XP</span>
            </div>
          </div>

          <div class="problem-content-body">
            <h4>Problem Description</h4>
            <p>${activeCodingQuestion.description}</p>

            <h4>Input Format</h4>
            <p style="white-space:pre-line;">${activeCodingQuestion.inputFormat}</p>

            <h4>Output Format</h4>
            <p style="white-space:pre-line;">${activeCodingQuestion.outputFormat}</p>

            <h4>Constraints</h4>
            <p style="font-family:monospace; white-space:pre-line; background:#F1F5F9; padding:8px 12px; border-radius:6px;">${activeCodingQuestion.constraints}</p>

            <h4>Sample Examples</h4>
            ${(activeCodingQuestion.sampleCases || []).map((sc, idx) => `
              <div style="margin-bottom:12px;">
                <div style="font-size:12px; font-weight:700; color:var(--portal-ink-muted);">Example ${idx + 1}:</div>
                <div class="code-example-box"><strong>Input:</strong>
${sc.input || '(no input)'}

<strong>Output:</strong>
${sc.expectedOutput}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- RIGHT: Code Editor & Execution Console -->
        <div class="code-editor-panel">
          <div class="editor-topbar">
            <div class="lang-selector-wrap">
              <label style="color:#94A3B8; font-size:11.5px; font-weight:700;">Language:</label>
              <select id="codeLangSelect" class="lang-select">
                <option value="java" ${activeCodingLanguage === 'java' ? 'selected' : ''}>Java (OpenJDK 15)</option>
                <option value="python" ${activeCodingLanguage === 'python' ? 'selected' : ''}>Python (3.10)</option>
                <option value="c" ${activeCodingLanguage === 'c' ? 'selected' : ''}>C (GCC 10.2)</option>
                <option value="cpp" ${activeCodingLanguage === 'cpp' ? 'selected' : ''}>C++ (G++ 10.2)</option>
                <option value="javascript" ${activeCodingLanguage === 'javascript' ? 'selected' : ''}>JavaScript (Node.js 18)</option>
              </select>
            </div>

            <div class="editor-actions">
              <button type="button" class="editor-btn reset" id="resetCodeBtn" title="Reset starter code">↺ Reset</button>
              <button type="button" class="editor-btn run" id="runCodeBtn">▶ Run Code</button>
              <button type="button" class="editor-btn submit" id="submitCodeBtn">🚀 Submit Code</button>
            </div>
          </div>

          <!-- Code Textarea -->
          <div class="code-textarea-wrap">
            <textarea id="codeEditorArea" class="code-editor-textarea" spellcheck="false">${(activeCodingQuestion.starterCode && activeCodingQuestion.starterCode[activeCodingLanguage]) || '// Write your code solution here'}</textarea>
          </div>

          <!-- Output / Error Console -->
          <div class="editor-output-panel" id="editorConsolePanel">
            <div class="output-header">
              <span class="output-title">Terminal &amp; Execution Output</span>
              <span id="outputStatusTag" class="output-status-tag" style="display:none;">Ready</span>
            </div>
            <pre class="console-output-text" id="consoleOutputText">Select your language, write your code, and click 'Run Code' or 'Submit Code'.</pre>
          </div>
        </div>
      </div>
    `;

    bindCodingPracticeEvents(user, progress, questions);
  }

  function bindCodingPracticeEvents(user, progress, questions) {
    const langSelect = document.getElementById('codeLangSelect');
    const editorArea = document.getElementById('codeEditorArea');
    const runBtn = document.getElementById('runCodeBtn');
    const submitBtn = document.getElementById('submitCodeBtn');
    const resetBtn = document.getElementById('resetCodeBtn');
    const consoleOutput = document.getElementById('consoleOutputText');
    const statusTag = document.getElementById('outputStatusTag');

    // Filter Buttons (Easy, Medium, Hard, All)
    const diffBtns = document.querySelectorAll('.diff-btn[data-diff]');
    diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeDifficultyFilter = btn.getAttribute('data-diff');
        renderCodingPracticeView(user, progress, questions);
      });
    });

    // Language Change
    if (langSelect && editorArea) {
      langSelect.addEventListener('change', () => {
        activeCodingLanguage = langSelect.value;
        if (activeCodingQuestion && activeCodingQuestion.starterCode) {
          editorArea.value = activeCodingQuestion.starterCode[activeCodingLanguage] || '';
        }
      });
    }

    // Reset Starter Code
    if (resetBtn && editorArea) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset editor to initial template?')) {
          editorArea.value = (activeCodingQuestion.starterCode && activeCodingQuestion.starterCode[activeCodingLanguage]) || '';
        }
      });
    }

    // Switch Question Chips
    const chips = document.querySelectorAll('#problemChipsContainer [data-qid]');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const qid = chip.getAttribute('data-qid');
        const q = questions.find(item => item.id === qid);
        if (q) {
          activeCodingQuestion = q;
          renderCodingPracticeView(user, progress, questions);
        }
      });
    });

    // RUN CODE BUTTON
    if (runBtn) {
      runBtn.addEventListener('click', async () => {
        const code = editorArea.value;
        const lang = langSelect.value;
        const sampleInput = (activeCodingQuestion.sampleCases && activeCodingQuestion.sampleCases[0]?.input) || '';

        runBtn.disabled = true;
        statusTag.style.display = 'inline-block';
        statusTag.className = 'output-status-tag status-running';
        statusTag.textContent = 'Compiling & Running...';
        consoleOutput.textContent = `[COMPILER] Executing ${lang.toUpperCase()} source...\n`;

        const result = await window.BVCITS_RUNNER.execute(lang, code, sampleInput);
        runBtn.disabled = false;

        if (result.isCompileError) {
          statusTag.className = 'output-status-tag status-failed';
          statusTag.textContent = 'Compilation Error ⚠️';
          consoleOutput.textContent = `[COMPILATION ERROR]\n${result.stderr}`;
        } else if (result.isRuntimeError) {
          statusTag.className = 'output-status-tag status-failed';
          statusTag.textContent = 'Runtime Error ❌';
          consoleOutput.textContent = `[RUNTIME ERROR]\n${result.stderr}\nExit Code: ${result.exitCode}`;
        } else {
          statusTag.className = 'output-status-tag status-passed';
          statusTag.textContent = 'Execution Succeeded ✅';
          consoleOutput.textContent = `[OUTPUT (Execution Time: ${result.executionTimeMs}ms)]\n${result.stdout || '(Empty Output)'}`;
        }
      });
    }

    // SUBMIT CODE BUTTON
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        const code = editorArea.value;
        const lang = langSelect.value;

        submitBtn.disabled = true;
        statusTag.style.display = 'inline-block';
        statusTag.className = 'output-status-tag status-running';
        statusTag.textContent = 'Evaluating Test Cases...';
        consoleOutput.textContent = `[TEST SUITE] Evaluating against all hidden and sample test cases...\n`;

        const testReport = await window.BVCITS_RUNNER.testAllCases(activeCodingQuestion, lang, code);
        submitBtn.disabled = false;

        let logOutput = `=== CODEQUEST TEST RUN REPORT ===\nTotal Cases: ${testReport.totalCount} | Passed: ${testReport.passedCount} | Failed: ${testReport.totalCount - testReport.passedCount}\nAverage Execution Time: ${testReport.avgRuntimeMs}ms\n\n`;

        testReport.details.forEach(tc => {
          logOutput += `Test Case #${tc.index} (${tc.isHidden ? 'Hidden' : 'Sample'}): ${tc.passed ? 'PASSED ✅' : 'FAILED ❌'}\n`;
          if (!tc.passed) {
            logOutput += `  Expected: ${tc.expected}\n  Actual:   ${tc.actual}\n`;
            if (tc.error) logOutput += `  Error:    ${tc.error}\n`;
          }
        });

        if (testReport.allPassed) {
          statusTag.className = 'output-status-tag status-passed';
          statusTag.textContent = 'Accepted ✅';
          logOutput += `\n🎉 CONGRATULATIONS! ALL TEST CASES PASSED!\nEarned +${activeCodingQuestion.xpReward} XP! Problem marked as Solved.`;

          // Record in DB
          window.BVCITS_DB.recordSuccessfulSubmission(
            user.id,
            activeCodingQuestion.id,
            lang,
            code,
            `${testReport.avgRuntimeMs}ms`,
            testReport.memoryUsageKb
          );

          consoleOutput.textContent = logOutput;
          showToast(`🏆 Problem Solved! +${activeCodingQuestion.xpReward} XP Earned!`, 'success');

          // Refresh HUD
          setTimeout(() => {
            const updatedProg = window.BVCITS_DB.getCodingProgress(user.id);
            renderCodingPracticeView(user, updatedProg, questions);
          }, 1200);

        } else {
          statusTag.className = 'output-status-tag status-failed';
          statusTag.textContent = 'Wrong Answer ❌';
          consoleOutput.textContent = logOutput;
          showToast(`❌ Test Evaluation Failed: ${testReport.passedCount}/${testReport.totalCount} test cases passed.`, 'error');
        }
      });
    }
  }

  /* ==========================================================================
     6. TIMETABLE VIEW
     ========================================================================== */
  function renderTimetableView(user) {
    const container = document.getElementById('view-timetable');
    if (!container) return;

    const timetableData = window.BVCITS_DB.getTimetableForUser(user.id);
    const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const currentDay = (activeTimetableDay === 'Today' || !activeTimetableDay) ? 'Monday' : activeTimetableDay;

    container.innerHTML = `
      <div class="portal-card" style="margin-bottom:24px;">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box gold">🗓️</div>
            <div>
              <h3 class="card-title">Class Time Table &amp; Faculty In-Charge</h3>
              <span class="card-subtitle">${timetableData.department} — ${timetableData.year} (Section ${timetableData.section})</span>
            </div>
          </div>

          <!-- Day Selection Tabs -->
          <div class="timetable-day-tabs">
            <button type="button" class="day-tab-btn ${activeTimetableDay === 'Today' || activeTimetableDay === 'Monday' ? 'active' : ''}" data-day="Monday">Monday</button>
            <button type="button" class="day-tab-btn ${activeTimetableDay === 'Tuesday' ? 'active' : ''}" data-day="Tuesday">Tuesday</button>
            <button type="button" class="day-tab-btn ${activeTimetableDay === 'Wednesday' ? 'active' : ''}" data-day="Wednesday">Wednesday</button>
            <button type="button" class="day-tab-btn ${activeTimetableDay === 'Thursday' ? 'active' : ''}" data-day="Thursday">Thursday</button>
            <button type="button" class="day-tab-btn ${activeTimetableDay === 'Friday' ? 'active' : ''}" data-day="Friday">Friday</button>
            <button type="button" class="day-tab-btn ${activeTimetableDay === 'Saturday' ? 'active' : ''}" data-day="Saturday">Saturday</button>
            <button type="button" class="day-tab-btn ${activeTimetableDay === 'FullWeek' ? 'active' : ''}" data-day="FullWeek">Full Week Grid</button>
          </div>
        </div>

        ${activeTimetableDay === 'FullWeek' ? renderFullWeekGrid(timetableData) : renderSingleDayTimetable(timetableData, currentDay)}
      </div>
    `;

    // Bind Day tab events
    const dayBtns = container.querySelectorAll('.day-tab-btn[data-day]');
    dayBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeTimetableDay = btn.getAttribute('data-day');
        renderTimetableView(user);
      });
    });
  }

  function renderSingleDayTimetable(timetableData, dayName) {
    const schedule = (timetableData.schedule && timetableData.schedule[dayName]) || [];

    if (!schedule.length) {
      return `<div style="padding:32px; text-align:center; color:var(--portal-ink-muted);">No classes scheduled for ${dayName}.</div>`;
    }

    return `
      <div style="padding:16px 0;">
        <h4 style="font-size:16px; color:var(--portal-maroon); margin:0 0 16px;">Schedule for ${dayName}</h4>
        <table class="attendance-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Time Slot</th>
              <th>Subject Code &amp; Title</th>
              <th>Faculty Name</th>
              <th>Classroom / Lab Location</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            ${schedule.map(slot => `
              <tr>
                <td><span class="period-badge">Period ${slot.period}</span></td>
                <td><strong style="color:var(--portal-maroon); font-size:13px;">${slot.time}</strong></td>
                <td><strong>${slot.code} — ${slot.subject}</strong></td>
                <td>👨‍🏫 ${slot.faculty}</td>
                <td><span class="room-pill">📍 ${slot.room}</span></td>
                <td>
                  <span class="attendance-badge ${slot.subject.toLowerCase().includes('lab') ? 'warn' : 'good'}">
                    ${slot.subject.toLowerCase().includes('lab') ? '🔬 Practical Lab' : '📖 Theory'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderFullWeekGrid(timetableData) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return `
      <div style="padding:16px 0; overflow-x:auto;">
        <h4 style="font-size:16px; color:var(--portal-maroon); margin:0 0 16px;">Full Weekly Timetable Matrix</h4>
        <div style="display:flex; flex-direction:column; gap:20px;">
          ${days.map(d => {
            const slots = (timetableData.schedule && timetableData.schedule[d]) || [];
            return `
              <div style="background:var(--portal-cream); border:1px solid var(--portal-border); border-radius:10px; padding:16px;">
                <h5 style="margin:0 0 12px; color:var(--portal-maroon); font-size:15px; font-weight:800;">${d}</h5>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px;">
                  ${slots.map(s => `
                    <div style="background:#fff; border:1px solid var(--portal-border); border-radius:8px; padding:12px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                      <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; color:var(--portal-maroon); margin-bottom:4px;">
                        <span>P${s.period}</span>
                        <span>${s.time.split('–')[0].trim()}</span>
                      </div>
                      <div style="font-size:12.5px; font-weight:700; color:var(--portal-ink); line-height:1.3;">${s.subject}</div>
                      <div style="font-size:11px; color:var(--portal-ink-muted); margin-top:6px;">👨‍🏫 ${s.faculty}</div>
                      <div style="font-size:10.5px; color:#475569; margin-top:2px;">📍 ${s.room}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     7. NOTIFICATIONS VIEW
     ========================================================================== */
  function renderNotificationsView(user) {
    const container = document.getElementById('view-notifications');
    if (!container) return;

    const notifs = window.BVCITS_DB.getNotifications(user.id, activeNotifCategory);

    container.innerHTML = `
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box maroon">🔔</div>
            <div>
              <h3 class="card-title">Campus &amp; Academic Notifications</h3>
              <span class="card-subtitle">Official announcements from Principal Office, Examination Cell, and Faculty</span>
            </div>
          </div>

          <!-- Category Filter Tabs -->
          <div class="notif-filter-tabs">
            <button type="button" class="notif-tab-btn ${activeNotifCategory === 'all' ? 'active' : ''}" data-cat="all">All Alerts</button>
            <button type="button" class="notif-tab-btn ${activeNotifCategory === 'college' ? 'active' : ''}" data-cat="college">🏛 College Announcements</button>
            <button type="button" class="notif-tab-btn ${activeNotifCategory === 'exam' ? 'active' : ''}" data-cat="exam">📝 Exam Notices</button>
            <button type="button" class="notif-tab-btn ${activeNotifCategory === 'assignment' ? 'active' : ''}" data-cat="assignment">📂 Assignments</button>
            <button type="button" class="notif-tab-btn ${activeNotifCategory === 'attendance' ? 'active' : ''}" data-cat="attendance">⚠️ Attendance Alerts</button>
          </div>
        </div>

        <div class="notification-full-list" style="margin-top:18px;">
          ${notifs.length === 0 ? `
            <div style="padding:40px; text-align:center; color:var(--portal-ink-muted);">No notifications found for this category.</div>
          ` : notifs.map(n => `
            <div class="notif-card-item ${n.unread ? 'unread' : ''}" data-nid="${n.id}">
              <div class="notif-card-left">
                <div class="notif-icon-box ${n.category}">
                  ${n.category === 'attendance' ? '⚠️' : (n.category === 'exam' ? '📝' : (n.category === 'assignment' ? '📂' : '🏛'))}
                </div>
                <div class="notif-card-text">
                  <div class="notif-meta-line">
                    <span class="notif-category-chip">${n.categoryLabel || n.category}</span>
                    <span class="notif-sender">From: ${n.sender || 'BVCITS Administration'}</span>
                    <span class="notif-time-tag">⏱ ${n.time}</span>
                  </div>
                  <h4 class="notif-card-title">${n.title}</h4>
                  <p class="notif-card-desc">${n.text}</p>
                </div>
              </div>
              <div class="notif-card-actions">
                ${n.unread ? `<button type="button" class="portal-btn outline sm mark-read-btn" data-nid="${n.id}">Mark as Read</button>` : `<span style="font-size:12px; color:var(--portal-green); font-weight:700;">✓ Read</span>`}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Hook category buttons
    const catBtns = container.querySelectorAll('.notif-tab-btn[data-cat]');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeNotifCategory = btn.getAttribute('data-cat');
        renderNotificationsView(user);
      });
    });

    // Hook Mark as Read buttons
    const markReadBtns = container.querySelectorAll('.mark-read-btn[data-nid]');
    markReadBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nid = btn.getAttribute('data-nid');
        window.BVCITS_DB.markNotificationRead(user.id, nid);
        renderNotificationsView(user);
      });
    });
  }

  /* ==========================================================================
     8. STUDENT PROFILE VIEW
     ========================================================================== */
  function renderProfileView(user, attendance, marks, progress) {
    const container = document.getElementById('view-profile');
    if (!container) return;

    container.innerHTML = `
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box maroon">👤</div>
            <div>
              <h3 class="card-title">Official Student Profile Information</h3>
              <span class="card-subtitle">Autonomous Academic Record &amp; Personal Credentials</span>
            </div>
          </div>
        </div>

        <div class="profile-layout-grid" style="display:grid; grid-template-columns:260px 1fr; gap:32px; align-items:start; margin-top:20px;">
          <!-- Profile Badge Card -->
          <div style="background:var(--portal-cream); border:1px solid var(--portal-border); border-radius:12px; padding:24px; text-align:center;">
            <img src="${user.avatar || 'images/bvcits_seal.jpg'}" alt="${user.fullName}" style="width:110px; height:110px; border-radius:50%; object-fit:cover; border:3px solid var(--portal-gold); margin-bottom:12px;">
            <h4 style="font-family:'Fraunces', serif; font-size:19px; color:var(--portal-maroon); margin:0 0 4px;">${user.fullName}</h4>
            <div style="font-size:13px; font-weight:700; color:var(--portal-ink-muted);">${user.rollNo}</div>
            <div style="margin-top:12px;">
              <span class="attendance-badge good">Status: ${user.status}</span>
            </div>
            <div style="margin-top:16px; font-size:12px; color:var(--portal-ink-soft); line-height:1.5;">
              ${user.program || user.department}<br>
              <strong>BVCITS Amalapuram</strong>
            </div>
          </div>

          <!-- Detailed Information Grid -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="contact-item">
              <div class="lbl">Student Full Name</div>
              <div class="val">${user.fullName}</div>
            </div>
            <div class="contact-item">
              <div class="lbl">University Roll Number</div>
              <div class="val">${user.rollNo}</div>
            </div>
            <div class="contact-item">
              <div class="lbl">Branch / Department</div>
              <div class="val">${user.department}</div>
            </div>
            <div class="contact-item">
              <div class="lbl">Academic Year &amp; Section</div>
              <div class="val">${user.year} • Section ${user.section}</div>
            </div>
            <div class="contact-item">
              <div class="lbl">Current Semester</div>
              <div class="val">${user.semester}</div>
            </div>
            <div class="contact-item">
              <div class="lbl">Cumulative Grade Point (CGPA)</div>
              <div class="val" style="color:var(--portal-maroon); font-weight:800;">${marks.cgpa} / 10.0</div>
            </div>
            <div class="contact-item">
              <div class="lbl">Registered Student Email</div>
              <div class="val">${user.email}</div>
            </div>
            <div class="contact-item">
              <div class="lbl">Contact Phone Number</div>
              <div class="val">${user.phone}</div>
            </div>
            <div class="contact-item">
              <div class="lbl">Assigned Faculty Mentor</div>
              <div class="val">${user.mentor}</div>
            </div>
            <div class="contact-item">
              <div class="lbl">Campus Placement Status</div>
              <div class="val" style="color:var(--portal-maroon); font-weight:700;">${user.placementStatus || 'Enrolled in CRT'}</div>
            </div>
            <div class="contact-item" style="grid-column: span 2;">
              <div class="lbl">Permanent Residential Address</div>
              <div class="val">${user.address || 'Amalapuram, East Godavari District, Andhra Pradesh - 533201'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     Notification Dropdown Setup & Toast Helper
     ========================================================================== */
  function setupNotificationBell(user) {
    const bellBtn = document.getElementById('notificationBellBtn');
    const dropdown = document.getElementById('notificationDropdown');
    const list = document.getElementById('dropdownNotifList');

    if (!bellBtn || !dropdown || !list) return;

    const notifs = window.BVCITS_DB.getNotifications(user.id);
    list.innerHTML = notifs.slice(0, 4).map(n => `
      <div class="notification-item ${n.unread ? 'unread' : ''}" style="cursor:pointer;" onclick="document.querySelector('.sidebar-link[data-view=\\'notifications\\']').click();">
        <div class="notif-icon">${n.category === 'attendance' ? '⚠️' : (n.category === 'exam' ? '📝' : (n.category === 'assignment' ? '📂' : '🏛'))}</div>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-text">${n.text}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>
    `).join('');

    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== bellBtn) {
        dropdown.classList.remove('show');
      }
    });
  }

  function showToast(message, type = 'info') {
    let container = document.querySelector('.portal-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'portal-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `portal-toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️')}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

})(window);
