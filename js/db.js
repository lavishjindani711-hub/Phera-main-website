/**
 * pheraDB - A LocalStorage Database Wrapper for the PHERA MVP
 * Handles Models: Users (Owners/Shippers/Admins), Trucks, Shipments, Trips
 */
const pheraDB = {
    // Utility to get a collection
    getCollection: function (collectionName) {
        const data = localStorage.getItem(`phera_${collectionName}`);
        return data ? JSON.parse(data) : [];
    },

    // Utility to save a collection
    saveCollection: function (collectionName, data) {
        localStorage.setItem(`phera_${collectionName}`, JSON.stringify(data));
    },

    // Initialize Database with Demo Data if empty
    init: function () {
        if (!localStorage.getItem('phera_Users')) {
            console.log("Initializing PHERA Local DB with Demo Data...");

            // Demo Users Structure
            this.saveCollection('Users', [
                { id: 'u1', role: 'owner', name: 'Ramesh Singh', phone: '9876543210', city: 'Delhi', verified: true },
                { id: 'u3', role: 'owner', name: 'Suresh Transport', phone: '9876543211', city: 'Mumbai', verified: true },
                { id: 'u4', role: 'owner', name: 'Gurpreet Logistics', phone: '9876543212', city: 'Chennai', verified: true },
                { id: 'u7', role: 'owner', name: 'VK Freight', phone: '9876543213', city: 'Delhi', verified: true },
                { id: 'u8', role: 'owner', name: 'National Carriers', phone: '9876543214', city: 'Mumbai', verified: true },
                { id: 'u2', role: 'shipper', name: 'Balaji Textiles', phone: '9123456780', city: 'Mumbai', verified: true },
                { id: 'u5', role: 'shipper', name: 'ABC Electronics', phone: '9123456781', city: 'Delhi', verified: true },
                { id: 'u6', role: 'shipper', name: 'India Foods Corp', phone: '9123456782', city: 'Chennai', verified: true },
                { id: 'u9', role: 'shipper', name: 'Reliance Materials', phone: '9123456783', city: 'Mumbai', verified: true },
                { id: 'admin1', role: 'admin', name: 'System Admin', phone: 'admin', verified: true }
            ]);

            // Demo Trucks (14 Trucks)
            this.saveCollection('Trucks', [
                {
                    id: 't1', ownerId: 'u1', type: 'Open Container', capacity: 10,
                    currentCity: 'Delhi', registration: 'DL-1M-4321', status: 'available', routePref: ['Delhi', 'Mumbai'],
                    loadCompatibility: ['packaged', 'textiles', 'electronics']
                },
                {
                    id: 't2', ownerId: 'u3', type: 'Closed Container', capacity: 15,
                    currentCity: 'Mumbai', registration: 'MH-04-9876', status: 'available', routePref: ['Mumbai', 'Chennai'],
                    loadCompatibility: ['packaged', 'electronics', 'fragile']
                },
                {
                    id: 't3', ownerId: 'u4', type: 'Refrigerated', capacity: 5,
                    currentCity: 'Chennai', registration: 'TN-01-5555', status: 'available', routePref: ['Chennai', 'Mumbai'],
                    loadCompatibility: ['food', 'packaged']
                },
                {
                    id: 't4', ownerId: 'u1', type: 'Flatbed', capacity: 20,
                    currentCity: 'Delhi', registration: 'DL-1M-8888', status: 'booked', routePref: ['Delhi', 'Mumbai'],
                    loadCompatibility: ['packaged', 'textiles', 'machinery']
                },
                {
                    id: 't5', ownerId: 'u7', type: 'Open Container', capacity: 12,
                    currentCity: 'Delhi', registration: 'DL-2C-1122', status: 'available', routePref: ['Delhi', 'Mumbai'],
                    loadCompatibility: ['packaged', 'textiles']
                },
                {
                    id: 't6', ownerId: 'u7', type: 'Closed Container', capacity: 18,
                    currentCity: 'Mumbai', registration: 'MH-12-3344', status: 'available', routePref: ['Mumbai', 'Delhi'],
                    loadCompatibility: ['electronics', 'fragile', 'packaged']
                },
                {
                    id: 't7', ownerId: 'u8', type: 'Flatbed', capacity: 25,
                    currentCity: 'Chennai', registration: 'TN-09-7788', status: 'available', routePref: ['Chennai', 'Mumbai'],
                    loadCompatibility: ['machinery', 'packaged']
                },
                {
                    id: 't8', ownerId: 'u8', type: 'Refrigerated', capacity: 8,
                    currentCity: 'Mumbai', registration: 'MH-01-9900', status: 'available', routePref: ['Mumbai', 'Chennai'],
                    loadCompatibility: ['food', 'chemicals'] // Edge case compatibility demo
                },
                {
                    id: 't9', ownerId: 'u3', type: 'Open Container', capacity: 9,
                    currentCity: 'Delhi', registration: 'DL-5S-4455', status: 'available', routePref: ['Delhi', 'Mumbai'],
                    loadCompatibility: ['packaged', 'fragile']
                },
                {
                    id: 't10', ownerId: 'u1', type: 'Closed Container', capacity: 14,
                    currentCity: 'Chennai', registration: 'TN-04-2211', status: 'available', routePref: ['Chennai', 'Delhi'],
                    loadCompatibility: ['textiles', 'electronics']
                },
                {
                    id: 't11', ownerId: 'u7', type: 'Flatbed', capacity: 30,
                    currentCity: 'Mumbai', registration: 'MH-43-1212', status: 'booked', routePref: ['Mumbai', 'Delhi'],
                    loadCompatibility: ['machinery']
                },
                {
                    id: 't12', ownerId: 'u8', type: 'Open Container', capacity: 10,
                    currentCity: 'Delhi', registration: 'DL-9W-8765', status: 'available', routePref: ['Delhi', 'Chennai'],
                    loadCompatibility: ['packaged', 'textiles']
                },
                {
                    id: 't13', ownerId: 'u4', type: 'Closed Container', capacity: 16,
                    currentCity: 'Mumbai', registration: 'MH-02-5432', status: 'available', routePref: ['Mumbai', 'Delhi'],
                    loadCompatibility: ['electronics', 'packaged']
                },
                {
                    id: 't14', ownerId: 'u3', type: 'Refrigerated', capacity: 6,
                    currentCity: 'Delhi', registration: 'DL-3C-9876', status: 'available', routePref: ['Delhi', 'Mumbai'],
                    loadCompatibility: ['food']
                }
            ]);

            // Demo Shipments (Demand)
            this.saveCollection('Shipments', [
                {
                    id: 's1', shipperId: 'u2', pickupCity: 'Mumbai', deliveryCity: 'Delhi',
                    cargoType: 'textiles', weight: 8, date: '2026-03-10', status: 'open',
                    specialReq: 'Keep dry'
                },
                {
                    id: 's2', shipperId: 'u5', pickupCity: 'Delhi', deliveryCity: 'Mumbai',
                    cargoType: 'electronics', weight: 4, date: '2026-03-12', status: 'open',
                    specialReq: 'Fragile handling'
                },
                {
                    id: 's3', shipperId: 'u6', pickupCity: 'Chennai', deliveryCity: 'Mumbai',
                    cargoType: 'food', weight: 3, date: '2026-03-15', status: 'open',
                    specialReq: 'Temperature control'
                },
                {
                    id: 's4', shipperId: 'u2', pickupCity: 'Mumbai', deliveryCity: 'Chennai',
                    cargoType: 'packaged', weight: 12, date: '2026-03-10', status: 'booked',
                    specialReq: 'Standard'
                },
                {
                    id: 's5', shipperId: 'u9', pickupCity: 'Mumbai', deliveryCity: 'Delhi',
                    cargoType: 'fragile', weight: 6, date: '2026-03-11', status: 'open',
                    specialReq: 'Handle with care'
                },
                {
                    id: 's6', shipperId: 'u5', pickupCity: 'Delhi', deliveryCity: 'Chennai',
                    cargoType: 'packaged', weight: 9, date: '2026-03-14', status: 'open',
                    specialReq: 'Fast delivery'
                }
            ]);

            // Demo Trips (Active/Completed)
            this.saveCollection('Trips', [
                {
                    id: 'trip_1', truckId: 't4', shipmentId: 's4',
                    ownerId: 'u1', shipperId: 'u2', price: 24000,
                    status: 'booked', escrowStatus: 'held', dateBooked: new Date().toISOString()
                },
                {
                    id: 'trip_2', truckId: 't11', shipmentId: 's4', // Mocking another active trip
                    ownerId: 'u7', shipperId: 'u2', price: 35000,
                    status: 'in-transit', escrowStatus: 'held', dateBooked: new Date().toISOString()
                }
            ]);
        }
    },

    // --- User Operations ---
    registerUser: function (userData) {
        const users = this.getCollection('Users');
        // Check if phone exists
        if (users.find(u => u.phone === userData.phone)) {
            return { error: 'Phone number already registered' };
        }

        const newUser = {
            id: 'u_' + Date.now(),
            ...userData,
            verified: false, // requires admin verification
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveCollection('Users', users);
        return newUser;
    },

    login: function (phone) {
        const users = this.getCollection('Users');
        const user = users.find(u => u.phone === phone);
        if (user) {
            localStorage.setItem('phera_currentUser', JSON.stringify(user));
            return user;
        }
        return null;
    },

    logout: function () {
        localStorage.removeItem('phera_currentUser');
    },

    getCurrentUser: function () {
        const d = localStorage.getItem('phera_currentUser');
        return d ? JSON.parse(d) : null;
    },

    // --- Truck/Supply Operations ---
    addTruck: function (truckData) {
        const trucks = this.getCollection('Trucks');
        const newTruck = {
            id: 't_' + Date.now(),
            ...truckData,
            status: 'available'
        };
        trucks.push(newTruck);
        this.saveCollection('Trucks', trucks);
        return newTruck;
    },

    getTrucksByOwner: function (ownerId) {
        return this.getCollection('Trucks').filter(t => t.ownerId === ownerId);
    },

    // --- Shipment/Demand Operations ---
    addShipment: function (shipData) {
        const shipments = this.getCollection('Shipments');
        const newShipment = {
            id: 's_' + Date.now(),
            ...shipData,
            status: 'open',
            createdAt: new Date().toISOString()
        };
        shipments.push(newShipment);
        this.saveCollection('Shipments', shipments);
        return newShipment;
    },

    getShipmentsByShipper: function (shipperId) {
        return this.getCollection('Shipments').filter(s => s.shipperId === shipperId);
    },

    // --- Load Matching & Compatibility Engine ---
    findMatchesForTruck: function (truckId) {
        const truck = this.getCollection('Trucks').find(t => t.id === truckId);
        if (!truck) return [];

        const openShipments = this.getCollection('Shipments').filter(s => s.status === 'open');

        return openShipments.filter(ship => {
            // 1. Capacity Check
            if (ship.weight > truck.capacity) return false;

            // 2. Compatibility Check (e.g. food cannot ride with chemicals)
            // Simplified match: Ensure shipment cargoType is in truck's loadCompatibility list
            if (!truck.loadCompatibility.includes(ship.cargoType) && truck.loadCompatibility.length > 0) {
                return false;
            }

            // 3. Route check (Optional Phase 1: if truck prefers shipping route)
            if (truck.routePref.length > 0) {
                if (!truck.routePref.includes(ship.pickupCity) || !truck.routePref.includes(ship.deliveryCity)) {
                    return false;
                }
            }

            return true;
        });
    },

    // --- Booking & Trip Workflow ---
    bookTrip: function (truckId, shipmentId, price) {
        const trips = this.getCollection('Trips');
        const trucks = this.getCollection('Trucks');
        const shipments = this.getCollection('Shipments');

        const truckIdx = trucks.findIndex(t => t.id === truckId);
        const shipIdx = shipments.findIndex(s => s.id === shipmentId);

        if (truckIdx > -1 && shipIdx > -1) {
            // Initiate Escrow Flow automatically
            const newTrip = {
                id: 'trip_' + Date.now(),
                truckId: truckId,
                shipmentId: shipmentId,
                ownerId: trucks[truckIdx].ownerId,
                shipperId: shipments[shipIdx].shipperId,
                price: price,
                status: 'booked', // moving to in-transit soon
                escrowStatus: 'held', // meaning Shipper paid, Phera holds
                dateBooked: new Date().toISOString()
            };

            // Update models
            trucks[truckIdx].status = 'booked';
            shipments[shipIdx].status = 'booked';

            trips.push(newTrip);

            this.saveCollection('Trucks', trucks);
            this.saveCollection('Shipments', shipments);
            this.saveCollection('Trips', trips);

            return newTrip;
        }
        return { error: 'Invalid truck or shipment' };
    }
};

// Auto-init on script load
pheraDB.init();
