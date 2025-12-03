-- 1. Ensure at least one service exists
INSERT INTO public.services (id, name, price_cents, duration_minutes)
VALUES (
    's1',
    '{"EN": "Dental Hygiene", "LV": "Zobu Higiēna", "RU": "Гигиена зубов"}',
    5000,
    60
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.services (id, name, price_cents, duration_minutes)
VALUES (
    's2',
    '{"EN": "Root Canal", "LV": "Sakņu Kanālu Ārstēšana", "RU": "Лечение каналов"}',
    12000,
    90
)
ON CONFLICT (id) DO NOTHING;

-- 2. Update bookings with NULL or invalid service_id to point to 's1'
UPDATE public.bookings
SET service_id = 's1'
WHERE service_id IS NULL OR service_id NOT IN (SELECT id FROM public.services);
