/**
 * Logic for the Truck Owner Dashboard
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Guard
    const user = pheraDB.getCurrentUser();
    if (!user || user.role !== 'owner') {
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

            // Refresh data when switching tabs safely
            renderDashboard();
        });
    });

    // 4. Form Submission (Add Truck)
    const formAddTruck = document.getElementById('form-add-truck');
    if (formAddTruck) {
        formAddTruck.addEventListener('submit', (e) => {
            e.preventDefault();

            const compatSelect = document.getElementById('t-compat');
            const compatValues = Array.from(compatSelect.selectedOptions).map(opt => opt.value);

            const routeStr = document.getElementById('t-routes').value;
            const routes = routeStr ? routeStr.split(',').map(s => s.trim()) : [];

            const truckData = {
                ownerId: user.id,
                registration: document.getElementById('t-reg').value,
                type: document.getElementById('t-type').value,
                capacity: parseFloat(document.getElementById('t-cap').value),
                routePref: routes,
                loadCompatibility: compatValues
            };

            pheraDB.addTruck(truckData);
            document.getElementById('add-truck-modal').style.display = 'none';
            formAddTruck.reset();
            alert('Truck availability posted! Phera will now match you with shipments.');
            renderDashboard();
        });
    }

    // Initialize data
    renderDashboard();
});

// Render all tables/stats
function renderDashboard() {
    const user = pheraDB.getCurrentUser();
    if (!user) return;

    // Fetch data
    const myTrucks = pheraDB.getTrucksByOwner(user.id);
    const trips = pheraDB.getCollection('Trips').filter(t => t.ownerId === user.id);

    // Render Stats
    document.getElementById('stat-trucks-count').innerText = myTrucks.length;
    document.getElementById('stat-trips-count').innerText = trips.length;

    // Render My Trucks Table
    const trucksTable = document.querySelector('#my-trucks-table tbody');
    trucksTable.innerHTML = '';
    myTrucks.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${t.registration}</strong></td>
            <td>${t.type} (${t.capacity} Tons)</td>
            <td>${t.routePref.length > 0 ? t.routePref.join(' &rarr; ') : 'Any'}</td>
            <td><span class="badge ${t.status === 'available' ? 'badge-success' : 'badge-warning'}">${t.status}</span></td>
        `;
        trucksTable.appendChild(tr);
    });

    // Render Matches Container
    const matchesContainer = document.getElementById('matches-container');
    matchesContainer.innerHTML = '';
    let matchCount = 0;

    // Check each available truck for matches
    myTrucks.filter(t => t.status === 'available').forEach(truck => {
        const compatibleShipments = pheraDB.findMatchesForTruck(truck.id);

        compatibleShipments.forEach(ship => {
            matchCount++;
            const compCard = document.createElement('div');
            compCard.className = 'card p-4 border-left';
            compCard.style.borderLeft = '4px solid var(--clr-secondary)';
            compCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <span class="badge badge-info mb-2">Match found</span>
                        <h4 class="m-0">${ship.pickupCity} &rarr; ${ship.deliveryCity}</h4>
                    </div>
                    <div style="text-align: right;">
                        <strong>₹${ship.weight * 1200}</strong><br>
                        <small class="text-gray">Est. Payment</small>
                    </div>
                </div>
                <div class="mb-3">
                    <p class="mb-1 text-sm"><strong>Cargo:</strong> ${ship.cargoType.toUpperCase()} (${ship.weight} Tons)</p>
                    <p class="mb-1 text-sm"><strong>Pickup Date:</strong> ${ship.date || 'Immediate'}</p>
                    <p class="mb-1 text-sm text-gray">Compatible with your truck: ${truck.registration}</p>
                </div>
                <!-- Escrow acceptance via Action -->
                <button class="btn btn-secondary btn-block" onclick="acceptLoad('${truck.id}', '${ship.id}', ${ship.weight * 1200})">Accept & Confirm Trip</button>
            `;
            matchesContainer.appendChild(compCard);
        });
    });

    if (matchCount === 0) {
        matchesContainer.innerHTML = '<p class="text-gray w-100 p-4">No matching loads found right now. Check back later.</p>';
    }
    document.getElementById('stat-matches-count').innerText = matchCount;

    // Render Active Trips
    const tripsTable = document.querySelector('#active-trips-table tbody');
    tripsTable.innerHTML = '';
    trips.forEach(trip => {
        const tObj = pheraDB.getCollection('Trucks').find(x => x.id === trip.truckId);
        const sObj = pheraDB.getCollection('Shipments').find(x => x.id === trip.shipmentId);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${trip.id.substring(5, 12)}</td>
            <td>${tObj ? tObj.registration : 'Unknown'}</td>
            <td>${sObj ? sObj.pickupCity + ' &rarr; ' + sObj.deliveryCity : 'Unknown'}</td>
            <td>
                <span class="badge ${trip.status === 'completed' ? 'badge-success' : 'badge-warning'}">${trip.status}</span><br>
                <span style="font-size:10px; color:#17a2b8;">Escrow: ${trip.escrowStatus}</span>
            </td>
            <td>
                ${trip.status !== 'completed' ? `<button class="btn btn-outline text-sm" onclick="completeTrip('${trip.id}')" style="padding:0.2rem 0.5rem">Mark Delivered</button>` : '<span class="text-success">Paid</span>'}
            </td>
        `;
        tripsTable.appendChild(tr);
    });
}

window.acceptLoad = function (truckId, shipmentId, price) {
    if (confirm('Are you sure you want to lock this load? Payment will be held in PHERA escrow for you.')) {
        const trip = pheraDB.bookTrip(truckId, shipmentId, price);
        if (!trip.error) {
            alert('Trip booked successfully! Status updated.');
            renderDashboard();
            // switch to dashboard view to see active trip
            document.getElementById('tab-dashboard').click();
        } else {
            alert(trip.error);
        }
    }
};

window.completeTrip = function (tripId) {
    if (confirm('Confirm delivery? PHERA admin will verify and release funds to your account.')) {
        const trips = pheraDB.getCollection('Trips');
        const idx = trips.findIndex(t => t.id === tripId);
        if (idx > -1) {
            trips[idx].status = 'completed';
            trips[idx].escrowStatus = 'released';
            pheraDB.saveCollection('Trips', trips);

            // Free the truck
            const trucks = pheraDB.getCollection('Trucks');
            const tIdx = trucks.findIndex(t => t.id === trips[idx].truckId);
            if (tIdx > -1) {
                trucks[tIdx].status = 'available';
                pheraDB.saveCollection('Trucks', trucks);
            }

            renderDashboard();
        }
    }
};
