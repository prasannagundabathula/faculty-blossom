/**
 * BVCITS Faculty Portal Controller — Complete Academic & CodeQuest Management
 */

(function (window) {
  'use strict';

  // Immediate and bfcache authentication check for Faculty Portal
  function verifyFacultyAccess() {
    if (!window.BVCITS_AUTH || !window.BVCITS_AUTH.requireAuth(['faculty', 'admin'])) {
      return false;
    }
    return true;
  }

  // Handle browser Back / Forward navigation and bfcache restoration
  window.addEventListener('pageshow', () => {
    verifyFacultyAccess();
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (!verifyFacultyAccess()) {
      return;
    }

    initFacultyPortal();
  });

  // Global event delegation for all logout buttons in Faculty Portal
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

  function initFacultyPortal() {
    const authUser = window.BVCITS_AUTH.getCurrentUser();
    if (!authUser) return;
    const db = window.BVCITS_DB;
    const user = db ? (db.getUserById(authUser.id) || authUser) : authUser;

    // Header Profile
    const nameEl = document.getElementById('topbarUserName');
    const roleEl = document.getElementById('topbarUserRole');
    if (nameEl) nameEl.textContent = user.fullName;
    if (roleEl) roleEl.textContent = `${user.designation || 'Faculty'} (${user.department || 'CSE'})`;
    const topAvatar = document.querySelector('.topbar-user .user-avatar');
    if (topAvatar) {
      topAvatar.src = window.BVCITSPhotos.resolve(user);
      topAvatar.onerror = () => window.BVCITSPhotos.handleError(topAvatar, window.BVCITSPhotos.fallbackChain(user));
    }


    // Mobile Sidebar Toggle
    const mobileBtn = document.getElementById('mobileSidebarToggle');
    const sidebar = document.querySelector('.portal-sidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Setup Navigation
    setupFacultyNav(user, db);

    // Initial View
    renderFacultyDashboard(user, db);
  }

  function setupFacultyNav(user, db) {
    const links = document.querySelectorAll('.sidebar-link[data-view]');
    const views = document.querySelectorAll('.portal-view');
    const pageTitle = document.getElementById('pageTitle');
    const breadcrumb = document.getElementById('currentBreadcrumb');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = link.getAttribute('data-view');

        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        views.forEach(v => v.classList.remove('active'));
        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) targetView.classList.add('active');

        // Close mobile sidebar if open
        const sidebar = document.querySelector('.portal-sidebar');
        if (sidebar) sidebar.classList.remove('mobile-open');

        const title = link.querySelector('span:not(.icon):not(.badge-count)')?.textContent || 'Faculty Portal';
        if (pageTitle) pageTitle.textContent = title;
        if (breadcrumb) breadcrumb.textContent = title;

        // Render target view
        switch (viewId) {
          case 'dashboard':
            renderFacultyDashboard(user, db);
            break;
          case 'students':
            renderStudentsRoster(user, db);
            break;
          case 'attendance':
            renderAttendanceMarker(user, db);
            break;
          case 'marks':
            renderMarksEntry(user, db);
            break;
          case 'assignments':
            renderAssignmentManager(user, db);
            break;
          case 'exams':
            renderExamsManager(user, db);
            break;
          case 'questions':
            renderQuestionCreator(user, db);
            break;
          case 'submissions':
            renderSubmissionsViewer(user, db);
            break;
          case 'announcements':
            renderAnnouncementsManager(user, db);
            break;
          case 'notifications':
            renderNotificationsView(user, db);
            break;
          case 'profile':
            renderFacultyProfileView(user, db);
            break;
        }
      });
    });
  }

  /* ==========================================================================
     1. Faculty Dashboard Overview
     ========================================================================== */
  function renderFacultyDashboard(user, db) {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    const students = db.getUsers().filter(u => u.role === 'student');
    const submissions = db.getSubmissions();
    const assignments = db.getAssignments();
    const exams = db.getExams();

    // Compute metrics
    let totalAttSum = 0;
    students.forEach(st => {
      const att = db.getAttendanceForUser(st.id);
      totalAttSum += (att.overall || 85);
    });
    const avgAttendance = (totalAttSum / (students.length || 1)).toFixed(1);

    container.innerHTML = `
      <!-- Top Faculty Profile Banner -->
      <div class="dashboard-hero-banner">
        <div class="hero-student-profile">
          ${window.BVCITSPhotos.imgTag(user, 'hero-avatar')}
          <div class="hero-profile-meta">
            <h2>Faculty Portal — ${user.fullName}</h2>
            <div class="hero-tags-row">
              <span class="hero-tag">🆔 ID: ${user.employeeId || 'FAC001'}</span>
              <span class="hero-tag">🏛 ${user.department} Department</span>
              <span class="hero-tag">⭐ ${user.designation}</span>
              <span class="hero-tag">✉️ ${user.email}</span>
            </div>
          </div>
        </div>
        <div class="hero-quick-actions">
          <button type="button" class="hero-btn gold" onclick="document.querySelector('.sidebar-link[data-view=\\'attendance\\']').click();">
            <span>📅 Mark Attendance</span>
          </button>
          <button type="button" class="hero-btn outline logout-trigger">
            <span>🚪 Logout</span>
          </button>
        </div>
      </div>

      <!-- 6 KPI Dashboard Cards -->
      <div class="grid-3" style="margin-bottom:24px;">
        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#DCFCE7; color:#15803D;">👨‍🎓</div>
          <div class="kpi-info">
            <div class="kpi-label">Total Assigned Students</div>
            <div class="kpi-val">${students.length}</div>
            <div class="kpi-sub">Across ${(user.assignedClasses || ['CSE-3A']).join(', ')}</div>
          </div>
        </div>

        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#DBEAFE; color:#1D4ED8;">📊</div>
          <div class="kpi-info">
            <div class="kpi-label">Class Average Attendance</div>
            <div class="kpi-val">${avgAttendance}%</div>
            <div class="kpi-sub">Requirement: 75% Threshold Met</div>
          </div>
        </div>

        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#FEF3C7; color:#B45309;">📈</div>
          <div class="kpi-info">
            <div class="kpi-label">Average Performance</div>
            <div class="kpi-val">8.65 CGPA</div>
            <div class="kpi-sub">Semester V Ongoing</div>
          </div>
        </div>

        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#F3E8FF; color:#7E22CE;">📝</div>
          <div class="kpi-info">
            <div class="kpi-label">Pending Assignments</div>
            <div class="kpi-val">${assignments.length}</div>
            <div class="kpi-sub">Course modules active</div>
          </div>
        </div>

        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#CCFBF1; color:#0F766E;">⚔️</div>
          <div class="kpi-info">
            <div class="kpi-label">Coding Submissions</div>
            <div class="kpi-val">${submissions.length}</div>
            <div class="kpi-sub">Evaluated in CodeQuest</div>
          </div>
        </div>

        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#FEE2E2; color:#B91C1C;">📅</div>
          <div class="kpi-info">
            <div class="kpi-label">Upcoming Exams</div>
            <div class="kpi-val">${exams.length}</div>
            <div class="kpi-sub">Autonomous Mid-1 Scheduled</div>
          </div>
        </div>
      </div>

      <!-- Charts & Visual Analytics Section -->
      <div class="grid-2" style="margin-bottom:24px;">
        <div class="portal-card">
          <div class="portal-card-header">
            <div class="card-title-group">
              <div class="card-icon-box maroon">📊</div>
              <div>
                <h3 class="card-title">Subject-Wise Attendance Analytics</h3>
                <span class="card-subtitle">Class percentage across assigned courses</span>
              </div>
            </div>
          </div>

          <div style="padding:10px 0;">
            <div style="margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:4px;">
                <span>Advanced Java Programming (CS502)</span>
                <span style="color:#15803D;">92.4%</span>
              </div>
              <div class="analytics-bar-track">
                <div class="analytics-bar-fill good" style="width:92.4%;"></div>
              </div>
            </div>

            <div style="margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:4px;">
                <span>Database Management Systems (CS503)</span>
                <span style="color:#15803D;">89.1%</span>
              </div>
              <div class="analytics-bar-track">
                <div class="analytics-bar-fill good" style="width:89.1%;"></div>
              </div>
            </div>

            <div style="margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:4px;">
                <span>VLSI Design &amp; Embedded Systems (EC501)</span>
                <span style="color:#15803D;">88.0%</span>
              </div>
              <div class="analytics-bar-track">
                <div class="analytics-bar-fill good" style="width:88.0%;"></div>
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:4px;">
                <span>Web Technologies &amp; Cloud Lab (CS506)</span>
                <span style="color:#15803D;">94.5%</span>
              </div>
              <div class="analytics-bar-track">
                <div class="analytics-bar-fill good" style="width:94.5%;"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="portal-card">
          <div class="portal-card-header">
            <div class="card-title-group">
              <div class="card-icon-box gold">📈</div>
              <div>
                <h3 class="card-title">Student Performance Distribution</h3>
                <span class="card-subtitle">CGPA and letter grade breakdown</span>
              </div>
            </div>
          </div>

          <div style="padding:10px 0;">
            <div style="margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:4px;">
                <span>Outstanding (O Grade — CGPA &gt; 9.0)</span>
                <span style="color:var(--portal-maroon);">40% of class</span>
              </div>
              <div class="analytics-bar-track">
                <div class="analytics-bar-fill good" style="width:40%;"></div>
              </div>
            </div>

            <div style="margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:4px;">
                <span>Excellent (A+ Grade — CGPA 8.0 – 8.99)</span>
                <span style="color:var(--portal-maroon);">50% of class</span>
              </div>
              <div class="analytics-bar-track">
                <div class="analytics-bar-fill good" style="width:50%;"></div>
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:4px;">
                <span>Good (A Grade — CGPA 7.0 – 7.99)</span>
                <span style="color:#D97706;">10% of class</span>
              </div>
              <div class="analytics-bar-track">
                <div class="analytics-bar-fill warning" style="width:10%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Roster & Recent Submissions -->
      <div class="grid-2">
        <div class="portal-card">
          <div class="portal-card-header">
            <div class="card-title-group">
              <div class="card-icon-box maroon">👥</div>
              <div>
                <h3 class="card-title">Enrolled Students Roster</h3>
                <span class="card-subtitle">Quick overview of assigned learners</span>
              </div>
            </div>
            <button class="portal-btn outline sm" onclick="document.querySelector('.sidebar-link[data-view=\\'students\\']').click();">Full Roster →</button>
          </div>

          <table class="attendance-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>CGPA</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              ${students.slice(0, 4).map(st => {
                const att = db.getAttendanceForUser(st.id);
                return `
                  <tr style="cursor:pointer;" onclick="window.showStudentDetailModal('${st.id}')">
                    <td><strong>${st.fullName}</strong></td>
                    <td>${st.rollNo}</td>
                    <td><strong style="color:var(--portal-maroon);">${st.cgpa}</strong></td>
                    <td>
                      <span class="attendance-badge ${att.overall >= 75 ? 'good' : 'warn'}">
                        ${att.overall}%
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="portal-card">
          <div class="portal-card-header">
            <div class="card-title-group">
              <div class="card-icon-box gold">⚔️</div>
              <div>
                <h3 class="card-title">Recent CodeQuest Activity</h3>
                <span class="card-subtitle">Automated compiler evaluation logs</span>
              </div>
            </div>
            <button class="portal-btn outline sm" onclick="document.querySelector('.sidebar-link[data-view=\\'submissions\\']').click();">All Logs →</button>
          </div>

          <div class="notification-list" style="max-height:240px;">
            ${submissions.slice(0, 4).map(sub => `
              <div class="notification-item">
                <div class="notif-icon">✅</div>
                <div class="notif-body">
                  <div class="notif-title">${sub.studentName} — ${sub.questionTitle}</div>
                  <div class="notif-text">Language: <strong>${sub.language}</strong> | Runtime: <strong>${sub.executionTime}</strong></div>
                  <div class="notif-time">${sub.submittedAt}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     2. Students Management & Detailed Profile Inspector
     ========================================================================== */
  function renderStudentsRoster(user, db) {
    const container = document.getElementById('view-students');
    if (!container) return;

    let students = db.getUsers().filter(u => u.role === 'student');

    container.innerHTML = `
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box maroon">👥</div>
            <div>
              <h3 class="card-title">Assigned Students Directory</h3>
              <span class="card-subtitle">Filter, search, and click any student to inspect full academic, attendance, and coding profile</span>
            </div>
          </div>
        </div>

        <!-- Filter Controls Bar -->
        <div style="display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr; gap:12px; margin-bottom:20px; background:#F8FAFC; padding:16px; border-radius:10px; border:1px solid #E2E8F0;">
          <div>
            <label style="display:block; font-size:11.5px; font-weight:700; margin-bottom:4px; color:#475569;">Search Student</label>
            <input type="text" class="search-input" id="stFilterSearch" placeholder="Search by name or roll no..." style="width:100%;">
          </div>
          <div>
            <label style="display:block; font-size:11.5px; font-weight:700; margin-bottom:4px; color:#475569;">Filter by Year</label>
            <select id="stFilterYear" class="search-input" style="width:100%;">
              <option value="all">All Years</option>
              <option value="III Year">III Year</option>
              <option value="II Year">II Year</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:11.5px; font-weight:700; margin-bottom:4px; color:#475569;">Filter by Section</label>
            <select id="stFilterSection" class="search-input" style="width:100%;">
              <option value="all">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:11.5px; font-weight:700; margin-bottom:4px; color:#475569;">Attendance Status</label>
            <select id="stFilterAttendance" class="search-input" style="width:100%;">
              <option value="all">All Status</option>
              <option value="above75">Above 75% (Eligible)</option>
              <option value="below75">Below 75% (Shortage)</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:11.5px; font-weight:700; margin-bottom:4px; color:#475569;">Sort by Performance</label>
            <select id="stSortPerf" class="search-input" style="width:100%;">
              <option value="cgpa_desc">CGPA (High → Low)</option>
              <option value="xp_desc">CodeQuest XP (High → Low)</option>
              <option value="att_desc">Attendance (High → Low)</option>
              <option value="name_asc">Name (A → Z)</option>
            </select>
          </div>
        </div>

        <table class="attendance-table" id="studentsMainTable">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Department</th>
              <th>Year &amp; Section</th>
              <th>Attendance</th>
              <th>CGPA</th>
              <th>CodeQuest XP</th>
              <th>Placement / Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="studentsTableBody">
            <!-- Rendered dynamically -->
          </tbody>
        </table>
      </div>
    `;

    function updateStudentTable() {
      const q = (document.getElementById('stFilterSearch')?.value || '').toLowerCase();
      const year = document.getElementById('stFilterYear')?.value || 'all';
      const section = document.getElementById('stFilterSection')?.value || 'all';
      const attFilter = document.getElementById('stFilterAttendance')?.value || 'all';
      const sort = document.getElementById('stSortPerf')?.value || 'cgpa_desc';

      let filtered = students.filter(st => {
        const matchQ = st.fullName.toLowerCase().includes(q) || st.rollNo.toLowerCase().includes(q);
        const matchYear = (year === 'all' || st.year === year);
        const matchSec = (section === 'all' || st.section === section);
        
        const att = db.getAttendanceForUser(st.id);
        const matchAtt = (attFilter === 'all' || (attFilter === 'above75' && att.overall >= 75) || (attFilter === 'below75' && att.overall < 75));

        return matchQ && matchYear && matchSec && matchAtt;
      });

      // Sorting
      filtered.sort((a, b) => {
        if (sort === 'cgpa_desc') return (b.cgpa || 0) - (a.cgpa || 0);
        if (sort === 'xp_desc') {
          const xpA = db.getCodingProgress(a.id).totalXp;
          const xpB = db.getCodingProgress(b.id).totalXp;
          return xpB - xpA;
        }
        if (sort === 'att_desc') {
          return db.getAttendanceForUser(b.id).overall - db.getAttendanceForUser(a.id).overall;
        }
        if (sort === 'name_asc') return a.fullName.localeCompare(b.fullName);
        return 0;
      });

      const tbody = document.getElementById('studentsTableBody');
      if (!tbody) return;

      if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:#64748B;">No students match the selected filter criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(st => {
        const att = db.getAttendanceForUser(st.id);
        const prog = db.getCodingProgress(st.id);
        return `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                ${window.BVCITSPhotos.imgTag(st, '', 'width:34px; height:34px; border-radius:50%; object-fit:cover; border:1px solid #CBD5E1;')}
                <div>
                  <strong>${st.fullName}</strong>
                  <div style="font-size:11.5px; color:#64748B;">${st.email}</div>
                </div>
              </div>
            </td>
            <td><strong>${st.rollNo}</strong></td>
            <td><span class="hero-tag" style="background:#F1F5F9; color:var(--portal-maroon);">${st.department}</span></td>
            <td>${st.year} - ${st.section}</td>
            <td>
              <span class="attendance-badge ${att.overall >= 75 ? 'good' : 'warn'}">
                ${att.overall}% ${att.overall < 75 ? '⚠️ Shortage' : ''}
              </span>
            </td>
            <td><strong style="color:var(--portal-maroon); font-size:14.5px;">${st.cgpa}</strong></td>
            <td>
              <strong style="color:#D97706;">⚡ ${prog.totalXp} XP</strong> (L${prog.level})
            </td>
            <td><span class="attendance-badge good">${st.placementStatus ? '🎓 Placed' : 'Active'}</span></td>
            <td>
              <button class="portal-btn outline sm" onclick="window.showStudentDetailModal('${st.id}')">View Details →</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Attach listeners
    ['stFilterSearch', 'stFilterYear', 'stFilterSection', 'stFilterAttendance', 'stSortPerf'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateStudentTable);
    });

    updateStudentTable();
  }

  // Global Detailed Student Modal Inspector
  window.showStudentDetailModal = function (studentId) {
    const db = window.BVCITS_DB;
    const st = db.getUserById(studentId);
    if (!st) return;

    const att = db.getAttendanceForUser(studentId);
    const marksData = db.getMarksForUser(studentId);
    const prog = db.getCodingProgress(studentId);

    const overlay = document.createElement('div');
    overlay.className = 'faculty-modal-overlay active';
    overlay.innerHTML = `
      <div class="faculty-modal-content">
        <div class="faculty-modal-header">
          <div style="display:flex; align-items:center; gap:12px;">
            ${window.BVCITSPhotos.imgTag(st, '', 'width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid var(--portal-gold);')}
            <div>
              <h3>${st.fullName} — ${st.rollNo}</h3>
              <span style="font-size:12px; color:#64748B;">${st.program} · ${st.year} (${st.section})</span>
            </div>
          </div>
          <button class="faculty-modal-close" onclick="this.closest('.faculty-modal-overlay').remove()">✕</button>
        </div>

        <div class="faculty-modal-body">
          <div class="modal-tabs">
            <button class="modal-tab-btn active" data-tab="tab-bio">Profile Bio</button>
            <button class="modal-tab-btn" data-tab="tab-att">Attendance (${att.overall}%)</button>
            <button class="modal-tab-btn" data-tab="tab-marks">Semester Marks &amp; CGPA</button>
            <button class="modal-tab-btn" data-tab="tab-codequest">CodeQuest (${prog.totalXp} XP)</button>
          </div>

          <!-- Tab 1: Bio -->
          <div class="modal-tab-pane active" id="tab-bio">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; font-size:13.5px;">
              <div><strong>Roll Number:</strong> ${st.rollNo}</div>
              <div><strong>Department:</strong> ${st.department}</div>
              <div><strong>Academic Year:</strong> ${st.academicYear}</div>
              <div><strong>Semester:</strong> ${st.semester}</div>
              <div><strong>Email:</strong> ${st.email}</div>
              <div><strong>Phone:</strong> ${st.phone}</div>
              <div><strong>Admission Details:</strong> ${st.admissionType}</div>
              <div><strong>Faculty Mentor:</strong> ${st.mentor}</div>
              <div><strong>Placement Status:</strong> <span style="color:#15803D; font-weight:700;">${st.placementStatus}</span></div>
              <div><strong>Current CGPA:</strong> <span style="color:var(--portal-maroon); font-weight:700;">${st.cgpa}</span></div>
            </div>
          </div>

          <!-- Tab 2: Attendance -->
          <div class="modal-tab-pane" id="tab-att">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; background:#F8FAFC; padding:12px 16px; border-radius:8px;">
              <div>
                <strong>Overall Attendance:</strong> <span style="font-size:18px; font-weight:800; color:var(--portal-maroon);">${att.overall}%</span>
                <div style="font-size:12px; color:#64748B;">Total Classes: ${att.attendedClasses} / ${att.totalClasses}</div>
              </div>
              <span class="attendance-badge ${att.overall >= 75 ? 'good' : 'warn'}">
                ${att.overall >= 75 ? '✓ 75% Requirement Met' : '⚠️ Shortage Notice Sent'}
              </span>
            </div>

            <table class="attendance-table">
              <thead>
                <tr>
                  <th>Subject Code &amp; Name</th>
                  <th>Attended</th>
                  <th>Total</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${(att.subjects || []).map(s => `
                  <tr>
                    <td><strong>${s.code}</strong> — ${s.name}</td>
                    <td>${s.attended}</td>
                    <td>${s.total}</td>
                    <td><strong>${s.percent}%</strong></td>
                    <td><span class="attendance-badge ${s.percent >= 75 ? 'good' : 'warn'}">${s.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Tab 3: Marks -->
          <div class="modal-tab-pane" id="tab-marks">
            <div style="margin-bottom:14px;">
              <strong>Cumulative Grade Point Average (CGPA):</strong> <span style="font-size:18px; font-weight:800; color:var(--portal-maroon);">${st.cgpa}</span>
            </div>

            <table class="attendance-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Mid 1 (30M)</th>
                  <th>Mid 2 (30M)</th>
                  <th>Lab (50M)</th>
                  <th>Total (100M)</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                ${(marksData?.currentSemesterCourses || []).map(c => `
                  <tr>
                    <td><strong>${c.code}</strong> — ${c.name}</td>
                    <td>${c.mid1}</td>
                    <td>${c.mid2}</td>
                    <td>${c.lab || '-'}</td>
                    <td><strong>${c.total} / 100</strong></td>
                    <td><span class="attendance-badge good">${c.grade} (${c.gradePoint} GP)</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Tab 4: CodeQuest -->
          <div class="modal-tab-pane" id="tab-codequest">
            <div class="grid-3" style="margin-bottom:16px;">
              <div class="portal-card" style="padding:12px; text-align:center;">
                <div style="font-size:11px; color:#64748B;">Total XP</div>
                <div style="font-size:18px; font-weight:800; color:#D97706;">⚡ ${prog.totalXp}</div>
              </div>
              <div class="portal-card" style="padding:12px; text-align:center;">
                <div style="font-size:11px; color:#64748B;">Problems Solved</div>
                <div style="font-size:18px; font-weight:800; color:var(--portal-maroon);">${prog.problemsSolved} Solved</div>
              </div>
              <div class="portal-card" style="padding:12px; text-align:center;">
                <div style="font-size:11px; color:#64748B;">Coding Streak</div>
                <div style="font-size:18px; font-weight:800; color:#EF4444;">🔥 ${prog.streakDays} Days</div>
              </div>
            </div>

            <div style="font-size:13px; font-weight:700; margin-bottom:8px;">Unlocked Badges:</div>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${(prog.unlockedBadges || []).map(b => `<span class="hero-tag" style="background:#FEF3C7; color:#B45309;">🎖️ ${b.replace('badge_', '').replace('_', ' ').toUpperCase()}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Tab switching
    const tabBtns = overlay.querySelectorAll('.modal-tab-btn');
    const tabPanes = overlay.querySelectorAll('.modal-tab-pane');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        tabPanes.forEach(p => p.classList.remove('active'));
        overlay.querySelector(`#${tabId}`)?.classList.add('active');
      });
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  };

  /* ==========================================================================
     3. Attendance Management & Daily Ledger Marker (Live Sync to DB)
     ========================================================================== */
  function renderAttendanceMarker(user, db) {
    const container = document.getElementById('view-attendance');
    if (!container) return;

    const students = db.getUsers().filter(u => u.role === 'student');

    container.innerHTML = `
      <!-- Low Attendance (< 75%) Alert Callout -->
      <div class="warning-callout-box">
        <div class="warning-callout-title">
          <span>⚠️ Low Attendance Alert (&lt; 75% Autonomous Threshold)</span>
        </div>
        <div class="warning-callout-text">
          Attention Faculty: <strong>K. V. Teja (22H41A0415)</strong> is currently at <strong>71.4%</strong> attendance. Please ensure regular biometric / register recording to prevent exam debarment.
        </div>
      </div>

      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box maroon">📅</div>
            <div>
              <h3 class="card-title">Daily Attendance Entry Register</h3>
              <span class="card-subtitle">Mark and submit real-time attendance directly to the autonomous student database</span>
            </div>
          </div>

          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <select id="attSubjectSelect" class="lang-select" style="background:#fff; color:#1E293B; border-color:#CBD5E1; font-weight:700;">
              <option value="CS502">Advanced Java (CS502) — CSE-3A</option>
              <option value="CS503">DBMS (CS503) — CSE-3A</option>
              <option value="CS506">Web Tech Lab (CS506) — CSE-3A</option>
              <option value="EC501">VLSI Design (EC501) — ECE-3A</option>
            </select>

            <input type="date" id="attDateSelect" class="lang-select" style="background:#fff; color:#1E293B; border-color:#CBD5E1;" value="${new Date().toISOString().split('T')[0]}">

            <button type="button" class="portal-btn primary sm" id="markAllPresentBtn">✓ Mark All Present</button>
            <button type="button" class="portal-btn gold sm" id="saveAttendanceBtn">💾 Save Attendance to DB</button>
          </div>
        </div>

        <table class="attendance-table" id="attendanceMarkerTable">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Current Overall</th>
              <th>Today's Status</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(st => {
              const att = db.getAttendanceForUser(st.id);
              return `
                <tr data-student-id="${st.id}">
                  <td><strong>${st.rollNo}</strong></td>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      ${window.BVCITSPhotos.imgTag(st, '', 'width:28px; height:28px; border-radius:50%; object-fit:cover;')}
                      <span>${st.fullName}</span>
                    </div>
                  </td>
                  <td>${st.department} - ${st.section}</td>
                  <td>
                    <span class="attendance-badge ${att.overall >= 75 ? 'good' : 'warn'}">
                      ${att.overall}%
                    </span>
                  </td>
                  <td>
                    <div class="attendance-toggle-group">
                      <button type="button" class="att-toggle-btn present active" data-status="present">Present</button>
                      <button type="button" class="att-toggle-btn absent" data-status="absent">Absent</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Toggle button clicks
    const rows = container.querySelectorAll('#attendanceMarkerTable tbody tr');
    rows.forEach(r => {
      const btns = r.querySelectorAll('.att-toggle-btn');
      btns.forEach(b => {
        b.addEventListener('click', () => {
          btns.forEach(x => x.classList.remove('active'));
          b.classList.add('active');
        });
      });
    });

    // Mark All Present
    const markAllBtn = container.querySelector('#markAllPresentBtn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        rows.forEach(r => {
          const presentBtn = r.querySelector('.att-toggle-btn.present');
          const absentBtn = r.querySelector('.att-toggle-btn.absent');
          if (presentBtn && absentBtn) {
            absentBtn.classList.remove('active');
            presentBtn.classList.add('active');
          }
        });
        showToast('All students set to Present.');
      });
    }

    // Save Attendance to Database
    const saveBtn = container.querySelector('#saveAttendanceBtn');
    const subjSelect = container.querySelector('#attSubjectSelect');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const subjectCode = subjSelect.value;
        let count = 0;

        rows.forEach(r => {
          const stId = r.getAttribute('data-student-id');
          const isPresent = r.querySelector('.att-toggle-btn.present').classList.contains('active');
          db.updateStudentAttendance(stId, subjectCode, isPresent);
          count++;
        });

        alert(`✅ Attendance successfully saved for ${count} students in ${subjectCode}!\n\nAll student accounts in the database have been updated in real-time.`);
        renderAttendanceMarker(user, db);
      });
    }
  }

  /* ==========================================================================
     4. Performance Management (Continuous Assessment & Marks Entry)
     ========================================================================== */
  function renderMarksEntry(user, db) {
    const container = document.getElementById('view-marks');
    if (!container) return;

    const students = db.getUsers().filter(u => u.role === 'student');

    container.innerHTML = `
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box gold">📝</div>
            <div>
              <h3 class="card-title">Continuous Internal Assessment &amp; Marks Entry</h3>
              <span class="card-subtitle">Enter Mid 1, Mid 2, Lab, and Assignment marks — Auto-calculates totals and letter grades</span>
            </div>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <select id="marksSubjectSelect" class="lang-select" style="background:#fff; color:#1E293B; border-color:#CBD5E1; font-weight:700;">
              <option value="CS502">Advanced Java Programming (CS502)</option>
              <option value="CS503">DBMS (CS503)</option>
              <option value="EC501">VLSI Design (EC501)</option>
            </select>
            <button type="button" class="portal-btn gold sm" id="saveAllMarksBtn">💾 Save All Marks to DB</button>
          </div>
        </div>

        <table class="attendance-table" id="marksEntryTable">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Mid 1 (30M)</th>
              <th>Mid 2 (30M)</th>
              <th>Assignment (10M)</th>
              <th>Lab (50M)</th>
              <th>End Sem (70M)</th>
              <th>Total (100M)</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(st => {
              const marksData = db.getMarksForUser(st.id);
              const course = marksData?.currentSemesterCourses?.[0] || { mid1: 28, mid2: 29, assignment: 10, lab: 48, endSem: 62, total: 90, grade: 'O' };
              return `
                <tr data-student-id="${st.id}">
                  <td><strong>${st.rollNo}</strong></td>
                  <td>${st.fullName}</td>
                  <td><input type="number" class="mark-input mid1-input" value="${course.mid1 || 28}" min="0" max="30" style="width:55px; padding:4px 6px; border-radius:4px; border:1px solid #CBD5E1; font-weight:700;"></td>
                  <td><input type="number" class="mark-input mid2-input" value="${course.mid2 || 29}" min="0" max="30" style="width:55px; padding:4px 6px; border-radius:4px; border:1px solid #CBD5E1; font-weight:700;"></td>
                  <td><input type="number" class="mark-input asg-input" value="${course.assignment || 10}" min="0" max="10" style="width:50px; padding:4px 6px; border-radius:4px; border:1px solid #CBD5E1; font-weight:700;"></td>
                  <td><input type="number" class="mark-input lab-input" value="${course.lab || 48}" min="0" max="50" style="width:55px; padding:4px 6px; border-radius:4px; border:1px solid #CBD5E1; font-weight:700;"></td>
                  <td><input type="number" class="mark-input endsem-input" value="${course.endSem || 62}" min="0" max="70" style="width:55px; padding:4px 6px; border-radius:4px; border:1px solid #CBD5E1; font-weight:700;"></td>
                  <td><strong class="calculated-total" style="color:var(--portal-maroon); font-size:15px;">${course.total || 90}</strong></td>
                  <td><span class="attendance-badge good calculated-grade">${course.grade || 'O'}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Dynamic auto-calculator on input
    const rows = container.querySelectorAll('#marksEntryTable tbody tr');
    rows.forEach(r => {
      const mid1 = r.querySelector('.mid1-input');
      const mid2 = r.querySelector('.mid2-input');
      const asg = r.querySelector('.asg-input');
      const endSem = r.querySelector('.endsem-input');
      const totalEl = r.querySelector('.calculated-total');
      const gradeEl = r.querySelector('.calculated-grade');

      function recalculate() {
        const m1 = parseFloat(mid1.value) || 0;
        const m2 = parseFloat(mid2.value) || 0;
        const a = parseFloat(asg.value) || 0;
        const es = parseFloat(endSem.value) || 0;

        const midAvg = (m1 + m2) / 2;
        const total = Math.min(100, Math.round(midAvg + a + es * 0.7));
        totalEl.textContent = total;

        let g = 'O';
        if (total >= 90) g = 'O';
        else if (total >= 80) g = 'A+';
        else if (total >= 70) g = 'A';
        else if (total >= 60) g = 'B+';
        else if (total >= 50) g = 'B';
        else g = 'F';

        gradeEl.textContent = g;
      }

      [mid1, mid2, asg, endSem].forEach(inp => {
        if (inp) inp.addEventListener('input', recalculate);
      });
    });

    // Save Marks button
    const saveBtn = container.querySelector('#saveAllMarksBtn');
    const subjSelect = container.querySelector('#marksSubjectSelect');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const subjectCode = subjSelect.value;
        let count = 0;

        rows.forEach(r => {
          const stId = r.getAttribute('data-student-id');
          const mid1 = parseFloat(r.querySelector('.mid1-input').value) || 0;
          const mid2 = parseFloat(r.querySelector('.mid2-input').value) || 0;
          const asg = parseFloat(r.querySelector('.asg-input').value) || 0;
          const lab = parseFloat(r.querySelector('.lab-input').value) || 0;
          const endSem = parseFloat(r.querySelector('.endsem-input').value) || 0;

          db.saveSubjectMarks(stId, subjectCode, {
            mid1, mid2, assignment: asg, lab, endSem
          });
          count++;
        });

        alert(`✅ Marks successfully updated for ${count} students in ${subjectCode}!\n\nStudents will immediately see these updated marks in their Academic Performance view.`);
      });
    }
  }

  /* ==========================================================================
     5. Assignments & Submissions Evaluator
     ========================================================================== */
  function renderAssignmentManager(user, db) {
    const container = document.getElementById('view-assignments');
    if (!container) return;

    const assignments = db.getAssignments();

    container.innerHTML = `
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box blue">📝</div>
            <div>
              <h3 class="card-title">Manage Course Assignments</h3>
              <span class="card-subtitle">Create assignment tasks and evaluate student work</span>
            </div>
          </div>
          <button type="button" class="portal-btn primary sm" id="createAssignmentModalBtn">+ Create New Assignment</button>
        </div>

        <table class="attendance-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Assignment Title</th>
              <th>Assigned Class</th>
              <th>Due Date</th>
              <th>Max Marks</th>
              <th>Submissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${assignments.map(asg => `
              <tr>
                <td><strong>${asg.subjectCode}</strong></td>
                <td>
                  <strong>${asg.title}</strong>
                  <div style="font-size:12px; color:#64748B;">${asg.description.substring(0, 70)}...</div>
                </td>
                <td><span class="hero-tag" style="background:#F1F5F9; color:var(--portal-maroon);">${asg.assignedClass || 'CSE-3A'}</span></td>
                <td>${asg.dueDate}</td>
                <td>${asg.maxMarks} Marks</td>
                <td>
                  <span class="attendance-badge good">
                    ${(asg.submissions || []).length} Submitted
                  </span>
                </td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="portal-btn outline sm" onclick="window.showAssignmentSubmissionsModal('${asg.id}')">Review Submissions</button>
                    <button class="portal-btn danger sm" onclick="window.deleteAssignmentConfirm('${asg.id}')">✕</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Modal to create assignment
    const createBtn = container.querySelector('#createAssignmentModalBtn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.className = 'faculty-modal-overlay active';
        overlay.innerHTML = `
          <div class="faculty-modal-content">
            <div class="faculty-modal-header">
              <h3>Create Course Assignment</h3>
              <button class="faculty-modal-close" onclick="this.closest('.faculty-modal-overlay').remove()">✕</button>
            </div>
            <div class="faculty-modal-body">
              <form id="newAsgForm">
                <div style="margin-bottom:12px;">
                  <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Assignment Title</label>
                  <input type="text" id="asgTitle" required placeholder="e.g. Assignment 3 — Cloud Native Microservices" style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;">
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Subject</label>
                    <select id="asgSubj" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                      <option value="CS502">CS502 — Advanced Java</option>
                      <option value="CS503">CS503 — DBMS</option>
                      <option value="CS506">CS506 — Web Tech</option>
                      <option value="EC501">EC501 — VLSI Design</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Due Date</label>
                    <input type="date" id="asgDate" required value="2026-09-10" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                  </div>
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Max Marks</label>
                    <input type="number" id="asgMarks" required value="10" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                  </div>
                </div>

                <div style="margin-bottom:12px;">
                  <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Description</label>
                  <textarea id="asgDesc" rows="3" required placeholder="Enter assignment problem statement..." style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;"></textarea>
                </div>

                <div style="margin-bottom:16px;">
                  <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Submission Instructions</label>
                  <input type="text" id="asgInst" placeholder="e.g. Upload PDF and ZIP archive with unit tests" style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;">
                </div>

                <button type="submit" class="portal-btn primary">Publish Assignment to Students 🚀</button>
              </form>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#newAsgForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const newAsg = {
            title: overlay.querySelector('#asgTitle').value,
            subjectCode: overlay.querySelector('#asgSubj').value,
            subjectName: overlay.querySelector('#asgSubj').selectedOptions[0].text,
            facultyId: user.id,
            facultyName: user.fullName,
            assignedClass: 'CSE-3A',
            dueDate: overlay.querySelector('#asgDate').value,
            maxMarks: parseInt(overlay.querySelector('#asgMarks').value, 10),
            description: overlay.querySelector('#asgDesc').value,
            instructions: overlay.querySelector('#asgInst').value
          };

          db.addAssignment(newAsg);
          alert(`✅ Assignment "${newAsg.title}" created successfully! Students will now see it in their Student Portal.`);
          overlay.remove();
          renderAssignmentManager(user, db);
        });
      });
    }
  }

  // Global Assignment Submissions & Grader Modal
  window.showAssignmentSubmissionsModal = function (asgId) {
    const db = window.BVCITS_DB;
    const asg = db.getAssignments().find(a => a.id === asgId);
    if (!asg) return;

    const overlay = document.createElement('div');
    overlay.className = 'faculty-modal-overlay active';
    overlay.innerHTML = `
      <div class="faculty-modal-content" style="max-width:850px;">
        <div class="faculty-modal-header">
          <div>
            <h3>Review Submissions — ${asg.title}</h3>
            <span style="font-size:12px; color:#64748B;">Max Marks: ${asg.maxMarks} | Due: ${asg.dueDate}</span>
          </div>
          <button class="faculty-modal-close" onclick="this.closest('.faculty-modal-overlay').remove()">✕</button>
        </div>

        <div class="faculty-modal-body">
          <table class="attendance-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Submitted Date</th>
                <th>Marks Awarded</th>
                <th>Faculty Feedback</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${(asg.submissions || []).map(sub => `
                <tr data-student-id="${sub.studentId}">
                  <td><strong>${sub.studentName}</strong></td>
                  <td>${sub.rollNo}</td>
                  <td>${sub.submittedAt}</td>
                  <td>
                    <input type="number" class="grade-input" value="${sub.marks !== null ? sub.marks : 10}" max="${asg.maxMarks}" min="0" step="0.5" style="width:60px; padding:4px 6px; border:1px solid #CBD5E1; border-radius:4px; font-weight:700;">
                  </td>
                  <td>
                    <input type="text" class="feedback-input" value="${sub.feedback || 'Good implementation'}" style="width:100%; padding:4px 8px; border:1px solid #CBD5E1; border-radius:4px; font-size:12.5px;">
                  </td>
                  <td>
                    <button class="portal-btn primary sm save-review-btn">Save Review</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.save-review-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        const stId = row.getAttribute('data-student-id');
        const marks = parseFloat(row.querySelector('.grade-input').value);
        const feedback = row.querySelector('.feedback-input').value;

        db.gradeAssignmentSubmission(asgId, stId, marks, feedback);
        alert(`✅ Grade (${marks}/${asg.maxMarks}) and feedback saved! Student has been notified.`);
      });
    });
  };

  window.deleteAssignmentConfirm = function (asgId) {
    if (confirm('Are you sure you want to delete this assignment?')) {
      window.BVCITS_DB.deleteAssignment(asgId);
      const authUser = window.BVCITS_AUTH.getCurrentUser();
      renderAssignmentManager(authUser, window.BVCITS_DB);
    }
  };

  /* ==========================================================================
     6. Exams Scheduling
     ========================================================================== */
  function renderExamsManager(user, db) {
    const container = document.getElementById('view-exams');
    if (!container) return;

    const exams = db.getExams();

    container.innerHTML = `
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box maroon">📅</div>
            <div>
              <h3 class="card-title">Autonomous Examination Schedules</h3>
              <span class="card-subtitle">Schedule Mid and End-Semester exams for student cohorts</span>
            </div>
          </div>
          <button type="button" class="portal-btn primary sm" id="scheduleExamModalBtn">+ Schedule New Exam</button>
        </div>

        <table class="attendance-table">
          <thead>
            <tr>
              <th>Exam Title</th>
              <th>Subject</th>
              <th>Date &amp; Time</th>
              <th>Examination Hall</th>
              <th>Syllabus Units</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${exams.map(ex => `
              <tr>
                <td><strong>${ex.title}</strong></td>
                <td><span class="hero-tag" style="background:#F1F5F9; color:var(--portal-maroon);">${ex.subject}</span></td>
                <td><strong>${ex.date}</strong><br><span style="font-size:12px; color:#64748B;">${ex.time}</span></td>
                <td>${ex.room}</td>
                <td><div style="font-size:12px; color:#475569; max-width:280px;">${ex.syllabus}</div></td>
                <td>
                  <button class="portal-btn danger sm" onclick="window.deleteExamConfirm('${ex.id}')">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const schedBtn = container.querySelector('#scheduleExamModalBtn');
    if (schedBtn) {
      schedBtn.addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.className = 'faculty-modal-overlay active';
        overlay.innerHTML = `
          <div class="faculty-modal-content">
            <div class="faculty-modal-header">
              <h3>Schedule Autonomous Examination</h3>
              <button class="faculty-modal-close" onclick="this.closest('.faculty-modal-overlay').remove()">✕</button>
            </div>
            <div class="faculty-modal-body">
              <form id="newExamForm">
                <div style="margin-bottom:12px;">
                  <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Exam Title</label>
                  <input type="text" id="exTitle" required placeholder="e.g. Autonomous Mid-2 Examination — Java & DBMS" style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;">
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Subject</label>
                    <input type="text" id="exSubject" required placeholder="e.g. Advanced Java (CS502)" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                  </div>
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Department &amp; Semester</label>
                    <input type="text" id="exDept" required value="CSE — Semester V" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                  </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Date</label>
                    <input type="date" id="exDate" required value="2026-09-15" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                  </div>
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Time</label>
                    <input type="text" id="exTime" required value="10:00 AM – 12:00 PM" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                  </div>
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Exam Hall Room</label>
                    <input type="text" id="exRoom" required value="Hall 302" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                  </div>
                </div>

                <div style="margin-bottom:12px;">
                  <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Syllabus Units</label>
                  <textarea id="exSyllabus" rows="2" required placeholder="e.g. Unit IV (Spring Boot & REST) and Unit V (Hibernate JPA)" style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;"></textarea>
                </div>

                <button type="submit" class="portal-btn primary">Broadcast Exam Schedule 📢</button>
              </form>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#newExamForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const newEx = {
            title: overlay.querySelector('#exTitle').value,
            subject: overlay.querySelector('#exSubject').value,
            department: overlay.querySelector('#exDept').value,
            date: overlay.querySelector('#exDate').value,
            time: overlay.querySelector('#exTime').value,
            room: overlay.querySelector('#exRoom').value,
            syllabus: overlay.querySelector('#exSyllabus').value,
            createdBy: user.fullName
          };

          db.addExam(newEx);
          alert(`✅ Exam schedule "${newEx.title}" added to the autonomous examination calendar!`);
          overlay.remove();
          renderExamsManager(user, db);
        });
      });
    }
  }

  window.deleteExamConfirm = function (examId) {
    if (confirm('Delete this examination schedule?')) {
      window.BVCITS_DB.deleteExam(examId);
      const authUser = window.BVCITS_AUTH.getCurrentUser();
      renderExamsManager(authUser, window.BVCITS_DB);
    }
  };

  /* ==========================================================================
     7. Coding Questions Creator (CodeQuest Management)
     ========================================================================== */
  function renderQuestionCreator(user, db) {
    const container = document.getElementById('view-questions');
    if (!container) return;

    const questions = db.getCodingQuestions();

    container.innerHTML = `
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box gold">⚔️</div>
            <div>
              <h3 class="card-title">CodeQuest Question Bank Administration</h3>
              <span class="card-subtitle">Create, configure test cases, and publish coding problems across Levels 1 to 5</span>
            </div>
          </div>
          <button type="button" class="portal-btn gold sm" id="createQuestionModalBtn">+ Publish New Challenge</button>
        </div>

        <table class="attendance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Problem Title</th>
              <th>Tier / Level</th>
              <th>Difficulty</th>
              <th>Category</th>
              <th>XP Reward</th>
              <th>Sample Cases</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${questions.map(q => `
              <tr>
                <td><strong>${q.id}</strong></td>
                <td><strong>${q.title}</strong></td>
                <td><span class="hero-tag" style="background:#FEF3C7; color:#B45309;">Level ${q.level}</span></td>
                <td><span class="difficulty-badge difficulty-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
                <td>${q.category}</td>
                <td><strong style="color:#D97706;">+${q.xpReward} XP</strong></td>
                <td>${(q.sampleCases || []).length} Cases</td>
                <td>
                  <button class="portal-btn danger sm" onclick="window.deleteQuestionConfirm('${q.id}')">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const createBtn = container.querySelector('#createQuestionModalBtn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.className = 'faculty-modal-overlay active';
        overlay.innerHTML = `
          <div class="faculty-modal-content" style="max-width:800px;">
            <div class="faculty-modal-header">
              <h3>Create CodeQuest Challenge</h3>
              <button class="faculty-modal-close" onclick="this.closest('.faculty-modal-overlay').remove()">✕</button>
            </div>
            <div class="faculty-modal-body">
              <form id="newQuestionForm">
                <div style="margin-bottom:12px;">
                  <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Problem Title</label>
                  <input type="text" id="qTitle" required placeholder="e.g. Binary Search in Rotated Array" style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;">
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Level Tier</label>
                    <select id="qLevel" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                      <option value="1">Level 1 — Beginner</option>
                      <option value="2">Level 2 — Easy</option>
                      <option value="3" selected>Level 3 — Intermediate</option>
                      <option value="4">Level 4 — Advanced</option>
                      <option value="5">Level 5 — Expert</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Difficulty</label>
                    <select id="qDifficulty" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                      <option value="Easy">Easy</option>
                      <option value="Medium" selected>Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">XP Reward</label>
                    <input type="number" id="qXp" required value="250" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                  </div>
                </div>

                <div style="margin-bottom:12px;">
                  <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Problem Statement</label>
                  <textarea id="qDesc" rows="3" required placeholder="Describe the problem, input specifications, and output..." style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;"></textarea>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Sample Input</label>
                    <textarea id="qSampleIn" rows="2" placeholder="e.g. 5 3\n1 2 3 4 5" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;"></textarea>
                  </div>
                  <div>
                    <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Expected Sample Output</label>
                    <textarea id="qSampleOut" rows="2" placeholder="e.g. 2" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;"></textarea>
                  </div>
                </div>

                <button type="submit" class="portal-btn primary">Publish Question to CodeQuest 🚀</button>
              </form>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#newQuestionForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const title = overlay.querySelector('#qTitle').value;
          const level = parseInt(overlay.querySelector('#qLevel').value, 10);
          const diff = overlay.querySelector('#qDifficulty').value;
          const xp = parseInt(overlay.querySelector('#qXp').value, 10);
          const desc = overlay.querySelector('#qDesc').value;
          const sIn = overlay.querySelector('#qSampleIn').value;
          const sOut = overlay.querySelector('#qSampleOut').value;

          const newQ = {
            title: title,
            slug: title.toLowerCase().replace(/\s+/g, '-'),
            level: level,
            levelName: `LEVEL ${level}`,
            difficulty: diff,
            category: 'Algorithms',
            xpReward: xp,
            description: desc,
            inputFormat: 'Standard Input',
            outputFormat: 'Standard Output',
            constraints: '1 <= N <= 10^5',
            sampleCases: [{ input: sIn, expectedOutput: sOut }],
            hiddenTestCases: [{ input: sIn, expectedOutput: sOut }],
            starterCode: {
              java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your solution\n    }\n}',
              python: '# Your solution\n',
              c: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
              cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
              javascript: 'const fs = require("fs");\n'
            }
          };

          db.addCodingQuestion(newQ);
          alert(`✅ Challenge "${newQ.title}" published! Students can now solve it in CodeQuest.`);
          overlay.remove();
          renderQuestionCreator(user, db);
        });
      });
    }
  }

  window.deleteQuestionConfirm = function (qId) {
    if (confirm('Delete this coding challenge from CodeQuest?')) {
      window.BVCITS_DB.deleteCodingQuestion(qId);
      const authUser = window.BVCITS_AUTH.getCurrentUser();
      renderQuestionCreator(authUser, window.BVCITS_DB);
    }
  };

  /* ==========================================================================
     8. Coding Submissions & Student Code Inspector
     ========================================================================== */
  function renderSubmissionsViewer(user, db) {
    const container = document.getElementById('view-submissions');
    if (!container) return;

    const subs = db.getSubmissions();

    container.innerHTML = `
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box purple">📊</div>
            <div>
              <h3 class="card-title">Student Code Submissions &amp; Compiler Logs</h3>
              <span class="card-subtitle">Real-time compiler sandbox evaluation records — Click "Inspect Code" to view submitted student source</span>
            </div>
          </div>
        </div>

        <table class="attendance-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Problem Title</th>
              <th>Language</th>
              <th>Status</th>
              <th>Score</th>
              <th>Execution Time</th>
              <th>Memory</th>
              <th>Submitted Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${subs.map(s => `
              <tr>
                <td><strong>${s.studentName}</strong></td>
                <td>${s.questionTitle}</td>
                <td><span class="hero-tag" style="background:#F1F5F9; color:var(--portal-maroon);">${s.language}</span></td>
                <td><span class="attendance-badge ${s.status === 'Accepted' ? 'good' : 'warn'}">${s.status}</span></td>
                <td><strong>${s.score || 100} / 100</strong></td>
                <td>${s.executionTime || '45ms'}</td>
                <td>${s.memory || '8.2 MB'}</td>
                <td>${s.submittedAt}</td>
                <td>
                  <button class="portal-btn outline sm" onclick="window.inspectStudentCodeModal('${s.id}')">Inspect Code 🔍</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Global Code Inspector Modal
  window.inspectStudentCodeModal = function (subId) {
    const db = window.BVCITS_DB;
    const sub = db.getSubmissions().find(s => s.id === subId);
    if (!sub) return;

    const overlay = document.createElement('div');
    overlay.className = 'faculty-modal-overlay active';
    overlay.innerHTML = `
      <div class="faculty-modal-content" style="max-width:750px;">
        <div class="faculty-modal-header">
          <div>
            <h3>Submitted Code — ${sub.studentName}</h3>
            <span style="font-size:12px; color:#64748B;">Problem: <strong>${sub.questionTitle}</strong> | Language: <strong>${sub.language}</strong> | Status: <strong style="color:#15803D;">${sub.status}</strong></span>
          </div>
          <button class="faculty-modal-close" onclick="this.closest('.faculty-modal-overlay').remove()">✕</button>
        </div>

        <div class="faculty-modal-body">
          <div style="display:flex; justify-content:space-between; font-size:12px; color:#64748B; margin-bottom:8px;">
            <span>Execution Time: <strong>${sub.executionTime || '52ms'}</strong></span>
            <span>Memory: <strong>${sub.memory || '12.4 MB'}</strong></span>
            <span>Submitted: <strong>${sub.submittedAt}</strong></span>
          </div>

          <pre class="code-viewer-block"><code>${escapeHtml(sub.studentCode || '// Code snippet available in sandbox')}</code></pre>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  };

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ==========================================================================
     9. Announcements Broadcaster
     ========================================================================== */
  function renderAnnouncementsManager(user, db) {
    const container = document.getElementById('view-announcements');
    if (!container) return;

    const announcements = db.getAnnouncements();

    container.innerHTML = `
      <div class="grid-2">
        <div class="portal-card">
          <div class="portal-card-header">
            <div class="card-title-group">
              <div class="card-icon-box maroon">📢</div>
              <div>
                <h3 class="card-title">Broadcast Notice to Students</h3>
                <span class="card-subtitle">Dispatches immediate notification to student portals</span>
              </div>
            </div>
          </div>

          <form id="broadcastNoticeForm">
            <div style="margin-bottom:12px;">
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Notice Title</label>
              <input type="text" id="ancTitle" required placeholder="e.g. Special Lab Session Schedule" style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;">
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
              <div>
                <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Target Audience</label>
                <select id="ancTarget" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
                  <option value="All Students">All Students</option>
                  <option value="CSE Department">Specific Department (CSE)</option>
                  <option value="III Year Students" selected>III Year Students</option>
                  <option value="Class CSE-3A">Specific Class (CSE-3A)</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Subject</label>
                <input type="text" id="ancSubj" value="Advanced Java (CS502)" style="width:100%; padding:8px; border:1px solid #CBD5E1; border-radius:6px;">
              </div>
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Message Body</label>
              <textarea id="ancMsg" rows="4" required placeholder="Enter announcement body..." style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;"></textarea>
            </div>

            <button type="submit" class="portal-btn primary">Broadcast Notice 📢</button>
          </form>
        </div>

        <div class="portal-card">
          <div class="portal-card-header">
            <div class="card-title-group">
              <div class="card-icon-box gold">📜</div>
              <div>
                <h3 class="card-title">Recent Broadcasts</h3>
                <span class="card-subtitle">History of posted announcements</span>
              </div>
            </div>
          </div>

          <div class="notification-list" style="max-height:360px;">
            ${announcements.map(anc => `
              <div class="notification-item">
                <div class="notif-icon">📢</div>
                <div class="notif-body">
                  <div class="notif-title">${anc.title}</div>
                  <div class="notif-text">${anc.message}</div>
                  <div style="font-size:11px; color:#94A3B8; margin-top:4px;">Target: <strong>${anc.target}</strong> · Date: <strong>${anc.date}</strong></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const form = container.querySelector('#broadcastNoticeForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newAnc = {
          title: container.querySelector('#ancTitle').value,
          message: container.querySelector('#ancMsg').value,
          target: container.querySelector('#ancTarget').value,
          department: user.department,
          subject: container.querySelector('#ancSubj').value,
          author: user.fullName
        };

        db.broadcastAnnouncement(newAnc);
        alert(`✅ Announcement "${newAnc.title}" broadcasted!\n\nAll student accounts in ${newAnc.target} have received this notification.`);
        form.reset();
        renderAnnouncementsManager(user, db);
      });
    }
  }

  /* ==========================================================================
     10. Notifications View
     ========================================================================== */
  function renderNotificationsView(user, db) {
    const container = document.getElementById('view-notifications');
    if (!container) return;

    const notifs = db.getNotificationsForUser(user.id);

    container.innerHTML = `
      <div class="portal-card" style="max-width:720px;">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box gold">🔔</div>
            <div>
              <h3 class="card-title">Faculty Notifications &amp; Alerts</h3>
              <span class="card-subtitle">Automated notices on assignments, student submissions, and attendance</span>
            </div>
          </div>
        </div>

        <div class="notification-list">
          ${notifs.length ? notifs.map(n => `
            <div class="notification-item ${n.unread ? 'unread' : ''}">
              <div class="notif-icon">🔔</div>
              <div class="notif-body">
                <div class="notif-title">${n.title}</div>
                <div class="notif-text">${n.text}</div>
                <div class="notif-time">${n.time}</div>
              </div>
            </div>
          `).join('') : '<div style="padding:20px; text-align:center; color:#64748B;">No notifications at this time.</div>'}
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     11. Faculty Profile View & Updates
     ========================================================================== */
  function renderFacultyProfileView(user, db) {
    const container = document.getElementById('view-profile');
    if (!container) return;

    container.innerHTML = `
      <div class="portal-card" style="max-width:760px;">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box maroon">👤</div>
            <div>
              <h3 class="card-title">Faculty Profile &amp; Academic Credentials</h3>
              <span class="card-subtitle">Institutional profile, qualifications, and course allocations</span>
            </div>
          </div>
        </div>

        <form id="facultyProfileForm">
          <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px; padding:16px; background:#F8FAFC; border-radius:10px; border:1px solid #E2E8F0;">
            ${window.BVCITSPhotos.imgTag(user, '', 'width:64px; height:64px; border-radius:50%; object-fit:cover; border:2px solid var(--portal-gold);', 'id="facultyProfilePhoto"')}
            <div>
              <h3 style="margin:0; font-size:18px; color:var(--portal-maroon);">${user.fullName}</h3>
              <div style="font-size:13px; color:#64748B;">Employee ID: <strong>${user.employeeId || 'FAC001'}</strong> · ${user.designation} (${user.department})</div>
              <div style="font-size:12px; color:#64748B; margin-top:2px;">${user.email}</div>
              <div style="margin-top:8px;">
                <label for="facultyPhotoInput" class="portal-btn outline sm" style="cursor:pointer; font-size:11px; padding:6px 10px;">📷 Change Photo</label>
                <input type="file" id="facultyPhotoInput" accept="image/*" style="display:none;">
              </div>
            </div>
          </div>


          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
            <div>
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Full Name</label>
              <input type="text" id="facName" value="${user.fullName}" required style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;">
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Email Address</label>
              <input type="email" id="facEmail" value="${user.email}" required style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
            <div>
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Phone Contact</label>
              <input type="text" id="facPhone" value="${user.phone || '+91 94401 22334'}" required style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;">
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Qualifications</label>
              <input type="text" id="facQual" value="${user.qualification || 'Ph.D. (Computer Science)'}" style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;">
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Experience &amp; Industry Consulting</label>
            <input type="text" id="facExp" value="${user.experience || '18 Years Teaching & Research'}" style="width:100%; padding:8px 12px; border:1px solid #CBD5E1; border-radius:6px;">
          </div>

          <div style="margin-bottom:20px;">
            <label style="display:block; font-size:12px; font-weight:700; margin-bottom:6px;">Allocated Courses Handled</label>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${(user.coursesHandled || [
                { code: 'CS502', name: 'Advanced Java' },
                { code: 'CS503', name: 'DBMS' },
                { code: 'CS506', name: 'Web Tech Lab' }
              ]).map(c => `<span class="hero-tag" style="background:#F1F5F9; color:var(--portal-maroon); font-weight:700;">📚 ${c.code} — ${c.name}</span>`).join('')}
            </div>
          </div>

          <button type="submit" class="portal-btn primary">Save Profile Changes 💾</button>
        </form>
      </div>
    `;

    // Bind the per-user photo uploader (persisted in the local ERP database)
    window.BVCITSPhotos.bindUploader('facultyPhotoInput', 'facultyProfilePhoto', user.id, () => {
      showToast('✅ Profile photo updated for ' + user.fullName);
    });

    const form = container.querySelector('#facultyProfileForm');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const updates = {
          fullName: container.querySelector('#facName').value,
          email: container.querySelector('#facEmail').value,
          phone: container.querySelector('#facPhone').value,
          qualification: container.querySelector('#facQual').value,
          experience: container.querySelector('#facExp').value
        };

        db.updateFacultyProfile(user.id, updates);
        alert('✅ Faculty profile information updated successfully in the college database!');
        initFacultyPortal();
      });
    }
  }

  function showToast(msg) {
    const container = document.querySelector('.portal-toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = 'portal-toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

})(window);
