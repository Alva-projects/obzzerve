import React from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, Alert, Platform,
} from 'react-native';
import { deleteObservation } from '../utils/storage';
import { BeeColors } from '../constants/Colors';

const ObservationDetailScreen = ({ route, navigation }) => {
  const { observation } = route.params;

  const handleDelete = () => {
    const confirmDelete = async () => {
      const success = await deleteObservation(observation.id);
      if (success) {
        navigation.goBack();
      } else {
        Alert.alert('Fel', 'Kunde inte radera observationen');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Är du säker på att du vill radera denna nektar? Detta går inte att ångra.');
      if (confirmed) confirmDelete();
    } else {
      Alert.alert(
        '🗑️ Radera observation',
        'Är du säker på att du vill radera denna nektar? Detta går inte att ångra.',
        [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Radera', style: 'destructive', onPress: confirmDelete }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: observation.image }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.title}>{observation.title}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Årstid:</Text>
          <Text style={styles.value}>{observation.season}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Datum:</Text>
          <Text style={styles.value}>
            {new Date(observation.date).toLocaleDateString('sv-SE', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </Text>
        </View>

        {observation.tags && observation.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Tags:</Text>
            <View style={styles.tagsContainer}>
              {observation.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {observation.description ? (
          <View style={styles.section}>
            <Text style={styles.label}>Beskrivning:</Text>
            <Text style={styles.description}>{observation.description}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑 Radera</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BeeColors.honeycomb },
  image: { width: '100%', height: 300 },
  content: {
    padding: 20, backgroundColor: BeeColors.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: BeeColors.honeyDark },
  infoRow: { flexDirection: 'row', marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '600', color: '#666', marginRight: 8 },
  value: { fontSize: 16, color: '#333' },
  section: { marginTop: 20 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tag: {
    backgroundColor: BeeColors.honeycomb, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, marginRight: 8, marginBottom: 8,
    borderWidth: 1, borderColor: BeeColors.honeyLight,
  },
  tagText: { fontSize: 14, color: BeeColors.honeyDark, fontWeight: '500' },
  description: { fontSize: 16, color: '#333', lineHeight: 24, marginTop: 8 },
  deleteButton: {
    backgroundColor: '#DC3545', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 30, marginBottom: 20,
    borderWidth: 2, borderColor: '#BD2130',
  },
  deleteButtonText: { color: BeeColors.white, fontSize: 18, fontWeight: 'bold' },
});

export default ObservationDetailScreen;