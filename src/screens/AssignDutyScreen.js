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
import { getTeacherDisplayName, PERIOD_TIMES } from '../data/teachers';
import { getDutyCounter } from '../utils/storage';

export default function AssignDutyScreen({ route, navigation }) {
  const { date, absentTeachers, dayKey } = route.params;
  const parsedDate = new Date(date);

  const [dutiesByTeacher, setDutiesByTeacher] = useState({});
  const [neededDuties, setNeededDuties] = useState([]);
  const [assignments, setAssignments] = useState({});
  // assignments: { [dutyId]: { coverTeacher: string, combined: boolean, isCombined: boolean } }
  const [dutyCounters, setDutyCounters] = useState({});
  const [expandedDutyId, setExpandedDutyId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load historical duty counters
    const counters = await getDutyCounter();
    setDutyCounters(counters || {});

    // Collect all classes needing cover across all absent teachers
    const allDuties = [];
    const byTeacher = {};

    absentTeachers.forEach((teacherName) => {
      const classes = getAbsentTeacherClasses(teacherName, dayKey);
      byTeacher[teacherName] = [];

      classes.forEach((cls) => {
        const dutyId = `${cls.period}_${teacherName}_${cls.classInfo ? cls.classInfo.label : 'Class'}`;
        const sameClassTeachers = findTeachersWithSameClass(
          dayKey,
          cls.period,
          cls.classInfo,
          absentTeachers
        );

        const dutyObj = {
          id: dutyId,
          period: cls.period,
          periodLabel: cls.periodLabel,
          periodTime: PERIOD_TIMES[cls.period] || '',
          absentTeacher: teacherName,
          classInfo: cls.classInfo,
          classLabel: cls.classInfo ? cls.classInfo.label : cls.rawEntry,
          rawEntry: cls.rawEntry,
          sameClassTeachers,
        };

        allDuties.push(dutyObj);
        byTeacher[teacherName].push(dutyObj);
      });
    });

    // Sort duties by period inside each teacher
    Object.keys(byTeacher).forEach((teacherName) => {
      byTeacher[teacherName].sort((a, b) => a.period - b.period);
    });

    allDuties.sort((a, b) => a.period - b.period);
    setNeededDuties(allDuties);
    setDutiesByTeacher(byTeacher);

    // Initial Smart Auto-Assignment
    // Rule 1: If a class can be combined, NO free teacher is used. The teacher taking that class handles it.
    // Rule 4: If not combined, assign best eligible free teacher.
    const initialAssignments = {};
    const assignedInPeriod = {}; // { period: Set of free teacherNames }

    allDuties.forEach((duty) => {
      if (!assignedInPeriod[duty.period]) {
        assignedInPeriod[duty.period] = new Set();
      }

      const hasSameClassOpportunity = duty.sameClassTeachers && duty.sameClassTeachers.length > 0;

      if (hasSameClassOpportunity) {
        // Option 1: Auto-combine with the first teacher who already teaches this class
        const combineTeacher = duty.sameClassTeachers[0].teacherName;
        initialAssignments[duty.id] = {
          coverTeacher: combineTeacher,
          combined: true,
          isCombined: true,
        };
        // NOTE: No free teacher is added to assignedInPeriod because this teacher already has this class!
      } else {
        // Option 2: Need an outside free teacher
        const freeCandidates = findFreeTeachers(
          dayKey,
          duty.period,
          duty.classInfo,
          absentTeachers
        );

        const available = freeCandidates.filter(
          (c) => !assignedInPeriod[duty.period].has(c.name)
        );

        // Sort by rule: eligible first, higher day class count (Rule 4d), lower past duty count (Rule 5)
        available.sort((a, b) => {
          if (a.canCover && !b.canCover) return -1;
          if (!a.canCover && b.canCover) return 1;
          if (b.dayClassCount !== a.dayClassCount) {
            return b.dayClassCount - a.dayClassCount;
          }
          const countA = counters[a.name] || 0;
          const countB = counters[b.name] || 0;
          return countA - countB;
        });

        const bestCandidate = available[0];
        if (bestCandidate) {
          initialAssignments[duty.id] = {
            coverTeacher: bestCandidate.name,
            combined: false,
            isCombined: false,
          };
          assignedInPeriod[duty.period].add(bestCandidate.name);
        } else {
          initialAssignments[duty.id] = {
            coverTeacher: '',
            combined: false,
            isCombined: false,
          };
        }
      }
    });

    setAssignments(initialAssignments);
    if (allDuties.length > 0) {
      setExpandedDutyId(allDuties[0].id);
    }
  };

  // User chooses a teacher to take the combined class (No free teacher needed)
  const handleSelectCombinedTeacher = (dutyId, combineTeacherName) => {
    setAssignments((prev) => ({
      ...prev,
      [dutyId]: {
        coverTeacher: combineTeacherName,
        combined: true,
        isCombined: true,
      },
    }));
  };

  // User chooses to assign an outside free teacher instead of combining
  const handleSwitchToFreeTeacher = (dutyId, bestFreeCandidateName = '') => {
    setAssignments((prev) => ({
      ...prev,
      [dutyId]: {
        coverTeacher: bestFreeCandidateName,
        combined: false,
        isCombined: false,
      },
    }));
  };

  // User picks a specific free teacher
  const handleSelectFreeTeacher = (dutyId, teacherName) => {
    setAssignments((prev) => ({
      ...prev,
      [dutyId]: {
        coverTeacher: teacherName,
        combined: false,
        isCombined: false,
      },
    }));
  };

  const handleFinish = () => {
    const unassigned = neededDuties.filter(
      (d) => !assignments[d.id] || !assignments[d.id].coverTeacher
    );

    if (unassigned.length > 0) {
      Alert.alert(
        'Incomplete Assignments',
        `There are ${unassigned.length} period(s) without a teacher assigned. Do you want to proceed anyway?`,
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
    // Group assignments by ABSENT TEACHER (Rule 2 correction)
    // Structure: { [absentTeacher]: [ { period, periodLabel, classLabel, coverTeacher, combined } ] }
    const groupedByAbsentTeacher = {};

    neededDuties.forEach((duty) => {
      const assignment = assignments[duty.id];
      if (assignment && assignment.coverTeacher) {
        const absent = duty.absentTeacher;
        if (!groupedByAbsentTeacher[absent]) {
          groupedByAbsentTeacher[absent] = [];
        }
        groupedByAbsentTeacher[absent].push({
          period: duty.period,
          periodLabel: duty.periodLabel,
          classLabel: duty.classLabel,
          coverTeacher: assignment.coverTeacher,
          combined: assignment.combined || false,
        });
      }
    });

    // Sort duties inside each absent teacher by period ascending
    Object.keys(groupedByAbsentTeacher).forEach((absent) => {
      groupedByAbsentTeacher[absent].sort((a, b) => a.period - b.period);
    });

    navigation.navigate('Output', {
      date: parsedDate.toISOString(),
      groupedByAbsentTeacher,
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
          {absentTeachers.length} Absent: {absentTeachers.map(getTeacherDisplayName).join(', ')}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {neededDuties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No classes to cover today for selected absent teachers! 🎉</Text>
          </View>
        ) : (
          Object.entries(dutiesByTeacher).map(([absentTeacherName, duties]) => {
            if (duties.length === 0) return null;
            const absentShortName = getTeacherDisplayName(absentTeacherName);

            return (
              <View key={absentTeacherName} style={styles.absentTeacherSection}>
                <View style={styles.absentTeacherHeader}>
                  <Text style={styles.absentTeacherTitle}>
                    🔴 Absent: {absentShortName} ({duties.length} classes)
                  </Text>
                </View>

                {duties.map((duty) => {
                  const assignment = assignments[duty.id] || {};
                  const isExpanded = expandedDutyId === duty.id;
                  const isCombined = assignment.isCombined === true;
                  const freeCandidates = findFreeTeachers(
                    dayKey,
                    duty.period,
                    duty.classInfo,
                    absentTeachers
                  );
                  const hasSameClassOption = duty.sameClassTeachers && duty.sameClassTeachers.length > 0;
                  const coverTeacherDisplay = assignment.coverTeacher
                    ? getTeacherDisplayName(assignment.coverTeacher)
                    : null;

                  return (
                    <View key={duty.id} style={styles.dutyCard}>
                      {/* Card Header */}
                      <TouchableOpacity
                        style={styles.cardHeader}
                        onPress={() => setExpandedDutyId(isExpanded ? null : duty.id)}
                      >
                        <View style={styles.cardHeaderLeft}>
                          <View style={styles.periodBadge}>
                            <Text style={styles.periodBadgeText}>{duty.periodLabel}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dutyClassTitle}>
                              {duty.classLabel} ({duty.rawEntry})
                            </Text>
                            <Text style={styles.dutySubtitle}>{duty.periodTime}</Text>
                          </View>
                        </View>

                        <View style={styles.cardHeaderRight}>
                          {isCombined ? (
                            <View style={styles.combinedBadge}>
                              <Text style={styles.combinedBadgeText}>
                                🔀 {coverTeacherDisplay} (combined)
                              </Text>
                            </View>
                          ) : coverTeacherDisplay ? (
                            <View style={styles.assignedBadge}>
                              <Text style={styles.assignedBadgeText}>
                                👤 {coverTeacherDisplay}
                              </Text>
                            </View>
                          ) : (
                            <Text style={styles.unassignedText}>⚠️ Select</Text>
                          )}
                          <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Card Body */}
                      {isExpanded && (
                        <View style={styles.cardBody}>
                          {/* 1. Combined Class Options (Rule 1 & 4e) */}
                          {hasSameClassOption && (
                            <View style={styles.combineBox}>
                              <Text style={styles.combineBoxTitle}>
                                🔀 Combine Section Option (No Free Teacher Needed):
                              </Text>
                              <Text style={styles.combineBoxSub}>
                                Other present teachers already taking {duty.classLabel} this period:
                              </Text>

                              {duty.sameClassTeachers.map((st) => {
                                const isSelected =
                                  isCombined && assignment.coverTeacher === st.teacherName;
                                const teacherShort = getTeacherDisplayName(st.teacherName);

                                return (
                                  <TouchableOpacity
                                    key={st.teacherName}
                                    style={[
                                      styles.combineOption,
                                      isSelected && styles.combineOptionSelected,
                                    ]}
                                    onPress={() =>
                                      handleSelectCombinedTeacher(duty.id, st.teacherName)
                                    }
                                  >
                                    <View style={styles.radioCircle}>
                                      <Text style={styles.radioText}>{isSelected ? '●' : '○'}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                      <Text style={styles.combineTeacherName}>
                                        {teacherShort} ({st.rawEntry})
                                      </Text>
                                      <Text style={styles.combineTeacherMeta}>
                                        Combines both sections into one • No outside cover teacher needed
                                      </Text>
                                    </View>
                                    {isSelected && (
                                      <View style={styles.activeTag}>
                                        <Text style={styles.activeTagText}>Combined</Text>
                                      </View>
                                    )}
                                  </TouchableOpacity>
                                );
                              })}

                              {/* Toggle between combined and outside free teacher */}
                              {isCombined && (
                                <TouchableOpacity
                                  style={styles.switchToFreeBtn}
                                  onPress={() => {
                                    const firstFree = freeCandidates[0]?.name || '';
                                    handleSwitchToFreeTeacher(duty.id, firstFree);
                                  }}
                                >
                                  <Text style={styles.switchToFreeText}>
                                    🔄 Or choose an outside free teacher instead
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}

                          {/* 2. Free Teachers Selection */}
                          {(!hasSameClassOption || !isCombined) && (
                            <View style={styles.freeTeachersBox}>
                              <Text style={styles.freeSectionTitle}>
                                👤 Choose Free Teacher for Duty ({duty.periodLabel} Period):
                              </Text>

                              {freeCandidates.length === 0 ? (
                                <Text style={styles.noCandidatesText}>
                                  No eligible teachers are free in this period.
                                </Text>
                              ) : (
                                <View style={styles.candidateList}>
                                  {freeCandidates.map((candidate) => {
                                    const isSelected =
                                      !isCombined && assignment.coverTeacher === candidate.name;
                                    const pastDutyCount = dutyCounters[candidate.name] || 0;
                                    const candidateDisplay = getTeacherDisplayName(candidate.name);

                                    return (
                                      <TouchableOpacity
                                        key={candidate.name}
                                        style={[
                                          styles.candidateItem,
                                          isSelected && styles.candidateItemSelected,
                                          !candidate.canCover && styles.candidateItemIneligible,
                                        ]}
                                        onPress={() =>
                                          handleSelectFreeTeacher(duty.id, candidate.name)
                                        }
                                      >
                                        <View style={styles.radioCircle}>
                                          <Text style={styles.radioText}>
                                            {isSelected ? '●' : '○'}
                                          </Text>
                                        </View>
                                        <View style={styles.candidateInfo}>
                                          <View style={styles.candidateNameRow}>
                                            <Text style={styles.candidateName}>
                                              {candidateDisplay}
                                            </Text>
                                            {candidate.canCover ? (
                                              <View style={styles.eligibleTag}>
                                                <Text style={styles.eligibleTagText}>Eligible</Text>
                                              </View>
                                            ) : (
                                              <View style={styles.otherTag}>
                                                <Text style={styles.otherTagText}>Other Range</Text>
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
                      )}
                    </View>
                  );
                })}
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
  absentTeacherSection: {
    marginBottom: 16,
  },
  absentTeacherHeader: {
    backgroundColor: '#fce4ec',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#c2185b',
  },
  absentTeacherTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#880e4f',
  },
  dutyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
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
    padding: 12,
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
    marginRight: 10,
  },
  periodBadgeText: {
    color: '#1a73e8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dutyClassTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#202124',
  },
  dutySubtitle: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 2,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  combinedBadge: {
    backgroundColor: '#e6f4ea',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#34a853',
  },
  combinedBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#137333',
  },
  assignedBadge: {
    backgroundColor: '#e8f0fe',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  assignedBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a73e8',
  },
  unassignedText: {
    fontSize: 12,
    color: '#d93025',
    fontWeight: 'bold',
  },
  expandIcon: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 4,
  },
  cardBody: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    backgroundColor: '#fafbfc',
  },
  combineBox: {
    backgroundColor: '#f1f8e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#c5e1a5',
  },
  combineBoxTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#33691e',
    marginBottom: 4,
  },
  combineBoxSub: {
    fontSize: 12,
    color: '#558b2f',
    marginBottom: 8,
  },
  combineOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c5e1a5',
    marginBottom: 6,
  },
  combineOptionSelected: {
    borderColor: '#33691e',
    backgroundColor: '#e8f5e9',
  },
  combineTeacherName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#202124',
  },
  combineTeacherMeta: {
    fontSize: 11,
    color: '#558b2f',
    marginTop: 2,
  },
  activeTag: {
    backgroundColor: '#33691e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  switchToFreeBtn: {
    marginTop: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  switchToFreeText: {
    fontSize: 12,
    color: '#1a73e8',
    fontWeight: '600',
  },
  freeTeachersBox: {
    marginTop: 4,
  },
  freeSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#5f6368',
    marginBottom: 8,
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
    opacity: 0.6,
  },
  radioCircle: {
    marginRight: 10,
  },
  radioText: {
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
    fontSize: 14,
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
    fontSize: 11,
    color: '#5f6368',
    marginTop: 2,
  },
  noCandidatesText: {
    fontSize: 13,
    color: '#d93025',
    fontStyle: 'italic',
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
