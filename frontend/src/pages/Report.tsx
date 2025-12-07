import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, CheckCircle, Lightbulb, Pill, Activity, Utensils, Bot, Download, Share2 } from 'lucide-react-native';

const SimplePieChart = () => {
    // A simplified visual representation of 85% completion
    return (
        <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{
                position: 'absolute',
                width: 88,
                height: 88,
                borderRadius: 44,
                borderWidth: 8,
                borderColor: '#e5e7eb',
            }} />
            <View style={{
                position: 'absolute',
                width: 88,
                height: 88,
                borderRadius: 44,
                borderWidth: 8,
                borderColor: '#1392ec',
                borderLeftColor: 'transparent',
                borderBottomColor: 'transparent',
                transform: [{ rotate: '-45deg'}]
            }} />
             <View style={{
                position: 'absolute',
                width: 88,
                height: 88,
                borderRadius: 44,
                borderWidth: 8,
                borderColor: '#1392ec',
                borderRightColor: 'transparent',
                borderTopColor: 'transparent',
                 transform: [{ rotate: '-45deg'}]
            }} />
             {/* Text overlay */}
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111518' }}>85%</Text>
        </View>
    )
}

export const Report: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ChevronLeft size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reporte Mensual</Text>
            <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.reportTitle}>Reporte de Mayo 2024</Text>
            <Text style={styles.patientName}>Elena García</Text>

            {/* Executive Summary */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Resumen Ejecutivo</Text>
                <View style={styles.summaryRow}>
                    <SimplePieChart />
                    <View style={styles.summaryList}>
                        <View style={styles.summaryItem}>
                            <CheckCircle color="#22c55e" size={20} />
                            <Text style={styles.summaryText}>
                                <Text style={styles.boldText}>Logros:</Text> Mejora en la adherencia a la medicación.
                            </Text>
                        </View>
                         <View style={styles.summaryItem}>
                            <Lightbulb color="#f97316" size={20} />
                            <Text style={styles.summaryText}>
                                <Text style={styles.boldText}>A mejorar:</Text> Aumentar la ingesta de agua diaria.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Adherence */}
            <Text style={styles.sectionTitle}>Adherencia a Recomendaciones</Text>
            <View style={[styles.card, styles.adherenceCard]}>
                {/* Meds */}
                <View style={styles.adherenceItem}>
                    <View style={[styles.iconBg, { backgroundColor: 'rgba(19, 146, 236, 0.2)' }]}>
                        <Pill color="#1392ec" size={20} />
                    </View>
                    <View style={styles.progressContent}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Medicación</Text>
                            <Text style={styles.progressValue}>95%</Text>
                        </View>
                        <View style={styles.track}>
                            <View style={[styles.fill, { width: '95%', backgroundColor: '#1392ec' }]} />
                        </View>
                    </View>
                </View>

                {/* Activity */}
                <View style={styles.adherenceItem}>
                    <View style={[styles.iconBg, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                        <Activity color="#22c55e" size={20} />
                    </View>
                    <View style={styles.progressContent}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Actividad Física</Text>
                            <Text style={styles.progressValue}>70%</Text>
                        </View>
                        <View style={styles.track}>
                            <View style={[styles.fill, { width: '70%', backgroundColor: '#22c55e' }]} />
                        </View>
                    </View>
                </View>

                {/* Nutrition */}
                <View style={styles.adherenceItem}>
                    <View style={[styles.iconBg, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                        <Utensils color="#f97316" size={20} />
                    </View>
                    <View style={styles.progressContent}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Nutrición</Text>
                            <Text style={styles.progressValue}>82%</Text>
                        </View>
                        <View style={styles.track}>
                            <View style={[styles.fill, { width: '82%', backgroundColor: '#f97316' }]} />
                        </View>
                    </View>
                </View>
            </View>

            {/* AI Insights */}
            <Text style={styles.sectionTitle}>Análisis de Victoria</Text>
            <View style={styles.aiCard}>
                <View style={styles.aiHeader}>
                    <View style={styles.botIcon}>
                        <Bot size={24} color="white" />
                    </View>
                    <Text style={styles.aiTitle}>Insights y Recomendaciones</Text>
                </View>
                <View style={styles.aiContent}>
                    <Text style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text> Se observa una excelente consistencia en la toma de medicamentos matutinos. ¡Gran trabajo!
                    </Text>
                     <Text style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text> Para el próximo mes, propongo establecer recordatorios para beber un vaso de agua cada 2 horas.
                    </Text>
                     <Text style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text> Sugiero incorporar una caminata de 15 minutos después del almuerzo para alcanzar el objetivo de actividad física.
                    </Text>
                </View>
            </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
            <View style={styles.footerRow}>
                <TouchableOpacity style={styles.outlineButton}>
                    <Download size={20} color="#1392ec" />
                    <Text style={styles.outlineButtonText}>Descargar PDF</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.fillButton}>
                    <Share2 size={20} color="white" />
                    <Text style={styles.fillButtonText}>Compartir</Text>
                </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(246, 247, 248, 0.9)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111518',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111518',
    marginTop: 8,
  },
  patientName: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111518',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  summaryList: {
    flex: 1,
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '600',
    color: '#111518',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111518',
    marginBottom: 12,
  },
  adherenceCard: {
    gap: 20,
  },
  adherenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContent: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111518',
  },
  track: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  aiCard: {
    backgroundColor: 'rgba(19, 146, 236, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  botIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1392ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111518',
  },
  aiContent: {
    gap: 12,
    paddingLeft: 4,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  bullet: {
    color: '#9ca3af',
    marginRight: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  outlineButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1392ec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineButtonText: {
    color: '#1392ec',
    fontWeight: '600',
    fontSize: 16,
  },
  fillButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1392ec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fillButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
