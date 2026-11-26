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
import { TEACHERS } from '../data/teachers';
import {
  getDutyCounter,
  incrementDutyCounter,
  resetDutyCounter,
} from '../utils/storage';
import { getStoredTeachers } from '../utils/sync';

export default function CounterScreen({ route, navigation }) {
  const routeTeachers = route?.params?.teachers;
  const [counters, setCounters] = useState({});
  const [teachersList, setTeachersList] = useState(
    routeTeachers && routeTeachers.length > 0 ? routeTeachers : TEACHERS
  );

  useEffect(() => {
    loadCounters();
  }, []);

  const loadCounters = async () => {
    const [data, storedTeachers] = await Promise.all([
      getDutyCounter(),
      routeTeachers && routeTeachers.length > 0
        ? Promise.resolve(routeTeachers)
        : getStoredTeachers(),
    ]);
    setCounters(data || {});
    if (storedTeachers && storedTeachers.length > 0) {
      setTeachersList(storedTeachers);
    }
  };

  const handleAdjust = async (teacherName, delta) => {
    const newCounters = await incrementDutyCounter(teacherName, delta);
    if (newCounters) {
      setCounters(newCounters);
    }
  };

  const handleResetAll = () => {
    Alert.alert(
      'Reset Duty Counters',
      'Are you sure you want to reset all teacher cover duty counters to 0? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: async () => {
            await resetDutyCounter();
            setCounters({});
            Alert.alert('Reset Complete', 'All counters set to 0.');
          },
        },
      ]
    );
  };

  // Sort teachers: teachers with duties first, then alphabetical
  const eligibleTeachers = teachersList.filter(
    (t) => !['principal', 'primary', 'excluded', 'nios'].includes(t.category)
  );
  const sortedTeachers = [...eligibleTeachers].sort((a, b) => {
    const countA = counters[a.name] || 0;
    const countB = counters[b.name] || 0;
    if (countB !== countA) return countB - countA;
    return a.name.localeCompare(b.name);
  });

  const totalDutiesAssigned = Object.values(counters).reduce((sum, val) => sum + val, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>◀ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Teacher Duty Counter</Text>
        <Text style={styles.headerSubtitle}>
          Track who has done how many cover classes (Rule 5)
        </Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalDutiesAssigned}</Text>
          <Text style={styles.summaryLabel}>Total Covers Given</Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={handleResetAll}>
          <Text style={styles.resetBtnText}>🔄 Reset All</Text>
        </TouchableOpacity>
      </View>

      {/* Teacher List */}
      <ScrollView style={styles.list}>
        {sortedTeachers.map((teacher) => {
          const count = counters[teacher.name] || 0;
          return (
            <View key={teacher.name} style={styles.teacherRow}>
              <View style={styles.teacherDetails}>
                <Text style={styles.teacherName}>
                  {teacher.shortName ? `${teacher.shortName} (${teacher.name})` : teacher.name}
                </Text>
                <Text style={styles.teacherSub}>
                  {teacher.designation} • {(teacher.subjects || []).join(', ')}
                </Text>
              </View>

              <View style={styles.counterControl}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => handleAdjust(teacher.name, -1)}
                  disabled={count <= 0}
                >
                  <Text style={[styles.adjustBtnText, count <= 0 && styles.disabledText]}>
                    −
                  </Text>
                </TouchableOpacity>

                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{count}</Text>
                </View>

                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => handleAdjust(teacher.name, 1)}
                >
                  <Text style={styles.adjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  header: {
    backgroundColor: '#1a73e8',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 56,
  },
  backBtn: {
    marginBottom: 8,
  },
  backBtnText: {
    color: '#e8f0fe',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#d2e3fc',
    marginTop: 4,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#5f6368',
  },
  resetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fce8e6',
    borderRadius: 6,
  },
  resetBtnText: {
    color: '#d93025',
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    padding: 12,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  teacherDetails: {
    flex: 1,
    marginRight: 10,
  },
  teacherName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#202124',
  },
  teacherSub: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 2,
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adjustBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  disabledText: {
    color: '#bdc1c6',
  },
  countBadge: {
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#202124',
  },
});
