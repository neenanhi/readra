import {supabase} from "../Supabase";

export async function getBooksAndPages() {
    const {
        data: {user},
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("No logged-in user.");
        return {totalBooks: 0, totalPages: 0};
    }

    // Query the rewind table for this user's stats
    let {data, error} = await supabase
        .from("book")
        .select("pages")
        .eq("user", user.id)

    // data = JSON.parse(data);

    let total_pages = 0;

    for (let i = 0; i < data.length; i++) {
      total_pages += data[i]["pages"]
    }

    return {
        totalBooks: data?.length || 0,
        totalPages: total_pages,
    };
}
