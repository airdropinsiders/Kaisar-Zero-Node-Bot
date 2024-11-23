import { logger } from './logger.js';
async function getMiningData(apiClient, extensionId) {
    try {
        const response = await apiClient.get('/mining/current', {
            params: { extension: extensionId }
        });

        if (response.data && response.data.data) {
            const miningData = response.data.data;

            updateProgress(extensionId, miningData); 
            updateMiningPoint(extensionId, miningData); 

            if (miningData.ended === 1) {
                logger(`[${extensionId}] Mining has ended. Proceeding to claim mining points.`, 'debug');
                await claim(apiClient, extensionId);
            }
        }
    } catch (error) {
        logger(`[${extensionId}] Error fetching mining data`, 'error');
    }
}

function updateMiningPoint(extensionId, miningData) {
    const elapsedTimeInHours = (Date.now() - new Date(miningData.start).getTime() - miningData.miss) / 36e5;
    const points = elapsedTimeInHours * miningData.hourly;
    const miningPoint = Math.max(0, points);

    logger(`[${extensionId}] Points: ${points}, MiningPoints: ${miningPoint}, ElapsedTimeInHours: ${elapsedTimeInHours}`, 'warn');
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
    } catch (error) {
        logger(`[${extensionId}] Error during claim:`, 'error', error.message || error);
    }
}
export { getMiningData };