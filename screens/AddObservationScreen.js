import React, { useState, useLayoutEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, ScrollView, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { saveObservation } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import LoadingBee from '../components/LoadingBee';
import { BeeColors } from '../constants/Colors';

const AddObservationScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const retroactiveDate = route?.params?.retroactiveDate ?? null;
  const dayNumber = route?.params?.dayNumber ?? null;
  const defaultSeason = route?.params?.defaultSeason ?? 'Vår';
  const returnTo = route?.params?.returnTo ?? 'home';
  const returnSeason = route?.params?.returnSeason ?? null;

  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [season, setSeason] = useState(defaultSeason);
  const [loading, setLoading] = useState(false);

  const observationDate = retroactiveDate ? new Date(retroactiveDate) : new Date();

  // Visa header med tillbaka-pil
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: retroactiveDate ? 'Retroaktiv nektar' : '🐝 Samla Nektar',
      headerStyle: { backgroundColor: '#FFF9E6' },
      headerTintColor: '#F5A623',
      headerTitleStyle: { fontWeight: 'bold' },
    });
  }, [navigation, retroactiveDate]);

  const formatDate = (date) =>
    date.toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handleImagePicker = async () => {
    if (Platform.OS === 'web') {
      openGallery();
      return;
    }
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert('📷 Välj bild', 'Var vill du hämta bilden från?', [
      { text: '📸 Kamera', onPress: openCamera },
      { text: '🖼️ Galleri', onPress: openGallery },
      { text: 'Avbryt', style: 'cancel' },
    ]);
  };

  const requestPermissions = async () => {
    try {
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cam.status !== 'granted' || media.status !== 'granted') {
        Alert.alert('Behörigheter krävs', 'Vi behöver tillgång till kamera och galleri');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) setImage(result.assets[0]);
    } catch {
      Alert.alert('Fel', 'Kunde inte öppna kameran');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) setImage(result.assets[0]);
    } catch {
      Alert.alert('Fel', 'Kunde inte öppna galleriet');
    }
  };

  const handleSave = async () => {
    if (!image) {
      Alert.alert('🐝 Saknas bild', 'Du måste fotografera din nektar-källa!');
      return;
    }
    if (!title.trim()) {
      Alert.alert('🐝 Saknas titel', 'Vad hittade du för nektar?');
      return;
    }

    setLoading(true);

    // Titel kopieras automatiskt till tags så man kan söka/räkna på den i statistik
    const extraTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    const allTags = [title.trim(), ...extraTags].filter(Boolean);

    const observation = {
      image: image.uri,
      title: title.trim(),
      description: description.trim(),
      tags: allTags,
      category,
      subcategory: ['Djur', 'Växt', 'Insekt', 'Svamp'].includes(category) ? subcategory : '',
      season,
      date: observationDate.toISOString(),
    };

    try {
      const success = await saveObservation(observation, user);
      if (success) {
        // Navigera direkt tillbaka utan val
        if (returnTo === 'season' && returnSeason) {
          // popToTop går tillbaka till SeasonView i stacken
          navigation.popToTop();
        } else {
          navigation.goBack();
        }
      }
    } catch (error) {
      Alert.alert('Fel', 'Ett fel uppstod: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FORMULÄR-VY ---
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container}>
      {retroactiveDate && (
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>📅 {formatDate(observationDate)}</Text>
          {dayNumber && <Text style={styles.dateBadgeDay}>Dag {dayNumber} av 365</Text>}
        </View>
      )}

      <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>✏️ Byt bild</Text>
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderIcon}>📷</Text>
            <Text style={styles.imagePlaceholderText}>
              {Platform.OS === 'web' ? 'Välj bild från dator' : 'Ta foto eller välj från galleri'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Vad hittade du? *</Text>
        <TextInput
          style={styles.input}
          placeholder="T.ex. Maskros, Rödhake, Blåsippa"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          autoCorrect={true}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Vilken årstid? *</Text>
        <View style={styles.seasonContainer}>
          {['Vår', 'Sommar', 'Höst', 'Vinter'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.seasonButton, season === s && styles.seasonButtonActive]}
              onPress={() => setSeason(s)}
            >
              <Text style={styles.seasonButtonEmoji}>
                {s === 'Vår' ? '🌼' : s === 'Sommar' ? '☀️' : s === 'Höst' ? '🍂' : '❄️'}
              </Text>
              <Text style={[styles.seasonButtonLabel, season === s && styles.seasonButtonLabelActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>📂 Kategori</Text>
        <View style={styles.categoryContainer}>
          {[
            { key: 'Växt',    emoji: '🌿' },
            { key: 'Svamp',   emoji: '🍄' },
            { key: 'Djur',    emoji: '🦊' },
            { key: 'Insekt',  emoji: '🐛' },
            { key: 'Spår',    emoji: '🐾' },
            { key: 'Lämning', emoji: '🪨' },
          ].map(({ key, emoji }) => (
            <TouchableOpacity
              key={key}
              style={[styles.categoryButton, category === key && styles.categoryButtonActive]}
              onPress={() => { const next = category === key ? '' : key; setCategory(next); setSubcategory(''); }}
            >
              <Text style={styles.categoryEmoji}>{emoji}</Text>
              <Text style={[styles.categoryLabel, category === key && styles.categoryLabelActive]}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Underkategorier för Växt */}
        {category === 'Växt' && (
          <View style={styles.subcategoryContainer}>
            <Text style={styles.sublabel}>↳ Vilken typ av växt?</Text>
            <View style={styles.subcategoryRow}>
              {[
                { key: 'Blomväxt',         emoji: '🌸' },
                { key: 'Träd och buskar',   emoji: '🌳' },
                { key: 'Gräs och örter',    emoji: '🌾' },
                { key: 'Mossor och lavar',  emoji: '🌱' },
                { key: 'Vet inte',          emoji: '❓' },
              ].map(({ key, emoji }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.subcategoryButton, subcategory === key && styles.subcategoryButtonActive]}
                  onPress={() => setSubcategory(subcategory === key ? '' : key)}
                >
                  <Text style={styles.subcategoryEmoji}>{emoji}</Text>
                  <Text style={[styles.subcategoryLabel, subcategory === key && styles.subcategoryLabelActive]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Underkategorier för Insekt */}
        {category === 'Insekt' && (
          <View style={styles.subcategoryContainer}>
            <Text style={styles.sublabel}>↳ Vilken typ av insekt?</Text>
            <View style={styles.subcategoryRow}>
              {[
                { key: 'Skalbaggar',    emoji: '🪲' },
                { key: 'Steklar',       emoji: '🐝' },
                { key: 'Tvåvingar',     emoji: '🪰' },
                { key: 'Fjärilar',      emoji: '🦋' },
                { key: 'Halvvingar',    emoji: '🐛' },
                { key: 'Hopprätvingar', emoji: '🦗' },
                { key: 'Trollsländor',  emoji: '🪰' },
                { key: 'Tvestjärtar',   emoji: '🐛' },
                { key: 'Vet inte',      emoji: '❓' },
              ].map(({ key, emoji }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.subcategoryButton, subcategory === key && styles.subcategoryButtonActive]}
                  onPress={() => setSubcategory(subcategory === key ? '' : key)}
                >
                  <Text style={styles.subcategoryEmoji}>{emoji}</Text>
                  <Text style={[styles.subcategoryLabel, subcategory === key && styles.subcategoryLabelActive]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Underkategorier för Svamp */}
        {category === 'Svamp' && (
          <View style={styles.subcategoryContainer}>
            <Text style={styles.sublabel}>↳ Vilken typ av svamp?</Text>
            <View style={styles.subcategoryRow}>
              {[
                { key: 'Skivlingar',   emoji: '' },
                { key: 'Soppar',       emoji: '' },
                { key: 'Tickor',       emoji: '' },
                { key: 'Taggsvampar',  emoji: '' },
                { key: 'Buksvampar',   emoji: '' },
                { key: 'Murklor',      emoji: '' },
                { key: 'Vet inte',     emoji: '❓' },
              ].map(({ key, emoji }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.subcategoryButton, subcategory === key && styles.subcategoryButtonActive]}
                  onPress={() => setSubcategory(subcategory === key ? '' : key)}
                >
                  <Text style={styles.subcategoryEmoji}>{emoji}</Text>
                  <Text style={[styles.subcategoryLabel, subcategory === key && styles.subcategoryLabelActive]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Underkategorier för Djur */}
        {category === 'Djur' && (
          <View style={styles.subcategoryContainer}>
            <Text style={styles.sublabel}>↳ Vilken typ av djur?</Text>
            <View style={styles.subcategoryRow}>
              {[
                { key: 'Däggdjur',        emoji: '🦊' },
                { key: 'Fågel',           emoji: '🐦' },
                { key: 'Fisk',            emoji: '🐟' },
                { key: 'Reptil',          emoji: '🦎' },
                { key: 'Groddjur',        emoji: '🐸' },
                { key: 'Övriga smådjur',  emoji: '🐌' },
                { key: 'Vet inte',        emoji: '❓' },
              ].map(({ key, emoji }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.subcategoryButton, subcategory === key && styles.subcategoryButtonActive]}
                  onPress={() => setSubcategory(subcategory === key ? '' : key)}
                >
                  <Text style={styles.subcategoryEmoji}>{emoji}</Text>
                  <Text style={[styles.subcategoryLabel, subcategory === key && styles.subcategoryLabelActive]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.label}>🏷️ Taggar (kommaseparerade)</Text>
        <TextInput
          style={styles.input}
          placeholder="T.ex. gul, vild, skogsmark"
          placeholderTextColor="#999"
          value={tags}
          onChangeText={setTags}
          autoCorrect={true}
        />

        <Text style={styles.label}>📝 Beskrivning</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Beskriv din upptäckt..."
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          autoCorrect={true}
          autoCapitalize="sentences"
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <LoadingBee size={30} /> : (
            <Text style={styles.saveButtonText}>🍯 Spara i Bikupan</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BeeColors.honeycomb },

  // Sparad-vy
  savedContainer: {
    flex: 1, backgroundColor: BeeColors.honeycomb,
    justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  savedEmoji: { fontSize: 80, marginBottom: 20 },
  savedTitle: { fontSize: 32, fontWeight: 'bold', color: BeeColors.honey, marginBottom: 10 },
  savedSubtitle: { fontSize: 16, color: BeeColors.honeyDark, textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  savedButtonPrimary: {
    backgroundColor: BeeColors.honey, width: '100%', padding: 18,
    borderRadius: 15, alignItems: 'center', marginBottom: 14,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  savedButtonPrimaryText: { color: BeeColors.white, fontSize: 18, fontWeight: 'bold' },
  savedButtonSecondary: {
    backgroundColor: BeeColors.white, width: '100%', padding: 18,
    borderRadius: 15, alignItems: 'center',
    borderWidth: 2, borderColor: BeeColors.honey,
  },
  savedButtonSecondaryText: { color: BeeColors.honey, fontSize: 18, fontWeight: 'bold' },

  // Formulär
  dateBadge: {
    backgroundColor: BeeColors.honey, margin: 20, marginBottom: 0,
    padding: 14, borderRadius: 12, alignItems: 'center',
  },
  dateBadgeText: { color: BeeColors.white, fontSize: 15, fontWeight: '700' },
  dateBadgeDay: { color: BeeColors.pollen, fontSize: 12, marginTop: 3 },
  imageButton: { margin: 20, marginBottom: 0 },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 250, borderRadius: 15 },
  imageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 10,
    borderBottomLeftRadius: 15, borderBottomRightRadius: 15,
  },
  imageOverlayText: { color: BeeColors.white, textAlign: 'center', fontSize: 16, fontWeight: '600' },
  imagePlaceholder: {
    width: '100%', height: 220, backgroundColor: BeeColors.white, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: BeeColors.honey, borderStyle: 'dashed',
  },
  imagePlaceholderIcon: { fontSize: 60, marginBottom: 10 },
  imagePlaceholderText: { fontSize: 16, color: BeeColors.honeyDark, textAlign: 'center', paddingHorizontal: 20 },
  formContainer: {
    backgroundColor: BeeColors.white, margin: 20, padding: 20,
    borderRadius: 15, marginBottom: 30, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: BeeColors.honeyDark },
  input: {
    borderWidth: 2, borderColor: BeeColors.honeyLight, borderRadius: 10,
    padding: 12, fontSize: 16, marginBottom: 20, backgroundColor: BeeColors.honeycomb,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  seasonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 8 },
  categoryButton: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 2, borderColor: BeeColors.honeyLight,
    backgroundColor: BeeColors.honeycomb,
  },
  categoryButtonActive: { backgroundColor: BeeColors.honeyDark, borderColor: BeeColors.honeyDark },
  categoryEmoji: { fontSize: 16, marginRight: 5 },
  categoryLabel: { fontSize: 13, color: BeeColors.honeyDark, fontWeight: '600' },
  categoryLabelActive: { color: BeeColors.white },
  subcategoryContainer: {
    backgroundColor: BeeColors.honeycomb, borderRadius: 12, padding: 12,
    marginBottom: 20, borderWidth: 2, borderColor: BeeColors.honeyLight,
  },
  sublabel: { fontSize: 14, color: BeeColors.honeyDark, fontWeight: '600', marginBottom: 10 },
  subcategoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subcategoryButton: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1.5, borderColor: '#ccc',
    backgroundColor: BeeColors.white,
  },
  subcategoryButtonActive: { backgroundColor: '#f0ad4e', borderColor: '#f0ad4e' },
  subcategoryEmoji: { fontSize: 14, marginRight: 4 },
  subcategoryLabel: { fontSize: 12, color: BeeColors.honeyDark, fontWeight: '500' },
  subcategoryLabelActive: { color: BeeColors.white, fontWeight: '700' },
  seasonButton: {
    flex: 1, padding: 10, marginHorizontal: 3, borderRadius: 10,
    borderWidth: 2, borderColor: BeeColors.honeyLight, alignItems: 'center',
    backgroundColor: BeeColors.honeycomb,
  },
  seasonButtonActive: { backgroundColor: BeeColors.honey, borderColor: BeeColors.honey },
  seasonButtonEmoji: { fontSize: 22, marginBottom: 3 },
  seasonButtonLabel: { fontSize: 11, color: BeeColors.honeyDark, fontWeight: '600' },
  seasonButtonLabelActive: { color: BeeColors.white },
  saveButton: {
    backgroundColor: BeeColors.honey, padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 10, elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  saveButtonDisabled: { backgroundColor: BeeColors.honeyLight },
  saveButtonText: { color: BeeColors.white, fontSize: 18, fontWeight: 'bold' },
});

export default AddObservationScreen;