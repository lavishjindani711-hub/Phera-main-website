/**
 * Handles Authentication, Login/Registration forms, and Session redirection
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check global scope auth status for UI updates
    updateAuthUI();

    // Attach to Login Modal
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const phoneStr = document.getElementById('login-phone').value;
            if (!phoneStr) {
                alert('Please enter your phone number.');
                return;
            }

            const user = pheraDB.login(phoneStr);
            if (user) {
                // Redirect based on role
                redirectUser(user.role);
            } else {
                alert('Account not found. Please register or check your number. (Demo data: 9876543210 (Owner) / 9123456780 (Shipper) / admin)');
            }
        });
    }

    // Attach to the main Register Form (from index.html)
    const mainRegForm = document.getElementById('reg-form');
    if (mainRegForm) {
        const regSubmitBtn = mainRegForm.querySelector('.btn-primary');
        regSubmitBtn.addEventListener('click', (e) => {
            // Override previous mock submission with real simulation
            e.preventDefault();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const city = document.getElementById('city').value;
            const role = document.getElementById('type').value;

            if (!name || !phone || !city) {
                alert('Please fill out all fields');
                return;
            }

            const result = pheraDB.registerUser({ name, phone, city, role });
            if (result.error) {
                alert(result.error);
                return;
            }

            alert('Registration Successful! Logging you in...');
            pheraDB.login(phone);
            setTimeout(() => { redirectUser(role); }, 1000);
        });
    }

    // Logout logic
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            pheraDB.logout();
            window.location.href = 'index.html';
        });
    });

    // ----------------------------------------------------------------------
    // Mobile Menu Toggle Logic (Global)
    // ----------------------------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    if (mobileMenuBtn && mobileMenuOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuOverlay.classList.toggle('open');
            if (mobileMenuOverlay.classList.contains('open')) {
                mobileMenuBtn.innerHTML = '✕';
            } else {
                mobileMenuBtn.innerHTML = '☰';
            }
        });

        mobileMenuOverlay.querySelectorAll('.global-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                mobileMenuOverlay.classList.remove('open');
                mobileMenuBtn.innerHTML = '☰';
            });
        });
    }
});

function updateAuthUI() {
    const user = pheraDB.getCurrentUser();

    // 1. Update Hero CTAs if on index
    const ctaGroup = document.querySelector('.hero-cta-group');
    if (user && ctaGroup) {
        ctaGroup.innerHTML = `<button class="btn btn-primary btn-large" onclick="redirectUser('${user.role}')" style="text-decoration:none;">Go to Dashboard</button>`;
    }

    // 2. Update Global Auth Container
    const authContainer = document.getElementById('global-auth-container');
    if (authContainer) {
        if (user) {
            authContainer.innerHTML = `
                <div class="profile-dropdown-container">
                    <button class="profile-trigger" id="profile-btn">
                        ${user.name || user.phone || 'User'}
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div class="profile-dropdown" id="profile-menu">
                        <a href="#" class="profile-dropdown-item" id="nav-dash-link">Dashboard</a>
                        <a href="#" class="profile-dropdown-item" id="nav-logout-btn">Logout</a>
                    </div>
                </div>
            `;

            // Re-attach event listeners
            document.getElementById('nav-dash-link').addEventListener('click', (e) => {
                e.preventDefault();
                redirectUser(user.role);
            });
            document.getElementById('nav-logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                pheraDB.logout();
                window.location.reload();
            });

            // Toggle dropdown logic
            const profileBtn = document.getElementById('profile-btn');
            const profileMenu = document.getElementById('profile-menu');
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                profileMenu.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                    profileMenu.classList.remove('show');
                }
            });
        } else {
            // Not logged in
            authContainer.innerHTML = `
                <button class="btn btn-outline text-sm"
                    onclick="document.getElementById('login-modal').style.display='flex'"
                    data-i18n="nav-login" style="color: var(--clr-white); border-color: rgba(255,255,255,0.3);">Login</button>
            `;
        }
    }
}

function redirectUser(role) {
    if (role === 'owner') window.location.href = 'owner-dashboard.html';
    else if (role === 'shipper') window.location.href = 'shipper-dashboard.html';
    else if (role === 'admin') window.location.href = 'admin-dashboard.html';
    else window.location.href = 'index.html';
}
