import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ScrollView, TextInput, Dimensions,
} from 'react-native';
import { getObservationsBySeason } from '../utils/storage';
import Hexagon from '../components/Hexagon';
import { BeeColors } from '../constants/Colors';

const { width } = Dimensions.get('window');

const SeasonScreen = ({ route, navigation }) => {
  const { season } = route.params;
  const [observations, setObservations] = useState([]);
  const [filteredObservations, setFilteredObservations] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadObservations();
    const unsubscribe = navigation.addListener('focus', loadObservations);
    return unsubscribe;
  }, [navigation, season]);

  const loadObservations = async () => {
    const data = await getObservationsBySeason(season);
    setObservations(data);
    setFilteredObservations(data);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredObservations(observations);
    } else {
      const filtered = observations.filter(obs =>
        obs.title.toLowerCase().includes(query.toLowerCase()) ||
        (obs.description || '').toLowerCase().includes(query.toLowerCase()) ||
        (obs.tags || []).some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredObservations(filtered);
    }
  };

  // Navigera till AddObservation – skickar med returnTo så man kommer tillbaka hit
  const goToAddObservation = () => {
    navigation.navigate('AddObservation', {
      defaultSeason: season,
      returnTo: 'season',
      returnSeason: season,
    });
  };

  const getSeasonEmoji = () => {
    const map = { Vår: '🌼', Sommar: '☀️', Höst: '🍂', Vinter: '❄️' };
    return map[season] ?? '🌿';
  };

  const getSeasonColor = () => {
    const map = { Vår: BeeColors.spring, Sommar: BeeColors.summer, Höst: BeeColors.autumn, Vinter: BeeColors.winter };
    return map[season] ?? BeeColors.honeycomb;
  };

  // --- HEXAGON-VY ---
  const renderHexagonView = () => {
    if (filteredObservations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🍯</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Inga träffar' : 'Ingen nektar samlad ännu'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity style={styles.addButton} onPress={goToAddObservation}>
              <Text style={styles.addButtonText}>+ Samla första nektarn</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    const hexSize = 80;
    const hexW = hexSize * 0.866;
    const hexH = hexSize;
    const spacing = 1.15;
    const cols = Math.floor((width - 40) / (hexW * spacing));
    const rows = Math.ceil(filteredObservations.length / cols);
    const gridHeight = rows * hexH * 0.85 + hexH + 20;

    return (
      <ScrollView style={styles.hexScrollContainer}>
        <View style={[styles.hexGrid, { height: gridHeight }]}>
          {filteredObservations.map((obs, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = col * hexW * spacing + (row % 2) * (hexW * spacing / 2);
            const y = row * hexH * 0.85;
            return (
              <View key={obs.id} style={{ position: 'absolute', left: x, top: y }}>
                <Hexagon
                  size={hexSize}
                  color={getSeasonColor()}
                  image={obs.image}
                  isEmpty={false}
                  onPress={() => navigation.navigate('ObservationDetail', { observation: obs })}
                />
              </View>
            );
          })}
        </View>
        <TouchableOpacity style={styles.addFloatButton} onPress={goToAddObservation}>
          <Text style={styles.addFloatButtonText}>🐝 Lägg till nektar</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // --- LIST-VY ---
  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ObservationDetail', { observation: item })}
    >
      {item.image ? <Image source={{ uri: item.image }} style={styles.cardImage} /> : null}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
        ) : null}
        <View style={styles.tagsContainer}>
          {(item.tags || []).map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.cardDate}>
          {new Date(item.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderListView = () => {
    if (filteredObservations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🍯</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Inga träffar' : 'Ingen nektar samlad ännu'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity style={styles.addButton} onPress={goToAddObservation}>
              <Text style={styles.addButtonText}>+ Samla första nektarn</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={filteredObservations}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <TouchableOpacity style={styles.addFloatButton} onPress={goToAddObservation}>
            <Text style={styles.addFloatButtonText}>🐝 Lägg till nektar</Text>
          </TouchableOpacity>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: getSeasonColor() }]}>
        <Text style={styles.title}>{getSeasonEmoji()} {season}</Text>
        <Text style={styles.count}>{observations.length} nektar samlad</Text>
      </View>

      {/* Sök */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Sök fynd..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Växla vy */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>☰ Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'hexagon' && styles.toggleButtonActive]}
          onPress={() => setViewMode('hexagon')}
        >
          <Text style={[styles.toggleText, viewMode === 'hexagon' && styles.toggleTextActive]}>⬡ Bikupa</Text>
        </TouchableOpacity>
      </View>

      {/* Innehåll */}
      {viewMode === 'list' ? renderListView() : renderHexagonView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BeeColors.honeycomb },
  header: {
    padding: 20, paddingBottom: 12, backgroundColor: BeeColors.white, borderBottomWidth: 4,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: BeeColors.honeyDark },
  count: { fontSize: 14, color: BeeColors.honey, fontWeight: '600' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: BeeColors.white },
  searchInput: {
    backgroundColor: BeeColors.honeycomb, borderRadius: 10, padding: 10,
    fontSize: 15, borderWidth: 1.5, borderColor: BeeColors.honeyLight,
  },
  toggleContainer: {
    flexDirection: 'row', backgroundColor: BeeColors.white, paddingHorizontal: 16, paddingBottom: 12,
  },
  toggleButton: {
    flex: 1, padding: 10, marginHorizontal: 4, borderRadius: 10,
    borderWidth: 2, borderColor: BeeColors.honeyLight, alignItems: 'center',
    backgroundColor: BeeColors.honeycomb,
  },
  toggleButtonActive: { backgroundColor: BeeColors.honey, borderColor: BeeColors.honey },
  toggleText: { fontSize: 15, color: BeeColors.honeyDark, fontWeight: '600' },
  toggleTextActive: { color: BeeColors.white },
  hexScrollContainer: { flex: 1, padding: 20 },
  hexGrid: { position: 'relative', width: '100%' },
  list: { padding: 16, paddingBottom: 8 },
  card: {
    backgroundColor: BeeColors.white, borderRadius: 14, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 180 },
  cardContent: { padding: 14 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, color: BeeColors.honeyDark },
  cardDescription: { fontSize: 14, color: '#666', marginBottom: 8, lineHeight: 20 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  tag: {
    backgroundColor: BeeColors.honeycomb, paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 12, marginRight: 6, marginBottom: 4, borderWidth: 1, borderColor: BeeColors.honeyLight,
  },
  tagText: { fontSize: 12, color: BeeColors.honeyDark, fontWeight: '600' },
  cardDate: { fontSize: 12, color: '#aaa', marginTop: 2 },
  addFloatButton: {
    backgroundColor: BeeColors.honey, marginHorizontal: 16, marginVertical: 16,
    padding: 16, borderRadius: 14, alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  addFloatButtonText: { color: BeeColors.white, fontSize: 17, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 18, color: BeeColors.honeyDark, marginBottom: 20, textAlign: 'center' },
  addButton: { backgroundColor: BeeColors.honey, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 12 },
  addButtonText: { color: BeeColors.white, fontSize: 16, fontWeight: 'bold' },
});

export default SeasonScreen;