// TODO: Replace hardcoded "fantasy" with selected genre
import { supabase } from '../Supabase';


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
