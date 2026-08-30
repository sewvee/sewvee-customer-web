const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Business-Mobile/src/screens/OrderDetailScreen.js';
let content = fs.readFileSync(file, 'utf8');

const deleteFunc = `
  const handleDeletePhoto = async (orderId, photoId) => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const API_URL = require('../config/env').API_URL;
              const res = await fetch(\`\${API_URL}/mobile/orders/\${orderId}/photos/\${photoId}\`, {
                method: 'DELETE',
                headers: { 'Authorization': \`Bearer \${token}\` },
              });
              if (res.ok) {
                fetchOrderDetails();
              } else {
                Alert.alert("Error", "Failed to delete photo");
              }
            } catch (e) {
              Alert.alert("Error", "An error occurred");
            }
          }
        }
      ]
    );
  };
`;
content = content.replace("  const handleDateUpdate = async newDate => {", deleteFunc + "\n  const handleDateUpdate = async newDate => {");

const oldRenderGroup = `                                                          {photos.map((img, i) => {
                                                              const url = extractUrl(img);
                                                              if (!url) return null;
                                                              return (
                                                                  <TouchableOpacity key={i} onPress={() => setPreviewImageUri(url)} style={{ width: 64, height: 64, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' }}>
                                                                      <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                                                  </TouchableOpacity>
                                                              );
                                                          })}`;
const newRenderGroup = `                                                          {photos.map((img, i) => {
                                                              const url = extractUrl(img);
                                                              if (!url) return null;
                                                              return (
                                                                  <View key={i} style={{ width: 64, height: 64, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' }}>
                                                                      <TouchableOpacity onPress={() => setPreviewImageUri(url)} style={{ width: '100%', height: '100%' }}>
                                                                          <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                                                      </TouchableOpacity>
                                                                      {img?.id && (
                                                                          <TouchableOpacity 
                                                                              onPress={() => handleDeletePhoto(order.id, img.id)}
                                                                              style={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 2, zIndex: 10 }}
                                                                          >
                                                                              <X size={12} color="#FFF" />
                                                                          </TouchableOpacity>
                                                                      )}
                                                                  </View>
                                                              );
                                                          })}`;
content = content.replace(oldRenderGroup, newRenderGroup);
fs.writeFileSync(file, content);
console.log("Mobile App Patched");
