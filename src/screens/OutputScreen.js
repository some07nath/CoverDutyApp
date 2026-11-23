import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { formatCoverOutput } from '../utils/coverDuty';
import { incrementDutyCounter } from '../utils/storage';

export default function OutputScreen({ route, navigation }) {
  const { date, groupedAssignments } = route.params;
  const parsedDate = new Date(date);

  const [savedCounters, setSavedCounters] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate formatted routine string
  const outputText = formatCoverOutput(parsedDate, groupedAssignments);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    Alert.alert('Copied!', 'Cover routine text copied to clipboard.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: outputText,
        title: `Cover Duty for ${parsedDate.getDate()}.${parsedDate.getMonth() + 1}.${parsedDate.getFullYear()}`,
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSaveCounters = async () => {
    if (savedCounters) {
      Alert.alert('Notice', 'Counters for this session have already been saved.');
      return;
    }

    try {
      // For each cover teacher, increment their counter by the number of duties assigned
      for (const [teacher, duties] of Object.entries(groupedAssignments)) {
        await incrementDutyCounter(teacher, duties.length);
      }
      setSavedCounters(true);
      Alert.alert(
        'Success! 🎉',
        'Duty counters have been successfully updated in phone storage.'
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to update duty counters.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>◀ Edit Assignments</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Final Cover Routine</Text>
        <Text style={styles.headerSubtitle}>
          Formatted output ready to share
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Output Text Preview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Generated Routine Output</Text>
            <TouchableOpacity onPress={handleCopy} style={styles.miniCopyBtn}>
              <Text style={styles.miniCopyText}>{copied ? '✅ Copied' : '📄 Copy'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.outputPre}>{outputText}</Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleCopy}>
            <Text style={styles.actionBtnIcon}>📋</Text>
            <Text style={styles.actionBtnTextPrimary}>
              {copied ? 'Copied to Clipboard!' : 'Copy Routine'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleShare}>
            <Text style={styles.actionBtnIcon}>📤</Text>
            <Text style={styles.actionBtnTextSecondary}>Share via WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtnSuccess,
              savedCounters && styles.actionBtnSuccessDisabled,
            ]}
            onPress={handleSaveCounters}
          >
            <Text style={styles.actionBtnIcon}>{savedCounters ? '✅' : '📊'}</Text>
            <Text style={styles.actionBtnTextSuccess}>
              {savedCounters ? 'Duty Counters Saved' : 'Update Duty Counters (Rule 5)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation to Counter & Home */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.navigate('Counter')}
          >
            <Text style={styles.navBtnText}>View Duty Counters 📊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtnHome}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.navBtnTextHome}>Back to Home 🏠</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    padding: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#202124',
  },
  miniCopyBtn: {
    backgroundColor: '#e8f0fe',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  miniCopyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a73e8',
  },
  outputPre: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    lineHeight: 22,
    color: '#1f1f1f',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  actionGrid: {
    gap: 10,
    marginBottom: 16,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
  },
  actionBtnTextPrimary: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25d366',
    paddingVertical: 14,
    borderRadius: 8,
  },
  actionBtnTextSecondary: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionBtnSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#137333',
    paddingVertical: 14,
    borderRadius: 8,
  },
  actionBtnSuccessDisabled: {
    backgroundColor: '#5f6368',
  },
  actionBtnTextSuccess: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionBtnIcon: {
    fontSize: 18,
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  navBtn: {
    flex: 1,
    backgroundColor: '#e8f0fe',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navBtnText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '600',
  },
  navBtnHome: {
    flex: 1,
    backgroundColor: '#dadce0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navBtnTextHome: {
    color: '#202124',
    fontSize: 14,
    fontWeight: '600',
  },
});
