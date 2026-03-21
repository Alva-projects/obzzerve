import { supabase } from "../config/supabase";

// Ladda upp bild till Supabase Storage
const uploadImage = async (imageUri, userId) => {
  try {
    console.log("Starting upload for:", imageUri);
    console.log("User ID:", userId);

    // Testa Supabase-anslutning först
    const { data: testData, error: testError } = await supabase
      .from("observations")
      .select("id")
      .limit(1);

    console.log("Supabase connection test:", testError ? "FAILED" : "SUCCESS");
    if (testError) {
      throw new Error("Supabase connection failed: " + testError.message);
    }

    // Konvertera bild till blob - olika metoder för web vs mobil
    let blob;

    const isWebUri = imageUri.startsWith("blob:") || imageUri.startsWith("http");
    if (!isWebUri) {
      // Mobile: Använd XMLHttpRequest för file:// (iOS) och content:// (Android)
      console.log("Using XHR for mobile URI:", imageUri.substring(0, 20));
      blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new Error("XHR failed to read file"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", imageUri, true);
        xhr.send(null);
      });
    } else {
      // Web: Standard fetch för blob:// och http(s):// URIs
      console.log("Using fetch for web URI:");
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error("Failed to fetch image: " + response.status);
      }
      blob = await response.blob();
    }

    console.log("Blob created, size:", blob.size, "type:", blob.type);

    // Konvertera blob till ArrayBuffer (funkar bättre med Supabase)
    const arrayBuffer = await blob.arrayBuffer();
    console.log("ArrayBuffer created, byteLength:", arrayBuffer.byteLength);

    const fileName = `${userId}/${Date.now()}.jpg`;

    console.log("Uploading to:", fileName);

    const { data, error } = await supabase.storage
      .from("observations")
      .upload(fileName, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error("Supabase Storage: " + error.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("observations").getPublicUrl(fileName);

    console.log("Success! URL:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Spara observation i Supabase
export const saveObservation = async (observation, user) => {
  try {
    if (!user) throw new Error("Inte inloggad");

    // Ladda upp bilden först
    const imageUrl = await uploadImage(observation.image, user.id);

    const { error } = await supabase.from("observations").insert([
      {
        user_id: user.id,
        title: observation.title,
        description: observation.description,
        image: imageUrl,
        category: observation.category,
        subcategory: observation.subcategory,
        season: observation.season,
        tags: observation.tags || [],
        date: observation.date,
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving observation:", error);
    if (typeof alert !== "undefined") {
      alert("Kunde inte spara: " + (error.message || "Okänt fel"));
    }
    return false;
  }
};

// Uppdatera observation
export const updateObservation = async (updatedObservation) => {
  try {
    const { error } = await supabase
      .from("observations")
      .update({
        title: updatedObservation.title,
        description: updatedObservation.description,
        image: updatedObservation.image,
        category: updatedObservation.category,
        subcategory: updatedObservation.subcategory,
        season: updatedObservation.season,
        tags: updatedObservation.tags || [],
        date: updatedObservation.date,
      })
      .eq("id", updatedObservation.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating observation:", error);
    return false;
  }
};

// Radera observation (och bilden)
export const deleteObservation = async (id) => {
  try {
    const { data: obs } = await supabase
      .from("observations")
      .select("image")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("observations").delete().eq("id", id);

    if (error) throw error;

    if (obs?.image) {
      const fileName = obs.image.split("/observations/")[1];
      if (fileName) {
        await supabase.storage.from("observations").remove([fileName]);
      }
    }

    return true;
  } catch (error) {
    console.error("Error deleting observation:", error);
    return false;
  }
};

// Hämta alla användarens observationer
export const getObservations = async () => {
  try {
    const { data, error } = await supabase
      .from("observations")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting observations:", error);
    return [];
  }
};

// Hämta observationer för specifik säsong
export const getObservationsBySeason = async (season) => {
  try {
    const { data, error } = await supabase
      .from("observations")
      .select("*")
      .eq("season", season)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error filtering observations:", error);
    return [];
  }
};

// Räkna antal per säsong
export const getSeasonStats = async () => {
  try {
    const all = await getObservations();
    const stats = { Vår: 0, Sommar: 0, Höst: 0, Vinter: 0 };

    all.forEach((obs) => {
      if (stats[obs.season] !== undefined) {
        stats[obs.season]++;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error getting season stats:", error);
    return { Vår: 0, Sommar: 0, Höst: 0, Vinter: 0 };
  }
};

// Räkna hur många gånger varje titel (art) förekommer
export const getSpeciesStats = async () => {
  try {
    const all = await getObservations();
    const counts = {};

    all.forEach((obs) => {
      const name = obs.title?.trim();
      if (name) {
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  } catch (error) {
    console.error("Error getting species stats:", error);
    return [];
  }
};

// Räkna per kategori + underkategorier
export const getCategoryStats = async () => {
  try {
    const all = await getObservations();
    const counts = {
      Växt: 0,
      Svamp: 0,
      Djur: 0,
      Insekt: 0,
      Spår: 0,
      Lämning: 0,
      Okänd: 0,
    };
    const animalSubs = {
      Däggdjur: 0,
      Fågel: 0,
      Fisk: 0,
      Reptil: 0,
      Groddjur: 0,
      "Övriga smådjur": 0,
      "Vet inte": 0,
    };
    const plantSubs = {
      Blomväxt: 0,
      "Träd och buskar": 0,
      "Gräs och örter": 0,
      "Mossor och lavar": 0,
      "Vet inte": 0,
    };
    const insectSubs = {
      Skalbaggar: 0,
      Steklar: 0,
      Tvåvingar: 0,
      Fjärilar: 0,
      Halvvingar: 0,
      Hopprätvingar: 0,
      Trollsländor: 0,
      Tvestjärtar: 0,
      "Vet inte": 0,
    };
    const fungiSubs = {
      Skivlingar: 0,
      Soppar: 0,
      Tickor: 0,
      Taggsvampar: 0,
      Buksvampar: 0,
      Murklor: 0,
      "Vet inte": 0,
    };

    all.forEach((obs) => {
      const cat = obs.category?.trim();
      if (cat && counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts["Okänd"]++;
      }

      if (obs.subcategory) {
        const sub = obs.subcategory.trim();
        if (cat === "Djur" && animalSubs[sub] !== undefined) animalSubs[sub]++;
        if (cat === "Växt" && plantSubs[sub] !== undefined) plantSubs[sub]++;
        if (cat === "Insekt" && insectSubs[sub] !== undefined)
          insectSubs[sub]++;
        if (cat === "Svamp" && fungiSubs[sub] !== undefined) fungiSubs[sub]++;
      }
    });

    return { counts, animalSubs, plantSubs, insectSubs, fungiSubs };
  } catch (error) {
    console.error("Error getting category stats:", error);
    return {
      counts: {
        Växt: 0,
        Svamp: 0,
        Djur: 0,
        Insekt: 0,
        Spår: 0,
        Lämning: 0,
        Okänd: 0,
      },
      animalSubs: {
        Däggdjur: 0,
        Fågel: 0,
        Fisk: 0,
        Reptil: 0,
        Groddjur: 0,
        "Övriga smådjur": 0,
        "Vet inte": 0,
      },
      plantSubs: {
        Blomväxt: 0,
        "Träd och buskar": 0,
        "Gräs och örter": 0,
        "Mossor och lavar": 0,
        "Vet inte": 0,
      },
      insectSubs: {
        Skalbaggar: 0,
        Steklar: 0,
        Tvåvingar: 0,
        Fjärilar: 0,
        Halvvingar: 0,
        Hopprätvingar: 0,
        Trollsländor: 0,
        Tvestjärtar: 0,
        "Vet inte": 0,
      },
      fungiSubs: {
        Skivlingar: 0,
        Soppar: 0,
        Tickor: 0,
        Taggsvampar: 0,
        Buksvampar: 0,
        Murklor: 0,
        "Vet inte": 0,
      },
    };
  }
};
