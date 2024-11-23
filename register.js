import { axios, banner, headers, readline, logger, fs } from './utils/exporter.js';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function saveTokenToFile(token) {
    try {
        fs.appendFileSync('tokens.txt', token + '\n');
        console.log('Access token saved to tokens.txt');
    } catch (error) {
        console.error("Error saving token to file:", error.message);
    }
}

async function loginUser(email, password) {
    try {
        const response = await axios.post(
            'https://zero-api.kaisar.io/auth/login',
            { email, password },
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.data) {
            const token = response.data.data.accessToken;
            console.log(`Login successful for ${email} Token:`, token);
            
            saveTokenToFile(token);
        } else {
            console.error(`Login failed for ${email}:`, response.data.message);
        }
    } catch (error) {
        console.error(`Error during login for ${email} make sure you already confirm email`);
    }
}

async function registerUser(email, password) {
    try {
        const response = await axios.post(
            'https://zero-api.kaisar.io/auth/register',
            {
                ...headers,
                email: email,
                password: password,
            }
        );
        if (response.data) {
            console.log(`Registration successful for ${email}:`, response.data);
            console.log("Check your inbox to confirm your email...\nThen Rerun this script to login...")
        } else {
            console.error(`Registration failed for ${email}:`, response.data.message);
        }
    } catch (error) {
        if (error.response?.data?.error?.code === 410) {
            console.log(`Email already exists for ${email}, trying to login...`);
            await loginUser(email, password);
        } else {
            console.error(`Error during registration for ${email} Please try again..`);
        }
    }
}

async function processAllUsers() {
    try {
        logger(banner, 'debug')
        const emailList = fs.readFileSync('emails.txt', 'utf-8').split('\n').filter(email => email.trim() !== '');

        rl.question("Enter the password for your account: ", async (password) => {
            for (const email of emailList) {
                await new Promise(resolve => setTimeout(resolve, 1000)); 
                await registerUser(email, password); 
            }
            rl.close();
        });

    } catch (error) {
        console.error("Error reading emails.txt file:", error.message);
    }
}

processAllUsers();
