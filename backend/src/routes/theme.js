import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const THEME_CONFIG_PATH = path.join(process.cwd(), 'data', 'theme.json');

const defaultThemeConfig = {
  lightColor: '221.2 83.2% 53.3%',
  darkColor: '221.2 83.2% 53.3%',
  syncColors: false,
  backgroundEnabled: false,
  backgroundImage: '',
  backgroundOpacity: 0.15,
  backgroundBlur: 0,
};

async function ensureThemeConfig() {
  try {
    await fs.access(THEME_CONFIG_PATH);
  } catch {
    await fs.mkdir(path.dirname(THEME_CONFIG_PATH), { recursive: true });
    await fs.writeFile(THEME_CONFIG_PATH, JSON.stringify(defaultThemeConfig, null, 2));
  }
}

async function readThemeConfig() {
  try {
    await ensureThemeConfig();
    const data = await fs.readFile(THEME_CONFIG_PATH, 'utf-8');
    return { ...defaultThemeConfig, ...JSON.parse(data) };
  } catch (error) {
    console.error('Failed to read theme config:', error);
    return defaultThemeConfig;
  }
}

async function writeThemeConfig(config) {
  try {
    await ensureThemeConfig();
    await fs.writeFile(THEME_CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to write theme config:', error);
    return false;
  }
}

router.get('/config', async (req, res) => {
  const config = await readThemeConfig();
  res.json(config);
});

router.post('/config', async (req, res) => {
  const newConfig = req.body;
  const success = await writeThemeConfig(newConfig);
  if (success) {
    res.json({ success: true, config: newConfig });
  } else {
    res.status(500).json({ success: false, error: 'Failed to save config' });
  }
});

export default router;
