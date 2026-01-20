import type { DiaryApi } from "@/types/index";
import { mockDiaryApi } from "./mockApi";
import { supabaseApi } from "./supabaseApi";
import { supabase } from "./supabase";

// Automatic switching based on configuration
export const api: DiaryApi = supabase ? supabaseApi : mockDiaryApi;
