/**
 * Logic for the Admin Control Panel
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Guard
    const user = pheraDB.getCurrentUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // 2. Setup UI
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.innerText = user.name;

    // 3. Setup Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.dashboard-view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.getAttribute('id').replace('tab-', 'view-');
            views.forEach(v => v.style.display = 'none');
            document.getElementById(targetId).style.display = 'block';

            renderAdminDashboard();
        });
    });

    renderAdminDashboard();
});

function renderAdminDashboard() {
    // Fetch all global data
    const users = pheraDB.getCollection('Users');
    const trucks = pheraDB.getCollection('Trucks');
    const shipments = pheraDB.getCollection('Shipments');
    const trips = pheraDB.getCollection('Trips');

    // Stats
    document.getElementById('stat-total-users').innerText = users.filter(u => u.role !== 'admin').length;
    document.getElementById('stat-total-trucks').innerText = trucks.filter(t => t.status === 'available').length;
    document.getElementById('stat-total-loads').innerText = shipments.filter(s => s.status === 'open').length;

    let totalEscrow = 0;
    trips.forEach(t => { if (t.escrowStatus === 'held') totalEscrow += (t.price || 0) });
    document.getElementById('stat-escrow-total').innerText = "₹" + totalEscrow;

    // Active Trips Table
    const tripsTable = document.querySelector('#admin-trips-table tbody');
    tripsTable.innerHTML = '';
    trips.forEach(trip => {
        const owner = users.find(u => u.id === trip.ownerId);
        const shipper = users.find(u => u.id === trip.shipperId);
        const sObj = shipments.find(x => x.id === trip.shipmentId);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${trip.id.substring(5, 12)}</td>
            <td>O: ${owner ? owner.name : 'N/A'}<br>S: ${shipper ? shipper.name : 'N/A'}</td>
            <td>${sObj ? sObj.pickupCity + ' &rarr; ' + sObj.deliveryCity : 'Unknown'}</td>
            <td><span style="color:${trip.escrowStatus === 'held' ? '#dc3545' : '#28a745'}; font-weight:bold;">${trip.escrowStatus.toUpperCase()} (₹${trip.price})</span></td>
            <td><span class="badge ${trip.status === 'completed' ? 'badge-success' : 'badge-warning'}">${trip.status}</span></td>
        `;
        tripsTable.appendChild(tr);
    });

    // Verifications Table
    const verifyTable = document.querySelector('#verification-table tbody');
    verifyTable.innerHTML = '';
    const pendingUsers = users.filter(u => u.role !== 'admin'); // For demo, list all non-admin

    pendingUsers.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${u.name}</strong></td>
            <td>${u.phone}</td>
            <td><span class="badge" style="background:#eee">${u.role.toUpperCase()}</span></td>
            <td>${u.verified ? '<span class="text-success">Verified</span>' : '<span class="text-danger">Pending KYC</span>'}</td>
            <td>
                ${!u.verified ? `<button class="btn btn-outline text-sm" onclick="verifyUser('${u.id}')" style="padding:0.25rem 0.5rem; color:var(--clr-success); border-color:var(--clr-success);">Approve KYC</button>` : '<span class="text-gray text-sm">Approved</span>'}
            </td>
        `;
        verifyTable.appendChild(tr);
    });

    // Raw Data Viewers
    document.getElementById('raw-trucks').innerText = JSON.stringify(trucks, null, 2);
    document.getElementById('raw-shipments').innerText = JSON.stringify(shipments, null, 2);
}

window.verifyUser = function (userId) {
    if (confirm('Approve KYC documents for this user? They will receive a Verified Badge.')) {
        const users = pheraDB.getCollection('Users');
        const idx = users.findIndex(u => u.id === userId);
        if (idx > -1) {
            users[idx].verified = true;
            pheraDB.saveCollection('Users', users);
            alert('User verified successfully!');
            renderAdminDashboard();
        }
    }
};
