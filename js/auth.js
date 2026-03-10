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
});

function updateAuthUI() {
    const user = pheraDB.getCurrentUser();
    const ctaGroup = document.querySelector('.hero-cta-group'); // On index

    if (user && ctaGroup) {
        // If logged in on homepage, swap CTAs for Dashboard button
        ctaGroup.innerHTML = `<button class="btn btn-primary btn-large" onclick="redirectUser('${user.role}')">Go to ${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</button>`;

        // Add logout to Nav
        const navActions = document.querySelector('.nav-actions');

        // Remove existing if any to avoid duplicates
        const existingLogout = navActions.querySelector('.logout-btn');
        if (existingLogout) existingLogout.remove();

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-outline text-sm logout-btn';
        logoutBtn.style.padding = '0.25rem 0.5rem';
        logoutBtn.innerText = 'Logout';
        logoutBtn.addEventListener('click', () => { pheraDB.logout(); window.location.reload(); });
        navActions.insertBefore(logoutBtn, navActions.firstChild);

        // Hide login button
        const loginBtn = navActions.querySelector('button[onclick*="login-modal"]');
        if (loginBtn) loginBtn.style.display = 'none';

    } else {
        // If not logged in, ensure logout is hidden
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            const logout = navActions.querySelector('.logout-btn');
            if (logout) logout.remove();
        }
    }
}

function redirectUser(role) {
    if (role === 'owner') window.location.href = 'owner-dashboard.html';
    else if (role === 'shipper') window.location.href = 'shipper-dashboard.html';
    else if (role === 'admin') window.location.href = 'admin-dashboard.html';
    else window.location.href = 'index.html';
}
