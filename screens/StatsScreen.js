import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LoadingBee from "../components/LoadingBee";
import { BeeColors } from "../constants/Colors";
import {
  getCategoryStats,
  getObservations,
  getSeasonStats,
  getSpeciesStats,
} from "../utils/storage";

const CATEGORIES = [
  { key: "Växt", emoji: "🌿", color: "#5cb85c" },
  { key: "Djur", emoji: "🦊", color: "#f0ad4e" },
  { key: "Insekt", emoji: "🐛", color: "#9b59b6" },
  { key: "Spår", emoji: "🐾", color: "#8B6914" },
  { key: "Svamp", emoji: "🍄", color: "#8e44ad" },
  { key: "Lämning", emoji: "🪨", color: "#e74c3c" },
  { key: "Okänd", emoji: "❓", color: "#aaa" },
];

const SEASONS = [
  { key: "Vår", emoji: "🌼", color: BeeColors.spring },
  { key: "Sommar", emoji: "☀️", color: BeeColors.summer },
  { key: "Höst", emoji: "🍂", color: BeeColors.autumn },
  { key: "Vinter", emoji: "❄️", color: BeeColors.winter },
];

const StatsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [seasonStats, setSeasonStats] = useState({});
  const [categoryStats, setCategoryStats] = useState({});
  const [speciesStats, setSpeciesStats] = useState([]);
  const [animalSubs, setAnimalSubs] = useState({});
  const [plantSubs, setPlantSubs] = useState({});
  const [insectSubs, setInsectSubs] = useState({});
  const [fungiSubs, setFungiSubs] = useState({});
  const [showAllSpecies, setShowAllSpecies] = useState(false);

  useEffect(() => {
    loadStats();
    const unsub = navigation.addListener("focus", loadStats);
    return unsub;
  }, [navigation]);

  const loadStats = async () => {
    setLoading(true);
    const [all, seasons, categories, species] = await Promise.all([
      getObservations(),
      getSeasonStats(),
      getCategoryStats(),
      getSpeciesStats(),
    ]);
    setTotal(all.length);
    setSeasonStats(seasons);
    setCategoryStats(categories.counts);
    setAnimalSubs(categories.animalSubs);
    setPlantSubs(categories.plantSubs);
    setInsectSubs(categories.insectSubs);
    setFungiSubs(categories.fungiSubs);
    setSpeciesStats(species);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingBee size={70} />
        <Text style={styles.loadingText}>Räknar nektarn...</Text>
      </View>
    );
  }

  const progress = Math.round((total / 365) * 100);
  const visibleSpecies = showAllSpecies
    ? speciesStats
    : speciesStats.slice(0, 10);
  const categoryTotal = Object.values(categoryStats).reduce((a, b) => a + b, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* TOTALT */}
      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}></Text>
        <Text style={styles.heroNumber}>{total}</Text>
        <Text style={styles.heroLabel}>observationer totalt</Text>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(progress, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progress}% av 365-dagars utmaningen
        </Text>
      </View>

      {/* ÅRSTIDER */}
      <Text style={styles.sectionTitle}>📅 Per årstid</Text>
      <View style={styles.seasonRow}>
        {SEASONS.map(({ key, emoji, color }) => (
          <TouchableOpacity
            key={key}
            style={[styles.seasonCard, { backgroundColor: color }]}
            onPress={() => navigation.navigate(key)}
          >
            <Text style={styles.seasonEmoji}>{emoji}</Text>
            <Text style={styles.seasonCount}>{seasonStats[key] || 0}</Text>
            <Text style={styles.seasonLabel}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* KATEGORIER */}
      <Text style={styles.sectionTitle}>📂 Per kategori</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map(({ key, emoji, color }) => {
          const count = categoryStats[key] || 0;
          if (count === 0 && key === "Okänd") return null;
          const pct =
            categoryTotal > 0 ? Math.round((count / categoryTotal) * 100) : 0;
          return (
            <View key={key} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryEmoji}>{emoji}</Text>
                <Text style={styles.categoryName}>{key}</Text>
                <Text style={[styles.categoryCount, { color }]}>{count}</Text>
              </View>
              <View style={styles.categoryBarBg}>
                <View
                  style={[
                    styles.categoryBarFill,
                    { width: `${pct}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={styles.categoryPct}>{pct}%</Text>
            </View>
          );
        })}
      </View>

      {/* DJUR-UNDERKATEGORIER */}
      {(categoryStats["Djur"] || 0) > 0 && (
        <>
          <Text style={styles.sectionTitle}>🦊 Djurtyper</Text>
          <View style={styles.animalCard}>
            {[
              { key: "Däggdjur", emoji: "🦊" },
              { key: "Fågel", emoji: "🐦" },
              { key: "Fisk", emoji: "🐟" },
              { key: "Reptil", emoji: "🦎" },
              { key: "Groddjur", emoji: "🐸" },
              { key: "Övriga smådjur", emoji: "🐌" },
              { key: "Vet inte", emoji: "❓" },
            ]
              .filter(({ key }) => (animalSubs[key] || 0) > 0)
              .map(({ key, emoji }) => {
                const count = animalSubs[key] || 0;
                const djurTotal = categoryStats["Djur"] || 1;
                const pct = Math.round((count / djurTotal) * 100);
                return (
                  <View key={key} style={styles.animalRow}>
                    <Text style={styles.animalEmoji}>{emoji}</Text>
                    <Text style={styles.animalName}>{key}</Text>
                    <View style={styles.animalBarBg}>
                      <View
                        style={[styles.animalBarFill, { width: `${pct}%` }]}
                      />
                    </View>
                    <Text style={styles.animalCount}>{count}</Text>
                  </View>
                );
              })}
          </View>
        </>
      )}

      {(categoryStats["Växt"] || 0) > 0 && (
        <>
          <Text style={styles.sectionTitle}>🌿 Växttyper</Text>
          <View style={styles.animalCard}>
            {[
              { key: "Blomväxt", emoji: "🌸" },
              { key: "Träd och buskar", emoji: "🌳" },
              { key: "Gräs och örter", emoji: "🌾" },
              { key: "Mossor och lavar", emoji: "🌱" },
              { key: "Vet inte", emoji: "❓" },
            ]
              .filter(({ key }) => (plantSubs[key] || 0) > 0)
              .map(({ key, emoji }) => {
                const count = plantSubs[key] || 0;
                const växtTotal = categoryStats["Växt"] || 1;
                const pct = Math.round((count / växtTotal) * 100);
                return (
                  <View key={key} style={styles.animalRow}>
                    <Text style={styles.animalEmoji}>{emoji}</Text>
                    <Text style={styles.animalName}>{key}</Text>
                    <View style={styles.animalBarBg}>
                      <View
                        style={[
                          styles.animalBarFill,
                          { width: `${pct}%`, backgroundColor: "#5cb85c" },
                        ]}
                      />
                    </View>
                    <Text style={[styles.animalCount, { color: "#5cb85c" }]}>
                      {count}
                    </Text>
                  </View>
                );
              })}
          </View>
        </>
      )}

      {/* INSEKT-UNDERKATEGORIER */}
      {(categoryStats["Insekt"] || 0) > 0 && (
        <>
          <Text style={styles.sectionTitle}>🐛 Insekttyper</Text>
          <View style={styles.animalCard}>
            {[
              { key: "Skalbaggar", emoji: "🪲" },
              { key: "Steklar", emoji: "🐝" },
              { key: "Tvåvingar", emoji: "🪰" },
              { key: "Fjärilar", emoji: "🦋" },
              { key: "Halvvingar", emoji: "🐛" },
              { key: "Hopprätvingar", emoji: "🦗" },
              { key: "Trollsländor", emoji: "🪰" },
              { key: "Tvestjärtar", emoji: "🐛" },
              { key: "Vet inte", emoji: "❓" },
            ]
              .filter(({ key }) => (insectSubs[key] || 0) > 0)
              .map(({ key, emoji }) => {
                const count = insectSubs[key] || 0;
                const insektTotal = categoryStats["Insekt"] || 1;
                const pct = Math.round((count / insektTotal) * 100);
                return (
                  <View key={key} style={styles.animalRow}>
                    <Text style={styles.animalEmoji}>{emoji}</Text>
                    <Text style={styles.animalName}>{key}</Text>
                    <View style={styles.animalBarBg}>
                      <View
                        style={[
                          styles.animalBarFill,
                          { width: `${pct}%`, backgroundColor: "#9b59b6" },
                        ]}
                      />
                    </View>
                    <Text style={[styles.animalCount, { color: "#9b59b6" }]}>
                      {count}
                    </Text>
                  </View>
                );
              })}
          </View>
        </>
      )}

      {/* SVAMP-UNDERKATEGORIER */}
      {(categoryStats["Svamp"] || 0) > 0 && (
        <>
          <Text style={styles.sectionTitle}>🍄 Svamptyper</Text>
          <View style={styles.animalCard}>
            {[
              { key: "Skivlingar", emoji: "" },
              { key: "Soppar", emoji: "" },
              { key: "Tickor", emoji: "" },
              { key: "Taggsvampar", emoji: "" },
              { key: "Buksvampar", emoji: "" },
              { key: "Murklor", emoji: "" },
              { key: "Vet inte", emoji: "❓" },
            ]
              .filter(({ key }) => (fungiSubs[key] || 0) > 0)
              .map(({ key, emoji }) => {
                const count = fungiSubs[key] || 0;
                const svampTotal = categoryStats["Svamp"] || 1;
                const pct = Math.round((count / svampTotal) * 100);
                return (
                  <View key={key} style={styles.animalRow}>
                    <Text style={styles.animalEmoji}>{emoji}</Text>
                    <Text style={styles.animalName}>{key}</Text>
                    <View style={styles.animalBarBg}>
                      <View
                        style={[
                          styles.animalBarFill,
                          { width: `${pct}%`, backgroundColor: "#8e44ad" },
                        ]}
                      />
                    </View>
                    <Text style={[styles.animalCount, { color: "#8e44ad" }]}>
                      {count}
                    </Text>
                  </View>
                );
              })}
          </View>
        </>
      )}

      {/* ARTLISTA */}
      <Text style={styles.sectionTitle}>🔬 Arter du sett</Text>
      {speciesStats.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Inga observationer ännu</Text>
        </View>
      ) : (
        <View style={styles.speciesCard}>
          <Text style={styles.speciesSubtitle}>
            {speciesStats.length} unika arter
          </Text>
          {visibleSpecies.map(({ name, count }, i) => (
            <View key={name} style={styles.speciesRow}>
              <Text style={styles.speciesRank}>{i + 1}</Text>
              <Text style={styles.speciesName} numberOfLines={1}>
                {name}
              </Text>
              <View style={styles.speciesBarBg}>
                <View
                  style={[
                    styles.speciesBarFill,
                    {
                      width: `${Math.round((count / speciesStats[0].count) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.speciesCount}>{count}x</Text>
            </View>
          ))}

          {speciesStats.length > 10 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAllSpecies(!showAllSpecies)}
            >
              <Text style={styles.showMoreText}>
                {showAllSpecies
                  ? "↑ Visa färre"
                  : `↓ Visa alla ${speciesStats.length} arter`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BeeColors.honeycomb },
  content: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: BeeColors.honey },

  // Hero
  heroCard: {
    backgroundColor: BeeColors.white,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroNumber: {
    fontSize: 56,
    fontWeight: "bold",
    color: BeeColors.honey,
    lineHeight: 64,
  },
  heroLabel: { fontSize: 16, color: BeeColors.honeyDark, marginBottom: 16 },
  progressBarBg: {
    width: "100%",
    height: 12,
    backgroundColor: BeeColors.honeycomb,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: BeeColors.honey,
    borderRadius: 6,
  },
  progressText: { fontSize: 13, color: BeeColors.honeyDark },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BeeColors.honeyDark,
    marginBottom: 12,
    marginTop: 4,
  },

  // Årstider
  seasonRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  seasonCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  seasonEmoji: { fontSize: 24, marginBottom: 4 },
  seasonCount: { fontSize: 22, fontWeight: "bold", color: BeeColors.white },
  seasonLabel: {
    fontSize: 11,
    color: BeeColors.white,
    fontWeight: "600",
    marginTop: 2,
  },

  // Kategorier
  categoryGrid: { marginBottom: 24 },
  categoryCard: {
    backgroundColor: BeeColors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryEmoji: { fontSize: 20, marginRight: 8 },
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: BeeColors.honeyDark,
  },
  categoryCount: { fontSize: 20, fontWeight: "bold" },
  categoryBarBg: {
    height: 8,
    backgroundColor: BeeColors.honeycomb,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  categoryBarFill: { height: "100%", borderRadius: 4 },
  categoryPct: { fontSize: 11, color: "#aaa", textAlign: "right" },

  // Artlista
  speciesCard: {
    backgroundColor: BeeColors.white,
    borderRadius: 14,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  speciesSubtitle: {
    fontSize: 13,
    color: BeeColors.honey,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  speciesRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BeeColors.honeycomb,
  },
  speciesRank: {
    width: 28,
    fontSize: 13,
    color: "#aaa",
    fontWeight: "bold",
    textAlign: "center",
  },
  speciesName: {
    flex: 2,
    fontSize: 15,
    color: BeeColors.honeyDark,
    fontWeight: "500",
  },
  speciesBarBg: {
    flex: 3,
    height: 8,
    backgroundColor: BeeColors.honeycomb,
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  speciesBarFill: {
    height: "100%",
    backgroundColor: BeeColors.honey,
    borderRadius: 4,
  },
  speciesCount: {
    width: 32,
    fontSize: 13,
    color: BeeColors.honey,
    fontWeight: "bold",
    textAlign: "right",
  },
  showMoreButton: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BeeColors.honeycomb,
  },
  showMoreText: { color: BeeColors.honey, fontSize: 14, fontWeight: "600" },

  animalCard: {
    backgroundColor: BeeColors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  animalRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  animalEmoji: { fontSize: 20, width: 30 },
  animalName: {
    flex: 2,
    fontSize: 14,
    color: BeeColors.honeyDark,
    fontWeight: "500",
  },
  animalBarBg: {
    flex: 3,
    height: 8,
    backgroundColor: BeeColors.honeycomb,
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  animalBarFill: {
    height: "100%",
    backgroundColor: "#f0ad4e",
    borderRadius: 4,
  },
  animalCount: {
    width: 28,
    fontSize: 14,
    color: "#f0ad4e",
    fontWeight: "bold",
    textAlign: "right",
  },

  emptyCard: {
    backgroundColor: BeeColors.white,
    borderRadius: 14,
    padding: 30,
    alignItems: "center",
  },
  emptyText: { color: "#aaa", fontSize: 15 },
});

export default StatsScreen;
