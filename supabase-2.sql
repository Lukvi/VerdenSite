-- =====================================================================
--  VERDEN AF · rodada 1 (seguir, notificações, recados, salvos,
--  enquetes, presença diária e banner de perfil)
--  Cole INTEIRO no SQL Editor do Supabase e clique em Run.
--  Pode rodar mais de uma vez sem problema.
-- =====================================================================

alter table public.profiles add column if not exists banner text;

create table if not exists public.follows (
    follower_id uuid not null references public.profiles(id) on delete cascade,
    followed_id uuid not null references public.profiles(id) on delete cascade,
    criado      timestamptz not null default now(),
    primary key (follower_id, followed_id),
    check (follower_id <> followed_id)
);

create table if not exists public.notificacoes (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references public.profiles(id) on delete cascade,
    de_id       uuid references public.profiles(id) on delete set null,
    tipo        text not null,
    post_id     uuid references public.posts(id) on delete cascade,
    texto       text not null default '',
    lida        boolean not null default false,
    criado      timestamptz not null default now()
);

create table if not exists public.recados (
    id          uuid primary key default gen_random_uuid(),
    perfil_id   uuid not null references public.profiles(id) on delete cascade,
    autor_id    uuid not null references public.profiles(id) on delete cascade,
    texto       text not null,
    criado      timestamptz not null default now()
);

create table if not exists public.salvos (
    user_id     uuid not null references public.profiles(id) on delete cascade,
    post_id     uuid not null references public.posts(id) on delete cascade,
    criado      timestamptz not null default now(),
    primary key (user_id, post_id)
);

create table if not exists public.votos (
    post_id     uuid not null references public.posts(id) on delete cascade,
    bloco_id    text not null,
    user_id     uuid not null references public.profiles(id) on delete cascade,
    opcao       text not null,
    criado      timestamptz not null default now(),
    primary key (post_id, bloco_id, user_id)
);

create table if not exists public.checkins (
    user_id     uuid not null references public.profiles(id) on delete cascade,
    dia         date not null,
    primary key (user_id, dia)
);

create index if not exists notif_user_idx on public.notificacoes (user_id, criado desc);
create index if not exists recados_perfil_idx on public.recados (perfil_id, criado desc);
create index if not exists votos_post_idx on public.votos (post_id);

alter table public.follows       enable row level security;
alter table public.notificacoes  enable row level security;
alter table public.recados       enable row level security;
alter table public.salvos        enable row level security;
alter table public.votos         enable row level security;
alter table public.checkins      enable row level security;

-- Seguir
drop policy if exists "follows: ver" on public.follows;
create policy "follows: ver" on public.follows for select to authenticated using (public.eh_membro());
drop policy if exists "follows: seguir" on public.follows;
create policy "follows: seguir" on public.follows for insert to authenticated
    with check (public.eh_membro() and follower_id = auth.uid());
drop policy if exists "follows: deixar de seguir" on public.follows;
create policy "follows: deixar de seguir" on public.follows for delete to authenticated using (follower_id = auth.uid());

-- Notificações (cada pessoa só vê as suas)
drop policy if exists "notif: ver" on public.notificacoes;
create policy "notif: ver" on public.notificacoes for select to authenticated using (user_id = auth.uid());
drop policy if exists "notif: criar" on public.notificacoes;
create policy "notif: criar" on public.notificacoes for insert to authenticated
    with check (public.eh_membro() and de_id = auth.uid());
drop policy if exists "notif: marcar" on public.notificacoes;
create policy "notif: marcar" on public.notificacoes for update to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "notif: apagar" on public.notificacoes;
create policy "notif: apagar" on public.notificacoes for delete to authenticated using (user_id = auth.uid());

-- Recados
drop policy if exists "recados: ver" on public.recados;
create policy "recados: ver" on public.recados for select to authenticated using (public.eh_membro());
drop policy if exists "recados: criar" on public.recados;
create policy "recados: criar" on public.recados for insert to authenticated
    with check (public.eh_membro() and autor_id = auth.uid());
drop policy if exists "recados: apagar" on public.recados;
create policy "recados: apagar" on public.recados for delete to authenticated
    using (public.eh_membro() and (autor_id = auth.uid() or perfil_id = auth.uid() or public.eh_mestre()));

-- Salvos (privados)
drop policy if exists "salvos: ver" on public.salvos;
create policy "salvos: ver" on public.salvos for select to authenticated using (user_id = auth.uid());
drop policy if exists "salvos: criar" on public.salvos;
create policy "salvos: criar" on public.salvos for insert to authenticated
    with check (public.eh_membro() and user_id = auth.uid());
drop policy if exists "salvos: apagar" on public.salvos;
create policy "salvos: apagar" on public.salvos for delete to authenticated using (user_id = auth.uid());

-- Votos de enquete
drop policy if exists "votos: ver" on public.votos;
create policy "votos: ver" on public.votos for select to authenticated
    using (public.eh_membro() and exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists "votos: votar" on public.votos;
create policy "votos: votar" on public.votos for insert to authenticated
    with check (public.eh_membro() and user_id = auth.uid()
                and exists (select 1 from public.posts p where p.id = post_id));

-- Presença diária
drop policy if exists "checkins: ver" on public.checkins;
create policy "checkins: ver" on public.checkins for select to authenticated using (public.eh_membro());
drop policy if exists "checkins: marcar" on public.checkins;
create policy "checkins: marcar" on public.checkins for insert to authenticated
    with check (public.eh_membro() and user_id = auth.uid());

-- Permissões de acesso
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;
