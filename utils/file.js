import fs from 'fs';
import { logger } from './logger.js';

// Utility function to read and parse a file
function readFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return data.split('\n').map(line => line.trim()).filter(line => line !== '');
    } catch (error) {
        logger(`Error reading ${filePath}:`, 'error', error.message || error);
        return [];
    }
}

// Function to get tokens from 'tokens.txt'
function getTokensFromFile() {
    return readFile('tokens.txt');
}

// Function to get IDs from 'id.txt'
function getIdsFromFile() {
    return readFile('id.txt');
}

// Function to get proxies from 'proxy.txt'
function getProxiesFromFile() {
    return readFile('proxy.txt');
}

export { getTokensFromFile as getToken, getIdsFromFile as getId, getProxiesFromFile as getProxy };
