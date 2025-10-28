# Setup de Usuários Iniciais - Sistema de Autenticação

## ⚠️ IMPORTANTE: Execute este script MANUALMENTE no Supabase

Após a migração do banco de dados ter sido executada com sucesso, você precisa criar os usuários iniciais manualmente.

## Passos para Configuração

### 1. Desabilitar Confirmação de Email no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard/project/zdtuvslyqayjedjsfvwa)
2. Vá em **Authentication** → **Providers** → **Email**
3. **Desabilite** a opção "**Confirm email**"
4. Clique em **Save**

### 2. Executar Script SQL para Criar Usuários

1. No Supabase Dashboard, vá em **SQL Editor**
2. Crie uma nova query
3. Copie e cole o script SQL abaixo
4. Execute o script

```sql
-- ========================================
-- SCRIPT DE SETUP INICIAL - USUÁRIOS
-- Execute este script MANUALMENTE no Supabase SQL Editor
-- ========================================

-- 1. Criar usuário ADMINISTRADOR
-- Email: admvm11@sistema.local
-- Senha: admvm93
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admvm11@sistema.local',
  crypt('admvm93', gen_salt('bf')),
  NOW(),
  '{"nome_completo": "Administrador do Sistema"}'::jsonb,
  '',
  '',
  '',
  '',
  NOW(),
  NOW()
);

-- 2. Criar usuário MOTOBOYS (compartilhado)
-- Email: motoboys@sistema.local
-- Senha: vm11
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'motoboys@sistema.local',
  crypt('vm11', gen_salt('bf')),
  NOW(),
  '{"nome_completo": "Equipe de Motoboys"}'::jsonb,
  '',
  '',
  '',
  '',
  NOW(),
  NOW()
);

-- 3. Atribuir role de ADMIN ao primeiro usuário
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'admvm11@sistema.local';

-- 4. Atribuir role de MOTOBOY ao segundo usuário
INSERT INTO user_roles (user_id, role)
SELECT id, 'motoboy'::app_role 
FROM auth.users 
WHERE email = 'motoboys@sistema.local';

-- 5. Verificar usuários criados
SELECT 
  u.id,
  u.email,
  ur.role,
  p.nome_completo
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%@sistema.local'
ORDER BY u.created_at;
```

### 3. Verificar Criação dos Usuários

Após executar o script, você deve ver uma tabela com 2 usuários:

| email | role | nome_completo |
|-------|------|---------------|
| admvm11@sistema.local | admin | Administrador do Sistema |
| motoboys@sistema.local | motoboy | Equipe de Motoboys |

## 📋 Credenciais de Acesso

### Administrador
- **Usuário:** `admvm11`
- **Senha:** `admvm93`
- **Acesso:** Painel completo de administração em `/admin`

### Motoboys
- **Usuário:** `motoboys`
- **Senha:** `vm11`
- **Acesso:** Painel de entregas em `/entregas`

## 🔐 Como Fazer Login

1. Na página inicial, clique no botão de **engrenagem** (⚙️) no canto inferior esquerdo
2. Uma modal será aberta com duas abas: **Administrador** e **Motoboys**
3. Selecione a aba apropriada
4. Digite apenas o **usuário** (não precisa incluir `@sistema.local`)
5. Digite a **senha**
6. Clique em **Entrar**

## ✅ Funcionalidades Implementadas

- ✅ Autenticação segura com Supabase Auth
- ✅ Senhas hasheadas com bcrypt
- ✅ Sistema de roles (admin e motoboy)
- ✅ RLS policies protegendo dados
- ✅ Sessão persistente (não precisa relogar)
- ✅ Interface unificada de login
- ✅ Redirecionamento automático baseado em role
- ✅ Logout seguro

## 🚨 Troubleshooting

### Erro: "User already registered"
Se você já executou o script antes, os usuários já existem. Você pode:
1. Fazer login normalmente com as credenciais acima
2. OU deletar os usuários existentes e executar o script novamente

### Erro ao fazer login
1. Verifique se você desabilitou "Confirm email" no Supabase
2. Verifique se executou o script SQL completo
3. Confirme que os usuários foram criados na query de verificação (item 5 do script)

### Não redireciona após login
1. Limpe o cache do navegador
2. Faça um hard refresh (Ctrl+Shift+R)
3. Verifique o console do navegador por erros

## 📚 Próximos Passos

Após configurar os usuários, você pode:
1. Adicionar mais motoboys criando novos usuários e atribuindo a role `motoboy`
2. Personalizar os perfis na tabela `profiles`
3. Implementar recuperação de senha (futuro)
4. Adicionar 2FA (futuro)
