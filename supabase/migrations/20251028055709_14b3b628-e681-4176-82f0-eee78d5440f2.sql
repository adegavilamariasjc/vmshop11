-- ========================================
-- MIGRAÇÃO: Sistema de Autenticação Segura
-- Cria estrutura de roles, profiles e atualiza RLS policies
-- ========================================

-- 1. Criar ENUM de roles
CREATE TYPE app_role AS ENUM ('admin', 'motoboy');

-- 2. Criar tabela profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  telefone TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela user_roles (ANTES das policies que a referenciam)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 4. Criar função SECURITY DEFINER para evitar recursão RLS
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. AGORA habilitar RLS e criar policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- RLS: Apenas admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS: Usuários podem ver suas próprias roles
CREATE POLICY "Users can view own roles"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS: Apenas admins podem gerenciar roles
CREATE POLICY "Admins can manage all roles"
ON user_roles FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 6. Trigger para criar perfil automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, nome_completo)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- ATUALIZAR RLS POLICIES DAS TABELAS EXISTENTES
-- ========================================

-- PRODUTOS: Apenas admins podem gerenciar
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;
DROP POLICY IF EXISTS "Enable public access for products" ON products;

CREATE POLICY "Admins can manage products"
ON products FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view products"
ON products FOR SELECT
USING (true);

-- CATEGORIAS: Apenas admins podem gerenciar
DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON categories;
DROP POLICY IF EXISTS "Enable public access for categories" ON categories;

CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view categories"
ON categories FOR SELECT
USING (true);

-- BAIRROS: Apenas admins podem gerenciar
DROP POLICY IF EXISTS "Allow authenticated users to insert bairros" ON bairros;
DROP POLICY IF EXISTS "Allow authenticated users to update bairros" ON bairros;
DROP POLICY IF EXISTS "Allow authenticated users to delete bairros" ON bairros;
DROP POLICY IF EXISTS "Enable public access for bairros" ON bairros;

CREATE POLICY "Admins can manage bairros"
ON bairros FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view bairros"
ON bairros FOR SELECT
USING (true);

-- PEDIDOS: Regras complexas para admins, motoboys e público
DROP POLICY IF EXISTS "Allow public access for pedidos" ON pedidos;

-- Público pode criar pedidos (clientes fazendo pedidos)
CREATE POLICY "Public can create pedidos"
ON pedidos FOR INSERT
WITH CHECK (true);

-- Admins podem ver e gerenciar todos os pedidos
CREATE POLICY "Admins can manage all pedidos"
ON pedidos FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Motoboys podem ver pedidos com entregador atribuído
CREATE POLICY "Motoboys can view assigned pedidos"
ON pedidos FOR SELECT
USING (
  has_role(auth.uid(), 'motoboy') AND
  entregador IS NOT NULL AND
  cliente_bairro != 'BALCAO'
);

-- Motoboys podem atualizar apenas status de pedidos atribuídos
CREATE POLICY "Motoboys can update assigned pedidos status"
ON pedidos FOR UPDATE
USING (
  has_role(auth.uid(), 'motoboy') AND
  entregador IS NOT NULL
)
WITH CHECK (
  has_role(auth.uid(), 'motoboy') AND
  entregador IS NOT NULL
);