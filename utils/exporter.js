import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent'; 
import { checkAndClaimTask, dailyCheckin } from './task.js';
import { getProxy, getId, getToken } from './file.js';
import { getMiningData } from './script.js';
import { logger } from './logger.js';
import { banner } from './banner.js';
import { headers } from './task.js';
import readline from 'readline';
import fs from 'fs';

export { axios, HttpsProxyAgent, checkAndClaimTask, dailyCheckin, getProxy, getId, getToken, getMiningData, logger, banner, headers, readline, fs };