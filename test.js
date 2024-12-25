const BASE_URL = 'https://careerconnect-7af1.vercel.app';
const TEST_USER = {
    username: 'John Doe',
    email: 'johndoe@example.com',
    password: 'JohnDoe123!',
    role: 'jobseeker'
};

async function runTests() {
    console.log('Starting API tests with test user:', TEST_USER.username);
    console.log('----------------------------------------\n');
    let token;

    // Test 1: Registration
    try {
        console.log('Test 1: Registration Process');
        console.log('Sending registration request for:', TEST_USER.email);
        
        const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(TEST_USER)
        });
        
        const registerData = await registerResponse.json();
        console.log('\nRegistration Response:');
        console.log('Status Code:', registerResponse.status);
        console.log('Response Data:', JSON.stringify(registerData, null, 2));
        
        if (registerResponse.ok) {
            console.log('\n✅ Registration Successful!');
        } else {
            console.log('\n❌ Registration Failed:', registerData.message);
        }
        console.log('----------------------------------------\n');
    } catch (error) {
        console.error('\n❌ Registration Error:', error.message);
        console.log('----------------------------------------\n');
    }

    // Test 2: Login
    try {
        console.log('Test 2: Login Process');
        console.log('Attempting login with:', TEST_USER.email);
        
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: TEST_USER.email,
                password: TEST_USER.password
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('\nLogin Response:');
        console.log('Status Code:', loginResponse.status);
        console.log('Response Data:', JSON.stringify(loginData, null, 2));
        
        if (loginResponse.ok && loginData.data?.token) {
            token = loginData.data.token;
            console.log('\n✅ Login Successful!');
            console.log('Token received:', token.substring(0, 20) + '...');
        } else {
            console.log('\n❌ Login Failed:', loginData.message);
        }
        console.log('----------------------------------------\n');
    } catch (error) {
        console.error('\n❌ Login Error:', error.message);
        console.log('----------------------------------------\n');
    }

    // Test 3: Access Dashboard (Protected Route)
    if (token) {
        try {
            console.log('Test 3: Accessing Protected Dashboard');
            console.log('Sending request with authentication token');
            
            const dashboardResponse = await fetch(`${BASE_URL}/api/auth/dashboard`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            const dashboardData = await dashboardResponse.json();
            console.log('\nDashboard Access Response:');
            console.log('Status Code:', dashboardResponse.status);
            console.log('Response Data:', JSON.stringify(dashboardData, null, 2));
            
            if (dashboardResponse.ok) {
                console.log('\n✅ Dashboard Access Successful!');
            } else {
                console.log('\n❌ Dashboard Access Failed:', dashboardData.message);
            }
            console.log('----------------------------------------\n');
        } catch (error) {
            console.error('\n❌ Dashboard Access Error:', error.message);
            console.log('----------------------------------------\n');
        }
    }
}

// Run the tests
console.log('🚀 Starting CareerConnect API Tests');
console.log('----------------------------------------\n');

runTests()
    .then(() => {
        console.log('✨ All tests completed!');
        console.log('----------------------------------------');
    })
    .catch(error => {
        console.error('❌ Test suite error:', error.message);
        console.log('----------------------------------------');
    }); 