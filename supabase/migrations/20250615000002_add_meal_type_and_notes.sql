-- Add meal_type and notes columns to meals table
ALTER TABLE meals ADD COLUMN meal_type TEXT;
ALTER TABLE meals ADD COLUMN notes TEXT;
