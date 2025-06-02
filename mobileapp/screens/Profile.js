import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView, Platform, StatusBar,
} from 'react-native';
import { supabase } from '../Supabase';
import { UserContext } from '../context/UserContext';
import { launchImageLibrary } from 'react-native-image-picker';

import { COLORS } from '../styles/colors';
import { SPACING } from '../styles/spacing';
import { TEXT } from '../styles/typography';

function getFileExtension(uriString, mimeType, originalFileName) {
  if (originalFileName) {
    const nameParts = originalFileName.split('.');
    if (nameParts.length > 1) {
      const ext = nameParts.pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return ext;
      }
    }
  }

  if (mimeType) {
    switch (mimeType.toLowerCase()) {
      case 'image/jpeg': return 'jpg';
      case 'image/png': return 'png';
      case 'image/gif': return 'gif';
      case 'image/webp': return 'webp';
    }
  }

  if (uriString) {
    const uriParts = uriString.split('.');
    if (uriParts.length > 1) {
      const extFromUri = uriParts.pop().toLowerCase().split('?')[0];
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extFromUri)) {
        return extFromUri;
      }
    }
  }
  return 'jpg';
}


export default function ProfileScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');

  const [imagePreviewUri, setImagePreviewUri] = useState(null);
  const [selectedLocalAsset, setSelectedLocalAsset] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { refreshDisplayName } = useContext(UserContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();

        if (getUserError || !user) {
          console.warn('User not found or error fetching user:', getUserError?.message);
          return;
        }
        setUserId(user.id);

        const { data: profileData, error: fetchError } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

        if (fetchError) {
          console.log('Fetch profile info warning (profile might not exist yet):', fetchError.message);
        } else if (profileData) {
          if (profileData.username) setUsername(profileData.username);
          if (profileData.avatar_url) setImagePreviewUri(profileData.avatar_url);
        }
      } catch (err) {
        console.error('Fetch profile error:', err.message);
        Alert.alert('Error', 'Could not load your profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.didCancel) {
      console.log('User cancelled image picker');
      return;
    }
    if (result.errorCode) {
      Alert.alert('Image Picker Error', result.errorMessage || 'Unknown error');
      return;
    }

    const asset = result.assets && result.assets[0];
    if (asset && asset.uri) {
      setImagePreviewUri(asset.uri);
      setSelectedLocalAsset({
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName
      });
    } else {
      Alert.alert('Error', 'Could not select image. Please try again.');
    }
  };

  const uploadProfilePhoto = async (asset, currentUserId) => {
    if (!asset || !asset.uri || !currentUserId) {
      throw new Error("Asset or user ID missing for upload.");
    }

    setUploading(true);
    try {
      const localUri = asset.uri;
      const assetType = asset.type;

      const fileExt = getFileExtension(localUri, assetType, asset.fileName);
      const uploadPath = `${currentUserId}.${fileExt}`;

      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        name: uploadPath,
        type: assetType,
      });

      const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(uploadPath, formData, {
            upsert: true,
          });

      if (uploadError) {
        console.error('Supabase upload error details:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('avatars')
          .getPublicUrl(uploadPath);

      if (urlError) {
        console.error('Error getting public URL:', urlError);
        throw urlError;
      }
      return publicUrl;

    } catch (err) {
      console.error('Upload profile photo error:', err.message, err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Not signed in', 'Please sign in first.');
      return;
    }

    setUploading(true);
    let finalAvatarUrl = imagePreviewUri;

    try {
      if (selectedLocalAsset && selectedLocalAsset.uri) {
        finalAvatarUrl = await uploadProfilePhoto(selectedLocalAsset, userId);
      }

      const updates = {
        id: userId,
        username: username.trim() === '' ? null : username.trim(),
        avatar_url: finalAvatarUrl,
      };

      const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(updates, { returning: 'minimal' });

      if (upsertError) {
        console.error('Profile upsert error:', upsertError);
        throw upsertError;
      }

      await refreshDisplayName();

      if (selectedLocalAsset && finalAvatarUrl) {
        setImagePreviewUri(finalAvatarUrl);
      }
      setSelectedLocalAsset(null);

      Alert.alert('Saved!', 'Your profile has been updated.');

    } catch (err) {
      console.error('Save profile error:', err.message);
      Alert.alert('Error', `Could not save your profile: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007aff" />
          <Text style={styles.hint}>Loading profile...</Text>
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.heading}>Your Profile</Text>

        <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.avatarContainer}>
          {imagePreviewUri ? (
              <Image source={{ uri: imagePreviewUri }} style={styles.avatar} />
          ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>Choose Photo</Text>
              </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.photoButton]} onPress={pickImage} disabled={uploading}>
          <Text style={styles.buttonText}>{selectedLocalAsset ? 'Change Photo' : 'Choose Photo'}</Text>
        </TouchableOpacity>

        <TextInput
            style={styles.input}
            placeholder="Username (e.g. booklover123)"
            value={username}
            autoCapitalize="none"
            onChangeText={setUsername}
            editable={!uploading}
        />

        <Button
            title={uploading ? 'Saving…' : 'Save Profile'}
            onPress={handleSave}
            disabled={uploading || loading}
            color="#007aff"
        />

        {uploading && <ActivityIndicator style={{ marginTop: 20 }} size="small" color="#007aff"/>}
      </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background, 
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#007aff',
    padding: 3,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#555',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  hint: {
    marginTop: 12,
    color: '#555',
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  photoButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
});