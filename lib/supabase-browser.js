// lib/supabase-browser.js
"use client"; // importantissimo, indica che questo file è codice client

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const supabase = createClientComponentClient();
