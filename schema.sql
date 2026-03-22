-- ==========================================
-- SOLUÇÃO DEFINITIVA PARA ERRO 42P17 (RECURSÃO INFINITA)
-- ==========================================

-- 1. Limpeza de Políticas Antigas (Execute isso se o erro persistir)
-- DROP POLICY IF EXISTS "usuarios_self_select" ON usuarios;
-- DROP POLICY IF EXISTS "usuarios_self_insert" ON usuarios;
-- DROP POLICY IF EXISTS "usuarios_adm_select" ON usuarios;
-- DROP FUNCTION IF EXISTS is_admin();

-- 2. Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nome_completo TEXT,
  turma TEXT,
  adm BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  is_combo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pendente',
  pagou BOOLEAN DEFAULT FALSE,
  retirou BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Tabela de Tickets de Sorteio
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  numero_ticket SERIAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- FUNÇÃO SECURITY DEFINER (O SEGREDO)
-- ==========================================
-- Esta função roda com privilégios de sistema (bypass RLS)
-- Ela checa se o usuário é ADM sem disparar a política de SELECT da tabela usuarios.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() AND adm = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- POLÍTICAS DE ACESSO (NÃO RECURSIVAS)
-- ==========================================

-- USUARIOS
-- 1. Usuário pode ver seu próprio perfil (Simples, sem subquery)
CREATE POLICY "usuarios_select_own" ON usuarios FOR SELECT USING (auth.uid() = id);
-- 2. Usuário pode inserir seu próprio perfil no cadastro
CREATE POLICY "usuarios_insert_own" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);
-- 3. Usuário pode atualizar seu próprio perfil
CREATE POLICY "usuarios_update_own" ON usuarios FOR UPDATE USING (auth.uid() = id);
-- 4. ADM pode ver todos os usuários (Usa a função Security Definer para evitar recursão)
CREATE POLICY "usuarios_adm_select_all" ON usuarios FOR SELECT USING (is_admin());

-- PRODUTOS
CREATE POLICY "produtos_read_all" ON produtos FOR SELECT USING (true);
CREATE POLICY "produtos_adm_all" ON produtos FOR ALL USING (is_admin());

-- PEDIDOS
CREATE POLICY "pedidos_select_own" ON pedidos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "pedidos_insert_own" ON pedidos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "pedidos_adm_all" ON pedidos FOR ALL USING (is_admin());

-- ITENS_PEDIDO
CREATE POLICY "itens_select_own" ON itens_pedido FOR SELECT USING (
  EXISTS (SELECT 1 FROM pedidos WHERE id = itens_pedido.pedido_id AND usuario_id = auth.uid())
);
CREATE POLICY "itens_insert_own" ON itens_pedido FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pedidos WHERE id = itens_pedido.pedido_id AND usuario_id = auth.uid())
);
CREATE POLICY "itens_adm_all" ON itens_pedido FOR ALL USING (is_admin());

-- TICKETS
CREATE POLICY "tickets_select_own" ON tickets FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "tickets_insert_own" ON tickets FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "tickets_adm_all" ON tickets FOR ALL USING (is_admin());

-- 8. Inserir produtos iniciais
INSERT INTO produtos (nome, preco, categoria, is_combo) VALUES
('Pastel de Carne', 8.00, 'Pastéis', FALSE),
('Pastel de Queijo', 8.00, 'Pastéis', FALSE),
('Pastel de Frango', 8.00, 'Pastéis', FALSE),
('Pastel de Pizza', 8.50, 'Pastéis', FALSE),
('Pastel de Chocolate', 9.00, 'Pastéis Doce', FALSE),
('Combo Hello World (Pastel + Refri)', 15.00, 'Combos', TRUE),
('Combo Web Namoro (2 Pastéis + 2 Refris)', 28.00, 'Combos', TRUE),
('Refrigerante Lata', 5.00, 'Bebidas', FALSE),
('Caldo de Cana 300ml', 7.00, 'Bebidas', FALSE)
ON CONFLICT DO NOTHING;
