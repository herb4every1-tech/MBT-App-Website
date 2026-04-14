import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Circle } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', borderBottomStyle: 'solid', paddingBottom: 10, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#5D8A75' },
  headerInfo: { fontSize: 10, color: '#6b7280', textAlign: 'right', lineHeight: 1.4 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginTop: 20, marginBottom: 10, textTransform: 'uppercase' },
  
  // Score Card
  scoreCard: { flexDirection: 'row', backgroundColor: '#f9fafb', padding: 20, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  scoreRingContainer: { width: 80, height: 80, marginRight: 20, position: 'relative' },
  scoreTextWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  scoreNumber: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  scoreLabel: { fontSize: 8, color: '#9ca3af', textTransform: 'uppercase' },
  scoreContent: { flex: 1 },
  scoreTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  scoreDesc: { fontSize: 11, color: '#4b5563', lineHeight: 1.5 },

  // Table
  table: { width: '100%', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', borderBottomStyle: 'solid', paddingBottom: 8, marginBottom: 8 },
  tableHeaderCell: { fontSize: 9, color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', borderBottomStyle: 'solid', paddingVertical: 8, alignItems: 'center' },
  col1: { width: '40%', fontSize: 10, fontWeight: 'bold', color: '#374151' },
  col2: { width: '35%', fontSize: 10, color: '#4b5563' },
  col3: { width: '25%', alignItems: 'flex-end' },
  
  // Badges
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },
  badgeNormal: { backgroundColor: '#ecfdf5', color: '#059669' },
  badgeBorderline: { backgroundColor: '#fffbeb', color: '#d97706' },
  badgeAlert: { backgroundColor: '#fef2f2', color: '#dc2626' },

  // Insights
  insightCard: { backgroundColor: '#f9fafb', padding: 15, borderRadius: 8, marginBottom: 10 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  insightMarker: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
  insightMeaning: { fontSize: 10, color: '#4b5563', marginBottom: 8, lineHeight: 1.4 },
  
  // Action Plan
  actionStep: { flexDirection: 'row', marginBottom: 15 },
  actionNumberContainer: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#5D8A75', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionNumber: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  actionContent: { flex: 1, backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 },
  actionTitle: { fontSize: 12, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  actionDesc: { fontSize: 10, color: '#4b5563', lineHeight: 1.4 },

  // Dietary Recommendations
  dietGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  dietCard: { width: '48%', padding: 15, borderRadius: 12, borderWidth: 1, borderStyle: 'solid' },
  dietCardEat: { backgroundColor: '#ecfdf5', borderColor: '#d1fae5' },
  dietCardReduce: { backgroundColor: '#fef2f2', borderColor: '#fee2e2' },
  dietTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  dietTitleEat: { color: '#065f46' },
  dietTitleReduce: { color: '#991b1b' },
  dietItems: { flexDirection: 'row', flexWrap: 'wrap' },
  dietItem: { backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderStyle: 'solid', flexDirection: 'row', alignItems: 'center', marginRight: 6, marginBottom: 6 },
  dietItemEat: { borderColor: '#a7f3d0' },
  dietItemReduce: { borderColor: '#fecaca' },
  dietItemTextEat: { fontSize: 9, fontWeight: 'bold', color: '#064e3b' },
  dietItemTextReduce: { fontSize: 9, fontWeight: 'bold', color: '#7f1d1d' },
});

const getStatusColor = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'high' || s === 'low') return '#ef4444';
  if (s === 'borderline') return '#eab308';
  return '#10b981';
};

const getBadgeStyle = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'high' || s === 'low') return styles.badgeAlert;
  if (s === 'borderline') return styles.badgeBorderline;
  return styles.badgeNormal;
};

