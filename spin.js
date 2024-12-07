import axios from 'axios';
import * as Utils from './utils/exporter.js';

// Function to perform the spin
async function doSpin(token) {
    const payload = {};

    try {
        const response = await axios.post(`https://zero-api.kaisar.io/lucky/spin`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        Utils.logger('Spin Results:', "info", response.data.data.prize);
        return response.data;
    } catch (error) {
        Utils.logger('Error during spin:', "error", error.response?.data || error.message);
        return null;
    }
}

// Function to fetch user profile 
async function profile(token) {
    try {
        const response = await axios.get(`https://zero-api.kaisar.io/user/balances?symbol=ticket`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (error) {
        Utils.logger('Error fetching profile:', "error", error.response?.data || error.message);
        return null;
    }
}

// Function to convert tickets 
async function convert(token) {
    const payload = { "ticket": 10 };

    try {
        const response = await axios.post(`https://zero-api.kaisar.io/lucky/convert`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        Utils.logger('Converted 10 Tickets:', "success", response.data.data);
        return response.data;
    } catch (error) {
        Utils.logger('Error converting tickets:', "error", error.response?.data || error.message);
        return null;
    }
}

// Main execution function
async function main() {
    Utils.logger(Utils.banner, 'debug');
    const tokens = Utils.getToken();
    let counter = 1;

    for (const token of tokens) {
        Utils.logger(`Processing account ${counter} of ${tokens.length}...`, 'debug');

        while (true) {
            const tickets = await profile(token);
            if (!tickets) {
                Utils.logger('Error retrieving ticket balance, skipping account...', 'error');
                break;
            }

            const points = tickets[0].balance;
            let ticket = tickets[1] ? tickets[1].balance : 0;
            const vusd = tickets[2] ? tickets[2].balance : 0;

            Utils.logger(`Points: ${points} | USD: ${vusd} | Tickets Left: ${ticket}`);

            if (ticket < 1 && points > 3000) {
                Utils.logger('Not enough tickets. Converting points to tickets...', 'warn');
                await convert(token);
            } else if (ticket > 0) {
                await doSpin(token);
            } else {
                Utils.logger('No tickets left and points are insufficient, skipping account...', 'warn');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        counter++;
    }
}

// Start the main function
main().catch(error => {
    Utils.logger('Error in main execution:', "error", error.message);
});
