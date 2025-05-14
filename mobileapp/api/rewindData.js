import { supabase } from "../Supabase";

/**
 * Retrieves information for Rewind Screen 3:
 * - Top 3 authors by frequency
 * - Top 3 books by highest user rating
 *
 * @returns {Object} - An object containing topAuthors and topBooks arrays
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
    .not('author', 'is', null)
    .neq('author', '')
    .not('user_rating', 'is', null);

  if (error) {
    console.error('Error fetching book data:', error);
    return;
  }

  // Process top authors
  const authorCounts = {};
  for (const row of data) {
    const author = row.author;
    if (author) {
      authorCounts[author] = (authorCounts[author] || 0) + 1;
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
    topAuthors,
    topBooks: ratedBooks,
  };
}


// export async function getRewind3Data() {
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

  
//   // Grab user's top authors (ignores null and empty values)
//   const { data, error } = await supabase
//     .from('book')
//     .select('author', 'title', 'user_rating')
//     .order('user_rating', { ascending: true })
//     .limit(3);
// }

// /** 
//   * Retrieves information used for rewind screen 3: user's top authors. Currently returns top 3 authors
//   * @returns  { Array } Top Authors        - User's top 3 authors based on their library
// */
// export async function getTopAuthors() {
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     console.error('No logged-in user.');
//     return;
//   }

//   // Grab user's top authors (ignores null and empty values)
//   const { data, error } = await supabase
//     .from('book')
//     .select('author')
//     .not('author', 'is', null)
//     .neq('author', '');

//   if (error) {
//     console.error('Error fetching authors:', error);
//     return;
//   }
    
//   authorsDict = {}

//   for (const row of data) {
//     const author = row.author;
//     if (authorsDict.hasOwnProperty(author)) {
//       authorsDict[author]++;
//     } else {
//       authorsDict[author] = 1;
//     }
//   }

//   const sortedAuthorsDict = Object.entries(authorsDict).sort((a, b) => b[1] - a[1]);
//   const topAuthors = sortedAuthorsDict.slice(0, 3).map(([key]) => key);

//   return topAuthors;
// }

// /** 
//   * Retrieves the title and rating of the user's top 3 rated books in their library.
//   * @returns  { Array } Top Books        - User's top 3 rated books based on their library
// */
// export async function getTopBooks() {
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     console.error('No logged-in user.');
//     return;
//   }

//   // Grab user's top authors (ignores null and empty values)
//   const { data, error } = await supabase
//     .from('book')
//     .select('title, user_rating')
//     .not('user_rating', 'is', null)
//     .order('user_rating', { ascending: true })
//     .limit(3);

//   if (error) {
//     console.error('Error fetching ratings:', error);
//     return;

//   } else {
//     return data;
//   }

// }
