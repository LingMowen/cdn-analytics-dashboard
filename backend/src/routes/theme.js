import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const THEME_CONFIG_PATH = path.join(process.cwd(), 'data', 'theme.json');

// 默认主题配置
const defaultThemeConfig = {
  lightColor: '221.2 83.2% 53.3%',
  darkColor: '221.2 83.2% 53.3%',
  syncColors: false,
  backgroundEnabled: false,
  backgroundImage: '',
  backgroundOpacity: 0.15,
  backgroundBlur: 0,
};

// 确保主题配置文件存在
async function ensureThemeConfig() {
  try {
    await fs.access(THEME_CONFIG_PATH);
  } catch {
    await fs.mkdir(path.dirname(THEME_CONFIG_PATH), { recursive: true });
    await fs.writeFile(THEME_CONFIG_PATH, JSON.stringify(defaultThemeConfig, null, 2));
  }
}

// 读取主题配置
async function readThemeConfig() {
  try {
    await ensureThemeConfig();
    const data = await fs.readFile(THEME_CONFIG_PATH, 'utf-8');
    return { ...defaultThemeConfig, ...JSON.parse(data) };
  } catch (error) {
