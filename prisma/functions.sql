-- Helper function: safely extract a float value from a JSON text column.
-- Returns NULL instead of throwing when the text is not valid JSON or the
-- key is missing / not numeric. Used by the homepage flat-listing query to
-- tolerate legacy or corrupt Review.ratings rows without crashing the page.
--
-- Apply once per environment after `prisma db push`:
--   DATABASE_URL=... node -e "
--     const {PrismaClient}=require('./node_modules/@prisma/client');
--     const p=new PrismaClient();
--     const fs=require('fs');
--     p.\$executeRawUnsafe(fs.readFileSync('prisma/functions.sql','utf8'))
--       .then(()=>p.\$disconnect());
--   "
CREATE OR REPLACE FUNCTION safe_jsonb_float(text_val TEXT, key TEXT)
RETURNS FLOAT
LANGUAGE plpgsql IMMUTABLE STRICT
AS $$
BEGIN
  RETURN (text_val::jsonb ->> key)::float;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;
