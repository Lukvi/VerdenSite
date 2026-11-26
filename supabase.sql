-- =====================================================================
--  CLAVE — A REDE · banco de dados (Supabase)
--  Cole este arquivo INTEIRO no "SQL Editor" do Supabase e clique em Run.
--  Pode rodar de novo sem medo: ele não apaga nada que já exista.
-- =====================================================================

-- ---------- Tabelas ----------

create table if not exists public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    discord_id  text,
    nome        text not null default 'Viajante',
    avatar      text,
    bio         text default '',
    titulo      text default '',
    papel       text not null default 'jogador' check (papel in ('mestre','jogador')),
    aprovado    boolean not null default false,
    criado      timestamptz not null default now()
);

create table if not exists public.posts (
    id          uuid primary key default gen_random_uuid(),
    autor_id    uuid not null references public.profiles(id) on delete cascade,
    tipo        text not null default 'lore',
    titulo      text not null default '',
    capa        text,
    tags        text[] not null default '{}',
    visibilidade text not null default 'todos' check (visibilidade in ('todos','escolhidos','mestre')),
    para        uuid[] not null default '{}',
    blocos      jsonb not null default '[]',
    meta        jsonb not null default '{}',
    fixado      boolean not null default false,
    rascunho    boolean not null default false,
    criado      timestamptz not null default now(),
    editado     timestamptz
);

create table if not exists public.segredos (
    id          uuid primary key default gen_random_uuid(),
    post_id     uuid not null references public.posts(id) on delete cascade,
    conteudo    text not null default '',
    para        uuid[] not null default '{}',
    revelado    boolean not null default false
);

create table if not exists public.comentarios (
    id          uuid primary key default gen_random_uuid(),
    post_id     uuid not null references public.posts(id) on delete cascade,
    autor_id    uuid not null references public.profiles(id) on delete cascade,
    pai_id      uuid references public.comentarios(id) on delete cascade,
    texto       text not null,
    criado      timestamptz not null default now()
);

create table if not exists public.reacoes (
    post_id     uuid not null references public.posts(id) on delete cascade,
    user_id     uuid not null references public.profiles(id) on delete cascade,
    selo        text not null,
    primary key (post_id, user_id, selo)
);

create table if not exists public.personagens (
    id          uuid primary key default gen_random_uuid(),
    dono_id     uuid not null references public.profiles(id) on delete cascade,
    nome        text not null default 'Sem nome',
    dados       jsonb not null default '{}',
    avatar      text,
    publico     boolean not null default true,
    criado      timestamptz not null default now(),
    atualizado  timestamptz
);

-- ---------- Funções de apoio ----------

create or replace function public.eh_membro() returns boolean
language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.profiles where id = auth.uid() and aprovado);
$$;

create or replace function public.eh_mestre() returns boolean
language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.profiles where id = auth.uid() and aprovado and papel = 'mestre');
$$;

create or replace function public.meu_papel() returns text
language sql stable security definer set search_path = public as $$
    select papel from public.profiles where id = auth.uid();
$$;

create or replace function public.meu_aprovado() returns boolean
language sql stable security definer set search_path = public as $$
    select coalesce((select aprovado from public.profiles where id = auth.uid()), false);
$$;

-- ---------- Perfil automático no primeiro login ----------
-- A PRIMEIRA pessoa que entrar vira Mestre e já é aprovada.
-- As demais entram na "sala de espera" até o Mestre aprovar.

