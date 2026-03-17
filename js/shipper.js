/**
 * Logic for the Shipper Dashboard
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Guard
    const user = pheraDB.getCurrentUser();
    if (!user || user.role !== 'shipper') {
        window.location.href = 'index.html';
        return;
    }

    // 2. Setup UI
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.innerText = user.name;
    const userStatusEl = document.getElementById('user-status-icon');
    if (userStatusEl) userStatusEl.innerHTML = user.verified ? '✅ Verified' : '⏳ Pending Verification';

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

            renderShipperDashboard();
            if (targetId === 'view-find-trucks') window.searchTrucks(); // Auto load all
        });
    });

    // 4. Form Submission (Post Load)
    const formAddLoad = document.getElementById('form-add-load');
    if (formAddLoad) {
        formAddLoad.addEventListener('submit', (e) => {
            e.preventDefault();

            const shipmentData = {
                shipperId: user.id,
                pickupCity: document.getElementById('s-pickup').value,
                deliveryCity: document.getElementById('s-deliv').value,
                cargoType: document.getElementById('s-cargo').value,
                weight: parseFloat(document.getElementById('s-weight').value),
                date: document.getElementById('s-date').value
            };

            pheraDB.addShipment(shipmentData);
            document.getElementById('add-load-modal').style.display = 'none';
            formAddLoad.reset();
            alert('Shipment posted! Truck owners will now see this load in their dashboard.');
            renderShipperDashboard();
        });
    }

    renderShipperDashboard();
});

// Render Dashboard function
function renderShipperDashboard() {
    const user = pheraDB.getCurrentUser();
    if (!user) return;

    const myLoads = pheraDB.getShipmentsByShipper(user.id);
    const trips = pheraDB.getCollection('Trips').filter(t => t.shipperId === user.id);

    // Stats
    const openLoads = myLoads.filter(l => l.status === 'open').length;
    const activeTrips = trips.filter(t => t.status !== 'completed').length;
    let totalSpent = 0;
    trips.forEach(t => { if (t.status === 'completed') totalSpent += (t.price || 0) });

    document.getElementById('stat-loads-count').innerText = openLoads;
    document.getElementById('stat-transit-count').innerText = activeTrips;
    document.getElementById('stat-spent-count').innerText = "₹" + totalSpent;

    // Render My Loads Table
    const loadsTable = document.querySelector('#my-loads-table tbody');
    loadsTable.innerHTML = '';
    myLoads.forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${l.pickupCity} &rarr; ${l.deliveryCity}</strong></td>
            <td><span class="badge" style="background:#eee">${l.cargoType.toUpperCase()}</span></td>
            <td>${l.weight} Tons</td>
            <td>${l.date}</td>
            <td><span class="badge ${l.status === 'open' ? 'badge-success' : 'badge-warning'}">${l.status}</span></td>
        `;
        loadsTable.appendChild(tr);
    });

    // Render Tracking Table
    const trackingTable = document.querySelector('#active-trips-table tbody');
    trackingTable.innerHTML = '';
    trips.forEach(trip => {
        const tObj = pheraDB.getCollection('Trucks').find(x => x.id === trip.truckId);
        const sObj = pheraDB.getCollection('Shipments').find(x => x.id === trip.shipmentId);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${trip.id.substring(5, 12)}</td>
            <td>${sObj ? sObj.pickupCity + ' &rarr; ' + sObj.deliveryCity : 'Unknown'}</td>
            <td>${tObj ? tObj.registration : 'Loading...'}</td>
            <td>
                <span class="badge ${trip.status === 'completed' ? 'badge-success' : 'badge-warning'}">${trip.status}</span>
                <br><span style="font-size:10px; color:${trip.escrowStatus === 'held' ? '#dc3545' : '#28a745'}">Escrow: ${trip.escrowStatus.toUpperCase()}</span>
            </td>
            <td>
                <a href="#" class="text-sm" onclick="alert('GPS Module not enabled in Phase 1 Demo. Truck is in transit.')">View Map</a>
                ${trip.status === 'completed' ? '<br><span class="text-success text-sm">Receipt</span>' : ''}
            </td>
        `;
        trackingTable.appendChild(tr);
    });
}

// Global search trucks function
window.searchTrucks = function () {
    const city = document.getElementById('search-city').value.toLowerCase();
    const cap = parseFloat(document.getElementById('search-cap').value) || 0;

    const trucks = pheraDB.getCollection('Trucks').filter(t => t.status === 'available');

    // Simple filter
    const matches = trucks.filter(t => {
        if (city && t.currentCity && !t.currentCity.toLowerCase().includes(city)) return false;
        if (cap && t.capacity < cap) return false;
        return true;
    });

    const tbody = document.querySelector('#search-results-table tbody');
    tbody.innerHTML = '';

    if (matches.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray p-4">No available trucks match your criteria.</td></tr>';
        return;
    }

    matches.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${t.registration}</strong></td>
            <td>${t.currentCity || 'Unknown'}</td>
            <td>${t.capacity} Tons</td>
            <td><span class="text-sm text-gray">${t.loadCompatibility.join(', ')}</span></td>
            <td><button class="btn btn-outline text-sm" onclick="alert('In future updates, you can send a booking request directly replacing the manual load matching workflow.')" style="padding: 0.25rem 0.5rem;">Request Booking</button></td>
        `;
        tbody.appendChild(tr);
    });
};
