import { ScrollView, View, Text, StyleSheet, useColorScheme, Image } from 'react-native';

export default function LearnScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = createStyles(isDark);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
          style={styles.headerImage}
        />
        <Text style={styles.headerTitle}>Page Replacement Algorithms</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Introduction to Memory Management</Text>
        <Text style={styles.description}>
          Memory management is a crucial aspect of operating systems that handles and coordinates how applications use computer memory. Page replacement algorithms are essential components of virtual memory systems, helping manage limited physical memory resources efficiently.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Virtual Memory Concepts</Text>
        <Text style={styles.text}>
          Virtual memory is a memory management technique that provides an idealized abstraction of the storage resources that are actually available on a given machine. It creates the illusion to users of a very large (main) memory.
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>Key Benefits:</Text>
          <Text style={styles.point}>• Larger address space for programs</Text>
          <Text style={styles.point}>• Protection between processes</Text>
          <Text style={styles.point}>• Shared memory implementation</Text>
          <Text style={styles.point}>• Efficient memory utilization</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Page Faults</Text>
        <Text style={styles.text}>
          A page fault occurs when a program tries to access a page that is mapped in the virtual address space, but not loaded in physical memory. The operating system must then load the required page from secondary storage into main memory.
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>Types of Page Faults:</Text>
          <Text style={styles.point}>• Minor Page Faults: Page is in memory but not mapped</Text>
          <Text style={styles.point}>• Major Page Faults: Page must be loaded from disk</Text>
          <Text style={styles.point}>• Invalid Page Faults: Program tries to access invalid memory</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>FIFO (First-In-First-Out)</Text>
        <Text style={styles.text}>
          The simplest page replacement algorithm. It treats the page list as a FIFO queue, where the oldest page is at the front of the queue. When a page needs to be replaced, the page at the front of the queue is selected for removal.
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>Characteristics:</Text>
          <Text style={styles.point}>• Simple to implement and understand</Text>
          <Text style={styles.point}>• Low overhead in terms of implementation</Text>
          <Text style={styles.point}>• Can suffer from Belady's anomaly</Text>
          <Text style={styles.point}>• Not always optimal in practice</Text>
        </View>
        <Text style={styles.subtext}>
          Belady's Anomaly: A phenomenon where increasing the number of page frames results in an increase in the number of page faults.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>LRU (Least Recently Used)</Text>
        <Text style={styles.text}>
          LRU replaces the page that hasn't been used for the longest period. It's based on the locality of reference principle: if a page has been frequently accessed recently, it's likely to be accessed again in the near future.
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>Implementation Methods:</Text>
          <Text style={styles.point}>• Counter Implementation: Timestamp for each page</Text>
          <Text style={styles.point}>• Stack Implementation: Double-linked list</Text>
          <Text style={styles.point}>• Reference Bit Implementation: Hardware support</Text>
        </View>
        <Text style={styles.subtext}>
          LRU is considered one of the most effective page replacement algorithms but can be expensive to implement perfectly.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Optimal Page Replacement</Text>
        <Text style={styles.text}>
          The theoretical best page replacement algorithm. It replaces the page that will not be used for the longest period in the future. While impossible to implement in practice (as it requires future knowledge), it serves as a benchmark for other algorithms.
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>Key Points:</Text>
          <Text style={styles.point}>• Provides the lowest possible page fault rate</Text>
          <Text style={styles.point}>• Used as a theoretical benchmark</Text>
          <Text style={styles.point}>• Requires knowledge of future page references</Text>
          <Text style={styles.point}>• Not implementable in real systems</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Clock Algorithm</Text>
        <Text style={styles.text}>
          Also known as the Second Chance algorithm, it's a more efficient version of FIFO that checks whether a page has been accessed before replacing it. It uses a circular list of pages with a reference bit for each page.
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>Advantages:</Text>
          <Text style={styles.point}>• Better performance than FIFO</Text>
          <Text style={styles.point}>• Simple to implement</Text>
          <Text style={styles.point}>• Low overhead</Text>
          <Text style={styles.point}>• Good approximation of LRU</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>NFU (Not Frequently Used)</Text>
        <Text style={styles.text}>
          NFU keeps a counter for each page, which is incremented each time the page is referenced. When a page needs to be replaced, the page with the lowest counter value is chosen.
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>Characteristics:</Text>
          <Text style={styles.point}>• Simple counting mechanism</Text>
          <Text style={styles.point}>• Can be implemented with software counters</Text>
          <Text style={styles.point}>• May not reflect recent usage patterns</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Aging Algorithm</Text>
        <Text style={styles.text}>
          An enhancement of NFU that gives more weight to recent references. It shifts the counter right by one bit and adds the new reference bit to the leftmost position periodically.
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>Benefits:</Text>
          <Text style={styles.point}>• Better approximation of LRU</Text>
          <Text style={styles.point}>• Considers historical and recent usage</Text>
          <Text style={styles.point}>• Efficient implementation possible</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Working Set Model</Text>
        <Text style={styles.text}>
          The working set model is based on the principle of locality. It keeps track of the set of pages that a process is currently using, called its working set.
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>Components:</Text>
          <Text style={styles.point}>• Working Set Window</Text>
          <Text style={styles.point}>• Working Set Size</Text>
          <Text style={styles.point}>• Page Fault Frequency</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Performance Considerations</Text>
        <Text style={styles.text}>
          When choosing a page replacement algorithm, several factors need to be considered:
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>Key Metrics:</Text>
          <Text style={styles.point}>• Page Fault Rate</Text>
          <Text style={styles.point}>• Memory Access Time</Text>
          <Text style={styles.point}>• Implementation Overhead</Text>
          <Text style={styles.point}>• Hardware Requirements</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Implementation Challenges</Text>
        <Text style={styles.text}>
          Real-world implementation of page replacement algorithms faces several challenges:
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>Common Issues:</Text>
          <Text style={styles.point}>• Hardware limitations</Text>
          <Text style={styles.point}>• Performance overhead</Text>
          <Text style={styles.point}>• Memory access patterns</Text>
          <Text style={styles.point}>• System workload variations</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Modern Developments</Text>
        <Text style={styles.text}>
          Recent developments in page replacement algorithms focus on adapting to modern computing environments:
        </Text>
        <View style={styles.keyPoints}>
          <Text style={styles.pointTitle}>New Approaches:</Text>
          <Text style={styles.point}>• Machine learning-based prediction</Text>
          <Text style={styles.point}>• Hybrid algorithms</Text>
          <Text style={styles.point}>• Workload-specific optimization</Text>
          <Text style={styles.point}>• Multi-level memory hierarchies</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#1a1a1a' : '#f8fafc',
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  headerTitle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    fontSize: 32,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#0f172a',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  section: {
    padding: 20,
    backgroundColor: isDark ? '#262626' : '#ffffff',
    marginBottom: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#e2e8f0' : '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#334155',
    lineHeight: 24,
  },
  text: {
    fontSize: 15,
    color: isDark ? '#94a3b8' : '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  keyPoints: {
    backgroundColor: isDark ? '#333333' : '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#e2e8f0' : '#1e293b',
    marginBottom: 8,
  },
  point: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#475569',
    marginBottom: 4,
    paddingLeft: 8,
  },
  subtext: {
    fontSize: 14,
    color: isDark ? '#64748b' : '#64748b',
    fontStyle: 'italic',
    marginTop: 8,
  },
});