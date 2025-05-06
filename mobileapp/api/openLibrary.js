// TODO: Replace hardcoded "fantasy" with selected genre
import {supabase} from '../Supabase';


export async function fetchBooks() {
    const response = await fetch('https://openlibrary.org/search.json?q=fantasy');
    const data = await response.json();
    const topBooks = data.docs.slice(0, 8); 

    const booksWithDescriptions = await Promise.all(
        topBooks.map(async (book) => {
            let description = '';
            try {
              const workResponse = await fetch(`https://openlibrary.org${book.key}.json`);
              const workData = await workResponse.json();
              if (typeof workData.description === 'string') {
                if (workData.description.trim().length < 15 || /^https?:\/\//.test(workData.description.trim())) {
                  description = '';
                } else {
                  description = workData.description.replace(/https?:\/\/[\S]+/g, '').trim();
                }
              } else if (workData.description?.value) {
                const raw = workData.description.value;
                description = raw.replace(/https?:\/\/[\S]+/g, '').trim();
              }
            } catch (err) {
              console.warn('No description found for', book.title);
            }
            return { ...book, description };
          })
        );

        return booksWithDescriptions;
}

export const getCoverUrl = (coverId) => {
    return coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
      : 'https://via.placeholder.com/160x240.png?text=No+Cover';
  };

export async function PutBook(book) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('No logged-in user.');
    return;
  }

  const { data, error } = await supabase
    // table name
    .from('book')
    // Upsert seems to be the same as insert + update
    // if the item exists, it updates it, if not it inserts it to the table
    .upsert([{
      title: book.title,
      // Insert provided information or provide null if not given
      author: book.author || null,
      cover_image: book.cover_image || null,
      description: book.description || null,
      genre: book.genre || null,
      isbn: book.isbn || null,
      // user.id will allow them to edit only tableentries matching their id
      user: user.id
    }]);

  if (error) {
    console.error('Supabase insert error:', error.message);
    return null;
  }
  return data;
}


/** 
 * Fetches associated log data. Used for user's rewind.
 * @returns  { Object } logData        - All of the user's log data
 * @property { Array }  logs           - Contains all user logs   
 * @property { Number } totalPagesRead - Total amount of pages user has read across all books 
 * @property { Object } mostPagesLog   - The specific log where the user has read the most pages 
*/
export async function getLogData() {
  try {
    /** Create new log data object. */
    logData = {
      logs: [],
      totalPagesRead: 0,
      mostPagesLog: 0,
    }
    // Get the current user's ID
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
  
    if (userError || !user) {
      console.error('No logged-in user.');
      return;
    }

    /** Fetch user logs */
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('pages', { ascending: false });
    
    if (error) {
      console.error("Supabase log error:", error.message);
      return null;
    }

    console.log('data', data);

    /** Update logData based on user's log data */
    logData['logs'] = data;
    logData['mostPagesLog'] = data[0];

    /** Update logData object by calculating total pages read */
    const pagesRead = data.reduce((total, log) => total + log.pages, 0);
    logData['totalPagesRead'] = pagesRead;

    return logData;

  } catch (err) {
    console.error("Unexpected error:", err);
    return null;
  }

};

