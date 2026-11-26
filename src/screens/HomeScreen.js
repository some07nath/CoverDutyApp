// Home Screen - Select date, mark absent teachers, generate cover duties, live sync from Google Sheet
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { TEACHERS, DAYS, getDayKey } from '../data/teachers';
import {
  getStoredTeachers,
  fetchRoutineFromSheet,
  getSyncUrl,
  saveSyncUrl,
  getLastSyncTime,
  resetToDefaultRoutine,
} from '../utils/sync';

export default function HomeScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [absentTeachers, setAbsentTeachers] = useState([]);
  const [teachers, setTeachers] = useState(TEACHERS);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [syncUrlInput, setSyncUrlInput] = useState('');

  const dayKey = getDayKey(selectedDate);
  const isWeekday = selectedDate.getDay() >= 1 && selectedDate.getDay() <= 5;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const stored = await getStoredTeachers();
      if (stored && stored.length > 0) {
        setTeachers(stored);
      }
      const syncTime = await getLastSyncTime();
      setLastSyncTime(syncTime);
      const url = await getSyncUrl();
      setSyncUrlInput(url);
    } catch (err) {
      console.warn('Error loading initial routine data:', err);
    }
  };

  // Get list of teachers who can be marked absent (non-primary, non-excluded)
  const selectableTeachers = teachers.filter(
    (t) => !['primary', 'excluded'].includes(t.category)
  );

  const toggleAbsent = (teacherName) => {
    setAbsentTeachers((prev) => {
      if (prev.includes(teacherName)) {
        return prev.filter((n) => n !== teacherName);
      } else {
        return [...prev, teacherName];
      }
    });
  };

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setAbsentTeachers([]);
  };

  const handleProceed = () => {
    if (!isWeekday) {
      Alert.alert('Weekend', 'No school on weekends. Please select a weekday.');
      return;
    }
    if (absentTeachers.length === 0) {
      Alert.alert('No Teachers Selected', 'Please select at least one absent teacher.');
      return;
    }
    navigation.navigate('AssignDuty', {
      date: selectedDate.toISOString(),
      absentTeachers,
      dayKey,
      teachers,
    });
  };

  const handleQuickSync = async () => {
    const url = await getSyncUrl();
    if (!url || !url.trim()) {
      setModalVisible(true);
      return;
    }
    performSync(url);
  };

  const performSync = async (urlToUse) => {
    setIsSyncing(true);
    try {
      if (urlToUse) {
        await saveSyncUrl(urlToUse);
      }
      const res = await fetchRoutineFromSheet(urlToUse);
      setTeachers(res.teachers);
      setLastSyncTime(res.syncedAt);
      setModalVisible(false);
      Alert.alert(
        'Sync Successful! ✅',
        `Updated routine for ${res.count} teachers from your Google Sheet.`
      );
    } catch (err) {
      Alert.alert(
        'Sync Failed ⚠️',
        err.message || 'Could not fetch data from Google Sheet. Existing timetable remains active.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveAndSync = () => {
    if (!syncUrlInput.trim()) {
      Alert.alert('Missing URL', 'Please paste the Google Apps Script Web App URL.');
      return;
    }
    performSync(syncUrlInput.trim());
  };

  const handleResetToDefault = () => {
    Alert.alert(
      'Reset Routine',
      'Revert timetable to the built-in default routine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetToDefaultRoutine();
            setTeachers(TEACHERS);
            setLastSyncTime(null);
            setModalVisible(false);
            Alert.alert('Reset Complete', 'Timetable has been restored to built-in default.');
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatSyncTime = (isoString) => {
    if (!isoString) return 'Built-in Timetable';
    try {
      const d = new Date(isoString);
      const hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHour = hours % 12 || 12;
      return `Synced: ${d.getDate()}/${d.getMonth() + 1} at ${formattedHour}:${minutes} ${ampm}`;
    } catch (e) {
      return 'Synced';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>📋 Cover Duty Manager</Text>
            <Text style={styles.subtitle}>Select Date & Absent Teachers</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => setModalVisible(true)}
            accessibilityLabel="Sheet Settings"
          >
            <Text style={styles.settingsIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Sync Status Banner */}
        <View style={styles.syncBanner}>
          <View style={styles.syncStatusContainer}>
            <View
              style={[
                styles.syncDot,
                lastSyncTime ? styles.syncDotActive : styles.syncDotDefault,
              ]}
            />
            <Text style={styles.syncText} numberOfLines={1}>
              {formatSyncTime(lastSyncTime)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.syncBtn}
            onPress={handleQuickSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#1a73e8" />
            ) : (
              <Text style={styles.syncBtnText}>🔄 Sync</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => handleDateChange(-1)}>
          <Text style={styles.dateBtnText}>◀</Text>
        </TouchableOpacity>
        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          {!isWeekday && <Text style={styles.weekendText}>⚠️ Weekend</Text>}
        </View>
        <TouchableOpacity style={styles.dateBtn} onPress={() => handleDateChange(1)}>
          <Text style={styles.dateBtnText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Teacher List */}
      <Text style={styles.sectionTitle}>
        Select Absent Teachers ({absentTeachers.length} selected)
      </Text>

      <ScrollView style={styles.teacherList}>
        {selectableTeachers.map((teacher) => {
          const isAbsent = absentTeachers.includes(teacher.name);
          const isPrincipal = teacher.category === 'principal';
          return (
            <TouchableOpacity
              key={teacher.name}
              style={[
                styles.teacherItem,
                isAbsent && styles.teacherItemAbsent,
                isPrincipal && styles.teacherItemPrincipal,
              ]}
              onPress={() => toggleAbsent(teacher.name)}
            >
              <View style={styles.teacherInfo}>
                <Text
                  style={[
                    styles.teacherName,
                    isAbsent && styles.teacherNameAbsent,
                  ]}
                >
                  {isAbsent ? '✅ ' : '⬜ '}
                  {teacher.shortName ? `${teacher.shortName} (${teacher.name})` : teacher.name}
                </Text>
                <Text style={styles.teacherDesignation}>
                  {teacher.designation} | {(teacher.subjects || []).join(', ')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => navigation.navigate('Counter', { teachers })}
        >
          <Text style={styles.counterBtnText}>📊 Duty Counter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.proceedBtn, !isWeekday && styles.proceedBtnDisabled]}
          onPress={handleProceed}
          disabled={!isWeekday}
        >
          <Text style={styles.proceedBtnText}>Proceed →</Text>
        </TouchableOpacity>
      </View>

      {/* Google Sheet Sync Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚙️ Google Sheet Sync</Text>
            <Text style={styles.modalDescription}>
              Paste your Google Apps Script Web App URL below (from Extensions → Apps Script → Deploy → Web app) to sync routine changes live:
            </Text>

            <TextInput
              style={styles.urlInput}
              value={syncUrlInput}
              onChangeText={setSyncUrlInput}
              placeholder="https://script.google.com/macros/s/.../exec"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              multiline={false}
            />

            <TouchableOpacity
              style={[styles.modalActionBtn, isSyncing && styles.modalActionBtnDisabled]}
              onPress={handleSaveAndSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalActionBtnText}>💾 Save & Sync Now</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalResetBtn}
              onPress={handleResetToDefault}
              disabled={isSyncing}
            >
              <Text style={styles.modalResetBtnText}>🔄 Reset to Default Routine</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
              disabled={isSyncing}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a73e8',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 56,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#cce0ff',
    marginTop: 2,
  },
  settingsIconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    marginLeft: 8,
  },
  settingsIconText: {
    fontSize: 18,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  syncDotActive: {
    backgroundColor: '#4caf50',
  },
  syncDotDefault: {
    backgroundColor: '#ffb300',
  },
  syncText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  syncBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    minWidth: 64,
    alignItems: 'center',
  },
  syncBtnText: {
    color: '#1a73e8',
    fontSize: 12,
    fontWeight: '700',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateBtn: {
    padding: 12,
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
  },
  dateBtnText: {
    fontSize: 20,
    color: '#1a73e8',
  },
  dateDisplay: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  weekendText: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 12,
    paddingBottom: 8,
    color: '#555',
  },
  teacherList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  teacherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  teacherItemAbsent: {
    backgroundColor: '#fce4ec',
    borderLeftColor: '#d32f2f',
  },
  teacherItemPrincipal: {
    backgroundColor: '#fff8e1',
    borderLeftColor: '#f9a825',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  teacherNameAbsent: {
    color: '#c62828',
  },
  teacherDesignation: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  counterBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    alignItems: 'center',
  },
  counterBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a73e8',
  },
  proceedBtn: {
    flex: 2,
    padding: 14,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedBtnDisabled: {
    backgroundColor: '#ccc',
  },
  proceedBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  modalActionBtn: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalActionBtnDisabled: {
    backgroundColor: '#90caf9',
  },
  modalActionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalResetBtn: {
    backgroundColor: '#fff3e0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe082',
    marginBottom: 10,
  },
  modalResetBtnText: {
    color: '#e65100',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#777',
    fontSize: 14,
  },
});
