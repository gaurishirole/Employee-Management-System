import { supabase } from "../config/supabase.js";

async function run() {
  const { data, error } = await supabase
    .from("Leaves")
    .select("*")
    .limit(1);
  if (error) {
    console.error("Error querying Leaves:", error);
  } else {
    console.log("Leaves record sample:", data);
  }
}
run();
