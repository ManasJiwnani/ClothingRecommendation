// import { SymbolView } from 'expo-symbols';
// import { useState } from 'react';
// import {
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   TextInput,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { BottomTabInset, Fonts, Spacing } from '@/constants/theme';

// const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes'];

// const wardrobeItems = [
//   { name: 'White Oversized T-Shirt', detail: 'Tops · Organic cotton', symbol: 'checkroom', tone: '#e8e4dc' },
//   { name: 'Washed Black Jeans', detail: 'Bottoms · Selvedge denim', symbol: 'checkroom', tone: '#b8b3ae' },
//   { name: 'Court Leather Sneakers', detail: 'Shoes · Italian leather', symbol: 'steps', tone: '#d9d3c7' },
//   { name: 'Raw Denim Jacket', detail: 'Outerwear · Indigo denim', symbol: 'checkroom', tone: '#8d9aa1' },
//   { name: 'Cashmere Mock-Neck', detail: 'Tops · Fine gauge cashmere', symbol: 'checkroom', tone: '#a9a19a' },
//   { name: 'Pleated Wool Trousers', detail: 'Bottoms · Virgin wool', symbol: 'checkroom', tone: '#777a78' },
// ] as const;

// export default function ClosetScreen() {
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [showOutfits, setShowOutfits] = useState(false);
//   const [query, setQuery] = useState('');

//   const visibleItems = wardrobeItems.filter((item) => {
//     const matchesCategory = selectedCategory === 'All' || item.detail.startsWith(selectedCategory);
//     const matchesQuery = `${item.name} ${item.detail}`.toLowerCase().includes(query.toLowerCase());
//     return matchesCategory && matchesQuery;
//   });

//   return (
//     <ThemedView style={styles.container}>
//       <SafeAreaView style={styles.safeArea}>
//         <ScrollView
//           contentInsetAdjustmentBehavior="automatic"
//           contentContainerStyle={styles.content}
//           showsVerticalScrollIndicator={false}>
//           <View style={styles.header}>
//             <View style={styles.headerTop}>
//               <View>
//               <ThemedText style={styles.kicker}>STYLE SENSE</ThemedText>
//               <ThemedText type="subtitle" style={styles.heading}>My Wardrobe</ThemedText>
//               </View>
//               <View style={styles.headerWeather}><ThemedText style={styles.weatherText}>PARIS</ThemedText><ThemedText style={styles.weatherTemperature}>19°C</ThemedText></View>
//             </View>
//           </View>

//           <View style={styles.metricRow}>
//             <View style={styles.metricDot} />
//             <ThemedText style={styles.metric}>84 PIECES · 12 SAVED OUTFITS</ThemedText>
//           </View>

//           <View style={styles.searchRow}>
//             <View style={styles.searchBox}>
//               <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={19} tintColor="#747878" />
//               <TextInput
//                 value={query}
//                 onChangeText={setQuery}
//                 placeholder="Search your wardrobe"
//                 placeholderTextColor="#747878"
//                 style={styles.searchInput}
//               />
//             </View>
//             <Pressable accessibilityLabel="Filter wardrobe" style={styles.filterButton}>
//               <SymbolView name={{ ios: 'line.3.horizontal.decrease', android: 'tune', web: 'tune' }} size={20} tintColor="#1b1c1a" />
//             </Pressable>
//           </View>

//           <View style={styles.segmentedControl}>
//             <Pressable onPress={() => setShowOutfits(false)} style={[styles.segment, !showOutfits && styles.segmentSelected]}>
//               <SymbolView name={{ ios: 'hanger', android: 'checkroom', web: 'checkroom' }} size={17} tintColor="#1b1c1a" />
//               <ThemedText style={styles.segmentText}>Clothes</ThemedText>
//               <ThemedText style={styles.count}>84</ThemedText>
//             </Pressable>
//             <Pressable onPress={() => setShowOutfits(true)} style={[styles.segment, showOutfits && styles.segmentSelected]}>
//               <SymbolView name={{ ios: 'wand.and.stars', android: 'auto_fix_high', web: 'auto_fix_high' }} size={17} tintColor="#1b1c1a" />
//               <ThemedText style={styles.segmentText}>Outfits</ThemedText>
//               <ThemedText style={styles.count}>12</ThemedText>
//             </Pressable>
//           </View>

