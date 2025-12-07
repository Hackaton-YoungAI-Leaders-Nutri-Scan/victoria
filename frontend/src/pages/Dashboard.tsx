import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronDown, 
  Droplet, 
  Utensils, 
  Footprints, 
  Smile, 
  Activity,
  Pill
} from 'lucide-react-native';
import { BottomNav } from '../components/BottomNav';

const { width } = Dimensions.get('window');

const SimpleBarChart = ({ data }: { data: any[] }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    return (
        <View style={styles.chartContainer}>
            <View style={styles.barsRow}>
                {data.map((item, index) => (
                    <View key={index} style={styles.barColumn}>
                        <View style={[styles.bar, { height: (item.value / maxValue) * 120 }]} />
                        <Text style={styles.barLabel}>{item.name}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const SimpleAreaChartPlaceholder = () => {
    // A simplified visual representation using Views for a "chart-like" look since SVG implies extra deps
    return (
        <View style={styles.chartContainer}>
            <View style={styles.areaChartBg}>
                <View style={[styles.areaPoint, { left: '10%', bottom: '30%' }]} />
                <View style={[styles.areaPoint, { left: '25%', bottom: '50%' }]} />
                <View style={[styles.areaPoint, { left: '40%', bottom: '45%' }]} />
                <View style={[styles.areaPoint, { left: '55%', bottom: '70%' }]} />
                <View style={[styles.areaPoint, { left: '70%', bottom: '55%' }]} />
                <View style={[styles.areaPoint, { left: '85%', bottom: '80%' }]} />
                
                {/* Simulated connection line/area would ideally use SVG */}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(19, 146, 236, 0.1)', borderTopWidth: 2, borderTopColor: '#1392ec', transform: [{ skewY: '-5deg'}] }} />
            </View>
        </View>
    )
}

export const Dashboard: React.FC = () => {
  const navigation = useNavigation<any>();

  const stepsData = [
    { name: 'L', value: 4000 },
    { name: 'M', value: 3000 },
    { name: 'X', value: 6000 },
    { name: 'J', value: 8000 },
    { name: 'V', value: 5000 },
    { name: 'S', value: 9000 },
    { name: 'D', value: 7000 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <View style={styles.profileContainer}>
                <Image 
                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAv9PLR3_xgWvvLHy6thjn0D1u3jfJeb7PpZzJ_OFt7LXbuLyJX2hEBZh2LvSJT8guoipbNEF9qvu9Xl1WQ6JBT2RIKRGeP2PmBASYk3Ak55PltJGQ_g5bebs3i5zk26UwTK8HvJzhB0lkwoBd-G2V31h36iT85Furv41zWL5rZ8pk4jXQy5dplVF0q78xDgmLFZ4cLUTelO93oy1xvqBJWHHGP8tIKnAURBLFKWoJCie15niv4nZlwoFg0yvlMhXkPn6QpBqztruc" }}
                    style={styles.profileImage}
                />
            </View>
            <TouchableOpacity style={styles.dropdownButton}>
                <ChevronDown size={24} color="#111518" />
            </TouchableOpacity>
        </View>
        <Text style={styles.userName}>María García</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.statusCard}>
            <Image 
                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQFEiZuTWm_GI2kwrpy_ha-vkskELlRVyUh4sq95XzSmmSsIOZDlPPWbH294-IDrzpf3WtUSRG2tn-mG6t0ETLAYqPSDvowJh6uny0mkzUMv6JK-0v5pjwWUbOwA2AHj3wh_OQ3hBh9vV61F4DX7Kd4brBUh9bBJDzqYq6KQr41HnQOOqycfbGWlNS6tJx434XY_fwCWKQv2m4VRghUGoxEPDuFrErAub9VmELPi46ykIPXbRgBGBizwKKz-qk66G0xhW7-OU-QL0" }}
                style={styles.statusImage}
            />
            <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>Todo parece estar bien hoy</Text>
                <Text style={styles.statusDesc}>
                    Victoria no ha detectado nada inusual. La última interacción fue hace 5 minutos.
                </Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Report')}
                    style={styles.reportButton}
                >
                    <Text style={styles.reportButtonText}>Ver resumen completo</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Quick Stats Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel} contentContainerStyle={styles.carouselContent}>
            {[
                { Icon: Droplet, label: 'Hidratación', val: '1.5L / 2L' },
                { Icon: Utensils, label: 'Comidas', val: '2 / 3' },
                { Icon: Footprints, label: 'Actividad', val: '3,450 pasos' },
                { Icon: Smile, label: 'Ánimo', val: 'Bueno' },
            ].map((stat, i) => (
                <View key={i} style={styles.statCard}>
                    <View style={styles.statIconBg}>
                        <stat.Icon size={32} color="#1392ec" />
                    </View>
                    <View>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                        <Text style={styles.statValue}>{stat.val}</Text>
                    </View>
                </View>
            ))}
        </ScrollView>

        {/* Recent Activity */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <View style={styles.activityCard}>
                <View style={styles.timeline}>
                    <View style={styles.timelineLine} />
                    
                    {/* Item 1 */}
                    <View style={styles.timelineItem}>
                        <View style={styles.timelineIconBg}>
                            <Smile size={20} color="#1392ec" />
                        </View>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Reporte de ánimo: Feliz</Text>
                            <Text style={styles.timelineTime}>10:15 AM</Text>
                        </View>
                    </View>

                    {/* Item 2 */}
                    <View style={styles.timelineItem}>
                        <View style={styles.timelineIconBg}>
                            <Utensils size={20} color="#1392ec" />
                        </View>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Desayuno registrado</Text>
                            <Text style={styles.timelineTime}>9:00 AM</Text>
                        </View>
                    </View>

                     {/* Item 3 */}
                     <View style={styles.timelineItem}>
                        <View style={styles.timelineIconBg}>
                            <Pill size={20} color="#1392ec" />
                        </View>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Medicación tomada</Text>
                            <Text style={styles.timelineTime}>8:30 AM</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>

        {/* Weekly Trends */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tendencias Semanales</Text>
                <TouchableOpacity>
                    <Text style={styles.seeMore}>Ver más</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.grid}>
                {/* Mood Chart */}
                <View style={styles.gridItem}>
                    <Text style={styles.gridTitle}>Estado de Ánimo</Text>
                    <Text style={styles.gridSubtitle}>Últimos 7 días</Text>
                    <SimpleAreaChartPlaceholder />
                </View>

                {/* Steps Chart */}
                <View style={styles.gridItem}>
                    <Text style={styles.gridTitle}>Pasos Diarios</Text>
                    <Text style={styles.gridSubtitle}>Últimos 7 días</Text>
                    <SimpleBarChart data={stepsData} />
                </View>
            </View>
        </View>
      </ScrollView>
      
      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dropdownButton: {
    padding: 8,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111518',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statusCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusImage: {
    width: '100%',
    height: 128,
  },
  statusContent: {
    padding: 16,
    gap: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111518',
  },
  statusDesc: {
    fontSize: 14,
    color: '#617989',
    lineHeight: 20,
  },
  reportButton: {
    backgroundColor: '#1392ec',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  carousel: {
    paddingLeft: 16,
    paddingBottom: 16,
  },
  carouselContent: {
    paddingRight: 16,
    gap: 12,
  },
  statCard: {
    minWidth: 140,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconBg: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(19, 146, 236, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111518',
  },
  statValue: {
    fontSize: 14,
    color: '#617989',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111518',
    marginBottom: 12,
  },
  seeMore: {
    color: '#1392ec',
    fontSize: 14,
    fontWeight: '500',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timeline: {
    position: 'relative',
    gap: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 16,
    bottom: 16,
    width: 2,
    backgroundColor: '#f3f4f6',
    zIndex: -1,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  timelineIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineContent: {
    paddingTop: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111518',
  },
  timelineTime: {
    fontSize: 14,
    color: '#617989',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: (width - 48) / 2, // 2 column grid
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111518',
  },
  gridSubtitle: {
    fontSize: 14,
    color: '#617989',
    marginBottom: 16,
  },
  chartContainer: {
    height: 140,
    width: '100%',
    justifyContent: 'flex-end',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
  barColumn: {
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: 8,
    backgroundColor: '#64748b',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  areaChartBg: {
    flex: 1,
    backgroundColor: '#101a22',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  areaPoint: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1392ec',
  },
});
