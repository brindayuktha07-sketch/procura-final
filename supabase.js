// PROCURA - Supabase connection
// Replace ONLY these two values with the Project URL and Publishable/Anon Key
// from your Supabase project. Never put a service-role/secret key in this file.

const PROCURA_SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const PROCURA_SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";

(function () {
  const configured =
    PROCURA_SUPABASE_URL.startsWith("https://") &&
    !PROCURA_SUPABASE_URL.includes("YOUR_") &&
    PROCURA_SUPABASE_KEY &&
    !PROCURA_SUPABASE_KEY.includes("YOUR_");

  if (!configured) {
    console.warn("PROCURA Supabase is not configured yet. The app will use localStorage.");
    window.ProcuraCloud = { enabled: false };
    return;
  }

  const client = window.supabase.createClient(
    PROCURA_SUPABASE_URL,
    PROCURA_SUPABASE_KEY
  );

  window.ProcuraCloud = {
    enabled: true,

    async load() {
      const { data, error } = await client
        .from("app_state")
        .select("state")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;
      return data ? data.state : null;
    },

    async save(state) {
      const { error } = await client
        .from("app_state")
        .upsert({ id: 1, state }, { onConflict: "id" });

      if (error) throw error;
    }
  };

  console.log("PROCURA connected to Supabase");
})();
