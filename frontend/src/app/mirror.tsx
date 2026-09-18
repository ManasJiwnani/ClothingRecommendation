import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';

export default function MirrorScreen() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [error, setError] = useState('');
  const [command, setCommand] = useState('');

  // -----------------------------
  // START CAMERA
  // -----------------------------
  const startCamera = async () => {
    try {
      setError('');

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setError('Camera is not supported by this browser.');
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraStarted(true);
    } catch (err) {
      console.error(err);
      setError(
        'Unable to access webcam. Please allow camera permission.'
      );
    }
  };

  // -----------------------------
  // STOP CAMERA
  // -----------------------------
  const stopCamera = () => {
    const stream =
      videoRef.current?.srcObject as MediaStream | null;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStarted(false);
  };

  // -----------------------------
  // CLEANUP
  // -----------------------------
  useEffect(() => {
    return () => {
      const stream =
        videoRef.current?.srcObject as MediaStream | null;

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // -----------------------------
  // COMMAND HANDLER
  // -----------------------------
  const handleCommand = (text: string) => {
    setCommand(text);

    console.log('Mirror command:', text);

    // Later:
    // send command to FastAPI
    // FastAPI -> LangGraph -> recommendation
    // recommendation -> virtual try-on
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <Text style={styles.brand}>
          STYLE SENSE
        </Text>

        <Text style={styles.title}>
          AI SMART MIRROR
        </Text>
      </View>


      {/* ================= CAMERA ================= */}

      <View style={styles.cameraContainer}>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* CAMERA NOT STARTED */}

        {!cameraStarted && (
          <View style={styles.cameraPlaceholder}>

            <Text style={styles.placeholderTitle}>
              Your AI wardrobe mirror
            </Text>

            <Text style={styles.placeholderText}>
              Stand in front of your webcam to begin
            </Text>

            <Pressable
              style={styles.startButton}
              onPress={startCamera}
            >
              <Text style={styles.startButtonText}>
                START MIRROR
              </Text>
            </Pressable>

            {error ? (
              <Text style={styles.error}>
                {error}
              </Text>
            ) : null}

          </View>
        )}

        {/* LIVE BADGE */}

        {cameraStarted && (
          <View style={styles.liveBadge}>

            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              LIVE MIRROR
            </Text>

          </View>
        )}

      </View>


      {/* ================= STOP BUTTON ================= */}

      {cameraStarted && (
        <Pressable
          style={styles.stopButton}
          onPress={stopCamera}
        >
          <Text style={styles.stopButtonText}>
            STOP MIRROR
          </Text>
        </Pressable>
      )}


      {/* ================= AI COMMAND AREA ================= */}

      {cameraStarted && (
        <View style={styles.commandContainer}>

          <Text style={styles.commandTitle}>
            What would you like to wear?
          </Text>


          {/* QUICK COMMANDS */}

          <View style={styles.commandRow}>

            <Pressable
              style={styles.commandButton}
              onPress={() =>
                handleCommand('Change my top')
              }
            >
              <Text style={styles.commandText}>
                Change Top
              </Text>
            </Pressable>


            <Pressable
              style={styles.commandButton}
              onPress={() =>
                handleCommand('Change my bottom')
              }
            >
              <Text style={styles.commandText}>
                Change Bottom
              </Text>
            </Pressable>


            <Pressable
              style={styles.commandButton}
              onPress={() =>
                handleCommand('Give me a full outfit')
              }
            >
              <Text style={styles.commandText}>
                Full Outfit
              </Text>
            </Pressable>

          </View>


          {/* AI INPUT */}

          <View style={styles.aiInputContainer}>

            <Text style={styles.aiIcon}>
              ✨
            </Text>

            <TextInput
              value={command}
              onChangeText={setCommand}
              placeholder="Ask AI Stylist..."
              placeholderTextColor="#888888"
              style={styles.aiInput}
            />

            <Pressable
              style={styles.sendButton}
              onPress={() =>
                handleCommand(command)
              }
            >
              <Text style={styles.sendText}>
                →
              </Text>
            </Pressable>

          </View>

        </View>
      )}

    </ScrollView>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  page: {
    flex: 1,
    backgroundColor: '#fbf9f6',
  },

  container: {
    padding: 24,
    paddingBottom: 130,
  },


  // ---------------- HEADER ----------------

  header: {
    marginBottom: 16,
  },

  brand: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#745a38',
  },

  title: {
    marginTop: 5,
    fontSize: 28,
    fontWeight: '500',
    color: '#111111',
  },


  // ---------------- CAMERA ----------------

  cameraContainer: {
  width: '100%',
  maxWidth: 550,
  aspectRatio: 3 / 4,
  alignSelf: 'center',
  borderRadius: 18,
  overflow: 'hidden',
  backgroundColor: '#171717',
  position: 'relative',
},

  cameraPlaceholder: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  placeholderTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '500',
    textAlign: 'center',
  },

  placeholderText: {
    marginTop: 10,
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
  },


  // ---------------- START ----------------

  startButton: {
    marginTop: 25,
    backgroundColor: '#111111',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },

  startButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },


  // ---------------- ERROR ----------------

  error: {
    marginTop: 15,
    color: '#ffaaaa',
    textAlign: 'center',
  },


  // ---------------- LIVE ----------------

  liveBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff5555',
  },

  liveText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },


  // ---------------- STOP ----------------

  stopButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#e4e2df',
  },

  stopButtonText: {
    color: '#222222',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },


  // ---------------- COMMANDS ----------------

  commandContainer: {
    marginTop: 20,
  },

  commandTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 12,
  },

  commandRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },

  commandButton: {
    backgroundColor: '#f0eeea',
    borderWidth: 1,
    borderColor: '#e4e2df',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },

  commandText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222222',
  },


  // ---------------- AI INPUT ----------------

  aiInputContainer: {
    marginTop: 14,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e2df',
  },

  aiIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  aiInput: {
    flex: 1,
    color: '#222222',
    fontSize: 14,
  },

  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '500',
  },

});