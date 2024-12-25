const BASE_URL = 'https://careerconnect-7af1.vercel.app';
const TEST_USER = {
    username: 'TestUser',
    email: 'test@example.com',
    password: 'Test123!',
    role: 'jobseeker'
};

async function runTests() {
    console.log('Starting API tests...\n');
    let token;

    // Test 1: Registration
    try {
        console.log('Test 1: Registration');
        const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(TEST_USER)
        });
        
        const registerData = await registerResponse.json();
        console.log('Registration Response:', registerData);
        console.log('Status:', registerResponse.status);
        console.log('Test 1 Complete\n');
    } catch (error) {
        console.error('Registration Error:', error);
    }

    // Test 2: Login
    try {
        console.log('Test 2: Login');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: TEST_USER.email,
                password: TEST_USER.password
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login Response:', loginData);
        console.log('Status:', loginResponse.status);
        
        if (loginData.data?.token) {
            token = loginData.data.token;
            console.log('Token received successfully');
        }
        console.log('Test 2 Complete\n');
    } catch (error) {
        console.error('Login Error:', error);
    }

    // Test 3: Access Protected Route
    if (token) {
        try {
            console.log('Test 3: Access Protected Route');
            const protectedResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            const protectedData = await protectedResponse.json();
            console.log('Protected Route Response:', protectedData);
            console.log('Status:', protectedResponse.status);
            console.log('Test 3 Complete\n');
        } catch (error) {
            console.error('Protected Route Error:', error);
        }
    }
}

// Run the tests
runTests().then(() => {
    console.log('All tests completed');
}).catch(error => {
    console.error('Test suite error:', error);
}); 