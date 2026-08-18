/**
 * BVCITS Admin Portal Controller
 */

(function (window) {
  'use strict';

  function verifyAdminAccess() {
    if (!window.BVCITS_AUTH || !window.BVCITS_AUTH.requireAuth(['admin'])) {
      return false;
    }
    return true;
  }

  // Handle browser Back / Forward navigation and bfcache restoration
  window.addEventListener('pageshow', () => {
    verifyAdminAccess();
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (!verifyAdminAccess()) {
      return;
    }

    initAdminPortal();
  });

  // Global event delegation for all admin logout buttons
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

  function initAdminPortal() {
    const authUser = window.BVCITS_AUTH.getCurrentUser();
    if (!authUser) return;
    const db = window.BVCITS_DB;
    const user = db ? (db.getUserById(authUser.id) || authUser) : authUser;

    const nameEl = document.getElementById('topbarUserName');
    const roleEl = document.getElementById('topbarUserRole');
    if (nameEl) nameEl.textContent = user.fullName;
    if (roleEl) roleEl.textContent = 'Principal & Chief Administrator';

    setupAdminNav(user, db);
    renderAdminDashboard(user, db);
  }

  function setupAdminNav(user, db) {
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

        const title = link.querySelector('span:not(.icon):not(.badge-count)')?.textContent || 'Admin Portal';
        if (pageTitle) pageTitle.textContent = title;
        if (breadcrumb) breadcrumb.textContent = title;

        switch (viewId) {
          case 'dashboard':
            renderAdminDashboard(user, db);
            break;
          case 'users':
            renderUserManagement(user, db);
            break;
          case 'departments':
            renderDepartmentManagement(user, db);
            break;
          case 'codequest-admin':
            renderCodeQuestAdmin(user, db);
            break;
          case 'reports':
            renderReportsView(user, db);
            break;
        }
      });
    });
  }

  function renderAdminDashboard(user, db) {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    const users = db.getUsers();
    const students = users.filter(u => u.role === 'student');
    const faculty = users.filter(u => u.role === 'faculty');
    const depts = db.data.departments || [];
    const questions = db.getCodingQuestions();

    container.innerHTML = `
      <div class="dashboard-hero-banner">
        <div class="hero-student-profile">
          <img src="images/bvcits_seal.jpg" alt="BVCITS Admin" class="hero-avatar">
          <div class="hero-profile-meta">
            <h2>Principal &amp; Administrative Command Center</h2>
            <div class="hero-tags-row">
              <span class="hero-tag">🏛 Code: BVTS</span>
              <span class="hero-tag">⭐ NAAC 'A' Grade · Autonomous</span>
              <span class="hero-tag">📍 Batlapalem, Amalapuram</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-4">
        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#DCFCE7; color:#15803D;">👨‍🎓</div>
          <div class="kpi-info">
            <div class="kpi-label">Total Enrolled Students</div>
            <div class="kpi-val">1,450</div>
            <div class="kpi-sub">100% EAPCET Admissions 2026</div>
          </div>
        </div>

        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#DBEAFE; color:#1D4ED8;">👨‍🏫</div>
          <div class="kpi-info">
            <div class="kpi-label">Full-Time Faculty</div>
            <div class="kpi-val">150+</div>
            <div class="kpi-sub">Doctorates &amp; Researchers</div>
          </div>
        </div>

        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#FEF3C7; color:#B45309;">🏛</div>
          <div class="kpi-info">
            <div class="kpi-label">Programs Offered</div>
            <div class="kpi-val">12</div>
            <div class="kpi-sub">UG Engineering &amp; PG Courses</div>
          </div>
        </div>

        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#F3E8FF; color:#7E22CE;">📊</div>
          <div class="kpi-info">
            <div class="kpi-label">Campus Avg Attendance</div>
            <div class="kpi-val">86.4%</div>
            <div class="kpi-sub">Threshold: 75% Active</div>
          </div>
        </div>
      </div>

      <div class="grid-3">
        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#CCFBF1; color:#0F766E;">⭐</div>
          <div class="kpi-info">
            <div class="kpi-label">Institutional CGPA</div>
            <div class="kpi-val">8.15</div>
            <div class="kpi-sub">Across All 12 Departments</div>
          </div>
        </div>

        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#EDE9FE; color:#6D28D9;">⚔️</div>
          <div class="kpi-info">
            <div class="kpi-label">CodeQuest Problems</div>
            <div class="kpi-val">${questions.length}</div>
            <div class="kpi-sub">5 Active Difficulty Tiers</div>
          </div>
        </div>

        <div class="portal-card kpi-card">
          <div class="kpi-icon" style="background:#FEF3C7; color:#D97706;">💼</div>
          <div class="kpi-info">
            <div class="kpi-label">Placement Record</div>
            <div class="kpi-val">90%+</div>
            <div class="kpi-sub">Highest: ₹38 LPA | TCS: 7.09 LPA</div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="portal-card">
          <div class="portal-card-header">
            <div class="card-title-group">
              <div class="card-icon-box maroon">🏛</div>
              <div>
                <h3 class="card-title">Department Admissions &amp; Intake (2026)</h3>
                <span class="card-subtitle">100% Filled Capacity</span>
              </div>
            </div>
          </div>

          <table class="attendance-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Intake</th>
                <th>HOD</th>
              </tr>
            </thead>
            <tbody>
              ${depts.slice(0, 5).map(d => `
                <tr>
                  <td><strong>${d.name} (${d.code})</strong></td>
                  <td>${d.intake} seats</td>
                  <td>${d.hod}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="portal-card">
          <div class="portal-card-header">
            <div class="card-title-group">
              <div class="card-icon-box gold">👤</div>
              <div>
                <h3 class="card-title">Registered Portal Users</h3>
                <span class="card-subtitle">Active Student &amp; Faculty Accounts</span>
              </div>
            </div>
            <button class="portal-btn outline sm" onclick="document.querySelector('.sidebar-link[data-view=\\'users\\']').click();">Manage Users →</button>
          </div>

          <table class="attendance-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>ID / Roll</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${users.slice(0, 5).map(u => `
                <tr>
                  <td><strong>${u.fullName}</strong></td>
                  <td><span class="hero-tag" style="background:#F1F5F9; color:var(--portal-maroon);">${u.role.toUpperCase()}</span></td>
                  <td>${u.rollNo || u.employeeId || u.username}</td>
                  <td><span class="attendance-badge good">Active</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderUserManagement(user, db) {
    const container = document.getElementById('view-users');
    if (!container) return;

    const users = db.getUsers();

    container.innerHTML = `
      <div class="portal-card">
        <div class="table-actions-bar">
          <div class="search-input-wrap">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" placeholder="Search user ID or name...">
          </div>
          <button class="portal-btn primary sm" onclick="alert('User creation modal opened!');">+ Add New User Account</button>
        </div>

        <table class="attendance-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username / Roll No</th>
              <th>Role</th>
              <th>Email</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><strong>${u.fullName}</strong></td>
                <td>${u.rollNo || u.employeeId || u.username}</td>
                <td><span class="hero-tag" style="background:#F1F5F9; color:var(--portal-maroon);">${u.role}</span></td>
                <td>${u.email}</td>
                <td>${u.department}</td>
                <td><span class="attendance-badge good">${u.status || 'Active'}</span></td>
                <td>
                  <button class="portal-btn outline sm" onclick="alert('Reset password sent for ${u.username}');">Reset Pass</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderDepartmentManagement(user, db) {
    const container = document.getElementById('view-departments');
    if (!container) return;

    const depts = db.data.departments || [];

    container.innerHTML = `
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box maroon">🏛</div>
            <div>
              <h3 class="card-title">All 12 Academic Departments</h3>
              <span class="card-subtitle">Intakes, HOD allocations, and laboratory configurations</span>
            </div>
          </div>
        </div>

        <table class="attendance-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Department Name</th>
              <th>Approved Intake</th>
              <th>Head of Department</th>
              <th>Established</th>
              <th>Dedicated Labs</th>
            </tr>
          </thead>
          <tbody>
            ${depts.map(d => `
              <tr>
                <td><strong>${d.code}</strong></td>
                <td>${d.name}</td>
                <td><strong>${d.intake}</strong> Seats</td>
                <td>${d.hod}</td>
                <td>${d.established}</td>
                <td>${d.labs} Labs</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderCodeQuestAdmin(user, db) {
    const container = document.getElementById('view-codequest-admin');
    if (!container) return;

    const questions = db.getCodingQuestions();

    container.innerHTML = `
      <div class="portal-card">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box gold">⚔️</div>
            <div>
              <h3 class="card-title">CodeQuest Question Bank Administration</h3>
              <span class="card-subtitle">Manage coding problems, difficulty levels, and test cases</span>
            </div>
          </div>
          <button class="portal-btn gold sm" onclick="alert('Add question modal');">+ Add Challenge</button>
        </div>

        <table class="attendance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Tier / Level</th>
              <th>Difficulty</th>
              <th>XP Reward</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            ${questions.map(q => `
              <tr>
                <td><strong>${q.id}</strong></td>
                <td>${q.title}</td>
                <td>Level ${q.level}</td>
                <td><span class="difficulty-badge difficulty-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
                <td>+${q.xpReward} XP</td>
                <td>${q.category}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderReportsView(user, db) {
    const container = document.getElementById('view-reports');
    if (!container) return;

    container.innerHTML = `
      <div class="portal-card" style="max-width:600px;">
        <div class="portal-card-header">
          <div class="card-title-group">
            <div class="card-icon-box blue">📥</div>
            <div>
              <h3 class="card-title">Institutional Reports &amp; Exports</h3>
              <span class="card-subtitle">Download academic, attendance, and placement statistics</span>
            </div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px;">
          <button class="portal-btn outline" onclick="alert('Downloading Autonomous Attendance Summary Report (PDF)...')">📄 Download Overall Attendance Report (PDF)</button>
          <button class="portal-btn outline" onclick="alert('Downloading Semester CGPA Analysis (Excel)...')">📊 Download CGPA &amp; Academic Analysis (XLSX)</button>
          <button class="portal-btn outline" onclick="alert('Downloading CodeQuest Coding Arena Performance Report...')">⚔️ Download CodeQuest Student Rankings</button>
          <button class="portal-btn outline" onclick="alert('Downloading Placements 2026 Report...')">💼 Download TCS &amp; Placement Statistics Report</button>
        </div>
      </div>
    `;
  }

})(window);
