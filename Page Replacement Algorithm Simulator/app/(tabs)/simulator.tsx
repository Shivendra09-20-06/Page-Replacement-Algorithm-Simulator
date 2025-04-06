import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Share,
  Animated,
  useColorScheme,
} from 'react-native';
import {
  Play,
  RotateCcw,
  Pause,
  StepForward,
  Download,
  Share2,
  FastForward,
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type Algorithm = 'FIFO' | 'LRU' | 'OPTIMAL';
type SimulationSpeed = 'SLOW' | 'NORMAL' | 'FAST';

interface SimulationState {
  frames: string[];
  pageFault: boolean;
  referenceIndex: number;
}

interface SimulationResult {
  timestamp: number;
  algorithm: Algorithm;
  referenceString: string;
  frameCount: number;
  pageFaults: number;
  hitRatio: number;
  states: SimulationState[];
}

export default function SimulatorScreen() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('FIFO');
  const [referenceString, setReferenceString] = useState('1 2 3 4 1 2 5 1 2 3 4 5');
  const [frameCount, setFrameCount] = useState('3');
  const [simulationStates, setSimulationStates] = useState<SimulationState[]>([]);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<SimulationSpeed>('NORMAL');
  const [pageFaults, setPageFaults] = useState(0);
  const [hitRatio, setHitRatio] = useState(0);
  const animatedValues = useRef<Animated.Value[]>([]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedSimulation = localStorage.getItem('lastSimulation');
      if (savedSimulation) {
        const { referenceString: saved, frameCount: frames } = JSON.parse(savedSimulation);
        setReferenceString(saved);
        setFrameCount(frames);
      }
    }
  }, []);

  useEffect(() => {
    if (isPlaying && currentStateIndex < simulationStates.length - 1) {
      const speedMap = {
        SLOW: 1000,
        NORMAL: 500,
        FAST: 200,
      };

      const timer = setTimeout(() => {
        setCurrentStateIndex(prev => prev + 1);
      }, speedMap[speed]);

      return () => clearTimeout(timer);
    } else if (currentStateIndex === simulationStates.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStateIndex, simulationStates, speed]);

  const runSimulation = () => {
    const pages = referenceString.split(' ').map(p => p.trim()).filter(p => p !== '');
    const frames = parseInt(frameCount);
    
    if (isNaN(frames) || frames <= 0 || pages.length === 0) {
      return;
    }

    let states: SimulationState[] = [];
    let memory: string[] = [];
    let faults = 0;

    if (algorithm === 'FIFO') {
      pages.forEach((page, index) => {
        const isPageFault = !memory.includes(page);
        
        if (isPageFault) {
          faults++;
          if (memory.length >= frames) {
            memory.shift();
          }
          memory.push(page);
        }

        states.push({
          frames: [...memory],
          pageFault: isPageFault,
          referenceIndex: index,
        });
      });
    } else if (algorithm === 'LRU') {
      let lastUsed: { [key: string]: number } = {};
      
      pages.forEach((page, index) => {
        const isPageFault = !memory.includes(page);
        
        if (isPageFault) {
          faults++;
          if (memory.length >= frames) {
            let leastUsed = memory[0];
            let leastUsedIndex = lastUsed[memory[0]];
            
            memory.forEach(p => {
              if (lastUsed[p] < leastUsedIndex) {
                leastUsed = p;
                leastUsedIndex = lastUsed[p];
              }
            });
            
            memory = memory.filter(p => p !== leastUsed);
          }
          memory.push(page);
        }
        
        lastUsed[page] = index;
        states.push({
          frames: [...memory],
          pageFault: isPageFault,
          referenceIndex: index,
        });
      });
    } else if (algorithm === 'OPTIMAL') {
      pages.forEach((page, index) => {
        const isPageFault = !memory.includes(page);
        
        if (isPageFault) {
          faults++;
          if (memory.length >= frames) {
            let furthestPage = memory[0];
            let furthestDistance = -1;
            
            memory.forEach(p => {
              const nextUse = pages.slice(index + 1).indexOf(p);
              if (nextUse === -1) {
                furthestPage = p;
                return;
              }
              if (nextUse > furthestDistance) {
                furthestDistance = nextUse;
                furthestPage = p;
              }
            });
            
            memory = memory.filter(p => p !== furthestPage);
          }
          memory.push(page);
        }
        
        states.push({
          frames: [...memory],
          pageFault: isPageFault,
          referenceIndex: index,
        });
      });
    }

    const hitRatio = (pages.length - faults) / pages.length;
    
    setSimulationStates(states);
    setPageFaults(faults);
    setHitRatio(hitRatio);
    setCurrentStateIndex(0);
    setIsPlaying(true);

    if (Platform.OS === 'web') {
      const result: SimulationResult = {
        timestamp: Date.now(),
        algorithm,
        referenceString,
        frameCount: frames,
        pageFaults: faults,
        hitRatio,
        states,
      };
      localStorage.setItem('lastSimulation', JSON.stringify(result));
    }

    animatedValues.current = states[0].frames.map(() => new Animated.Value(0));
  };

  const reset = () => {
    setSimulationStates([]);
    setCurrentStateIndex(0);
    setIsPlaying(false);
    setPageFaults(0);
    setHitRatio(0);
  };

  const exportResults = async () => {
    const result: SimulationResult = {
      timestamp: Date.now(),
      algorithm,
      referenceString,
      frameCount: parseInt(frameCount),
      pageFaults,
      hitRatio,
      states: simulationStates,
    };

    if (Platform.OS === 'web') {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simulation-${Date.now()}.json`;
      a.click();
    } else {
      const path = `${FileSystem.documentDirectory}simulation-${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(path, JSON.stringify(result, null, 2));
      await Sharing.shareAsync(path);
    }
  };

  const shareResults = async () => {
    try {
      const message = `
Page Replacement Simulation Results
--------------------------------
Algorithm: ${algorithm}
Reference String: ${referenceString}
Frame Count: ${frameCount}
Page Faults: ${pageFaults}
Hit Ratio: ${(hitRatio * 100).toFixed(2)}%
Fault Ratio: ${((1 - hitRatio) * 100).toFixed(2)}%

Generated by Page Replacement Simulator
    `;

      if (Platform.OS === 'web') {
        try {
          await navigator.share({
            title: 'Page Replacement Simulation Results',
            text: message
          });
        } catch (err) {
          // Fallback for browsers that don't support Web Share API
          await navigator.clipboard.writeText(message);
          alert('Results copied to clipboard!');
        }
      } else {
        await Share.share({
          message,
          title: 'Page Replacement Simulation Results'
        });
      }
    } catch (error) {
      console.error('Error sharing results:', error);
      alert('Failed to share results. Please try again.');
    }
  };

  const currentState = simulationStates[currentStateIndex] || { frames: [], pageFault: false, referenceIndex: -1 };
  const pages = referenceString.split(' ').filter(p => p !== '');
  const styles = createStyles(isDark);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.controls}>
        <View style={styles.algorithmButtons}>
          {(['FIFO', 'LRU', 'OPTIMAL'] as Algorithm[]).map((alg) => (
            <TouchableOpacity
              key={alg}
              style={[
                styles.algorithmButton,
                algorithm === alg && styles.algorithmButtonActive,
              ]}
              onPress={() => setAlgorithm(alg)}
            >
              <Text
                style={[
                  styles.algorithmButtonText,
                  algorithm === alg && styles.algorithmButtonTextActive,
                ]}
              >
                {alg}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reference String (space-separated)</Text>
          <TextInput
            style={styles.input}
            value={referenceString}
            onChangeText={setReferenceString}
            placeholder="e.g., 1 2 3 4 1 2 5 1 2 3 4 5"
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Number of Frames</Text>
          <TextInput
            style={styles.input}
            value={frameCount}
            onChangeText={setFrameCount}
            keyboardType="numeric"
            placeholder="3"
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          />
        </View>

        <View style={styles.speedControl}>
          <Text style={styles.label}>Simulation Speed</Text>
          <View style={styles.speedButtons}>
            {(['SLOW', 'NORMAL', 'FAST'] as SimulationSpeed[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.speedButton,
                  speed === s && styles.speedButtonActive,
                ]}
                onPress={() => setSpeed(s)}
              >
                <Text
                  style={[
                    styles.speedButtonText,
                    speed === s && styles.speedButtonTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {simulationStates.length > 0 ? (
            <>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause size={20} color="#ffffff" />
                ) : (
                  <Play size={20} color="#ffffff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setCurrentStateIndex(prev => 
                  prev < simulationStates.length - 1 ? prev + 1 : prev
                )}
              >
                <StepForward size={20} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  setCurrentStateIndex(simulationStates.length - 1);
                  setIsPlaying(false);
                }}
              >
                <FastForward size={20} color="#ffffff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.button} onPress={runSimulation}>
              <Play size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Run Simulation</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <RotateCcw size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {simulationStates.length > 0 && (
        <View style={styles.results}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Simulation Results</Text>
            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={exportResults}
              >
                <Download size={20} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={shareResults}
              >
                <Share2 size={20} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Page Faults</Text>
              <Text style={styles.metricValue}>{pageFaults}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Hit Ratio</Text>
              <Text style={styles.metricValue}>
                {(hitRatio * 100).toFixed(2)}%
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Fault Ratio</Text>
              <Text style={styles.metricValue}>
                {((1 - hitRatio) * 100).toFixed(2)}%
              </Text>
            </View>
          </View>

          <View style={styles.referenceString}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {pages.map((page, index) => (
                <View
                  key={index}
                  style={[
                    styles.referencePage,
                    index === currentState.referenceIndex && styles.referencePageCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.referencePageText,
                      index === currentState.referenceIndex && styles.referencePageTextCurrent,
                    ]}
                  >
                    {page}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.frames}>
            {currentState.frames.map((page, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.frame,
                  currentState.pageFault && index === currentState.frames.length - 1 && styles.frameFault,
                ]}
              >
                <Text style={styles.frameText}>{page}</Text>
              </Animated.View>
            ))}
          </View>

          <View style={styles.status}>
            <Text style={styles.statusText}>
              {currentState.pageFault ? 'Page Fault' : 'Page Hit'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#1a1a1a' : '#f8fafc',
  },
  controls: {
    padding: 16,
  },
  algorithmButtons: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: isDark ? '#262626' : '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  algorithmButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  algorithmButtonActive: {
    backgroundColor: isDark ? '#333333' : '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  algorithmButtonText: {
    color: isDark ? '#94a3b8' : '#64748b',
    fontWeight: '600',
  },
  algorithmButtonTextActive: {
    color: '#0891b2',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#94a3b8' : '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: isDark ? '#262626' : '#ffffff',
    color: isDark ? '#ffffff' : '#000000',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: isDark ? '#404040' : '#e2e8f0',
  },
  speedControl: {
    marginBottom: 16,
  },
  speedButtons: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#262626' : '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  speedButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  speedButtonActive: {
    backgroundColor: isDark ? '#333333' : '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  speedButtonText: {
    color: isDark ? '#94a3b8' : '#64748b',
    fontWeight: '600',
  },
  speedButtonTextActive: {
    color: '#0891b2',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#0891b2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  controlButton: {
    backgroundColor: '#0891b2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  resetButton: {
    backgroundColor: isDark ? '#262626' : '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    color: isDark ? '#94a3b8' : '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: isDark ? '#262626' : '#f1f5f9',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
  },
  referenceString: {
    marginBottom: 24,
  },
  referencePage: {
    width: 40,
    height: 40,
    backgroundColor: isDark ? '#262626' : '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: isDark ? '#404040' : '#e2e8f0',
  },
  referencePageCurrent: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
  },
  referencePageText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
  },
  referencePageTextCurrent: {
    color: '#ffffff',
  },
  frames: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 16,
  },
  frame: {
    backgroundColor: isDark ? '#262626' : '#ffffff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#404040' : '#e2e8f0',
  },
  frameFault: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  frameText: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
  },
  status: {
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#94a3b8' : '#64748b',
  },
});