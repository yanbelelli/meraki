-- ============================================
-- MERAKI STORE - SUPABASE DATABASE SETUP
-- Execute este SQL no Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================

-- 1. Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Conjuntos',
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) DEFAULT 0,
  image TEXT DEFAULT '',
  badge TEXT DEFAULT 'NEW',
  sizes TEXT[] DEFAULT ARRAY['P','M','G','GG'],
  rating DECIMAL(2,1) DEFAULT 4.5,
  reviews INTEGER DEFAULT 0,
  section TEXT DEFAULT 'best-sellers',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Política: qualquer um pode ler produtos
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

-- 4. Política: apenas usuários autenticados podem inserir/atualizar/excluir
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- 5. Inserir produtos iniciais
INSERT INTO products (name, category, price, original_price, image, badge, sizes, rating, reviews, section, description) VALUES
('Conjunto Orquídea Rose', 'Conjuntos', 39.90, 44.90, 'assets/images/product-1.jpg', '11% OFF', ARRAY['P','M','G','GG'], 4.8, 124, 'best-sellers', 'Conjunto de lingerie em renda com detalhes florais. Tecido macio e confortável.'),
('Conjunto Orquídea Nude', 'Conjuntos', 39.90, 44.90, 'assets/images/product-2.jpg', '11% OFF', ARRAY['P','M','G','GG'], 4.9, 156, 'best-sellers', 'Versão nude do clássico Conjunto Orquídea. Renda delicada com forro de algodão.'),
('Conjunto Orquídea Preto', 'Conjuntos', 39.90, 44.90, 'assets/images/product-3.jpg', '11% OFF', ARRAY['P','M','G','GG'], 4.7, 98, 'best-sellers', 'A versão preta mais elegante do Conjunto Orquídea.'),
('Camisola Aurora Vermelho', 'Linha Noite', 42.90, 44.90, 'assets/images/product-4.jpg', '5% OFF', ARRAY['P','M','G','GG'], 4.6, 87, 'best-sellers', 'Camisola em cetim com detalhes em renda.'),
('Short Doll Laura Rose', 'Linha Noite', 39.90, 0, 'assets/images/product-5.jpg', 'NEW', ARRAY['P','M','G','GG'], 4.8, 65, 'featured', 'Short doll em malha de algodão com estampa floral.'),
('Short Doll Laura Preto', 'Linha Noite', 39.90, 0, 'assets/images/product-6.jpg', 'NEW', ARRAY['P','M','G','GG'], 4.7, 54, 'featured', 'Versão preta do Short Doll Laura.'),
('Conjunto Giovanna Rose', 'Conjuntos', 39.90, 0, 'assets/images/product-7.jpg', 'NEW', ARRAY['P','M','G','GG'], 4.9, 112, 'featured', 'Conjunto premium com sutiã push-up e calcinha fio.'),
('Conjunto Giovanna Bege', 'Conjuntos', 39.90, 0, 'assets/images/product-8.jpg', 'NEW', ARRAY['P','M','G','GG'], 4.8, 89, 'featured', 'Elegância em tom bege com renda floral.'),
('Body Sensual Preto', 'Linha Sexy', 49.90, 59.90, 'assets/images/product-9.jpg', '17% OFF', ARRAY['P','M','G','GG'], 4.9, 143, 'new-collection', 'Body em renda com decote profundo e detalhes em tule.'),
('Robe Elegance Rose', 'Linha Sexy', 54.90, 64.90, 'assets/images/product-10.jpg', '15% OFF', ARRAY['P','M','G','GG'], 4.8, 76, 'new-collection', 'Robe em cetim com acabamento em renda.'),
('Conjunto Premium Dourado', 'Conjuntos', 59.90, 79.90, 'assets/images/product-11.jpg', '25% OFF', ARRAY['P','M','G','GG'], 5.0, 201, 'new-collection', 'Peça exclusiva da coleção premium.'),
('Pijama Conforto Rosa', 'Linha Noite', 44.90, 54.90, 'assets/images/product-12.jpg', '18% OFF', ARRAY['P','M','G','GG'], 4.7, 92, 'new-collection', 'Pijama de manga longa em malha de algodão.');

-- 6. (Opcional) Para tornar um usuário admin, execute após o cadastro:
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}' WHERE email = 'SEU_EMAIL_AQUI';
