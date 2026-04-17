insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values (
  'cf52f5a5-569c-459a-af3d-2dbc1585a5c9',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'adminatbistro@gmail.com',
  crypt('Bistro123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

insert into auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  'cf52f5a5-569c-459a-af3d-2dbc1585a5c9',
  'cf52f5a5-569c-459a-af3d-2dbc1585a5c9',
  format('{"sub":"%s","email":"%s"}', 'cf52f5a5-569c-459a-af3d-2dbc1585a5c9', 'adminatbistro@gmail.com')::jsonb,
  'email',
  now(),
  now(),
  now()
);
