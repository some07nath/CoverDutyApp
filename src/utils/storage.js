// Local storage for duty counter
import AsyncStorage from '@react-native-async-storage/async-storage';

const COUNTER_KEY = '@cover_duty_counter';

/**
 * Get the duty counter - how many cover classes each teacher has been assigned
 * Returns: { teacherName: count }
 */
export async function getDutyCounter() {
  try {
    const data = await AsyncStorage.getItem(COUNTER_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error reading duty counter:', e);
    return {};
  }
}

/**
 * Increment duty counter for a teacher
 */
export async function incrementDutyCounter(teacherName, count = 1) {
  try {
    const counter = await getDutyCounter();
    counter[teacherName] = (counter[teacherName] || 0) + count;
    await AsyncStorage.setItem(COUNTER_KEY, JSON.stringify(counter));
    return counter;
  } catch (e) {
    console.error('Error saving duty counter:', e);
  }
}

/**
 * Reset duty counter
 */
export async function resetDutyCounter() {
  try {
    await AsyncStorage.setItem(COUNTER_KEY, JSON.stringify({}));
  } catch (e) {
    console.error('Error resetting duty counter:', e);
  }
}

/**
 * Get counter for a specific teacher
 */
export async function getTeacherDutyCount(teacherName) {
  const counter = await getDutyCounter();
  return counter[teacherName] || 0;
}
