-- Execute este SQL no editor do Supabase (SQL Editor > New query)

-- 1. Criar tabela de livros
create table if not exists books (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Ativar Row Level Security (cada usuário só vê seus próprios livros)
alter table books enable row level security;

-- 3. Política: usuários só acessam e modificam seus próprios livros
create policy "Usuários acessam apenas seus livros"
  on books for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Índice para buscas por usuário
create index if not exists books_user_id_idx on books(user_id);
