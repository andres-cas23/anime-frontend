import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

const ImagenesModal = ({ visible, personaje, imagenes, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTag}>⚡ IMÁGENES</Text>
              <Text style={styles.title}>{personaje?.nombre}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Grid de imágenes */}
          <ScrollView contentContainerStyle={styles.grid}>
            {imagenes.map((img, index) => (
              <View key={img.id || index} style={styles.imgWrapper}>
                <Image
                  source={{ uri: img.url }}
                  style={styles.img}
                 resizeMode="contain"
                />
                <View style={styles.imgBadge}>
                  <Text style={styles.imgBadgeText}>{img.orden || index + 1}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity style={styles.closeFullBtn} onPress={onClose}>
            <Text style={styles.closeFullText}>CERRAR</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0d0d1a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: height * 0.85,
    borderTopWidth: 2,
    borderTopColor: '#e94560',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTag: {
    color: '#e94560',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeBtn: {
    backgroundColor: '#e94560',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#1a1a2e',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingBottom: 16,
  },
  imgWrapper: {
    width: (width - 80) / 2,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#16213e',
    backgroundColor: '#0d0d1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  imgBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#e94560',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  closeFullBtn: {
    backgroundColor: '#e94560',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  closeFullText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 2,
  },
});

export default ImagenesModal;