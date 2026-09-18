import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HowToPhotographCard } from '@/components/how-to-photograph-card';
import { BottomTabInset, Fonts, Spacing } from '@/constants/theme';

export default function AddScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function choosePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to choose a garment image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to photograph a garment.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.9 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerTop}><View><ThemedText style={styles.kicker}>STYLE SENSE</ThemedText><ThemedText type="subtitle" style={styles.title}>Add a piece</ThemedText></View><View style={styles.headerWeather}><ThemedText style={styles.weatherText}>PARIS</ThemedText><ThemedText style={styles.weatherTemperature}>19°C</ThemedText></View></View>
            <ThemedText style={styles.description}>Capture your garment to add it to your wardrobe.</ThemedText>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={takePhoto} style={styles.actionButton}>
              <View style={styles.actionIconDark}>
                <SymbolView name={{ ios: 'camera', android: 'photo_camera', web: 'photo_camera' }} size={20} tintColor="#fedaae" />
              </View>
              <ThemedText style={styles.actionTitleLight}>Take photo</ThemedText>
              <ThemedText style={styles.actionMetaLight}>LIVE APERTURE</ThemedText>
            </Pressable>
            <Pressable onPress={choosePhoto} style={styles.uploadButton}>
              <View style={styles.actionIconLight}>
                <SymbolView name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }} size={20} tintColor="#444748" />
              </View>
              <ThemedText style={styles.actionTitle}>Upload file</ThemedText>
              <ThemedText style={styles.actionMeta}>STUDIO LIBRARY</ThemedText>
            </Pressable>
          </View>

          <View style={styles.preview}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} contentFit="cover" style={styles.image} />
                <Pressable
                  accessibilityLabel="Remove selected photo"
                  onPress={() => setImageUri(null)}
                  style={styles.removePhotoButton}>
                  <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor="#1b1c1a" />
                </Pressable>
              </>
            ) : (
              <View style={styles.emptyPreview}>
                <SymbolView name={{ ios: 'photo', android: 'add_a_photo', web: 'add_a_photo' }} size={38} tintColor="#747878" />
                <ThemedText style={styles.emptyTitle}>Add picture</ThemedText>
                <ThemedText style={styles.emptyText}>Your garment preview will appear here.</ThemedText>
              </View>
            )}
          </View>

          {!imageUri && <HowToPhotographCard />}

          {imageUri ? (
            <View style={styles.details}>
              <ThemedText style={styles.detailsKicker}>READY TO ANALYZE</ThemedText>
              <ThemedText style={styles.detailsTitle}>Your garment is ready.</ThemedText>
              <ThemedText style={styles.detailsText}>We will identify its category, color, material, and styling possibilities.</ThemedText>
              <Pressable style={styles.analyzeButton}>
                <SymbolView name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} size={18} tintColor="#ffffff" />
                <ThemedText style={styles.analyzeText}>Analyze garment</ThemedText>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fbf9f6' },
  safeArea: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + 120, gap: Spacing.three },
  header: { gap: 5 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerWeather: { alignItems: 'flex-end', gap: 2 },
  weatherText: { color: '#747878', fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  weatherTemperature: { color: '#745a38', fontFamily: Fonts.serif, fontSize: 18 },
  kicker: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700', letterSpacing: 2, color: '#745a38' },
  title: { fontFamily: Fonts.serif, fontSize: 32, lineHeight: 40, fontWeight: '500', marginTop: 4 },
  description: { fontSize: 14, color: '#747878' },
  actions: { flexDirection: 'row', gap: Spacing.two },
  actionButton: { flex: 1, minHeight: 122, alignItems: 'flex-start', justifyContent: 'center', gap: 5, padding: 14, borderRadius: 12, backgroundColor: '#1b1c1a' },
  uploadButton: { flex: 1, minHeight: 122, alignItems: 'flex-start', justifyContent: 'center', gap: 5, padding: 14, borderRadius: 12, backgroundColor: '#f5f3f0' },
  actionIconDark: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 5 },
  actionIconLight: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e4e2df', marginBottom: 5 },
  actionTitleLight: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  actionTitle: { fontSize: 16, fontWeight: '600' },
  actionMetaLight: { color: '#fedaae', fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  actionMeta: { color: '#747878', fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  preview: { width: '100%', aspectRatio: 1.05, overflow: 'hidden', borderRadius: 16, backgroundColor: '#dededb' },
  image: { width: '100%', height: '100%' },
  removePhotoButton: { position: 'absolute', top: 12, right: 12, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(251,249,246,0.9)', boxShadow: '0 2px 6px rgba(27, 28, 26, 0.14)' },
  emptyPreview: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 9 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#444748' },
  emptyText: { fontSize: 13, color: '#747878' },
  details: { gap: 8, padding: Spacing.three, borderRadius: 14, backgroundColor: '#efeeeb' },
  detailsKicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: '#745a38' },
  detailsTitle: { fontSize: 21, fontWeight: '600' },
  detailsText: { fontSize: 14, lineHeight: 20, color: '#747878' },
  analyzeButton: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, borderRadius: 12, backgroundColor: '#1b1c1a' },
  analyzeText: { color: '#ffffff', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  
});
