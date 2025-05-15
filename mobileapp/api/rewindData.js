import { supabase } from "../Supabase";

/**
 * Helper function to retrieve information for Rewind Screen 3:
 * @returns  { Object }     - An object containing two properties: topAuthors and topBooks arrays
 * @property { topAuthors } - Type: Array. Returns 0-3 of the user's top rated authors
 * @property { topBooks }   - Type: Array. Returns 0-3 of the user's highest rated books. Each item only contains the book title and rating. 
*/
export async function getRewind3Data() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('No logged-in user.');
    return;
  }

  // Fetch all relevant book data in one query
  const { data, error } = await supabase
    .from('book')
    .select('author, title, user_rating')

  if (error) {
    console.error('Error fetching book data:', error);
    return;
  }

  // Process top authors
  const authorCounts = {};
  for (const row of data) {
    const author = row.author;
    if (authorCounts.hasOwnProperty(author)) {
      authorCounts[author] += 1;
    } else if (author) {
      authorCounts[author] = 1;
    }
  }
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([author]) => author);

  // Process top books
  const ratedBooks = data
    .filter(book => book.user_rating !== null)
    .sort((a, b) => b.user_rating - a.user_rating)
    .slice(0, 3)
    .map(book => ({ title: book.title, user_rating: book.user_rating }));
  
  return {
    topAuthors: topAuthors,
    topBooks: ratedBooks,
  };
}
