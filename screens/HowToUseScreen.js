import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { BeeColors } from '../constants/Colors';

const HowToUseScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🐝</Text>
        <Text style={styles.title}>Välkommen till Obzzerve!</Text>
        <Text style={styles.subtitle}>
          Samla fynd likt ett bi samlar nektar
        </Text>
      </View>

      {/* Vad kan du samla? */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vad kan du samla?</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            <Text style={styles.emoji}>🌿</Text> <Text style={styles.bold}>Växter</Text> - Blommor, träd, buskar
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            <Text style={styles.emoji}>🐛</Text> <Text style={styles.bold}>Insekter</Text> - Spindeldjur, steklar, trollsländor
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            <Text style={styles.emoji}>🍄‍🟫</Text> <Text style={styles.bold}>Svampar</Text> - Skivlingar, tickor, buksvampar
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            <Text style={styles.emoji}>🦊</Text> <Text style={styles.bold}>Djur</Text> - Fåglar, däggdjur, reptiler
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            <Text style={styles.emoji}>🐾</Text> <Text style={styles.bold}>Spår</Text> - Fotspår, spillning, ben, fjädrar
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            <Text style={styles.emoji}>🐚</Text> <Text style={styles.bold}>Lämningar</Text> - Bon, hål, skal, kottar
          </Text>
        </View>
      </View>

      {/* Hur fungerar det? */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 Så samlar du nektar</Text>
        
        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Ta en bild</Text>
            <Text style={styles.stepText}>
              Fotografera din upptäckt ute i naturen - växter, djur, spår eller lämningar
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Namnge din fynd</Text>
            <Text style={styles.stepText}>
              Ge den ett namn (t.ex. "Maskros", "Rödhake", "Älgspår")
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Välj årstid</Text>
            <Text style={styles.stepText}>
              Markera om det är Vår, Sommar, Höst eller Vinter
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Lägg till taggar</Text>
            <Text style={styles.stepText}>
              Taggar hjälper dig räkna arter (t.ex. "kungsfiskare, lilja, mossa")
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>5</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Beskriv (valfritt)</Text>
            <Text style={styles.stepText}>
              Lägg till anteckningar om var du såg det, beteende, väder etc.
            </Text>
          </View>
        </View>
      </View>

      {/* Din bikupa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐝 Din bikupa (Hem)</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            På startsidan ser du din 365-dagars bikupa:
          </Text>
          <Text style={[styles.infoText, { marginTop: 10 }]}>
            Klicka på en hexagon för att se din observation i detalj eller för att radera ett fynd!
          </Text>
        </View>
      </View>

      {/* Årstider */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Årstider</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Öppna sidomenyn och välj en årstid för att se all nektar du samlat:
          </Text>
          <Text style={styles.bulletPoint}>
            ⬡ <Text style={styles.bold}>Bikupa-vy</Text> - Hexagoner med dina bilder
          </Text>
          <Text style={styles.bulletPoint}>
            ☰ <Text style={styles.bold}>List-vy</Text> - Kort med stora bilder och sökfunktion
          </Text>
          <Text style={styles.infoText}>Klicka på en hexagon för att se din observation i detalj eller för att radera ett fynd!</Text>
        </View>
      </View>

      {/* Statistik */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Statistik</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Se hur många olika arter du har hittat och vilka taggar som är vanligast. 
            Perfekt för att följa din progress genom året!
          </Text>
        </View>
      </View>

      {/* Utmaningen */}
      <View style={styles.challengeSection}>
        <Text style={styles.challengeTitle}>🎯 365-dagars utmaning</Text>
        <Text style={styles.challengeText}>
          Målet är att samla nektar varje dag under ett helt år! 
          Du behöver inte hitta olika arter - det viktiga är att komma ut i naturen 
          och observera något varje dag. Lycka till!
        </Text>
      </View>

      {/* Start-knapp */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('AddObservation')}
      >
        <Text style={styles.startButtonText}>🐝 Börja samla nektar!</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ha kul och njut av naturen! 🌻</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BeeColors.honeycomb,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 40,
    backgroundColor: BeeColors.white,
  },
  headerEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BeeColors.honey,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: BeeColors.honeyDark,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BeeColors.honeyDark,
    marginBottom: 15,
  },
  card: {
    backgroundColor: BeeColors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    color: BeeColors.beeBlack,
    lineHeight: 24,
  },
  emoji: {
    fontSize: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: BeeColors.honeyDark,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: BeeColors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BeeColors.honey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BeeColors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BeeColors.honeyDark,
    marginBottom: 5,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: BeeColors.white,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 15,
    color: BeeColors.beeBlack,
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 15,
    color: BeeColors.beeBlack,
    lineHeight: 26,
    marginLeft: 10,
  },
  challengeSection: {
    margin: 20,
    padding: 20,
    backgroundColor: BeeColors.honey,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BeeColors.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  challengeText: {
    fontSize: 15,
    color: BeeColors.white,
    lineHeight: 22,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: BeeColors.honey,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: BeeColors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: BeeColors.honeyDark,
    fontStyle: 'italic',
  },
});

export default HowToUseScreen;