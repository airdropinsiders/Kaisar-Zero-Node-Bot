import { logger } from './logger.js';
async function getMiningData(apiClient, extensionId) {
    try {
        const response = await apiClient.get('/mining/current', {
            params: { extension: extensionId }
        });

        if (response.data && response.data.data) {
            const miningData = response.data.data;

            updateProgress(extensionId, miningData); 
            await updateMiningPoint(extensionId, miningData, apiClient); 

            if (miningData.ended === 1) {
                logger(`[${extensionId}] Mining has ended. Proceeding to claim mining points.`, 'debug');
                await claim(apiClient, extensionId);
            }
        }
    } catch (error) {
        logger(`[${extensionId}] Error fetching mining data`, 'error');
    }
}

async function updateMiningPoint(extensionId, miningData, apiClient) {
    const elapsedTimeInHours = (Date.now() - new Date(miningData.start).getTime() - miningData.miss) / 36e5;
    const points = elapsedTimeInHours * miningData.hourly;
    const miningPoint = Math.max(0, points);
    const totalPoints = await checkBalance(apiClient, extensionId)
    logger(`[${extensionId}] Total Points: ${totalPoints}, MiningPoints: ${miningPoint}, ElapsedTimeInHours: ${elapsedTimeInHours}`, 'warn');
}

function updateProgress(extensionId, miningData) {
    const currentTime = Date.now(); 
    const endTime = miningData.end;     
    
    const remainingTime = Math.max(0, endTime - currentTime); 

    logger(
        `[${extensionId}] Progress: endTime: ${endTime}, currentTime: ${currentTime}, remainingTime: ${remainingTime}`, 'warn'
    );
}


async function claim(apiClient, extensionId) {
    try {
        logger(`[${extensionId}] Claiming mining points...`);
        const { data } = await apiClient.post('/mining/claim', { extension: extensionId });
        logger(`[${extensionId}] Claimed successfully:`, 'success', data);
        await startFarming(apiClient, extensionId);
    } catch (error) {
        logger(`[${extensionId}] Error during claim:`, 'error', error.message || error);
        //logger(`[${extensionId}] Restarting farming...`)
        //startFarming(apiClient, extensionId);
    }
}

async function startFarming(apiClient, extensionId) {
    try {
        const response = await apiClient.post('/mining/start', {
            extension: extensionId
        });
        if (response.status === 200) {
            logger(`[${extensionId}] Mining started successfully`, 'success');
        }
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;
            logger(`[${extensionId}] Error starting mining (HTTP Error):`, 'error', {
                status,
                data
            });

            // Check if mining is already started 
            if (status === 412 && data.error.message === 'Mining is started.') {
                console.log(`[${extensionId}] Mining already started. Skipping start process.`);
                return; 
            }
        } else {
            logger(`[${extensionId}] Error starting mining:`, 'error', error.message || error);
        }
    }
}
async function checkBalance(apiClient, extensionId) {
    try {
        logger(`[${extensionId}] Checking Balances points...`)
        const response = await apiClient.get('/user/balances');
        const balances = response.data.data[0].balance;
        logger(`[${extensionId}] Balances:`, 'info', balances);
        return balances;
    } catch (error) { 
        logger(`[${extensionId}] Error checking balance:`, 'error', error.message || error);
        return null;
    }
}
    
export { getMiningData };
