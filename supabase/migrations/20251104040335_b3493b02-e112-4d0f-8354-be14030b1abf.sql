-- Criar os 5 funcionários do balcão
-- Senha para todos: vm11
DO $$
DECLARE
  user_andre UUID;
  user_ramon UUID;
  user_lucas UUID;
  user_vinicius UUID;
  user_mariana UUID;
BEGIN
  -- Inserir usuário Andre (apenas se não existir)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'andre@balcao.local') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'andre@balcao.local',
      crypt('vm11', gen_salt('bf')),
      NOW(),
      jsonb_build_object('nome_completo', 'Andre'),
      NOW(),
      NOW(),
      '',
      ''
    )
    RETURNING id INTO user_andre;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_andre, 'balcao');
  END IF;

  -- Inserir usuário Ramon
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ramon@balcao.local') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'ramon@balcao.local',
      crypt('vm11', gen_salt('bf')),
      NOW(),
      jsonb_build_object('nome_completo', 'Ramon'),
      NOW(),
      NOW(),
      '',
      ''
    )
    RETURNING id INTO user_ramon;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_ramon, 'balcao');
  END IF;

  -- Inserir usuário Lucas
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lucas@balcao.local') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'lucas@balcao.local',
      crypt('vm11', gen_salt('bf')),
      NOW(),
      jsonb_build_object('nome_completo', 'Lucas'),
      NOW(),
      NOW(),
      '',
      ''
    )
    RETURNING id INTO user_lucas;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_lucas, 'balcao');
  END IF;

  -- Inserir usuário Vinicius
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vinicius@balcao.local') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'vinicius@balcao.local',
      crypt('vm11', gen_salt('bf')),
      NOW(),
      jsonb_build_object('nome_completo', 'Vinicius'),
      NOW(),
      NOW(),
      '',
      ''
    )
    RETURNING id INTO user_vinicius;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_vinicius, 'balcao');
  END IF;

  -- Inserir usuário Mariana
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mariana@balcao.local') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'mariana@balcao.local',
      crypt('vm11', gen_salt('bf')),
      NOW(),
      jsonb_build_object('nome_completo', 'Mariana'),
      NOW(),
      NOW(),
      '',
      ''
    )
    RETURNING id INTO user_mariana;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_mariana, 'balcao');
  END IF;

END $$;