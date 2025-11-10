/*
  # Create articles table

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `subtitle` (text)
      - `content` (jsonb) - array of paragraph/bullet blocks
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `articles` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read articles"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (true);
