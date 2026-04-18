import axios from 'axios';

async function reproduce() {
    try {
        const GATEWAY_URL = 'http://127.0.0.1:8000/api';

        console.log('Logging in...');
        let token;
        let userId;

        try {
            const loginRes = await axios.post(`${GATEWAY_URL}/auth/login`, {
                email: 'organizer@test.com',
                password: 'password123'
            });
            token = loginRes.data.token;
            userId = loginRes.data.user.id;
            console.log('Login successful. User ID:', userId);
        } catch (e) {
            console.log('Login failed (' + (e.response?.data?.message || e.message) + '), trying to register...');
            try {
                const regRes = await axios.post(`${GATEWAY_URL}/auth/register`, {
                    firstName: 'Test',
                    lastName: 'Organizer',
                    email: 'organizer@test.com',
                    password: 'password123',
                    college: 'SLIET',
                    role: 'organizer'
                });
                token = regRes.data.token;
                userId = regRes.data.user.id;
                console.log('Registration successful. User ID:', userId);
            } catch (regError) {
                console.error('Registration failed:', regError.response?.data || regError.message);
                return;
            }
        }

        console.log('Creating/Finding club...');
        let clubId;
        try {
            const createRes = await axios.post(`${GATEWAY_URL}/clubs`, {
                name: `Test Club ${Date.now()}`,
                description: 'This is a test club description',
                type: 'Technical'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            clubId = createRes.data.data._id;
            console.log('Club created. ID:', clubId);
        } catch (e) {
            console.log('Create club failed (' + (e.response?.data?.message || e.message) + '), trying to fetch existing...');
            try {
                // Updated endpoint to match confirmed routes
                const clubsRes = await axios.get(`${GATEWAY_URL}/clubs/organizer/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (clubsRes.data.data) {
                    clubId = clubsRes.data.data._id;
                    console.log('Found existing club. ID:', clubId);
                } else {
                    console.log("No club found for user.");
                    return;
                }
            } catch (findError) {
                console.error("Failed to find club:", findError.response?.data || findError.message);
                return;
            }
        }

        console.log(`Updating club ${clubId}...`);
        try {
            // IMPORTANT: Sending JSON body
            const updatePayload = {
                name: `Updated Test Club ${Date.now()}`,
                description: 'Updated description',
                tags: ['test', 'update']
            };
            console.log("Sending Payload:", JSON.stringify(updatePayload));

            const updateRes = await axios.put(`${GATEWAY_URL}/clubs/${clubId}`, updatePayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Update result:', updateRes.data);
        } catch (e) {
            console.error('Update failed:', e.response?.data || e.message);
            console.error('Status:', e.response?.status);
        }

    } catch (err) {
        console.error('Script error:', err.message);
    }
}

reproduce();
