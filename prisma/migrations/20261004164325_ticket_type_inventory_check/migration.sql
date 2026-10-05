-- Add DB-level safety net check constraint on ticket_type inventory
ALTER TABLE "ticket_type"
ADD CONSTRAINT "ticket_type_inventory_check"
CHECK (held >= 0 AND sold >= 0 AND (held + sold) <= total);