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

    // Process top authors based on average rating
    const authorRatings = {}; // { "Author Name": { total: x, count: y } }

    for (const row of data) {
      let authors = row.author;
      let rating = parseFloat(row.user_rating);
      if(isNaN(rating)){
        rating = 0
      }

      if (typeof authors === "string" && authors.startsWith("[")) {
        try {
          authors = JSON.parse(authors);
        } catch {
          authors = [authors];
        }
      }

      if (!Array.isArray(authors)) {
        authors = [authors];
      }

      for (const author of authors) {
        if (typeof author !== 'string') continue;
        const cleanAuthor = author.trim();
        if (!cleanAuthor) continue;
        if (!authorRatings[cleanAuthor]) {
          authorRatings[cleanAuthor] = { total: 0, count: 0 };
        }

        authorRatings[cleanAuthor].total += rating;
        authorRatings[cleanAuthor].count += 1;
        // console.log(authorRatings)
      }
    }
    
    const topAuthors = Object.entries(authorRatings)
      .map(([author, stats]) => ({
        author,
        avgRating: stats.total / stats.count,
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 3)
      .map(a => a.author);
    // console.log(topAuthors)



  // Process top books
  const ratedBooks = data
    .map(book => {
      const rating = parseFloat(book.user_rating);
      return {
        title: book.title,
        user_rating: isNaN(rating) || rating === 0 ? "Unrated" : rating,
      };
    })
    .sort((a, b) => {
      const ratingA = typeof a.user_rating === "number" ? a.user_rating : -1;
      const ratingB = typeof b.user_rating === "number" ? b.user_rating : -1;
      return ratingB - ratingA;
    })
    .slice(0, 3)
  
  return {
    topAuthors: topAuthors,
    topBooks: ratedBooks,
  };
}