export const AnalysisPDFDocument = ({ result, profile, date }: { result: any, profile?: any, date: string }) => {
  const score = result.score || 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const scoreColor = getStatusColor(score >= 80 ? 'normal' : score >= 60 ? 'borderline' : 'high');

  const tableData = Array.isArray(result) ? result : (result.table || []);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MBT Health</Text>
          <View>
            <Text style={styles.headerInfo}>Patient: {profile?.full_name || 'User'}</Text>
            <Text style={styles.headerInfo}>Date: {date}</Text>
          </View>
        </View>

        {/* Overall Score */}
        {result.summary && (
          <View style={styles.scoreCard} wrap={false}>
            <View style={styles.scoreRingContainer}>
              <Svg viewBox="0 0 80 80" width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
                <Circle cx={40} cy={40} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={6} />
                <Circle 
                  cx={40} cy={40} r={radius} 
                  fill="none" stroke={scoreColor} strokeWidth={6} 
                  {...{
                    strokeDasharray: `${circumference}`,
                    strokeDashoffset: `${strokeDashoffset}`
                  } as any}
                />
              </Svg>
              <View style={styles.scoreTextWrapper}>
                <Text style={styles.scoreNumber}>{result.score !== null ? score : 'N/A'}</Text>
                <Text style={styles.scoreLabel}>{result.score !== null ? 'out of 100' : 'Report'}</Text>
              </View>
            </View>
            <View style={styles.scoreContent}>
              <Text style={styles.scoreTitle}>Overall Health Score</Text>
              <Text style={styles.scoreDesc}>{result.summary || ''}</Text>
            </View>
          </View>
        )}

        {/* Detailed Markers */}
        {tableData.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Detailed Markers</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.col1]}>Parameter</Text>
                <Text style={[styles.tableHeaderCell, styles.col2]}>Value</Text>
                <Text style={[styles.tableHeaderCell, styles.col3, { textAlign: 'right' }]}>Status</Text>
              </View>
              {tableData.map((item: any, i: number) => {
                const badgeStyle = getBadgeStyle(item.status);
                return (
                  <View key={i} style={styles.tableRow} wrap={false}>
                    <Text style={styles.col1}>{item.parameter || ''}</Text>
                    <Text style={styles.col2}>{item.value || ''} {item.unit || ''}</Text>
                    <View style={styles.col3}>
                      <View style={[styles.badge, badgeStyle]}>
                        <Text style={styles.badgeText}>{item.status || 'UNKNOWN'}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Insights */}
        {result.insights && result.insights.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Insights on Abnormal Markers</Text>
            {result.insights.map((insight: any, i: number) => (
              <View key={i} style={styles.insightCard} wrap={false}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightMarker}>! {insight.marker || ''}</Text>
                </View>
                <Text style={styles.insightMeaning}>{insight.meaning || ''}</Text>
                {insight.tips && insight.tips.length > 0 && (
                  <View style={{ marginTop: 5 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#374151', marginBottom: 2 }}>Tips:</Text>
                    {insight.tips.map((tip: string, j: number) => (
                      <Text key={j} style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>• {tip || ''}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action Plan */}
        {result.actionPlan && result.actionPlan.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Your Action Plan</Text>
            {result.actionPlan.map((step: any, i: number) => (
              <View key={i} style={styles.actionStep} wrap={false}>
                <View style={styles.actionNumberContainer}>
                  <Text style={styles.actionNumber}>{i + 1}</Text>
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{step.action || step.title || ''}</Text>
                  <Text style={styles.actionDesc}>{step.description || ''}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Dietary Recommendations */}
        {result.foods && (result.foods.eatMore?.length > 0 || result.foods.reduce?.length > 0) && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Dietary Recommendations</Text>
            <View style={styles.dietGrid}>
              {/* Eat More */}
              {result.foods.eatMore?.length > 0 && (
                <View style={[styles.dietCard, styles.dietCardEat]}>
                  <Text style={[styles.dietTitle, styles.dietTitleEat]}>↑ Eat More</Text>
                  <View style={styles.dietItems}>
                    {result.foods.eatMore.map((food: any, idx: number) => (
                      <View key={idx} style={[styles.dietItem, styles.dietItemEat]}>
                        <Text style={styles.dietItemTextEat}>{food.name || ''}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Reduce or Avoid */}
              {result.foods.reduce?.length > 0 && (
                <View style={[styles.dietCard, styles.dietCardReduce]}>
                  <Text style={[styles.dietTitle, styles.dietTitleReduce]}>↓ Reduce or Avoid</Text>
                  <View style={styles.dietItems}>
                    {result.foods.reduce.map((food: any, idx: number) => (
                      <View key={idx} style={[styles.dietItem, styles.dietItemReduce]}>
                        <Text style={styles.dietItemTextReduce}>{food.name || ''}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default AnalysisPDFDocument;
