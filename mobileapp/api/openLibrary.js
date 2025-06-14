// TODO: Replace hardcoded "fantasy" with selected genre
import {isbndbGetHeaders, supabase} from '../Supabase';
import {getPages} from "../screens/BookDetail";


// Fetch top books for a fixed genre (e.g., fantasy)
export async function fetchBooks(publishedDate = null) {
  const apiKey = 'c8ZGljOzWgKmXCKsfd6mZdvTNzDZoGyI';
  const baseUrl = 'https://api.nytimes.com/svc/books/v3/lists/overview.json';

  const url = new URL(baseUrl);
  url.searchParams.append('api-key', apiKey);
  if (publishedDate) {
    url.searchParams.append('published_date', publishedDate);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const books = data.results.lists.map(list => ({
      listName: list.display_name,
      updated: list.updated,
      topBook: {
        title: list.books[0].title,
        author: list.books[0].author,
        description: list.books[0].description,
        image: list.books[0].book_image,
        amazonUrl: list.books[0].amazon_product_url,
        isbn13: list.books[0].primary_isbn13
      }
    }));

    return books;
  } catch (error) {
    console.error('Failed to fetch books:', error);
    return null;
  }
}


// Get cover image from ISBNdb book object
export const getCoverUrl = (book) => {
  return (
    book?.cover_image || book?.image || book?.image_original ||
    'https://via.placeholder.com/160x240.png?text=No+Cover'
  );
};
// export const getCoverUrl = (coverId) => {
//     return coverId
//       ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
//       : 'https://via.placeholder.com/160x240.png?text=No+Cover';
//   };

export async function PutBook(book) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('No logged-in user.');
    return;
  }
  // console.log(book)
  const { data, error } = await supabase
    // table name
    .from('book')
    // Upsert seems to be the same as insert + update
    // if the item exists, it updates it, if not it inserts it to the table
    .upsert([{
      title: book.title,
      // Insert provided information or provide null if not given
      author: book.author || book.authors || null,
      cover_image: book.cover_image || null,
      description: book.description || book.synopsis || null,
      genre: book.genre || book.subjects || null,
      isbn: book.isbn || null,
      pages: await getPages(book.isbn),
      // user.id will allow them to edit only tableentries matching their id
      user: user.id
    }]);

  if (error) {
    console.error('Supabase insert error:', error.message);
    return null;
  }
  return data;
}

export async function fetchSimilar(isbn) {
  try {
    const response = await fetch(`https://api2.isbndb.com/book/${isbn}`, {
      headers: isbndbGetHeaders
    });

    const data = await response.json();
    const subject = data.book?.subjects?.[0] || data.book?.authors?.[0] || 'fiction';

    return subject;
    //
    // const booksWithDescriptions = topBooks.map((book) => {
    //   const rawDescription = book.overview || book.synopsis || book.excerpt || '';
    //   const cleanedDescription =
    //       typeof rawDescription === 'string'
    //           ? rawDescription.replace(/https?:\/\/[\S]+/g, '').trim()
    //           : '';
    //
    //   return {
    //     title: book.title || "Unknown Title",
    //     authors: book.authors || [],
    //     isbn: book.isbn13 || book.isbn || null,
    //     cover_image: book.image || book.image_original || null,
    //     description: cleanedDescription.length >= 15 ? cleanedDescription : '',
    //     publisher: book.publisher || null,
    //     date_published: book.date_published || null,
    //     pages: book.pages || null,
    //     binding: book.binding || null,
    //     language: book.language || null,
    //     genre: "fantasy" // optional if you want to tag it
    //   };
    // });
    //
    // return booksWithDescriptions;
  } catch (error) {
    console.error('Error fetching books from ISBNdb:', error);
    return [];
  }
}
