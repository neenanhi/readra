import { supabase } from "../Supabase";

/** 
  * POST: Creates a new log entry to Supabase
  * @param {logInfo[string]} bookId    - Book's unique identifier
	* @param {logInfo[string]} pagesRead - Number of pages user has read, in regards to the bookId 
*/
export async function createBookLog(pagesRead, bookId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('No logged-in user.');
    return;
  }

  const { data, error } = await supabase
    .from('logs')
    .insert([{
      pages: pagesRead || 0,
      book: bookId || null,
      user: user.id
    }]);

  if (error) {
    console.error('Supabase insert error:', error.message);
    return null;
  }
  return data;
}

/** 
 * GET: Fetches associated log data. Used for user's rewind.
 * @returns  { Object } logData        All of the user's log data
 * @property { Array }  logs           - Contains all user logs   
 * @property { Number } totalPagesRead - Total amount of pages user has read across all books 
 * @property { Object } mostPagesLog   - The specific log where the user has read the most pages 
*/
export async function getLogData() {
  try {
    /** Create new log data object. */
    logData = { logs: [], totalPagesRead: 0, mostPagesLog: null}
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
  
    if (userError || !user) {
      console.error('No logged-in user.');
      return;
    }

    /** Fetch user logs from supabase */
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('pages', { ascending: false });
    
    if (error) {
      console.error("Supabase log error:", error.message);
      return logData;
    }

    /** Update logs based on retrieved supabase data */
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