//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
//             {categories.map((category) => (
//               <Pressable key={category} onPress={() => setSelectedCategory(category)} style={[styles.chip, selectedCategory === category && styles.chipSelected]}>
//                 <ThemedText style={[styles.chipText, selectedCategory === category && styles.chipTextSelected]}>{category}</ThemedText>
//               </Pressable>
//             ))}
//           </ScrollView>

//           {showOutfits ? (
//             <View style={styles.emptyState}>
//               <SymbolView name={{ ios: 'wand.and.stars', android: 'auto_fix_high', web: 'auto_fix_high' }} size={30} tintColor="#745a38" />
//               <ThemedText style={styles.emptyTitle}>Your saved edits</ThemedText>
//               <ThemedText style={styles.emptyBody}>Your styled outfits will appear here.</ThemedText>
//             </View>
//           ) : (
//             <View style={styles.grid}>
//               {visibleItems.map((item) => (
//                 <View key={item.name} style={styles.card}>
//                   <View style={[styles.cardImage, { backgroundColor: item.tone }]}>
//                     <SymbolView name={{ ios: item.symbol === 'steps' ? 'shoeprints.fill' : 'tshirt', android: item.symbol, web: item.symbol }} size={64} tintColor="#fbf9f6" />
//                     <View style={styles.wornBadge}><ThemedText style={styles.wornText}>WORN 14X</ThemedText></View>
//                   </View>
//                   <ThemedText style={styles.cardTitle} numberOfLines={1}>{item.name}</ThemedText>
//                   <ThemedText style={styles.cardDetail} numberOfLines={1}>{item.detail}</ThemedText>
//                 </View>
//               ))}
//             </View>
//           )}
//         </ScrollView>
//       </SafeAreaView>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fbf9f6' },
//   safeArea: { flex: 1 },
//   content: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: BottomTabInset + 32, gap: Spacing.two },
//   header: { gap: 5 },
//   headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
//   headerWeather: { alignItems: 'flex-end', gap: 2 },
//   weatherText: { color: '#747878', fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
//   weatherTemperature: { color: '#745a38', fontFamily: Fonts.serif, fontSize: 18 },
//   kicker: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700', letterSpacing: 2, color: '#745a38' },
//   heading: { fontFamily: Fonts.serif, fontSize: 32, lineHeight: 40, fontWeight: '500', marginTop: 4 },
//   insightButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#efeeeb', alignItems: 'center', justifyContent: 'center' },
//   metricRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
//   metricDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#745a38' },
//   metric: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: '#745a38' },
//   searchRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
//   searchBox: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, backgroundColor: '#f0eeea', borderRadius: 12 },
//   searchInput: { flex: 1, fontFamily: Fonts.sans, fontSize: 14, color: '#1b1c1a', paddingVertical: 0 },
//   filterButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f0eeea', alignItems: 'center', justifyContent: 'center' },
//   segmentedControl: { flexDirection: 'row', padding: 4, backgroundColor: '#efeeeb', borderRadius: 12, marginTop: Spacing.one },
//   segment: { flex: 1, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 9 },
//   segmentSelected: { backgroundColor: '#ffffff', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)' },
//   segmentText: { fontSize: 13, fontWeight: '600' },
//   count: { fontSize: 10, color: '#747878', backgroundColor: '#e4e2df', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 8 },
//   chips: { gap: 8, paddingVertical: 6 },
//   chip: { height: 34, paddingHorizontal: 15, borderRadius: 17, backgroundColor: '#efeeeb', alignItems: 'center', justifyContent: 'center' },
//   chipSelected: { backgroundColor: '#1b1c1a' },
//   chipText: { fontSize: 13, color: '#444748' },
//   chipTextSelected: { color: '#ffffff', fontWeight: '600' },
//   grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 22, paddingTop: 4 },
//   card: { width: '48.2%' },
//   cardImage: { aspectRatio: 0.78, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
//   wornBadge: { position: 'absolute', top: 9, right: 9, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(251,249,246,0.88)' },
//   wornText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: '#745a38' },
//   cardTitle: { fontSize: 15, fontWeight: '600', marginTop: 8 },
//   cardDetail: { fontSize: 12, color: '#747878', marginTop: 2 },
//   emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 70, gap: 10 },
//   emptyTitle: { fontSize: 18, fontWeight: '600' },
//   emptyBody: { fontSize: 14, color: '#747878' },
// });


