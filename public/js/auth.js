/**
 * BVCITS College ERP & Gamified Learning Platform
 * Authentication & Session Guard Engine
 */

(function (window) {
  'use strict';

  const SESSION_KEY = 'BVCITS_AUTH_SESSION_V2';

  class BVCITSAuth {
    constructor() {
      this.currentUser = null;
      this.init();
    }

    init() {
      try {
        const stored = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
        if (stored) {
          this.currentUser = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to parse auth session:', e);
        this.currentUser = null;
      }
    }

    getCurrentUser() {
      if (!this.currentUser) {
        this.init();
      }
      return this.currentUser;
    }

    isLoggedIn() {
      return !!this.getCurrentUser();
    }

    getUserRole() {
      const user = this.getCurrentUser();
      return user ? user.role : null;
    }

    getDashboardUrlForRole(role) {
      switch (role) {
        case 'student':
          return 'student-dashboard.html';
        case 'faculty':
          return 'faculty-dashboard.html';
        case 'admin':
          return 'admin-dashboard.html';
        default:
          return 'index.html';
      }
    }

    /**
     * Authenticate user with credentials
     * @param {string} identifier (username, roll number, employee ID, or email)
     * @param {string} password
     * @param {boolean} rememberMe
     */
    login(identifier, password, rememberMe = true) {
      return new Promise((resolve) => {
        // Realistic network delay
        setTimeout(() => {
          if (!window.BVCITS_DB) {
            resolve({ success: false, error: 'Database service is currently unavailable. Please reload.' });
            return;
          }

          if (!identifier || !password) {
            resolve({ success: false, error: 'Please enter both your User ID / Roll No and password.' });
            return;
          }

          const user = window.BVCITS_DB.findUserByCredential(identifier, password);

          if (!user) {
            resolve({
              success: false,
              error: 'Invalid credentials. Please verify your Roll Number, Employee ID, or Password.'
            });
            return;
          }

          if (user.status && user.status === 'Disabled') {
            resolve({
              success: false,
              error: 'Your account has been deactivated. Please contact the administrator.'
            });
            return;
          }

          // Successful authentication
          this.currentUser = user;
          const sessionPayload = JSON.stringify(user);
          sessionStorage.setItem(SESSION_KEY, sessionPayload);
          if (rememberMe) {
            localStorage.setItem(SESSION_KEY, sessionPayload);
          }

          const redirectUrl = this.getDashboardUrlForRole(user.role);

          resolve({
            success: true,
            user: user,
            redirectUrl: redirectUrl,
            message: `Welcome back, ${user.fullName}!`
          });
        }, 500);
      });
    }

    /**
     * Logout and clean up active session
     * @param {string} redirectUrl
     */
    logout(redirectUrl = 'portal-login.html') {
      this.currentUser = null;
      try {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem('BVCITS_AUTH_REDIRECT_AFTER_LOGIN');
        sessionStorage.removeItem('BVCITS_AUTH_SESSION');
        localStorage.removeItem('BVCITS_AUTH_SESSION');

        // Comprehensive cleanup of any authentication or faculty session artifacts
        const clearAuthKeys = (storage) => {
          if (!storage) return;
          const keysToRemove = [];
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && (key.startsWith('BVCITS_AUTH') || key.toLowerCase().includes('session') || key.toLowerCase().includes('auth_user') || key.toLowerCase().includes('faculty_session'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => storage.removeItem(k));
        };
        clearAuthKeys(sessionStorage);
        clearAuthKeys(localStorage);
      } catch (e) {
        console.error('Logout storage cleanup error:', e);
      }

      window.location.replace(redirectUrl || 'portal-login.html');
    }

    /**
     * Guard routes: Verify user is logged in with allowed roles
     * @param {Array<string>} allowedRoles
     */
    requireAuth(allowedRoles = []) {
      const user = this.getCurrentUser();
      if (!user) {
        // Redirect to login page
        sessionStorage.setItem('BVCITS_AUTH_REDIRECT_AFTER_LOGIN', window.location.pathname);
        window.location.replace('portal-login.html');
        return false;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        alert(`Access Denied: Your account role (${user.role}) is not authorized to access this portal.`);
        window.location.replace(this.getDashboardUrlForRole(user.role));
        return false;
      }

      return true;
    }

    /**
     * Renders an interactive login card inside any DOM container
     * @param {HTMLElement|string} container
     * @param {Function} onSuccess
     */
    renderLoginForm(container, onSuccess) {
      const el = typeof container === 'string' ? document.getElementById(container) : container;
      if (!el) return;

      el.innerHTML = `
        <div class="portal-auth-card">
          <div class="auth-card-header">
            <div class="auth-brand-logo">
              <img src="images/bvcits_seal.jpg" alt="BVCITS Logo">
            </div>
            <h3>BVCITS Institutional Portal</h3>
            <p>Autonomous College ERP & CodeQuest Arena</p>
          </div>

          <div class="auth-role-tabs">
            <button type="button" class="role-tab-btn active" data-role="student">Student</button>
            <button type="button" class="role-tab-btn" data-role="faculty">Faculty</button>
            <button type="button" class="role-tab-btn" data-role="admin">Admin</button>
          </div>

          <div id="authAlertBox" class="auth-alert" style="display:none;"></div>

          <form id="portalLoginForm" class="auth-form">
            <div class="form-group">
              <label for="authIdentifier" id="authIdLabel">Roll Number / Student ID / Email</label>
              <div class="input-with-icon">
                <span class="icon">👤</span>
                <input type="text" id="authIdentifier" placeholder="e.g. 22H41A0482 or ratnaraju" required autocomplete="username">
              </div>
            </div>

            <div class="form-group">
              <label for="authPassword">Password</label>
              <div class="input-with-icon">
                <span class="icon">🔒</span>
                <input type="password" id="authPassword" placeholder="Enter password (default: password123)" required autocomplete="current-password">
              </div>
            </div>

            <div class="form-row-between">
              <label class="remember-wrap">
                <input type="checkbox" id="authRememberMe" checked>
                <span>Remember session</span>
              </label>
              <a href="contact.html" class="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" id="authSubmitBtn" class="auth-submit-btn">
              <span class="btn-text">Authenticate & Enter Portal</span>
              <span class="btn-spinner" style="display:none;">⏳</span>
            </button>
          </form>

          <div class="demo-quick-logins">
            <div class="demo-divider"><span>1-Click Demo Accounts</span></div>
            <div class="demo-chips-grid">
              <button type="button" class="demo-chip" data-user="ratnaraju" data-pass="password123" title="ECE III Year | TCS 7.09 LPA">
                <span>🎓 Student: Ratnaraju (ECE)</span>
              </button>
              <button type="button" class="demo-chip" data-user="meenakshi" data-pass="password123" title="CSE III Year | CodeQuest Level 4">
                <span>🎓 Student: Meenakshi (CSE)</span>
              </button>
              <button type="button" class="demo-chip" data-user="teja" data-pass="password123" title="ECE II Year | Low Attendance Warning Demo">
                <span>⚠️ Student: Teja (71% Att.)</span>
              </button>
              <button type="button" class="demo-chip" data-user="murthy" data-pass="password123" title="Dr. Murthy | HOD CSE">
                <span>👨‍🏫 Faculty: Dr. Murthy (HOD)</span>
              </button>
              <button type="button" class="demo-chip" data-user="admin" data-pass="admin123" title="Principal & Administrator">
                <span>🏛 Admin: Principal Office</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Inject styling for auth card if not present
      this.ensureAuthStyles();

      // Role Tabs Logic
      let currentSelectedRole = 'student';
      const roleBtns = el.querySelectorAll('.role-tab-btn');
      const idLabel = el.querySelector('#authIdLabel');
      const idInput = el.querySelector('#authIdentifier');
      const passInput = el.querySelector('#authPassword');
      const alertBox = el.querySelector('#authAlertBox');
      const form = el.querySelector('#portalLoginForm');
      const submitBtn = el.querySelector('#authSubmitBtn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');

      roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          roleBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentSelectedRole = btn.getAttribute('data-role');

          if (currentSelectedRole === 'student') {
            idLabel.textContent = 'Roll Number / Student ID / Email';
            idInput.placeholder = 'e.g. 22H41A0482 or ratnaraju';
            idInput.value = 'ratnaraju';
            passInput.value = 'password123';
          } else if (currentSelectedRole === 'faculty') {
            idLabel.textContent = 'Faculty Employee ID / Email';
            idInput.placeholder = 'e.g. FAC001 or murthy';
            idInput.value = 'murthy';
            passInput.value = 'password123';
          } else if (currentSelectedRole === 'admin') {
            idLabel.textContent = 'Administrator ID / Email';
            idInput.placeholder = 'e.g. ADM001 or admin';
            idInput.value = 'admin';
            passInput.value = 'admin123';
          }
        });
      });

      // Demo Chips Quick Fill
      const demoChips = el.querySelectorAll('.demo-chip');
      demoChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const u = chip.getAttribute('data-user');
          const p = chip.getAttribute('data-pass');
          idInput.value = u;
          passInput.value = p;
          form.dispatchEvent(new Event('submit'));
        });
      });

      // Submit Form
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = idInput.value.trim();
        const password = passInput.value;
        const rememberMe = el.querySelector('#authRememberMe').checked;

        // UI Loading State
        submitBtn.disabled = true;
        btnText.textContent = 'Verifying credentials...';
        btnSpinner.style.display = 'inline-block';
        alertBox.style.display = 'none';
        alertBox.className = 'auth-alert';

        const result = await this.login(identifier, password, rememberMe);

        if (result.success) {
          alertBox.textContent = `✅ ${result.message} Redirecting to your dashboard...`;
          alertBox.className = 'auth-alert success';
          alertBox.style.display = 'block';
          btnText.textContent = 'Access Granted!';

          setTimeout(() => {
            if (onSuccess) {
              onSuccess(result);
            } else {
              window.location.href = result.redirectUrl;
            }
          }, 600);
        } else {
          submitBtn.disabled = false;
          btnText.textContent = 'Authenticate & Enter Portal';
          btnSpinner.style.display = 'none';
          alertBox.textContent = `⚠️ ${result.error}`;
          alertBox.className = 'auth-alert error';
          alertBox.style.display = 'block';
        }
      });
    }

    ensureAuthStyles() {
      if (document.getElementById('bvcits-auth-form-styles')) return;
      const style = document.createElement('style');
      style.id = 'bvcits-auth-form-styles';
      style.textContent = `
        .portal-auth-card {
          background: #FFFFFF;
          padding: 28px 24px;
          border-radius: 16px;
        }
        .auth-card-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .auth-brand-logo img {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          margin: 0 auto 10px;
          border: 2px solid #D9A227;
        }
        .auth-card-header h3 {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          color: #7A1220;
          margin: 0 0 4px;
        }
        .auth-card-header p {
          font-size: 12px;
          color: #64748B;
          margin: 0;
        }
        .auth-role-tabs {
          display: flex;
          background: #F1F5F9;
          border-radius: 8px;
          padding: 4px;
          margin-bottom: 18px;
        }
        .role-tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          padding: 8px;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 700;
          color: #64748B;
          cursor: pointer;
          transition: all 0.2s;
        }
        .role-tab-btn.active {
          background: #7A1220;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(122, 18, 32, 0.2);
        }
        .auth-alert {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          margin-bottom: 16px;
          line-height: 1.4;
        }
        .auth-alert.error {
          background: #FEE2E2;
          color: #991B1B;
          border: 1px solid #F87171;
        }
        .auth-alert.success {
          background: #DCFCE7;
          color: #15803D;
          border: 1px solid #4ADE80;
        }
        .auth-form .form-group {
          margin-bottom: 14px;
        }
        .auth-form label {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-with-icon .icon {
          position: absolute;
          left: 12px;
          font-size: 14px;
          color: #94A3B8;
        }
        .input-with-icon input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          border-radius: 8px;
          border: 1px solid #CBD5E1;
          font-size: 13.5px;
          outline: none;
          transition: border 0.2s;
        }
        .input-with-icon input:focus {
          border-color: #7A1220;
          box-shadow: 0 0 0 3px rgba(122, 18, 32, 0.1);
        }
        .form-row-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          margin-bottom: 18px;
        }
        .remember-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #475569;
          cursor: pointer;
        }
        .forgot-link {
          color: #7A1220;
          font-weight: 700;
          text-decoration: none;
        }
        .auth-submit-btn {
          width: 100%;
          background: #7A1220;
          color: #FFFFFF;
          border: none;
          padding: 12px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(122, 18, 32, 0.25);
        }
        .auth-submit-btn:hover {
          background: #530C15;
          transform: translateY(-1px);
        }
        .demo-divider {
          text-align: center;
          position: relative;
          margin: 18px 0 12px;
        }
        .demo-divider::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background: #E2E8F0;
        }
        .demo-divider span {
          position: relative;
          background: #FFFFFF;
          padding: 0 10px;
          font-size: 10.5px;
          font-weight: 800;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .demo-chips-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .demo-chip {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
        }
        .demo-chip:hover {
          background: #FAF5EA;
          border-color: #D9A227;
          color: #7A1220;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Attach singleton
  window.BVCITS_AUTH = new BVCITSAuth();

})(window);
