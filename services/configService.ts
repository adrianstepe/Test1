import { supabase } from '../supabaseClient';
import { Language, Service, Specialist, Translations, ServiceCategory } from '../types';
import { SERVICES as FALLBACK_SERVICES, SPECIALISTS as FALLBACK_SPECIALISTS, TEXTS as FALLBACK_TEXTS } from '../constants';

// ===========================================
// CONFIG SERVICE: Dynamic Configuration from Supabase
// ===========================================
// Fetches services, specialists from Supabase tables
// Falls back to hardcoded constants if network fails (resilience)

interface ClinicServiceRow {
  id: string;
  name_en: string;
  name_lv: string;
  name_ru: string | null;
  description_en: string | null;
  description_lv: string | null;
  description_ru: string | null;
  price_cents: number;
  duration_minutes: number;
  icon: string | null;
  display_order: number;
  category: ServiceCategory | null;
}

interface ClinicSpecialistRow {
  id: string;
  name: string;
  role_en: string | null;
  role_lv: string | null;
  role_ru: string | null;
  photo_url: string | null;
  specialty_ids: string[] | null;
  display_order: number;
}

// Infer category from service name if not set in DB
function inferCategoryFromName(nameEn: string): ServiceCategory {
  const name = nameEn.toLowerCase();

  // PREVENTIVE CARE
  if (name.includes('check-up') || name.includes('hygiene') ||
    name.includes('integrated') || name.includes('oral cavity')) {
    return 'preventive';
  }

  // CHILDREN
  if (name.includes('children') || name.includes('pediatric') || name.includes('kid')) {
    return 'children';
  }

  // SURGERY & IMPLANTS
  if (name.includes('surgery') || name.includes('surgical') ||
    name.includes('implant') || name.includes('extraction') ||
    name.includes('jaw bone') || name.includes('bone tissue')) {
    return 'surgery';
  }

  // PROSTHETICS
  if (name.includes('prosthetic') || name.includes('crown') ||
    name.includes('bridge') || name.includes('denture') || name.includes('veneer')) {
    return 'prosthetics';
  }

  // Default to TREATMENT
  return 'treatment';
}

// Transform database row to frontend Service type
function mapServiceRowToService(row: ClinicServiceRow): Service {
  return {
    id: row.id,
    name: {
      [Language.EN]: row.name_en,
      [Language.LV]: row.name_lv,
      [Language.RU]: row.name_ru || row.name_en, // Fallback to EN if RU missing
    },
    description: {
      [Language.EN]: row.description_en || '',
      [Language.LV]: row.description_lv || '',
      [Language.RU]: row.description_ru || row.description_en || '',
    },
    price: row.price_cents / 100, // Convert cents to euros
    durationMinutes: row.duration_minutes,
    icon: row.icon || '',
    category: row.category || inferCategoryFromName(row.name_en), // Infer if not set
  };
}

// Transform database row to frontend Specialist type
function mapSpecialistRowToSpecialist(row: ClinicSpecialistRow): Specialist {
  return {
    id: row.id,
    name: row.name,
    role: {
      [Language.EN]: row.role_en || '',
      [Language.LV]: row.role_lv || '',
      [Language.RU]: row.role_ru || row.role_en || '',
    },
    photoUrl: row.photo_url || '',
    specialties: row.specialty_ids || [],
  };
}

// In-memory cache for session duration
let cachedServices: Service[] | null = null;
let cachedSpecialists: Specialist[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

/**
 * Fetch services from Supabase clinic_services table
 * Falls back to hardcoded constants on error
 */
export async function fetchServices(): Promise<Service[]> {
  // Return cached if valid
  if (cachedServices && isCacheValid()) {
    return cachedServices;
  }

  try {
    const { data, error } = await supabase
      .from('clinic_services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('[ConfigService] Supabase error, using fallback:', error.message);
      return FALLBACK_SERVICES;
    }

    if (!data || data.length === 0) {
      console.warn('[ConfigService] No services found in DB, using fallback');
      return FALLBACK_SERVICES;
    }

    cachedServices = data.map(mapServiceRowToService);
    cacheTimestamp = Date.now();
    console.log(`[ConfigService] Loaded ${cachedServices.length} services from Supabase`);
    return cachedServices;
  } catch (err) {
    console.warn('[ConfigService] Network error, using fallback:', err);
    return FALLBACK_SERVICES;
  }
}

/**
 * Fetch specialists from Supabase clinic_specialists table
 * Falls back to hardcoded constants on error
 */
export async function fetchSpecialists(): Promise<Specialist[]> {
  // Return cached if valid
  if (cachedSpecialists && isCacheValid()) {
    return cachedSpecialists;
  }

  try {
    const { data, error } = await supabase
      .from('clinic_specialists')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('[ConfigService] Supabase error for specialists, using fallback:', error.message);
      return FALLBACK_SPECIALISTS;
    }

    if (!data || data.length === 0) {
      console.warn('[ConfigService] No specialists found in DB, using fallback');
      return FALLBACK_SPECIALISTS;
    }

    cachedSpecialists = data.map(mapSpecialistRowToSpecialist);
    cacheTimestamp = Date.now();
    console.log(`[ConfigService] Loaded ${cachedSpecialists.length} specialists from Supabase`);
    return cachedSpecialists;
  } catch (err) {
    console.warn('[ConfigService] Network error for specialists, using fallback:', err);
    return FALLBACK_SPECIALISTS;
  }
}

/**
 * Fetch all configuration at once
 * Used on widget initialization
 */
export async function fetchAllConfig(): Promise<{
  services: Service[];
  specialists: Specialist[];
  texts: Translations;
}> {
  const [services, specialists] = await Promise.all([
    fetchServices(),
    fetchSpecialists(),
  ]);

  // For now, texts remain hardcoded (UI chrome)
  // Business-critical text is in service names/descriptions
  return {
    services,
    specialists,
    texts: FALLBACK_TEXTS,
  };
}

/**
 * Clear cache (for admin refresh scenarios)
 */
export function clearConfigCache(): void {
  cachedServices = null;
  cachedSpecialists = null;
  cacheTimestamp = 0;
  console.log('[ConfigService] Cache cleared');
}
