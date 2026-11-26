// Utility for syncing routine and timetable data from Google Sheets via Google Apps Script Web App
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TEACHERS } from '../data/teachers';

const STORAGE_KEYS = {
  SYNCED_TEACHERS: '@cover_duty_synced_teachers',
  SYNC_URL: '@cover_duty_sheet_sync_url',
  LAST_SYNC: '@cover_duty_last_sync_time',
};

/**
 * Get active teachers list:
 * Returns synced teachers from local storage if available,
 * otherwise falls back to built-in TEACHERS from teachers.js
 */
export async function getStoredTeachers() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNCED_TEACHERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read synced teachers from storage:', err);
  }
  return TEACHERS;
}

/**
 * Save newly fetched teachers to local storage
 */
export async function saveSyncedTeachers(teachers) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SYNCED_TEACHERS, JSON.stringify(teachers));
    const now = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
    return true;
  } catch (err) {
    console.error('Failed to save synced teachers:', err);
    return false;
  }
}

/**
 * Get stored Google Apps Script Web App URL
 */
export async function getSyncUrl() {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEYS.SYNC_URL)) || '';
  } catch (err) {
    console.warn('Failed to get sync URL:', err);
    return '';
  }
}

/**
 * Save Google Apps Script Web App URL
 */
export async function saveSyncUrl(url) {
  try {
    const trimmed = (url || '').trim();
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_URL, trimmed);
    return true;
  } catch (err) {
    console.error('Failed to save sync URL:', err);
    return false;
  }
}

/**
 * Get timestamp of the last successful sync
 */
export async function getLastSyncTime() {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC)) || null;
  } catch (err) {
    return null;
  }
}

/**
 * Fetch routine data from the Google Apps Script Web App URL
 * Supports standard JSON responses:
 * 1) { success: true, teachers: [...] }
 * 2) [ ... teachers ... ]
 */
export async function fetchRoutineFromSheet(customUrl = null) {
  const url = customUrl || (await getSyncUrl());
  if (!url || !url.trim()) {
    throw new Error('Please configure your Google Sheets Sync Web App URL first.');
  }

  const cleanUrl = url.trim();

  // Validate basic URL shape
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    throw new Error('Invalid URL. It must begin with https://');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const response = await fetch(cleanUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    let teachers = null;
    if (Array.isArray(json)) {
      teachers = json;
    } else if (json && Array.isArray(json.teachers)) {
      teachers = json.teachers;
    } else if (json && json.error) {
      throw new Error(`Google Apps Script error: ${json.error}`);
    }

    if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
      throw new Error('Received empty or unrecognized timetable data from Google Sheet.');
    }

    // Validate essential teacher fields
    const valid = teachers.some((t) => t.name && t.timetable);
    if (!valid) {
      throw new Error('The data received does not match the timetable format.');
    }

    // Save to storage
    await saveSyncedTeachers(teachers);

    return {
      success: true,
      count: teachers.length,
      syncedAt: new Date().toISOString(),
      teachers,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Network timeout (20s). Please check your internet connection.');
    }
    throw err;
  }
}

/**
 * Revert to built-in default routine
 */
export async function resetToDefaultRoutine() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SYNCED_TEACHERS);
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    return true;
  } catch (err) {
    console.error('Failed to reset routine to default:', err);
    return false;
  }
}
