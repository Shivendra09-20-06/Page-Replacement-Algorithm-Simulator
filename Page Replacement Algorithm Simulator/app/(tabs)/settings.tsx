import { View, Text, Switch, StyleSheet, useColorScheme } from 'react-native';
import { useState } from 'react';

export default function SettingsScreen() {
  const [showStepByStep, setShowStepByStep] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.setting}>
          <View>
            <Text style={styles.settingTitle}>Step-by-Step Animation</Text>
            <Text style={styles.settingDescription}>
              Show detailed steps during simulation
            </Text>
          </View>
          <Switch
            value={showStepByStep}
            onValueChange={setShowStepByStep}
            trackColor={{ false: isDark ? '#404040' : '#cbd5e1', true: '#0891b2' }}
            thumbColor={isDark ? '#ffffff' : '#ffffff'}
          />
        </View>

        <View style={styles.setting}>
          <View>
            <Text style={styles.settingTitle}>Sound Effects</Text>
            <Text style={styles.settingDescription}>
              Play sounds during page faults
            </Text>
          </View>
          <Switch
            value={soundEffects}
            onValueChange={setSoundEffects}
            trackColor={{ false: isDark ? '#404040' : '#cbd5e1', true: '#0891b2' }}
            thumbColor={isDark ? '#ffffff' : '#ffffff'}
          />
        </View>
      </View>

      <View style={styles.about}>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.copyright}>© 2025 Page Replacement Simulator</Text>
      </View>
    </View>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#1a1a1a' : '#f8fafc',
  },
  section: {
    backgroundColor: isDark ? '#262626' : '#ffffff',
    marginTop: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333333' : '#f1f5f9',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
  },
  about: {
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  version: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: isDark ? '#64748b' : '#94a3b8',
  },
});