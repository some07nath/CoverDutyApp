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
import {
  getAbsentTeacherClasses,
  findFreeTeachers,
  findTeachersWithSameClass,
} from '../utils/coverDuty';
import { getDutyCounter } from '../utils/storage';
import { PERIODS, PERIOD_TIMES } from '../data/teachers';

export default function AssignDutyScreen({ route, navigation }) {
  const { date, absentTeachers, dayKey } = route.params;
  const parsedDate = new Date(date);

  const [neededDuties, setNeededDuties] = useState([]);
  const [assignments, setAssignments] = useState({});
  // assignments: { [dutyId]: { coverTeacher: string, combined: boolean } }
  const [dutyCounters, setDutyCounters] = useState({});
  const [expandedDutyId, setExpandedDutyId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load historical duty counters
    const counters = await getDutyCounter();
    setDutyCounters(counters);

    // Collect all classes needing cover across all absent teachers
    const allDuties = [];
    absentTeachers.forEach((teacherName) => {
      const classes = getAbsentTeacherClasses(teacherName, dayKey);
      classes.forEach((cls) => {
        const dutyId = `${cls.period}_${teacherName}_${cls.classInfo ? cls.classInfo.label : 'Class'}`;
        const sameClassTeachers = findTeachersWithSameClass(
          dayKey,
          cls.period,
          cls.classInfo,
          absentTeachers
        );

        allDuties.push({
          id: dutyId,
          period: cls.period,
          periodLabel: cls.periodLabel,
          periodTime: PERIOD_TIMES[cls.period] || '',
          absentTeacher: teacherName,
          classInfo: cls.classInfo,
          classLabel: cls.classInfo ? cls.classInfo.label : cls.rawEntry,
          rawEntry: cls.rawEntry,
          sameClassTeachers,
        });
      });
    });

    // Sort duties by period
    allDuties.sort((a, b) => a.period - b.period);
    setNeededDuties(allDuties);

    // Initial default auto-assignment
    const initialAssignments = {};
    const assignedInPeriod = {}; // { period: Set of teacherNames }

    allDuties.forEach((duty) => {
      if (!assignedInPeriod[duty.period]) {
        assignedInPeriod[duty.period] = new Set();
      }

      const freeCandidates = findFreeTeachers(
        dayKey,
        duty.period,
        duty.classInfo,
        absentTeachers
      );

      // Filter out someone already assigned in this period
      const available = freeCandidates.filter(
        (c) => !assignedInPeriod[duty.period].has(c.name)
      );

      // Best candidate: eligible cover first, highest day class count, lowest past duty counter
      available.sort((a, b) => {
        if (a.canCover && !b.canCover) return -1;
        if (!a.canCover && b.canCover) return 1;
        // Prioritize higher classes today (Rule 4d: prefer 6 over 5)
        if (b.dayClassCount !== a.dayClassCount) {
          return b.dayClassCount - a.dayClassCount;
        }
        // Balance total past duty count
        const countA = counters[a.name] || 0;
        const countB = counters[b.name] || 0;
        return countA - countB;
      });

      const bestCandidate = available[0];
      const hasSameClassOpportunity = duty.sameClassTeachers && duty.sameClassTeachers.length > 0;

      if (bestCandidate) {
        initialAssignments[duty.id] = {
          coverTeacher: bestCandidate.name,
          combined: hasSameClassOpportunity,
        };
        assignedInPeriod[duty.period].add(bestCandidate.name);
      } else {
        initialAssignments[duty.id] = {
          coverTeacher: '',
          combined: hasSameClassOpportunity,
        };
      }
    });

    setAssignments(initialAssignments);
    if (allDuties.length > 0) {
      setExpandedDutyId(allDuties[0].id);
    }
  };

  const handleSelectCoverTeacher = (dutyId, period, teacherName) => {
    setAssignments((prev) => ({
      ...prev,
      [dutyId]: {
        ...(prev[dutyId] || {}),
        coverTeacher: teacherName,
      },
    }));
  };

  const handleToggleCombined = (dutyId) => {
    setAssignments((prev) => ({
      ...prev,
      [dutyId]: {
        ...(prev[dutyId] || {}),
        combined: !prev[dutyId]?.combined,
      },
    }));
  };

  const handleFinish = () => {
    // Check unassigned duties
    const unassigned = neededDuties.filter(
      (d) => !assignments[d.id] || !assignments[d.id].coverTeacher
    );

    if (unassigned.length > 0) {
      Alert.alert(
        'Incomplete Assignments',
        `There are ${unassigned.length} period(s) without a cover teacher assigned. Do you want to proceed anyway?`,
        [
          { text: 'Review', style: 'cancel' },
          { text: 'Proceed', onPress: () => navigateToOutput() },
        ]
      );
    } else {
      navigateToOutput();
    }
  };

  const navigateToOutput = () => {
    // Group assignments by cover teacher
    // Output structure: { [coverTeacher]: [ { periodLabel, classLabel, absentTeacher, combined } ] }
    const groupedAssignments = {};

    neededDuties.forEach((duty) => {
      const assignment = assignments[duty.id];
      if (assignment && assignment.coverTeacher) {
        const teacher = assignment.coverTeacher;
        if (!groupedAssignments[teacher]) {
          groupedAssignments[teacher] = [];
        }
        groupedAssignments[teacher].push({
          period: duty.period,
          periodLabel: duty.periodLabel,
          classLabel: duty.classLabel,
          absentTeacher: duty.absentTeacher,
          combined: assignment.combined || false,
        });
      }
    });

    // Sort duties inside each teacher by period
    Object.keys(groupedAssignments).forEach((teacher) => {
      groupedAssignments[teacher].sort((a, b) => a.period - b.period);
    });

    navigation.navigate('Output', {
      date: parsedDate.toISOString(),
      groupedAssignments,
      rawAssignments: assignments,
      neededDuties,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>◀ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Cover Duties</Text>
        <Text style={styles.headerSubtitle}>
          {absentTeachers.length} Absent: {absentTeachers.join(', ')}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {neededDuties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No classes to cover today for selected absent teachers! 🎉</Text>
          </View>
        ) : (
          neededDuties.map((duty, index) => {
            const assignment = assignments[duty.id] || {};
            const isExpanded = expandedDutyId === duty.id;
            const freeCandidates = findFreeTeachers(
              dayKey,
              duty.period,
              duty.classInfo,
              absentTeachers
            );

            return (
              <View key={duty.id} style={styles.dutyCard}>
                {/* Duty Card Header */}
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => setExpandedDutyId(isExpanded ? null : duty.id)}
                >
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.periodBadge}>
                      <Text style={styles.periodBadgeText}>{duty.periodLabel}</Text>
                    </View>
                    <View>
                      <Text style={styles.dutyClassTitle}>
                        {duty.classLabel} ({duty.rawEntry})
                      </Text>
                      <Text style={styles.dutySubtitle}>
                        Absent: <Text style={styles.bold}>{duty.absentTeacher}</Text> • {duty.periodTime}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardHeaderRight}>
                    <Text style={styles.assignedBadgeText}>
                      {assignment.coverTeacher ? assignment.coverTeacher : '⚠️ Select'}
                    </Text>
                    <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                  </View>
                </TouchableOpacity>

                {/* Duty Card Body */}
                {isExpanded && (
                  <View style={styles.cardBody}>
                    {/* Combine Sections Opportunity (Rule 4e) */}
                    {duty.sameClassTeachers && duty.sameClassTeachers.length > 0 && (
                      <View style={styles.combineNoticeBox}>
                        <Text style={styles.combineNoticeTitle}>
                          💡 Combine Sections Opportunity (Rule 4e):
                        </Text>
                        {duty.sameClassTeachers.map((s, idx) => (
                          <Text key={idx} style={styles.combineNoticeTeacher}>
                            • {s.teacherName} also has {duty.classLabel} ({s.rawEntry}) this period
                          </Text>
                        ))}
                        <TouchableOpacity
                          style={[
                            styles.combineToggleBtn,
                            assignment.combined && styles.combineToggleBtnActive,
                          ]}
                          onPress={() => handleToggleCombined(duty.id)}
                        >
                          <Text
                            style={[
                              styles.combineToggleText,
                              assignment.combined && styles.combineToggleTextActive,
                            ]}
                          >
                            {assignment.combined ? '✅ Sections Combined' : '➕ Mark as Combined Section'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Candidate Free Teachers (Rule 4a, 4b, 4c, 4d) */}
                    <Text style={styles.candidateHeader}>
                      Choose Free Teacher (Free in {duty.periodLabel}):
                    </Text>

                    {freeCandidates.length === 0 ? (
                      <Text style={styles.noCandidatesText}>
                        No eligible teachers are free in this period.
                      </Text>
                    ) : (
                      <View style={styles.candidateList}>
                        {freeCandidates.map((candidate) => {
                          const isSelected = assignment.coverTeacher === candidate.name;
                          const pastDutyCount = dutyCounters[candidate.name] || 0;

                          return (
                            <TouchableOpacity
                              key={candidate.name}
                              style={[
                                styles.candidateItem,
                                isSelected && styles.candidateItemSelected,
                                !candidate.canCover && styles.candidateItemIneligible,
                              ]}
                              onPress={() =>
                                handleSelectCoverTeacher(duty.id, duty.period, candidate.name)
                              }
                            >
                              <View style={styles.candidateRadio}>
                                <Text style={styles.candidateRadioText}>
                                  {isSelected ? '●' : '○'}
                                </Text>
                              </View>
                              <View style={styles.candidateInfo}>
                                <View style={styles.candidateNameRow}>
                                  <Text style={styles.candidateName}>{candidate.name}</Text>
                                  {candidate.canCover ? (
                                    <View style={styles.eligibleTag}>
                                      <Text style={styles.eligibleTagText}>Eligible</Text>
                                    </View>
                                  ) : (
                                    <View style={styles.otherTag}>
                                      <Text style={styles.otherTagText}>Different Range</Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={styles.candidateMeta}>
                                  📅 {candidate.dayClassCount} classes today (Rule 4d) • 📋 {pastDutyCount} past covers (Rule 5)
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.generateBtn} onPress={handleFinish}>
          <Text style={styles.generateBtnText}>Generate Cover Routine →</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    padding: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  dutyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  periodBadge: {
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 12,
  },
  periodBadgeText: {
    color: '#1a73e8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dutyClassTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#202124',
  },
  dutySubtitle: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 2,
  },
  bold: {
    fontWeight: 'bold',
    color: '#d93025',
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  assignedBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#188038',
  },
  expandIcon: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 4,
  },
  cardBody: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    backgroundColor: '#fafbfc',
  },
  combineNoticeBox: {
    backgroundColor: '#e6f4ea',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#137333',
  },
  combineNoticeTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#137333',
    marginBottom: 4,
  },
  combineNoticeTeacher: {
    fontSize: 12,
    color: '#202124',
    marginBottom: 2,
  },
  combineToggleBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#137333',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  combineToggleBtnActive: {
    backgroundColor: '#137333',
  },
  combineToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#137333',
  },
  combineToggleTextActive: {
    color: '#fff',
  },
  candidateHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#5f6368',
    marginBottom: 8,
  },
  noCandidatesText: {
    fontSize: 13,
    color: '#d93025',
    fontStyle: 'italic',
  },
  candidateList: {
    gap: 6,
  },
  candidateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  candidateItemSelected: {
    borderColor: '#1a73e8',
    backgroundColor: '#e8f0fe',
  },
  candidateItemIneligible: {
    opacity: 0.7,
  },
  candidateRadio: {
    marginRight: 10,
  },
  candidateRadioText: {
    fontSize: 18,
    color: '#1a73e8',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#202124',
  },
  eligibleTag: {
    backgroundColor: '#ceead6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  eligibleTagText: {
    fontSize: 11,
    color: '#137333',
    fontWeight: 'bold',
  },
  otherTag: {
    backgroundColor: '#feefe3',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  otherTagText: {
    fontSize: 11,
    color: '#c26401',
  },
  candidateMeta: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 2,
  },
  footer: {
    padding: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  generateBtn: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
