import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../Supabase';
import { UserContext } from '../context/UserContext';

export default function ProfileScreen({ navigation }) {
  // Store the current user ID and username
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const { refreshDisplayName } = useContext(UserContext);

  // loading=true only while we fetch the existing username once
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Immediately-invoked async function to:
    // 1) get the current user (if any),  
    // 2) fetch their username from profiles (if user exists).
    (async () => {
      try {
        // v2: getUser() returns { data: { user }, error }
        const {
          data: { user },
          error: getUserError,
        } = await supabase.auth.getUser();

        if (getUserError || !user) {
          // No user signed in or error—just skip fetching
          return;
        }

        setUserId(user.id);

        // Fetch existing username from profiles
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        // If row exists, set it; if no row (PGRST116), ignore.
        if (!fetchError && data?.username) {
          setUsername(data.username);
        }
      } catch (err) {
        console.log('Fetch username error:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Called when “Save” is tapped
  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Not signed in', 'Please sign in first.');
      return;
    }

    try {
      // Build the upsert payload
      const updates = {
        id: userId,
        username: username.trim() === '' ? null : username.trim(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { returning: 'minimal' });

      if (error) throw error;
      await refreshDisplayName(); // Update UserContext displayName
      Alert.alert('Saved!', 'Your username has been updated.');
      navigation.navigate('Home');
    } catch (err) {
      console.log('Upsert error:', err.message);
      Alert.alert('Error', 'Could not save your username.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Set Your Username</Text>

      {/* TextInput remains editable even while loading. */}
      <TextInput
        style={styles.input}
        placeholder="e.g. booklover123"
        value={username}
        autoCapitalize="none"
        onChangeText={setUsername}
      />

      <Button title="Save" onPress={handleSave} disabled={loading} />

      {/* Show a tiny hint if we’re still fetching the existing username */}
      {loading && <Text style={styles.hint}>Loading...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: '500',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
    borderRadius: 4,
    fontSize: 16,
  },
  hint: {
    marginTop: 8,
    color: '#555',
    fontStyle: 'italic',
  },
});