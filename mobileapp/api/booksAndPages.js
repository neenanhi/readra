import { supabase } from "../Supabase";

export async function getBooksAndPages() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No logged-in user.");
    return { totalBooks: 0, totalPages: 0 };
  }

  // Query the rewind table for this user's stats
  const { data, error } = await supabase
    .from("rewind")
    .select("total_books_read, total_pages_read")
    .eq("user", user.id)
    .maybeSingle();

  return {
    totalBooks: data?.total_books_read || 0,
    totalPages: data?.total_pages_read || 0,
  };
}
