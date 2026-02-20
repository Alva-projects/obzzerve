import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { getObservations, getSeasonStats } from '../utils/storage';
import Hexagon from '../components/Hexagon';
import LoadingBee from '../components/LoadingBee';
import { BeeColors } from '../constants/Colors';

const { width } = Dimensions.get('window');

// Hexagon-inställningar – justera HEX_SIZE om du vill ändra storlek
const HEX_SIZE = 30;
const HEX_W = HEX_SIZE * 0.866;
const HEX_H = HEX_SIZE;
const SPACING = 1.0;
const PAD = 30;

const HomeScreen = ({ navigation, route }) => {
  const [observations, setObservations] = useState([]);
  const [seasonStats, setSeasonStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (route?.params?.refresh) loadData();
  }, [route?.params?.refresh]);

  const loadData = async () => {
    setLoading(true);
    const [data, stats] = await Promise.all([getObservations(), getSeasonStats()]);
    setObservations(data);
    setSeasonStats(stats);
    setLoading(false);
  };

  const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / 86400000);
  };

  const getObservationForDay = (dayNumber) =>
    observations.find(obs => getDayOfYear(new Date(obs.date)) === dayNumber);

  const getSeasonForDay = (d) => {
    if (d >= 60 && d < 152) return 'Vår';
    if (d >= 152 && d < 244) return 'Sommar';
    if (d >= 244 && d < 335) return 'Höst';
    return 'Vinter';
  };

  const getSeasonColor = (season) => {
    const map = { Vår: BeeColors.spring, Sommar: BeeColors.summer, Höst: BeeColors.autumn, Vinter: BeeColors.winter };
    return map[season] ?? BeeColors.honeycomb;
  };

  const getSeasonEmoji = (season) => {
    const map = { Vår: '🌼', Sommar: '☀️', Höst: '🍂', Vinter: '❄️' };
    return map[season] ?? '🌿';
  };

  const renderHoneycomb = () => {
    const cols = Math.floor((width - PAD) / (HEX_W * SPACING));
    const rows = Math.ceil(365 / cols);
    const hexagons = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const dayNumber = row * cols + col + 1;
        if (dayNumber > 365) break;

        const obs = getObservationForDay(dayNumber);
        const x = col * HEX_W * SPACING + (row % 2) * (HEX_W * SPACING / 2);
        const y = row * HEX_H * 0.75;

        hexagons.push(
          <View key={dayNumber} style={{ position: 'absolute', left: x, top: y }}>
            <Hexagon
              size={HEX_SIZE}
              color={obs ? BeeColors.honey : BeeColors.pollen}
              image={obs?.image}
              isEmpty={false}
              onPress={() => {
                if (obs) {
                  navigation.navigate('ObservationDetail', { observation: obs });
                } else {
                  const date = new Date(year, 0, dayNumber);
                  navigation.navigate('AddObservation', {
                    retroactiveDate: date.toISOString(),
                    dayNumber,
                    defaultSeason: getSeasonForDay(dayNumber),
                  });
                }
              }}
            />
          </View>
        );
      }
    }
    return { hexagons, rows, cols };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingBee size={80} />
        <Text style={styles.loadingText}>Flyger till bikupan...</Text>
      </View>
    );
  }

  const totalNectar = observations.length;
  const progress = Math.round((totalNectar / 365) * 100);

  const cols = Math.floor((width - PAD) / (HEX_W * SPACING));
  const rows = Math.ceil(365 / cols);
  const honeycombHeight = rows * HEX_H * 0.75 + HEX_H + 10;

  const { hexagons } = renderHoneycomb();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mina obzzervationer {year}</Text>
        <Text style={styles.subtitle}>Samla arter likt ett bi samlar nektar!</Text>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>🍯 Nektar Samlat</Text>
        <Text style={styles.progressNumber}>{totalNectar} / 365</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}% av årets utmaning!</Text>
      </View>

      <View style={styles.seasonStatsContainer}>
        <Text style={styles.sectionTitle}>Nektar per årstid</Text>
        <View style={styles.seasonStatsRow}>
          {Object.entries(seasonStats).map(([season, count]) => (
            <TouchableOpacity
              key={season}
              style={[styles.seasonStatCard, { backgroundColor: getSeasonColor(season) }]}
              onPress={() => navigation.navigate(season)}
            >
              <Text style={styles.seasonStatEmoji}>{getSeasonEmoji(season)}</Text>
              <Text style={styles.seasonStatCount}>{count || 0}</Text>
              <Text style={styles.seasonStatLabel}>{season}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.honeycombSection}>
        <Text style={styles.sectionTitle}>🐝 Din Bikupa – 365 Dagar</Text>
        <View style={[styles.honeycomb, { height: honeycombHeight }]}>
          {hexagons}
        </View>
      </View>

      <TouchableOpacity
        style={styles.collectButton}
        onPress={() => navigation.navigate('AddObservation')}
      >
        <Text style={styles.collectButtonText}>Samla nektar</Text>
      </TouchableOpacity>

      {totalNectar > 0 && (
        <View style={styles.funStatsCard}>
          <Text style={styles.funStatsTitle}>Bi-Fakta</Text>
          <Text style={styles.funStatsText}>
            Du har samlat nektar {totalNectar} gånger! Ett bi besöker ca 5 000 blommor per dag. Du är på god väg! 🌻
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BeeColors.honeycomb },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BeeColors.honeycomb },
  loadingText: { marginTop: 20, fontSize: 18, color: BeeColors.honey, fontWeight: '600' },
  header: { padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: BeeColors.honey, marginBottom: 5 },
  subtitle: { fontSize: 16, color: BeeColors.honeyDark, fontStyle: 'italic' },
  progressCard: {
    backgroundColor: BeeColors.white, margin: 20, marginTop: 10, padding: 20,
    borderRadius: 15, alignItems: 'center', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  progressTitle: { fontSize: 20, fontWeight: 'bold', color: BeeColors.honey, marginBottom: 10 },
  progressNumber: { fontSize: 36, fontWeight: 'bold', color: BeeColors.honeyDark, marginBottom: 15 },
  progressBarContainer: {
    width: '100%', height: 20, backgroundColor: BeeColors.honeycomb,
    borderRadius: 10, overflow: 'hidden', marginBottom: 10,
  },
  progressBar: { height: '100%', backgroundColor: BeeColors.honey, borderRadius: 10 },
  progressText: { fontSize: 14, color: BeeColors.honeyDark, fontWeight: '600' },
  seasonStatsContainer: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: BeeColors.honeyDark, marginBottom: 15 },
  seasonStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  seasonStatCard: {
    flex: 1, margin: 4, padding: 15, borderRadius: 12, alignItems: 'center', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
  },
  seasonStatEmoji: { fontSize: 28, marginBottom: 5 },
  seasonStatCount: { fontSize: 24, fontWeight: 'bold', color: BeeColors.white },
  seasonStatLabel: { fontSize: 11.5, color: BeeColors.white, marginTop: 4, fontWeight: '600' },
  honeycombSection: { paddingHorizontal: 20, marginBottom: 20 },
  honeycombHint: { fontSize: 12, color: BeeColors.honeyDark, marginBottom: 10, fontStyle: 'italic' },
  honeycomb: { position: 'relative', width: '100%' },
  collectButton: {
    backgroundColor: BeeColors.honey, marginHorizontal: 20, padding: 18,
    borderRadius: 15, alignItems: 'center', marginBottom: 20, elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  collectButtonText: { color: BeeColors.white, fontSize: 20, fontWeight: 'bold' },
  funStatsCard: {
    backgroundColor: BeeColors.white, marginHorizontal: 20, marginBottom: 30,
    padding: 20, borderRadius: 15, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  funStatsTitle: { fontSize: 18, fontWeight: 'bold', color: BeeColors.honey, marginBottom: 10 },
  funStatsText: { fontSize: 14, color: BeeColors.honeyDark, lineHeight: 20 },
});

export default HomeScreen;