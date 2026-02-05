import fs from 'fs';
import fsPromises from 'fs/promises';
import yaml from 'js-yaml';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadCloudflareConfig() {
  const config = { accounts: [] };

  if (process.env.CF_CONFIG) {
    try {
      return JSON.parse(process.env.CF_CONFIG);
    } catch (e) {
      console.error('CF_CONFIG environment variable format error:', e.message);
    }
  }

  if (process.env.CF_TOKENS && process.env.CF_ZONES) {
    const tokens = process.env.CF_TOKENS.split(',').map(t => t.trim());
    const zones = process.env.CF_ZONES.split(',').map(z => z.trim());
    const domains = process.env.CF_DOMAINS ? process.env.CF_DOMAINS.split(',').map(d => d.trim()) : zones;

    // Only add account if token is not a placeholder
    if (tokens.length > 0 && zones.length > 0 && tokens[0] && tokens[0] !== 'your_cloudflare_token') {
      config.accounts.push({
        name: process.env.CF_ACCOUNT_NAME || "Default Account",
        token: tokens[0],
        zones: zones.map((zone_id, index) => ({
          zone_id,
          domain: domains[index] || zone_id
        }))
      });
    }
  }

  let accountIndex = 1;
  while (process.env[`CF_TOKENS_${accountIndex}`]) {
    const tokens = process.env[`CF_TOKENS_${accountIndex}`].split(',').map(t => t.trim());
    const zones = process.env[`CF_ZONES_${accountIndex}`].split(',').map(z => z.trim());
    const domains = process.env[`CF_DOMAINS_${accountIndex}`] ?
      process.env[`CF_DOMAINS_${accountIndex}`].split(',').map(d => d.trim()) : zones;

    if (tokens.length > 0 && zones.length > 0) {
      config.accounts.push({
        name: process.env[`CF_ACCOUNT_NAME_${accountIndex}`] || `Account ${accountIndex}`,
        token: tokens[0],
        zones: zones.map((zone_id, index) => ({
          zone_id,
          domain: domains[index] || zone_id
        }))
      });
    }
    accountIndex++;
  }

  // Only load from file if no accounts configured via environment variables
  if (config.accounts.length === 0) {
    try {
      const fileConfig = yaml.load(fs.readFileSync(new URL('./cloudflare.yml', import.meta.url)));
      // Filter out example accounts with placeholder values
      if (fileConfig && fileConfig.accounts) {
        fileConfig.accounts = fileConfig.accounts.filter(acc => {
          return acc.token && acc.token !== 'YOUR_CF_TOKEN_1' && acc.token !== 'YOUR_CF_TOKEN_2';
        });
      }
      return fileConfig;
    } catch (e) {
      console.error('Failed to load cloudflare.yml:', e.message);
    }
  }

  return config;
}

export function loadEdgeOneConfig() {
  const config = { accounts: [], enabledZones: [], disabledZones: [] };

  // Check if EO_SECRET_ID and EO_SECRET_KEY are set and not placeholder values
  if (process.env.EO_SECRET_ID && process.env.EO_SECRET_KEY) {
    // Only add account if secretId is not a placeholder
    if (process.env.EO_SECRET_ID !== 'your_secret_id' && process.env.EO_SECRET_ID !== 'YOUR_SECRET_ID') {
      config.accounts.push({
        name: process.env.EO_ACCOUNT_NAME || "Default Account",
        secretId: process.env.EO_SECRET_ID,
        secretKey: process.env.EO_SECRET_KEY,
        region: process.env.EO_REGION || "ap-guangzhou"
      });
      console.log('EdgeOne account added from environment variables');
    }
  }

  let accountIndex = 1;
  while (process.env[`EO_SECRET_ID_${accountIndex}`]) {
    config.accounts.push({
      name: process.env[`EO_ACCOUNT_NAME_${accountIndex}`] || `Account ${accountIndex}`,
      secretId: process.env[`EO_SECRET_ID_${accountIndex}`],
      secretKey: process.env[`EO_SECRET_KEY_${accountIndex}`],
      region: process.env[`EO_REGION_${accountIndex}`] || "ap-guangzhou"
    });
    accountIndex++;
  }

  // Load from file (including zone display configuration)
  try {
    const fileConfig = yaml.load(fs.readFileSync(new URL('./edgeone.yml', import.meta.url)));
    
    // If no accounts from environment, use file accounts
    if (config.accounts.length === 0 && fileConfig && fileConfig.accounts) {
      // Filter out example accounts with placeholder values
      fileConfig.accounts = fileConfig.accounts.filter(acc => {
        return acc.secretId && acc.secretId !== 'YOUR_SECRET_ID' && acc.secretId !== 'YOUR_SECRET_ID_2';
      });
      config.accounts = fileConfig.accounts;
    }
    
    // Load zone display configuration
    if (fileConfig) {
      if (fileConfig.enabledZones) {
        config.enabledZones = fileConfig.enabledZones;
      }
      if (fileConfig.disabledZones) {
        config.disabledZones = fileConfig.disabledZones;
      }
    }
  } catch (e) {
    console.error('Failed to load edgeone.yml:', e.message);
  }

  return config;
}

export function loadAllConfig() {
  return {
    cloudflare: loadCloudflareConfig(),
    edgeone: loadEdgeOneConfig(),
    server: {
      port: process.env.PORT || 4000,
      nodeEnv: process.env.NODE_ENV || 'development',
      isEn: (process.env.EN || '').toLowerCase() === 'true'
    },
    cache: {
      cloudflareUpdateInterval: parseInt(process.env.CF_UPDATE_INTERVAL) || 7200000,
      edgeoneCacheTTL: parseInt(process.env.EO_CACHE_TTL) || 300000
    }
  };
}
