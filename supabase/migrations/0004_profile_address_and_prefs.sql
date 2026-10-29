-- mobileDrive — persist account settings beyond the base profile fields.
--
-- `default_delivery_address` holds the single default address the checkout
-- flow pre-fills. Multi-address support (saved shipping addresses) can land
-- in its own `addresses` table later.
--
-- `notification_prefs` is a jsonb map of boolean flags, matching the toggles
-- on /account/settings:
--   orders  — order updates (email)
--   builds  — saved-build reminders
--   offers  — launches & promotions
--   dealer  — dealer messages
--   sms     — SMS test-drive reminders

alter table public.profiles
  add column if not exists default_delivery_address jsonb,
  add column if not exists notification_prefs jsonb not null default
    '{"orders":true,"builds":false,"offers":true,"dealer":true,"sms":true}'::jsonb;
