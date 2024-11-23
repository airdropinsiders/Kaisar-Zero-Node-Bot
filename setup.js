import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';

function generateUUID() {
    return crypto.randomUUID();
}

function getTokensFromFile() {
    try {
        const tokens = fs.readFileSync('tokens.txt', 'utf-8').split('\n').filter(token => token.trim() !== '');
        return tokens;
    } catch (error) {
        console.error("Error reading tokens.txt:", error.message || error);
        return [];
    }
}

function saveUUIDToFile(uuid) {
    try {
        fs.appendFileSync('id.txt', uuid + '\n');
        console.log('Extension ID saved to id.txt');
    } catch (error) {
        console.error("Error saving Extension ID to file:", error.message || error);
    }
}

async function startFarmingWithToken(token) {
    const extensionId = generateUUID();  
    const apiClient = axios.create({
        baseURL: 'https://zero-api.kaisar.io/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`  
        }
    });

    let miningData = null;

    async function startFarming() {
        try {
            console.log("Created", { extensionId }, "Trying to start farming");

            const response = await apiClient.post('/mining/start', {
                extension: extensionId
            });
            if (response.status === 200) {
                console.log("Mining started successfully:");
                saveUUIDToFile(extensionId);   
            }
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                console.error('Error starting mining (HTTP Error):', {
                    status,
                    
                });

                if (status === 412) {
                    console.log("Mining already started with another ID.\nYou must put Manually your extension id in id.txt");
                    return; 
                }
            } else {
                console.error('Error starting mining try again later');
            }
        }
    }
    await startFarming();
}

(async () => {
    const tokens = getTokensFromFile();
    for (const token of tokens) {
        await startFarmingWithToken(token); 
    }
})();