import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HowToPhotographCard } from '@/components/how-to-photograph-card';
import { API_BASE_URL } from '@/constants/api';
import { BottomTabInset, Fonts, Spacing } from '@/constants/theme';


// =========================================================
// TEMPORARY USER ID
// =========================================================

// Replace this later with the authenticated Supabase user ID.
//
// Example:
// const USER_ID = session.user.id;

const USER_ID = 'user001';


// =========================================================
// CATEGORIES
// =========================================================

const categories = [
  'All',
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
];


// =========================================================
// CLOTHING TYPE
// =========================================================

type ClothingItem = {
  id: string;
  user_id: string;
  image_url: string;

  category?: string;
  clothing_type?: string;

  subcategory?: string;
  color?: string;
  secondary_color?: string;
  pattern?: string;
  material?: string;
  sleeve_type?: string;
  fit?: string;
  style?: string;

  formality?: number;

  season?: string[];
  occasions?: string[];

  embedding?: number[];

  created_at?: string;
};


// =========================================================
// COMPONENT
// =========================================================

export default function ClosetScreen() {

  // -------------------------------------------------------
  // WARDROBE STATE
  // -------------------------------------------------------

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [showOutfits, setShowOutfits] =
    useState(false);

  const [query, setQuery] =
    useState('');

  const [clothes, setClothes] =
    useState<ClothingItem[]>([]);

  const [loadingClothes, setLoadingClothes] =
    useState(false);


  // -------------------------------------------------------
  // ADD PIECE STATE
  // -------------------------------------------------------

  const [showAddPiece, setShowAddPiece] =
    useState(false);

  const [imageUri, setImageUri] =
    useState<string | null>(null);

  const [analyzing, setAnalyzing] =
    useState(false);


  // =======================================================
  // LOAD CLOTHES FROM FASTAPI
  // =======================================================

  async function loadClothes() {

    try {

      setLoadingClothes(true);

      console.log(
        'Loading clothes for user:',
        USER_ID
      );

      const response = await fetch(
        `${API_BASE_URL}/clothes/${USER_ID}`
      );

      if (!response.ok) {

        throw new Error(
          `Failed to load clothes: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        'Clothes received:',
        data
      );

      setClothes(data);

    } catch (error) {

      console.error(
        'Load clothes error:',
        error
      );

      Alert.alert(
        'Unable to load wardrobe',
        'Could not connect to the backend. Make sure FastAPI is running.'
      );

    } finally {

      setLoadingClothes(false);

    }
  }


  // =======================================================
  // LOAD CLOTHES WHEN SCREEN OPENS
  // =======================================================

  useEffect(() => {

    loadClothes();

  }, []);


  // =======================================================
  // CHOOSE PHOTO
  // =======================================================

  async function choosePhoto() {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {

      Alert.alert(
        'Permission needed',
        'Allow photo access to choose a garment image.'
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({

        mediaTypes: ['images'],

        allowsEditing: true,

        quality: 0.9,

      });

    if (!result.canceled) {

      setImageUri(
        result.assets[0].uri
      );

    }
  }


  // =======================================================
  // TAKE PHOTO
  // =======================================================

  async function takePhoto() {

    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {

      Alert.alert(
        'Permission needed',
        'Allow camera access to photograph a garment.'
      );

      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({

        allowsEditing: true,

        quality: 0.9,

      });

    if (!result.canceled) {

      setImageUri(
        result.assets[0].uri
      );

    }
  }


  // =======================================================
  // OPEN ADD PIECE
  // =======================================================

  function openAddPiece() {

    setShowAddPiece(true);

    setImageUri(null);

  }


  // =======================================================
  // CLOSE ADD PIECE
  // =======================================================

  function closeAddPiece() {

    setShowAddPiece(false);

    setImageUri(null);

  }


  // =======================================================
  // ANALYZE GARMENT
  // =======================================================

  async function analyzeGarment() {

    if (!imageUri) {

      Alert.alert(
        'No image',
        'Please select or take a photo first.'
      );

      return;
    }

    try {

      setAnalyzing(true);

      /*
       * ----------------------------------------------------
       * IMPORTANT
       * ----------------------------------------------------
       *
       * Your Member 2 / AI backend should eventually return:
       *
       * {
       *   image_url: "...",
       *   attributes: {
       *      category: "dress",
       *      subcategory: "midi dress",
       *      color: "maroon",
       *      pattern: "solid",
       *      material: "jersey",
       *      sleeve_type: "sleeveless",
       *      fit: "fitted",
       *      style: "minimalist",
       *      formality: 2,
       *      season: ["summer", "spring"],
       *      occasions: ["casual", "party", "date"]
       *   },
       *   embedding: [...]
       * }
       *
       * For now this function shows the place where
       * that API should be connected.
       * ----------------------------------------------------
       */


      // ====================================================
      // TEMPORARY TEST DATA
      // ====================================================
      //
      // REMOVE this block when your AI analysis endpoint
      // is connected.
      //
      // ====================================================

      Alert.alert(
        'Image selected',
        'The garment image is ready. Connect your AI analysis endpoint here.'
      );


    } catch (error) {

      console.error(
        'Garment analysis error:',
        error
      );

      Alert.alert(
        'Analysis failed',
        'Something went wrong while analyzing the garment.'
      );

    } finally {

      setAnalyzing(false);

    }
  }


  // =======================================================
  // FILTER CLOTHES
  // =======================================================

  const visibleItems =
    clothes.filter((item) => {

      // -----------------------------------------------
      // CATEGORY FILTER
      // -----------------------------------------------

      const category =
        (
          item.category ||
          item.clothing_type ||
          ''
        ).toLowerCase();


      let matchesCategory = true;


      if (
        selectedCategory !== 'All'
      ) {

        const selected =
          selectedCategory.toLowerCase();


        if (selected === 'tops') {

          matchesCategory =
            category === 'top' ||
            category === 'tops';

        } else if (
          selected === 'bottoms'
        ) {

          matchesCategory =
            category === 'bottom' ||
            category === 'bottoms';

        } else if (
          selected === 'dresses'
        ) {

          matchesCategory =
            category === 'dress' ||
            category === 'dresses';

        } else if (
          selectedCategory === 'Outerwear'
        ) {

          matchesCategory =
            category === 'outerwear';

        } else if (
          selectedCategory === 'Shoes'
        ) {

          matchesCategory =
            category === 'shoe' ||
            category === 'shoes' ||
            category === 'footwear';

        }

      }


      // -----------------------------------------------
      // SEARCH FILTER
      // -----------------------------------------------

      const searchableText = [

        item.category,

        item.clothing_type,

        item.subcategory,

        item.color,

        item.secondary_color,

        item.pattern,

        item.material,

        item.sleeve_type,

        item.fit,

        item.style,

        ...(item.season || []),

        ...(item.occasions || []),

      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();


      const matchesQuery =
        searchableText.includes(
          query.toLowerCase()
        );


      return (
        matchesCategory &&
        matchesQuery
      );

    });


  // =======================================================
  // CLOSEST CATEGORY LABEL
  // =======================================================

  function getCategoryLabel(
    item: ClothingItem
  ) {

    const category =
      item.category ||
      item.clothing_type ||
      'Clothing';

    const subcategory =
      item.subcategory;

    if (subcategory) {

      return `${category} · ${subcategory}`;

    }

    return category;

  }


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <ThemedView style={styles.container}>

      <SafeAreaView style={styles.safeArea}>

        <ScrollView
          style={styles.scrollView}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >


          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <View style={styles.header}>

            <View style={styles.headerTop}>

              <View>

                <ThemedText style={styles.kicker}>
                  STYLE SENSE
                </ThemedText>

                <ThemedText
                  type="subtitle"
                  style={styles.heading}
                >
                  {showAddPiece
                    ? 'Add a piece'
                    : 'My Wardrobe'}
                </ThemedText>

              </View>


              <View style={styles.headerRight}>

                <View style={styles.headerWeather}>

                  <ThemedText
                    style={styles.weatherText}
                  >
                    PARIS
                  </ThemedText>

                  <ThemedText
                    style={styles.weatherTemperature}
                  >
                    19°C
                  </ThemedText>

                </View>


                {!showAddPiece && (

                  <Pressable
                    accessibilityLabel="Add clothing"
                    onPress={openAddPiece}
                    style={styles.addHeaderButton}
                  >

                    <SymbolView
                      name={{
                        ios: 'plus',
                        android: 'add',
                        web: 'add',
                      }}
                      size={20}
                      tintColor="#ffffff"
                    />

                    <ThemedText
                      style={styles.addHeaderText}
                    >
                      Add piece
                    </ThemedText>

                  </Pressable>

                )}

              </View>

            </View>


            <ThemedText
              style={styles.description}
            >
              {showAddPiece
                ? 'Capture your garment to add it to your wardrobe.'
                : 'Everything you own, ready to style.'}
            </ThemedText>

          </View>


          {/* ================================================= */}
          {/* ADD PIECE */}
          {/* ================================================= */}

          {showAddPiece ? (

            <View style={styles.addSection}>


              {/* BACK */}

              <Pressable
                onPress={closeAddPiece}
                style={styles.backButton}
              >

                <SymbolView
                  name={{
                    ios: 'chevron.left',
                    android: 'arrow_back',
                    web: 'arrow_back',
                  }}
                  size={18}
                  tintColor="#1b1c1a"
                />

                <ThemedText
                  style={styles.backText}
                >
                  Back to wardrobe
                </ThemedText>

              </Pressable>


              {/* CAMERA / UPLOAD */}

              <View style={styles.actions}>

                <Pressable
                  onPress={takePhoto}
                  style={styles.actionButton}
                >

                  <View
                    style={styles.actionIconDark}
                  >

                    <SymbolView
                      name={{
                        ios: 'camera',
                        android: 'photo_camera',
                        web: 'photo_camera',
                      }}
                      size={20}
                      tintColor="#fedaae"
                    />

                  </View>

                  <ThemedText
                    style={styles.actionTitleLight}
                  >
                    Take photo
                  </ThemedText>

                  <ThemedText
                    style={styles.actionMetaLight}
                  >
                    LIVE APERTURE
                  </ThemedText>

                </Pressable>


                <Pressable
                  onPress={choosePhoto}
                  style={styles.uploadButton}
                >

                  <View
                    style={styles.actionIconLight}
                  >

                    <SymbolView
                      name={{
                        ios: 'photo.on.rectangle',
                        android: 'photo_library',
                        web: 'photo_library',
                      }}
                      size={20}
                      tintColor="#444748"
                    />

                  </View>

                  <ThemedText
                    style={styles.actionTitle}
                  >
                    Upload file
                  </ThemedText>

                  <ThemedText
                    style={styles.actionMeta}
                  >
                    STUDIO LIBRARY
                  </ThemedText>

                </Pressable>

              </View>


              {/* PREVIEW */}

              <View style={styles.preview}>

                {imageUri ? (

                  <>

                    <Image
                      source={{
                        uri: imageUri,
                      }}
                      contentFit="cover"
                      style={styles.image}
                    />


                    <Pressable
                      accessibilityLabel="Remove selected photo"
                      onPress={() =>
                        setImageUri(null)
                      }
                      style={styles.removePhotoButton}
                    >

                      <SymbolView
                        name={{
                          ios: 'xmark',
                          android: 'close',
                          web: 'close',
                        }}
                        size={18}
                        tintColor="#1b1c1a"
                      />

                    </Pressable>

                  </>

                ) : (

                  <View
                    style={styles.emptyPreview}
                  >

                    <SymbolView
                      name={{
                        ios: 'photo',
                        android: 'add_a_photo',
                        web: 'add_a_photo',
                      }}
                      size={38}
                      tintColor="#747878"
                    />

                    <ThemedText
                      style={styles.emptyTitle}
                    >
                      Add picture
                    </ThemedText>

                    <ThemedText
                      style={styles.emptyText}
                    >
                      Your garment preview will appear here.
                    </ThemedText>

                  </View>

                )}

              </View>


              {/* INSTRUCTIONS */}

              {!imageUri && (
                <HowToPhotographCard />
              )}


              {/* ANALYZE */}

              {imageUri && (

                <View style={styles.details}>

                  <ThemedText
                    style={styles.detailsKicker}
                  >
                    READY TO ANALYZE
                  </ThemedText>

                  <ThemedText
                    style={styles.detailsTitle}
                  >
                    Your garment is ready.
                  </ThemedText>

                  <ThemedText
                    style={styles.detailsText}
                  >
                    We will identify its category, color, material,
                    and styling possibilities.
                  </ThemedText>


                  <Pressable
                    onPress={analyzeGarment}
                    disabled={analyzing}
                    style={[
                      styles.analyzeButton,
                      analyzing &&
                        styles.analyzeButtonDisabled,
                    ]}
                  >

                    {analyzing ? (

                      <ActivityIndicator
                        size="small"
                        color="#ffffff"
                      />

                    ) : (

                      <SymbolView
                        name={{
                          ios: 'sparkles',
                          android: 'auto_awesome',
                          web: 'auto_awesome',
                        }}
                        size={18}
                        tintColor="#ffffff"
                      />

                    )}

                    <ThemedText
                      style={styles.analyzeText}
                    >
                      {analyzing
                        ? 'Analyzing...'
                        : 'Analyze garment'}
                    </ThemedText>

                  </Pressable>

                </View>

              )}

            </View>

          ) : (

            <>
              {/* ============================================= */}
              {/* WARDROBE */}
              {/* ============================================= */}


              {/* METRICS */}

              <View style={styles.metricRow}>

                <View style={styles.metricDot} />

                <ThemedText
                  style={styles.metric}
                >
                  {clothes.length} PIECES · 12 SAVED OUTFITS
                </ThemedText>

              </View>


              {/* SEARCH */}

              <View style={styles.searchRow}>

                <View style={styles.searchBox}>

                  <SymbolView
                    name={{
                      ios: 'magnifyingglass',
                      android: 'search',
                      web: 'search',
                    }}
                    size={19}
                    tintColor="#747878"
                  />

                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search your wardrobe"
                    placeholderTextColor="#747878"
                    style={styles.searchInput}
                  />

                </View>


                <Pressable
                  accessibilityLabel="Filter wardrobe"
                  style={styles.filterButton}
                >

                  <SymbolView
                    name={{
                      ios: 'line.3.horizontal.decrease',
                      android: 'tune',
                      web: 'tune',
                    }}
                    size={20}
                    tintColor="#1b1c1a"
                  />

                </Pressable>

              </View>


              {/* CLOTHES / OUTFITS */}

              <View
                style={styles.segmentedControl}
              >

                <Pressable
                  onPress={() =>
                    setShowOutfits(false)
                  }
                  style={[
                    styles.segment,
                    !showOutfits &&
                      styles.segmentSelected,
                  ]}
                >

                  <SymbolView
                    name={{
                      ios: 'hanger',
                      android: 'checkroom',
                      web: 'checkroom',
                    }}
                    size={17}
                    tintColor="#1b1c1a"
                  />

                  <ThemedText
                    style={styles.segmentText}
                  >
                    Clothes
                  </ThemedText>

                  <ThemedText
                    style={styles.count}
                  >
                    {clothes.length}
                  </ThemedText>

                </Pressable>


                <Pressable
                  onPress={() =>
                    setShowOutfits(true)
                  }
                  style={[
                    styles.segment,
                    showOutfits &&
                      styles.segmentSelected,
                  ]}
                >

                  <SymbolView
                    name={{
                      ios: 'wand.and.stars',
                      android: 'auto_fix_high',
                      web: 'auto_fix_high',
                    }}
                    size={17}
                    tintColor="#1b1c1a"
                  />

                  <ThemedText
                    style={styles.segmentText}
                  >
                    Outfits
                  </ThemedText>

                  <ThemedText
                    style={styles.count}
                  >
                    12
                  </ThemedText>

                </Pressable>

              </View>


              {/* CATEGORIES */}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >

                {categories.map(
                  (category) => (

                    <Pressable
                      key={category}
                      onPress={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                      style={[
                        styles.chip,
                        selectedCategory ===
                          category &&
                          styles.chipSelected,
                      ]}
                    >

                      <ThemedText
                        style={[
                          styles.chipText,
                          selectedCategory ===
                            category &&
                            styles.chipTextSelected,
                        ]}
                      >
                        {category}
                      </ThemedText>

                    </Pressable>

                  )
                )}

              </ScrollView>


              {/* ============================================= */}
              {/* CONTENT */}
              {/* ============================================= */}

              {showOutfits ? (

                <View style={styles.emptyState}>

                  <SymbolView
                    name={{
                      ios: 'wand.and.stars',
                      android: 'auto_fix_high',
                      web: 'auto_fix_high',
                    }}
                    size={30}
                    tintColor="#745a38"
                  />

                  <ThemedText
                    style={styles.emptyTitle}
                  >
                    Your saved edits
                  </ThemedText>

                  <ThemedText
                    style={styles.emptyBody}
                  >
                    Your styled outfits will appear here.
                  </ThemedText>

                </View>

              ) : loadingClothes ? (

                <View
                  style={styles.loadingState}
                >

                  <ActivityIndicator
                    size="large"
                    color="#745a38"
                  />

                  <ThemedText
                    style={styles.loadingText}
                  >
                    Loading your wardrobe...
                  </ThemedText>

                </View>

              ) : visibleItems.length === 0 ? (

                <View
                  style={styles.emptyState}
                >

                  <SymbolView
                    name={{
                      ios: 'hanger',
                      android: 'checkroom',
                      web: 'checkroom',
                    }}
                    size={34}
                    tintColor="#745a38"
                  />

                  <ThemedText
                    style={styles.emptyTitle}
                  >
                    No clothes found
                  </ThemedText>

                  <ThemedText
                    style={styles.emptyBody}
                  >
                    {clothes.length === 0
                      ? 'Add your first piece to start building your wardrobe.'
                      : 'Try another category or search term.'}
                  </ThemedText>

                </View>

              ) : (

                <View style={styles.grid}>

                  {visibleItems.map(
                    (item) => (

                      <View
                        key={item.id}
                        style={styles.card}
                      >

                        {/* IMAGE */}

                        <View
                          style={styles.cardImage}
                        >

                          {item.image_url ? (

                            <Image
                              source={{
                                uri: item.image_url,
                              }}
                              contentFit="cover"
                              style={styles.clothingImage}
                            />

                          ) : (

                            <SymbolView
                              name={{
                                ios: 'tshirt',
                                android: 'checkroom',
                                web: 'checkroom',
                              }}
                              size={64}
                              tintColor="#fbf9f6"
                            />

                          )}


                          {/* CATEGORY BADGE */}

                          <View
                            style={styles.wornBadge}
                          >

                            <ThemedText
                              style={styles.wornText}
                            >
                              {(
                                item.color ||
                                'CLOTHING'
                              ).toUpperCase()}
                            </ThemedText>

                          </View>

                        </View>


                        {/* TITLE */}

                        <ThemedText
                          style={styles.cardTitle}
                          numberOfLines={1}
                        >
                          {item.subcategory ||
                            item.category ||
                            item.clothing_type ||
                            'Clothing'}
                        </ThemedText>


                        {/* DETAILS */}

                        <ThemedText
                          style={styles.cardDetail}
                          numberOfLines={1}
                        >
                          {getCategoryLabel(item)}
                        </ThemedText>

                      </View>

                    )
                  )}

                </View>

              )}

            </>

          )}

        </ScrollView>

      </SafeAreaView>

    </ThemedView>

  );
}


// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fbf9f6',
  },

  safeArea: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    backgroundColor: '#fbf9f6',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + 32,
    gap: Spacing.two,
  },

  header: {
    gap: 5,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerRight: {
    alignItems: 'flex-end',
    gap: 10,
  },

  headerWeather: {
    alignItems: 'flex-end',
    gap: 2,
  },

  weatherText: {
    color: '#747878',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },

  weatherTemperature: {
    color: '#745a38',
    fontFamily: Fonts.serif,
    fontSize: 18,
  },

  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#745a38',
  },

  heading: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '500',
    marginTop: 4,
  },

  description: {
    fontSize: 14,
    color: '#747878',
  },

  addHeaderButton: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1b1c1a',
  },

  addHeaderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  addSection: {
    gap: Spacing.three,
    paddingTop: 4,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },

  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444748',
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },

  actionButton: {
    flex: 1,
    minHeight: 122,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1b1c1a',
  },

  uploadButton: {
    flex: 1,
    minHeight: 122,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f5f3f0',
  },

  actionIconDark: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 5,
  },

  actionIconLight: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e4e2df',
    marginBottom: 5,
  },

  actionTitleLight: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  actionMetaLight: {
    color: '#fedaae',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  actionMeta: {
    color: '#747878',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  preview: {
    width: '100%',
    aspectRatio: 1.05,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#dededb',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  removePhotoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,249,246,0.9)',
  },

  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444748',
  },

  emptyText: {
    fontSize: 13,
    color: '#747878',
  },

  details: {
    gap: 8,
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: '#efeeeb',
  },

  detailsKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#745a38',
  },

  detailsTitle: {
    fontSize: 21,
    fontWeight: '600',
  },

  detailsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#747878',
  },

  analyzeButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: '#1b1c1a',
  },

  analyzeButtonDisabled: {
    opacity: 0.6,
  },

  analyzeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  metricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#745a38',
  },

  metric: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#745a38',
  },

  searchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },

  searchBox: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f0eeea',
    borderRadius: 12,
  },

  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#1b1c1a',
    paddingVertical: 0,
  },

  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0eeea',
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentedControl: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#efeeeb',
    borderRadius: 12,
    marginTop: Spacing.one,
  },

  segment: {
    flex: 1,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 9,
  },

  segmentSelected: {
    backgroundColor: '#ffffff',
  },

  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },

  count: {
    fontSize: 10,
    color: '#747878',
    backgroundColor: '#e4e2df',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
  },

  chips: {
    gap: 8,
    paddingVertical: 6,
  },

  chip: {
    height: 34,
    paddingHorizontal: 15,
    borderRadius: 17,
    backgroundColor: '#efeeeb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipSelected: {
    backgroundColor: '#1b1c1a',
  },

  chipText: {
    fontSize: 13,
    color: '#444748',
  },

  chipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 22,
    paddingTop: 4,
  },

  card: {
    width: '48.2%',
  },

  cardImage: {
    aspectRatio: 0.78,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#dededb',
  },

  clothingImage: {
    width: '100%',
    height: '100%',
  },

  wornBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(251,249,246,0.88)',
  },

  wornText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#745a38',
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },

  cardDetail: {
    fontSize: 12,
    color: '#747878',
    marginTop: 2,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    gap: 10,
  },

  emptyBody: {
    fontSize: 14,
    color: '#747878',
    textAlign: 'center',
    paddingHorizontal: 30,
  },

  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    gap: 12,
  },

  loadingText: {
    fontSize: 14,
    color: '#747878',
  },

});