import { supabase } from '../Supabase';

/** GET - Fetch a user's associated books */
export async function fetchUserBooks(userId) {
  try {
    // Verify we have a valid user ID
    if (!userId) {
      console.error('No user ID provided');
      return [];
    }

    const { data, error } = await supabase
      .from('book')
      .select('*')
      .eq('user', userId);  // Make sure this matches your column name exactly

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Fetched books:', data);
    return data || [];  // Ensure we always return an array
  } catch (error) {
    console.error('Failed to fetch user books:', error);
    return [];
  }
}