create or replace function public.novo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
declare qtd int;
begin
    select count(*) into qtd from public.profiles;
    insert into public.profiles (id, discord_id, nome, avatar, papel, aprovado)
    values (
        new.id,
        new.raw_user_meta_data->>'provider_id',
        coalesce(new.raw_user_meta_data->'custom_claims'->>'global_name',
                 new.raw_user_meta_data->>'full_name',
                 new.raw_user_meta_data->>'name',
                 'Viajante'),
        new.raw_user_meta_data->>'avatar_url',
        case when qtd = 0 then 'mestre' else 'jogador' end,
        qtd = 0
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
    for each row execute function public.novo_usuario();

-- ---------- Segurança (quem pode ver e fazer o quê) ----------

alter table public.profiles    enable row level security;
alter table public.posts       enable row level security;
alter table public.segredos    enable row level security;
alter table public.comentarios enable row level security;
alter table public.reacoes     enable row level security;
alter table public.personagens enable row level security;

-- Perfis
drop policy if exists "perfis: ver" on public.profiles;
create policy "perfis: ver" on public.profiles for select to authenticated
    using (id = auth.uid() or public.eh_membro());

drop policy if exists "perfis: editar o meu" on public.profiles;
create policy "perfis: editar o meu" on public.profiles for update to authenticated
    using (id = auth.uid())
    with check (id = auth.uid() and papel = public.meu_papel() and aprovado = public.meu_aprovado());

drop policy if exists "perfis: mestre gerencia" on public.profiles;
create policy "perfis: mestre gerencia" on public.profiles for update to authenticated
    using (public.eh_mestre()) with check (public.eh_mestre());

-- Posts
drop policy if exists "posts: ver" on public.posts;
create policy "posts: ver" on public.posts for select to authenticated
    using (
        public.eh_membro()
        and (not rascunho or autor_id = auth.uid())
        and (visibilidade = 'todos' or autor_id = auth.uid() or public.eh_mestre() or auth.uid() = any(para))
    );

drop policy if exists "posts: criar" on public.posts;
create policy "posts: criar" on public.posts for insert to authenticated
    with check (
        public.eh_membro() and autor_id = auth.uid()
        and (tipo not in ('decreto','missao') or public.eh_mestre())
        and (not fixado or public.eh_mestre())
    );

drop policy if exists "posts: editar" on public.posts;
create policy "posts: editar" on public.posts for update to authenticated
    using (public.eh_membro() and (autor_id = auth.uid() or public.eh_mestre()))
    with check (
        (autor_id = auth.uid() or public.eh_mestre())
        and (tipo not in ('decreto','missao') or public.eh_mestre())
        and (not fixado or public.eh_mestre())
    );

drop policy if exists "posts: apagar" on public.posts;
create policy "posts: apagar" on public.posts for delete to authenticated
    using (public.eh_membro() and (autor_id = auth.uid() or public.eh_mestre()));

-- Segredos (o texto secreto fica numa tabela à parte, de propósito:
-- quem não pode ler não recebe o conteúdo, nem mexendo no navegador)
drop policy if exists "segredos: ver" on public.segredos;
create policy "segredos: ver" on public.segredos for select to authenticated
    using (
        public.eh_membro() and (
            revelado
            or auth.uid() = any(para)
            or public.eh_mestre()
            or exists (select 1 from public.posts p where p.id = post_id and p.autor_id = auth.uid())
        )
    );

drop policy if exists "segredos: escrever" on public.segredos;
create policy "segredos: escrever" on public.segredos for all to authenticated
    using (public.eh_membro() and (public.eh_mestre()
           or exists (select 1 from public.posts p where p.id = post_id and p.autor_id = auth.uid())))
    with check (public.eh_membro() and (public.eh_mestre()
           or exists (select 1 from public.posts p where p.id = post_id and p.autor_id = auth.uid())));

-- Comentários
drop policy if exists "comentarios: ver" on public.comentarios;
create policy "comentarios: ver" on public.comentarios for select to authenticated
    using (public.eh_membro() and exists (select 1 from public.posts p where p.id = post_id));

drop policy if exists "comentarios: criar" on public.comentarios;
create policy "comentarios: criar" on public.comentarios for insert to authenticated
    with check (public.eh_membro() and autor_id = auth.uid()
                and exists (select 1 from public.posts p where p.id = post_id));

drop policy if exists "comentarios: apagar" on public.comentarios;
create policy "comentarios: apagar" on public.comentarios for delete to authenticated
    using (public.eh_membro() and (autor_id = auth.uid() or public.eh_mestre()));

-- Reações
drop policy if exists "reacoes: ver" on public.reacoes;
create policy "reacoes: ver" on public.reacoes for select to authenticated
    using (public.eh_membro() and exists (select 1 from public.posts p where p.id = post_id));

drop policy if exists "reacoes: criar" on public.reacoes;
create policy "reacoes: criar" on public.reacoes for insert to authenticated
    with check (public.eh_membro() and user_id = auth.uid()
                and exists (select 1 from public.posts p where p.id = post_id));

drop policy if exists "reacoes: apagar" on public.reacoes;
create policy "reacoes: apagar" on public.reacoes for delete to authenticated
    using (user_id = auth.uid());

-- Personagens (fichas)
drop policy if exists "personagens: ver" on public.personagens;
create policy "personagens: ver" on public.personagens for select to authenticated
    using (public.eh_membro() and (publico or dono_id = auth.uid() or public.eh_mestre()));

drop policy if exists "personagens: criar" on public.personagens;
create policy "personagens: criar" on public.personagens for insert to authenticated
    with check (public.eh_membro() and dono_id = auth.uid());

drop policy if exists "personagens: editar" on public.personagens;
create policy "personagens: editar" on public.personagens for update to authenticated
    using (public.eh_membro() and (dono_id = auth.uid() or public.eh_mestre()))
    with check (dono_id = auth.uid() or public.eh_mestre());

drop policy if exists "personagens: apagar" on public.personagens;
create policy "personagens: apagar" on public.personagens for delete to authenticated
    using (public.eh_membro() and (dono_id = auth.uid() or public.eh_mestre()));

-- ---------- Armazenamento de imagens ----------

insert into storage.buckets (id, name, public)
values ('midia', 'midia', true)
on conflict (id) do nothing;

drop policy if exists "midia: leitura" on storage.objects;
create policy "midia: leitura" on storage.objects for select
    using (bucket_id = 'midia');

drop policy if exists "midia: envio" on storage.objects;
create policy "midia: envio" on storage.objects for insert to authenticated
    with check (bucket_id = 'midia'
                and (storage.foldername(name))[1] = auth.uid()::text
                and public.eh_membro());

drop policy if exists "midia: apagar" on storage.objects;
create policy "midia: apagar" on storage.objects for delete to authenticated
    using (bucket_id = 'midia'
           and ((storage.foldername(name))[1] = auth.uid()::text or public.eh_mestre()));

-- ---------- Índices ----------
create index if not exists posts_criado_idx on public.posts (fixado desc, criado desc);
create index if not exists comentarios_post_idx on public.comentarios (post_id);
create index if not exists segredos_post_idx on public.segredos (post_id);
create index if not exists personagens_dono_idx on public.personagens (dono_id);

-- ---------- Permissões de acesso à API ----------
-- (projetos novos do Supabase podem não liberar as tabelas por padrão)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema public to anon, authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;

-- Pronto. Volte ao guia para o próximo passo.
