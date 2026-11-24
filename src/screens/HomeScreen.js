// Home Screen - Select date, mark absent teachers, generate cover duties
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { TEACHERS, ELIGIBLE_TEACHERS, DAYS, getDayKey } from '../data/teachers';

export default function HomeScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [absentTeachers, setAbsentTeachers] = useState([]);

  const dayKey = getDayKey(selectedDate);
  const dayName = DAYS[selectedDate.getDay() - 1] || '';
  const isWeekday = selectedDate.getDay() >= 1 && selectedDate.getDay() <= 5;

  // Get list of teachers who can be marked absent (non-primary, non-excluded)
  const selectableTeachers = TEACHERS.filter(
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
    });
  };

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Cover Duty Manager</Text>
        <Text style={styles.subtitle}>Select Date & Absent Teachers</Text>
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
                  {teacher.designation} | {teacher.subjects.join(', ')}
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
          onPress={() => navigation.navigate('Counter')}
        >
          <Text style={styles.counterBtnText}>📊 Duty Counter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.proceedBtn, !isWeekday && styles.proceedBtnDisabled]}
          onPress={handleProceed}
          disabled={!isWeekday}
        >
          <Text style={styles.proceedBtnText}>
            Proceed →
          </Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#cce0ff',
    marginTop: 4,
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
});
