import { supabase } from "../Supabase";

/** 
  * Retrieves information used for rewind screen 3: user's top authors. Currently returns top 3 authors
  * @returns  { Array } Top Authors        - User's top 3 authors based on their library
*/
export async function getTopAuthors() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('No logged-in user.');
    return;
  }

  // Grab user's top authors (ignores null and empty values)
  const { data, error } = await supabase
    .from('book')
    .select('author')
    .not('author', 'is', null)
    .neq('author', '');

  if (error) {
    console.error('Error fetching authors:', error);
    return;
  }
    
  authorsDict = {}

  for (const row of data) {
    const author = row.author;
    if (authorsDict.hasOwnProperty(author)) {
      authorsDict[author]++;
    } else {
      authorsDict[author] = 1;
    }
  }
  
  const sortedAuthorsDict = Object.entries(authorsDict).sort((a, b) => b[1] - a[1]);
  const topAuthors = sortedAuthorsDict.slice(0, 3);

  return topAuthors;
}

