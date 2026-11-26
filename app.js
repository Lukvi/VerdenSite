/* ==========================================================
   CLAVE — A REDE · núcleo e telas
   (o editor de posts e o formulário de ficha estão em editor.js)
   ========================================================== */
'use strict';

const CFG = window.CLAVE_CONFIG || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const TIPOS = {
    decreto: { nome: 'Aviso', gl: '⚜', desc: 'Comunicado oficial do Mestre', soMestre: true },
    ficha: { nome: 'Ficha', gl: '♜', desc: 'Apresente um personagem' },
    sistema: { nome: 'Sistema', gl: '⚙', desc: 'Regras e mecânicas' },
    relato: { nome: 'Crônica', gl: '✎', desc: 'Registro de uma sessão' },
    verbete: { nome: 'Verbete', gl: '❖', desc: 'Enciclopédia: NPC, local, facção, item…' },
    lore: { nome: 'Lore', gl: '☾', desc: 'História do mundo' },
    missao: { nome: 'Missão', gl: '⚔', desc: 'Tarefa para o grupo', soMestre: true },
    arte: { nome: 'Arte', gl: '✦', desc: 'Imagens e ilustrações' },
    enquete: { nome: 'Enquete', gl: '☷', desc: 'Pergunte à comunidade' }
};
const SELOS = [
    { id: 'selado', nome: 'Selado', gl: '⚜' }, { id: 'epico', nome: 'Épico', gl: '⚔' },
    { id: 'sombrio', nome: 'Sombrio', gl: '☾' }, { id: 'belo', nome: 'Belo', gl: '✦' }, { id: 'rindo', nome: 'Hilário', gl: '☺' }
];
const ESTADOS_MISSAO = { aberta: 'Aberta', curso: 'Em curso', concluida: 'Concluída' };

const S = { me: null, modo: 'demo', perfis: new Map(), usuariosDemo: [], pendentes: 0, erro: '', filtro: 'todos', tag: '', respondendo: null, aba: 'destaques', follows: [], checks: [], naoLidas: 0 };

/* ---------- Utilidades ---------- */
function urlSegura(u) {
    u = String(u || '').trim();
    return /^(https?:\/\/|data:image\/)/i.test(u) ? u : '';
}
function bg(u) {
    const s = urlSegura(u); if (!s) return '';
    return `style="${esc(`background-image:url('${s.replace(/'/g, '%27').replace(/\\/g, '%5C')}')`)}"`;
}
function quando(iso) {
    if (!iso) return '';
    const d = new Date(iso), s = (Date.now() - d.getTime()) / 1000;
    if (s < 60) return 'agora';
    if (s < 3600) return `há ${Math.floor(s / 60)} min`;
    if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
    if (s < 86400 * 7) return `há ${Math.floor(s / 86400)} d`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
const dataCompleta = iso => iso ? new Date(iso).toLocaleString('pt-BR') : '';
function perfil(id) { return S.perfis.get(id) || { id, nome: 'Alguém', avatar: null, papel: 'jogador' }; }
const ehMestre = () => S.me && S.me.papel === 'mestre';
const podeMexer = dono => S.me && (S.me.id === dono || ehMestre());
function iniciais(n) { return (String(n || '?').trim()[0] || '?').toUpperCase(); }
function avatarHtml(p, cls) {
    const u = urlSegura(p.avatar);
    return `<span class="retrato ${cls || 'av-p'}" ${u ? bg(u) : ''} aria-hidden="true">${u ? '' : esc(iniciais(p.nome))}</span>`;
}
function visLabel(p) {
    if (p.visibilidade === 'mestre') return '🔒 Só o Mestre';
    if (p.visibilidade === 'escolhidos') return '🔒 Para alguns';
    return '';
}

/* ---------- Texto formatado (Markdown simples e seguro) ---------- */
function mdInline(t) {
    let s = esc(t);
    s = s.replace(/\[\[([^\]|]{1,80})(?:\|([^\]]{1,80}))?\]\]/g, (_, alvo, rot) => linkWiki(desesc(alvo), rot || alvo));
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return s.replace(/\n/g, '<br>');
}
function md(src) {
    const linhas = String(src || '').replace(/\r/g, '').split('\n');
    let html = '', lista = null, par = [];
    const fechaPar = () => { if (par.length) { html += '<p>' + mdInline(par.join('\n')) + '</p>'; par = []; } };
    const fechaLista = () => { if (lista) { html += `</${lista}>`; lista = null; } };
    for (const l of linhas) {
        let m;
        if (!l.trim()) { fechaPar(); fechaLista(); continue; }
        if ((m = l.match(/^(#{1,3})\s+(.*)$/))) { fechaPar(); fechaLista(); const n = m[1].length >= 3 ? 3 : 2; html += `<h${n}>${mdInline(m[2])}</h${n}>`; continue; }
        if ((m = l.match(/^>\s?(.*)$/))) { fechaPar(); fechaLista(); html += `<blockquote>${mdInline(m[1])}</blockquote>`; continue; }
        if ((m = l.match(/^\s*[-*]\s+(.*)$/))) { fechaPar(); if (lista !== 'ul') { fechaLista(); html += '<ul>'; lista = 'ul'; } html += `<li>${mdInline(m[1])}</li>`; continue; }
        if ((m = l.match(/^\s*\d+[.)]\s+(.*)$/))) { fechaPar(); if (lista !== 'ol') { fechaLista(); html += '<ol>'; lista = 'ol'; } html += `<li>${mdInline(m[1])}</li>`; continue; }
        fechaLista(); par.push(l);
    }
    fechaPar(); fechaLista();
    return `<div class="md">${html}</div>`;
}
function textoPuro(src) {
    return String(src || '').replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (m, a, b) => b || a).replace(/[#>*`_]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/^\s*[-\d.)]+\s+/gm, '').replace(/\s+/g, ' ').trim();
}

/* ---------- Vídeo (somente links reconhecidos viram player) ---------- */
function videoEmbed(url) {
    const u = String(url || '').trim();
    let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
    if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
    m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (m) return `https://player.vimeo.com/video/${m[1]}`;
    return '';
}

/* ---------- Interface comum ---------- */
let _toastT;
function toast(msg, erro) {
    const t = $('#toast'); t.textContent = msg; t.className = 'toast on' + (erro ? ' erro' : '');
    clearTimeout(_toastT); _toastT = setTimeout(() => t.classList.remove('on'), erro ? 5200 : 2800);
}
function selar() {
    const s = $('#selagem'); s.classList.remove('on'); void s.offsetWidth; s.classList.add('on');
    setTimeout(() => s.classList.remove('on'), 1300);
}
function abrirModal(html) {
    const m = $('#modal'); m.innerHTML = `<div class="modal-caixa" role="dialog" aria-modal="true">${html}</div>`; m.hidden = false;
    const f = $('input,textarea,select,button', m); if (f) f.focus();
    return m;
}
function fecharModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; }
function confirmar(titulo, texto, ok, perigo) {
    return new Promise(res => {
        abrirModal(`<h2>${esc(titulo)}</h2><p>${esc(texto)}</p><div class="modal-acoes">
            <button class="btn" data-m="n">Cancelar</button>
            <button class="btn ${perigo ? 'btn-perigo' : 'btn-primario'}" data-m="s">${esc(ok || 'Confirmar')}</button></div>`);
        $('#modal').onclick = e => {
            const b = e.target.closest('[data-m]');
            if (b) { fecharModal(); res(b.dataset.m === 's'); }
            else if (e.target.id === 'modal') { fecharModal(); res(false); }
        };
    });
}
function seloHtml(tipo, cls) {
    const t = TIPOS[tipo] || TIPOS.lore;
    return `<span class="selo t-${esc(tipo)} ${cls || ''}" title="${esc(t.nome)}"><span>${t.gl}</span></span>`;
}
function carregando() { return `<div class="carregando"><div class="selo"><span>⚜</span></div>Abrindo os arquivos…</div>`; }
function vazio(titulo, texto, acao) {
    return `<div class="vazio"><b>${esc(titulo)}</b>${esc(texto)}${acao ? `<div style="margin-top:14px">${acao}</div>` : ''}</div>`;
}

/* ---------- Moldura (menu lateral) ---------- */
function moldura(conteudo, ativo, estreita) {
    const alias = { mural: 'inicio', registros: 'personagens', mesa: 'comunidade' };
    ativo = alias[ativo] || ativo;
    const itens = [['inicio', '⌂', 'Início', '#/', ''], ['wiki', '❖', 'Enciclopédia', '#/wiki', ''], ['criar', '＋', 'Criar', '#/novo', 'so-mobile'], ['personagens', '♜', 'Personagens', '#/registros', ''],
        ['avisos', '🔔', 'Avisos', '#/avisos', ''], ['cronicas', '✎', 'Crônicas', '#/cronicas', 'so-desk'], ['sistemas', '⚙', 'Sistemas', '#/sistemas', 'so-desk'], ['tomo', '☾', 'Tomo', '#/tomo', 'so-desk'], ['comunidade', '☉', 'Comunidade', '#/membros', 'so-desk'], ['busca', '✦', 'Buscar', '#/busca', 'so-desk']];
    const m = S.me;
    const nav = itens.map(([id, gl, nome, href, cls]) => {
        let n = 0; if (id === 'avisos') n = S.naoLidas; if (id === 'comunidade' && ehMestre()) n = S.pendentes;
        const cont = n ? `<span class="contador" title="${id === 'avisos' ? 'Avisos novos' : 'Aguardando aprovação'}">${n}</span>` : '';
        return `<a href="${href}" class="${cls} ${id === 'criar' ? 'nav-criar' : ''} ${ativo === id ? 'on' : ''}"><span class="gl">${gl}</span>${nome}${cont}</a>`;
    }).join('');
    const demo = S.modo === 'demo' ? `<div class="banner-demo">Modo demonstração: tudo fica só neste navegador.
        <button class="btn btn-peq" data-acao="reiniciar-demo">Reiniciar demonstração</button></div>` : '';
    const marca = `<a class="marca" href="#/"><span class="selo"><span>V</span></span><span><b>${esc(CFG.NOME_REDE || 'Verden Af')}</b><small>${esc(CFG.SUBTITULO || '')}</small></span></a>`;
    return `<div class="app">
        <aside class="rail">
            ${marca}
            <nav class="nav" aria-label="Seções">${nav}</nav>
            <a class="btn btn-primario novo" href="#/novo">Criar post</a>
            <div class="rail-fim">
                <a class="eu" href="#/perfil/${esc(m.id)}">${avatarHtml(m, 'av-p')}<span class="quem"><b>${esc(m.nome)}</b><small>${m.papel === 'mestre' ? 'Mestre' : 'Jogador'}</small></span></a>
                <button class="link-suave" data-acao="sair">Sair</button>
            </div>
        </aside>
        <div class="principal">${demo}
            <div class="topo-mobile">${marca}<button class="btn btn-peq" data-acao="menu-mais" aria-label="Mais opções">☰ Mais</button></div>
            <main class="vista ${estreita ? 'vista-estreita' : ''}" id="vista">${conteudo}</main>
        </div></div>`;
}
function pintar(html) { $('#app').innerHTML = html; window.scrollTo(0, 0); }

/* ---------- Nível, pontos e insígnias ---------- */
const NIVEIS = [
    { n: 1, min: 0, nome: 'Viajante' }, { n: 2, min: 20, nome: 'Andarilho' }, { n: 3, min: 60, nome: 'Aventureiro' },
    { n: 4, min: 120, nome: 'Veterano' }, { n: 5, min: 220, nome: 'Herói' }, { n: 6, min: 360, nome: 'Lenda' }, { n: 7, min: 560, nome: 'Mito' }
];
function hojeStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function sequencia(dias) {
    const s = new Set(dias); let n = 0; const d = new Date();
    if (!s.has(hojeStr(d))) d.setDate(d.getDate() - 1);
    while (s.has(hojeStr(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
}
function calcStats(id, c) {
    const visiveis = c.posts.filter(p => p.autor_id === id && !p.rascunho);
    const publicos = visiveis.filter(p => p.visibilidade === 'todos');
    const ids = new Set(publicos.map(p => p.id));
    const nCom = c.coms.filter(x => x.autor_id === id).length;
    const reacRec = c.reac.filter(r => ids.has(r.post_id)).length;
    const seguidores = c.follows.filter(f => f.followed_id === id).length;
    const seguindo = c.follows.filter(f => f.follower_id === id).length;
    const dias = c.checks.filter(x => x.user_id === id).map(x => x.dia);
    const pontos = publicos.length * 10 + nCom * 2 + reacRec + dias.length * 3 + seguidores * 2;
    let nivel = NIVEIS[0]; NIVEIS.forEach(n => { if (pontos >= n.min) nivel = n; });
    const prox = NIVEIS.find(n => n.min > pontos) || null;
    return { posts: visiveis.length, publicos, nCom, reacRec, seguidores, seguindo, dias: dias.length, sequencia: sequencia(dias),
        pontos, nivel, prox, personagens: c.pers.filter(p => p.dono_id === id).length };
}
function insignias(id, st) {
    const p = perfil(id), todos = Array.from(S.perfis.values()).sort((a, b) => String(a.criado).localeCompare(String(b.criado)));
    const lista = [];
    if (p.papel === 'mestre') lista.push(['👑', 'Mestre', 'Conduz a campanha']);
    if (todos.slice(0, 3).some(x => x.id === id)) lista.push(['⚜', 'Fundador', 'Entre os primeiros membros']);
    if (st.publicos.length >= 1) lista.push(['✎', 'Primeira história', 'Publicou o primeiro post']);
    if (st.publicos.filter(x => ['relato', 'lore'].includes(x.tipo)).length >= 3) lista.push(['☾', 'Contador de histórias', '3 relatos ou lores publicados']);
    if (st.nCom >= 10) lista.push(['💬', 'Voz ativa', '10 comentários']);
    if (st.sequencia >= 7 || st.dias >= 7) lista.push(['✦', 'Constante', '7 presenças marcadas']);
    if (st.seguidores >= 3) lista.push(['♥', 'Querido da comunidade', '3 seguidores']);
    if (st.personagens >= 1) lista.push(['♜', 'Aventureiro', 'Registrou um personagem']);
    return lista;
}
function nivelBarra(st) {
    const base = st.nivel.min, alvo = st.prox ? st.prox.min : base;
    const pc = st.prox ? Math.round((st.pontos - base) / (alvo - base) * 100) : 100;
    return `<div class="nivel"><div class="nivel-topo"><b>Nível ${st.nivel.n} · ${esc(st.nivel.nome)}</b><span>${st.pontos} pts${st.prox ? ` · próximo: ${alvo}` : ''}</span></div><div class="nivel-barra"><i style="width:${pc}%"></i></div></div>`;
}
function cardCheckin(st) {
    const hoje = hojeStr(), feito = S.checks.some(c => c.user_id === S.me.id && c.dia === hoje);
    return `<div class="quadro-bloco checkin"><h3>Presença diária</h3>
        <p style="margin:0 0 10px">${st.sequencia ? `Sequência de <b>${st.sequencia}</b> dia${st.sequencia > 1 ? 's' : ''}.` : 'Marque presença e comece uma sequência.'}</p>
        ${feito ? '<button class="btn btn-largo" disabled>Presença de hoje marcada ✓</button>' : '<button class="btn btn-primario btn-largo" data-acao="checkin">Marcar presença</button>'}
        ${nivelBarra(st)}</div>`;
}
async function dadosSociais() {
    const [posts, coms, reac, pers] = await Promise.all([API.posts(), API.todosComentarios(), API.reacoes(), API.personagens()]);
    return { posts, coms, reac, pers, follows: S.follows, checks: S.checks };
}

/* ---------- Entrada ---------- */
function telaEntrada() {
    const demo = S.modo === 'demo';
    const lista = demo ? `<p class="sub" style="margin-top:20px">Escolha quem você quer ser nesta demonstração:</p><div class="demo-usuarios">
        ${S.usuariosDemo.map(u => `<button data-acao="entrar-demo" data-id="${esc(u.id)}">${avatarHtml(u, 'av-p')}<span><b>${esc(u.nome)}</b><small>${u.papel === 'mestre' ? 'Mestre' : (u.aprovado ? 'Jogador' : 'Novo visitante, ainda sem aprovação')}</small></span></button>`).join('')}</div>`
        : `<button class="btn btn-discord btn-largo" data-acao="entrar">Entrar com Discord</button>`;
    pintar(`<div class="entrada"><div class="entrada-caixa">
        <div class="selo selo-g"><span>V</span></div>
        <h1>${esc(CFG.NOME_REDE || 'Verden Af')}</h1>
        <p class="sub">${esc(CFG.SUBTITULO || '')}</p>
        <p class="lema">“${esc(CFG.LEMA || '')}”</p>
        ${lista}
        ${S.erro ? `<div class="erro-caixa">${esc(S.erro)}</div>` : ''}
        <p class="nota">${demo ? 'Dados da demonstração ficam só neste navegador.' : 'Só quem o Mestre aprovar vê o conteúdo da comunidade.'}</p>
    </div></div>`);
}
function telaEspera() {
    pintar(`<div class="entrada"><div class="entrada-caixa">
        <div class="selo selo-g"><span>☾</span></div>
        <h1 style="font-size:1.7rem">Aguardando aprovação</h1>
        <p class="sub">Olá, ${esc(S.me.nome)}. Seu pedido de entrada foi enviado.</p>
        <p class="lema" style="margin-bottom:20px">Assim que o Mestre aprovar, a comunidade abre para você. Depois, recarregue esta página.</p>
        <button class="btn btn-largo" data-acao="recarregar">Já fui aprovado, recarregar</button>
        <p style="margin-top:14px"><button class="link-suave" data-acao="sair">Sair</button></p>
    </div></div>`);
}

/* ---------- Roteador ---------- */
function rotaAtual() {
    const h = location.hash.replace(/^#\/?/, '');
    const [caminho, consulta] = h.split('?');
    return { partes: caminho.split('/').filter(Boolean).map(decodeURIComponent), consulta: new URLSearchParams(consulta || '') };
}
let _rotaSeq = 0;
async function rotear() {
    const seq = ++_rotaSeq;
    if (!S.me) return telaEntrada();
    if (!S.me.aprovado) return telaEspera();
    pintar(moldura(carregando(), ''));
    try {
        const [lista, follows, checks, notifs] = await Promise.all([API.perfis(), API.seguidores(), API.checkins(), API.notificacoes(), carregarWiki().catch(() => null)]);
        S.perfis = new Map(lista.map(p => [p.id, p]));
        S.pendentes = lista.filter(p => !p.aprovado).length;
        S.follows = follows; S.checks = checks; S.naoLidas = notifs.filter(n => !n.lida).length;
        const me = S.perfis.get(S.me.id); if (me) S.me = me;
        const { partes } = rotaAtual();
        const [a, b, c] = partes;
        let r;
        if (!a) r = await vMural();
        else if (a === 'post') r = await vPost(b);
        else if (a === 'novo') r = await vEditor(null, b, c);
        else if (a === 'editar') r = await vEditor(b);
        else if (a === 'registros') r = await vRegistros();
        else if (a === 'registro') r = await vFicha(b);
        else if (a === 'registro-novo') r = await vFormFicha(null);
        else if (a === 'registro-editar') r = await vFormFicha(b);
        else if (a === 'tomo') r = await vTomo(b, c);
        else if (a === 'perfil') r = await vPerfil(b, c);
        else if (a === 'membros') r = await vMembros();
        else if (a === 'avisos') r = await vAvisos();
        else if (a === 'busca') r = await vBusca(b);
        else if (a === 'wiki') r = await vWiki(b);
        else if (a === 'cronicas') r = await vCronicas();
        else if (a === 'sistemas') r = await vSistemas(b);
        else r = { html: vazio('Página não encontrada', 'Esse caminho não existe.', '<a class="btn" href="#/">Voltar ao início</a>'), ativo: '' };
        if (seq !== _rotaSeq) return;
        pintar(moldura(r.html, r.ativo, r.estreita));
        if (r.depois) r.depois();
    } catch (e) {
        if (seq !== _rotaSeq) return;
        console.error(e);
        pintar(moldura(vazio('Algo deu errado', e.message || String(e), '<button class="btn" data-acao="recarregar">Tentar de novo</button>'), ''));
    }
}

/* =====================================================
   MURAL
   ===================================================== */
function resumoPost(p) {
    const t = (p.blocos || []).find(b => b.tipo === 'texto' && (b.texto || '').trim());
    if (t) return textoPuro(t.texto).slice(0, 260);
    const d = (p.blocos || []).find(b => b.tipo === 'documento');
    return d ? textoPuro(d.texto).slice(0, 200) : '';
}
function cartaoPost(p, ctx) {
    const a = perfil(p.autor_id);
    const rs = ctx.reac.filter(r => r.post_id === p.id);
    const nc = ctx.coms.filter(c => c.post_id === p.id).length;
    const porSelo = SELOS.map(s => [s, rs.filter(r => r.selo === s.id).length]).filter(x => x[1]);
    const miss = p.tipo === 'missao' && p.meta && p.meta.status ? `<span class="estado-missao estado-${esc(p.meta.status)}">${esc(ESTADOS_MISSAO[p.meta.status] || '')}</span>` : '';
    return `<a class="cartao papel ${p.capa ? 'com-capa' : ''}" href="#/post/${esc(p.id)}">
        ${p.fixado ? '<span class="fita" title="Fixado"></span>' : ''}
        ${p.capa ? `<div class="capa" ${bg(p.capa)}></div>` : ''}
        <div class="corpo">${seloHtml(p.tipo, 'selo-g')}
            <h2>${esc(p.titulo || 'Sem título')}</h2>
            <div class="meta">${avatarHtml(a, 'av-pp')}<span class="assina">${esc(a.nome)}</span><span title="${esc(dataCompleta(p.criado))}">${quando(p.criado)}</span>${miss}${etiquetaMeta(p)}
                ${p.rascunho ? '<span class="aviso-vis">Rascunho, só você vê</span>' : ''}${visLabel(p) ? `<span class="aviso-vis">${visLabel(p)}</span>` : ''}</div>
            ${resumoPost(p) ? `<p class="resumo">${esc(resumoPost(p))}</p>` : ''}
        </div>
        <div class="rodape-cartao">
            <span class="mini-selos">${porSelo.map(([s, n]) => `<span title="${esc(s.nome)}">${s.gl} ${n}</span>`).join('')}</span>
            ${nc ? `<span>💬 ${nc}</span>` : ''}
            <span class="sep"></span>
            ${(p.tags || []).slice(0, 3).map(t => `<span class="tag">${esc(t)}</span>`).join(' ')}
        </div></a>`;
}
async function vMural() {
    const [dados, salvos] = await Promise.all([dadosSociais(), API.salvos()]);
    const { posts, coms, reac, pers } = dados;
    const ctx = { reac, coms };
    const st = calcStats(S.me.id, dados);
    const score = p => reac.filter(r => r.post_id === p.id).length * 2 + coms.filter(c => c.post_id === p.id).length * 2;
    const seguindo = new Set(S.follows.filter(f => f.follower_id === S.me.id).map(f => f.followed_id));
    const salvosSet = new Set(salvos);
    const publicados = posts.filter(p => !p.rascunho);
    const meus = posts.filter(p => p.rascunho && p.autor_id === S.me.id);
    if (!['destaques', 'recentes', 'seguindo', 'salvos'].includes(S.aba)) S.aba = 'destaques';
    let base;
    if (S.aba === 'destaques') base = publicados.slice().sort((a, b) => (b.fixado - a.fixado) || (score(b) - score(a)) || b.criado.localeCompare(a.criado));
    else if (S.aba === 'recentes') base = publicados.slice().sort((a, b) => b.criado.localeCompare(a.criado));
    else if (S.aba === 'seguindo') base = publicados.filter(p => seguindo.has(p.autor_id)).sort((a, b) => b.criado.localeCompare(a.criado));
    else base = publicados.filter(p => salvosSet.has(p.id)).sort((a, b) => b.criado.localeCompare(a.criado));
    const lista = base.filter(p => (S.filtro === 'todos' || p.tipo === S.filtro) && (!S.tag || (p.tags || []).includes(S.tag)));
    const fixados = publicados.filter(p => p.fixado).slice(0, 6);
    const missoes = publicados.filter(p => p.tipo === 'missao' && p.meta && p.meta.status !== 'concluida');
    const todasTags = [...new Set(publicados.flatMap(p => p.tags || []))].slice(0, 14);
    const abas = [['destaques', 'Destaques'], ['recentes', 'Recentes'], ['seguindo', 'Seguindo'], ['salvos', 'Salvos']];
    const abasHtml = `<div class="abas-inicio" role="tablist">${abas.map(([id, nome]) => `<button role="tab" aria-selected="${S.aba === id}" class="aba-i ${S.aba === id ? 'on' : ''}" data-acao="aba" data-a="${id}">${nome}</button>`).join('')}</div>`;
    const filtros = `<button class="filtro ${S.filtro === 'todos' ? 'on' : ''}" data-acao="filtro" data-f="todos">Tudo</button>` +
        Object.entries(TIPOS).map(([id, t]) => `<button class="filtro t-${id} ${S.filtro === id ? 'on' : ''}" data-acao="filtro" data-f="${id}"><span class="gl">${t.gl}</span>${t.nome}</button>`).join('');
    const carrossel = S.aba === 'destaques' && fixados.length ? `<div class="destaques" aria-label="Posts em destaque">${fixados.map(p => `<a class="destaque t-${esc(p.tipo)}" href="#/post/${esc(p.id)}" ${bg(p.capa)}>
        <span class="destaque-info">${seloHtml(p.tipo, '')}<b>${esc(p.titulo)}</b><small>${esc(perfil(p.autor_vazio || p.autor_id).nome)} · ${quando(p.criado)}</small></span></a>`).join('')}</div>` : '';
    const vazioMsg = {
        destaques: ['O início ainda está vazio', 'Seja o primeiro a publicar um aviso, uma ficha ou um relato.', '<a class="btn btn-primario" href="#/novo">Criar o primeiro post</a>'],
        recentes: ['Nada por aqui ainda', 'Os posts novos aparecem nesta aba.', '<a class="btn btn-primario" href="#/novo">Criar post</a>'],
        seguindo: ['Você ainda não segue ninguém', 'Siga membros da comunidade para ver os posts deles aqui.', '<a class="btn btn-primario" href="#/membros">Ver a comunidade</a>'],
        salvos: ['Nenhum post salvo', 'Use o botão Salvar dentro de um post para guardar aqui.', '']
    }[S.aba];
    const html = `<div class="cab-vista"><div><h1>Início</h1><p>O que acontece em Verden Af, num lugar só.</p></div>
        <a class="btn btn-primario" href="#/novo">Criar post</a></div>
        <div class="mural"><div>
            ${abasHtml}${carrossel}
            <div class="filtros" id="filtros">${filtros}</div>
            ${S.tag ? `<p style="margin:-8px 0 16px">Filtrando pela tag <span class="tag tag-claro">${esc(S.tag)}</span> <button class="link-suave" data-acao="tag" data-t="">limpar</button></p>` : ''}
            <div class="lista-posts" id="lista-posts">${lista.length ? lista.map(p => cartaoPost(p, ctx)).join('') : vazio(...(base.length ? ['Nada com esse filtro', 'Tire o filtro para ver os outros posts.', ''] : vazioMsg))}</div></div>
        <aside class="quadro">
            ${cardCheckin(st)}
            ${missoes.length ? `<div class="quadro-bloco"><h3>Missões em aberto</h3><ul>${missoes.map(p => `<li><a href="#/post/${esc(p.id)}"><span class="gl">⚔</span><span>${esc(p.titulo)}<small>${esc(ESTADOS_MISSAO[p.meta.status] || '')}</small></span></a></li>`).join('')}</ul></div>` : ''}
            ${pers.length ? `<div class="quadro-bloco"><h3>Personagens recentes</h3><ul>${pers.slice(0, 4).map(c => `<li><a href="#/registro/${esc(c.id)}"><span class="gl">♜</span><span>${esc(c.nome)}<small>${esc([c.dados.Raca, c.dados.Classe].filter(Boolean).join(' · '))}</small></span></a></li>`).join('')}</ul></div>` : ''}
            ${meus.length ? `<div class="quadro-bloco"><h3>Seus rascunhos</h3><ul>${meus.map(p => `<li><a href="#/editar/${esc(p.id)}"><span class="gl">✎</span><span>${esc(p.titulo || 'Sem título')}<small>continuar editando</small></span></a></li>`).join('')}</ul></div>` : ''}
            ${todasTags.length ? `<div class="quadro-bloco"><h3>Tags</h3><div style="display:flex;gap:6px;flex-wrap:wrap">${todasTags.map(t => `<button class="filtro ${S.tag === t ? 'on' : ''}" data-acao="tag" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>` : ''}
        </aside></div>`;
    return { html, ativo: 'mural' };
}

/* =====================================================
   POST
   ===================================================== */
function renderBloco(b, segMap, post) {
    switch (b.tipo) {
        case 'texto': return md(b.texto);
        case 'imagem': {
            const u = urlSegura(b.url); if (!u) return '';
            return `<figure class="b-img"><img src="${esc(u)}" alt="${esc(b.legenda || '')}" data-acao="ampliar" loading="lazy">${b.legenda ? `<figcaption>${esc(b.legenda)}</figcaption>` : ''}</figure>`;
        }
        case 'galeria': {
            const us = (b.urls || []).map(urlSegura).filter(Boolean); if (!us.length) return '';
            return `<div class="b-galeria">${us.map(u => `<img src="${esc(u)}" alt="" data-acao="ampliar" loading="lazy">`).join('')}</div>`;
        }
        case 'video': {
            const e = videoEmbed(b.url);
            if (!e) return b.url && urlSegura(b.url) ? `<p><a href="${esc(urlSegura(b.url))}" target="_blank" rel="noopener noreferrer">${esc(b.legenda || b.url)}</a></p>` : '';
            return `<div><div class="b-video"><iframe src="${esc(e)}" title="${esc(b.legenda || 'Vídeo')}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>${b.legenda ? `<div class="b-leg">${esc(b.legenda)}</div>` : ''}</div>`;
        }
        case 'citacao': return `<blockquote class="b-citacao"><p>${esc(b.texto || '')}</p>${b.autor ? `<cite>${esc(b.autor)}</cite>` : ''}</blockquote>`;
        case 'divisor': return `<div class="b-divisor" role="separator"><span>⚜</span></div>`;
        case 'documento': return `<div class="b-doc"><h3>${esc(b.titulo || 'Documento')}</h3>${md(b.texto)}
            <div class="doc-fim"><span class="assina">${esc(b.assinatura || '')}</span>${b.selo ? `<span class="carimbo-doc">${esc(b.selo)}</span>` : ''}</div></div>`;
        case 'ficha': {
            const c = (segMap && segMap.__pers && segMap.__pers[b.personagem_id]) || null;
            if (!c) return `<div class="b-leg">Esta ficha não está disponível para você.</div>`;
            return miniFicha(c);
        }
        case 'enquete': {
            const votos = ((segMap && segMap.__votos) || []).filter(v => v.bloco_id === b.id);
            const meu = votos.find(v => v.user_id === S.me.id), total = votos.length;
            const ops = (b.opcoes || []).filter(o => o.texto);
            const podeVotar = !!(post && post.id && !meu);
            return `<div class="enquete"><div class="enq-p">${esc(b.pergunta || 'Enquete')}</div>` + ops.map(o => {
                const n = votos.filter(v => v.opcao === o.id).length, pc = total ? Math.round(n / total * 100) : 0;
                if (podeVotar) return `<button type="button" class="enq-op" data-acao="votar" data-bloco="${esc(b.id)}" data-op="${esc(o.id)}">${esc(o.texto)}</button>`;
                return `<div class="enq-res ${meu && meu.opcao === o.id ? 'meu' : ''}"><span class="enq-barra" style="width:${pc}%"></span><span class="enq-t">${esc(o.texto)}</span><span class="enq-n">${pc}% · ${n}</span></div>`;
            }).join('') + `<div class="enq-total">${total} voto${total === 1 ? '' : 's'}${meu ? ' · você votou' : ''}${podeVotar ? ' · escolha uma opção' : ''}</div></div>`;
        }
        case 'segredo': {
            const sg = segMap && segMap[b.sid];
            if (!sg) return `<div class="b-segredo trancado"><div class="rot" style="justify-content:center">🔒 Lacrado</div>${b.dica ? esc(b.dica) : 'Existe algo aqui que você ainda não pode ler.'}</div>`;
            const podeGerir = post && S.me && (post.autor_id === S.me.id || ehMestre());
            const para = (sg.para || []).map(id => perfil(id).nome);
            const quem = sg.revelado ? 'Revelado para todos' : (podeGerir ? ('Visível para: você' + (para.length ? ', ' + para.join(', ') : '')) : 'Revelado para você');
            return `<div class="b-segredo aberto"><div class="rot">🗝 Segredo · ${esc(quem)}
                ${podeGerir && post.id ? `<button class="btn btn-peq" data-acao="revelar" data-sid="${esc(sg.id)}" data-v="${sg.revelado ? 0 : 1}">${sg.revelado ? 'Ocultar de novo' : 'Revelar para todos'}</button>` : ''}</div>${md(sg.conteudo)}</div>`;
        }
        default: return '';
    }
}
function miniFicha(c) {
    const d = c.dados || {};
    return `<a class="mini-ficha" href="#/registro/${esc(c.id)}">${avatarFicha(c, 'ret')}<span><b>${esc(c.nome)}</b>
        <span>${esc([d.Raca, d.Classe, d.Subclasse].filter(Boolean).join(' · ') || 'Sem classe definida')}</span></span></a>`;
}
function avatarFicha(c, cls) {
    const u = urlSegura(c.avatar);
    return `<span class="retrato quadrado ${cls || ''}" ${u ? bg(u) : ''}>${u ? '' : esc(iniciais(c.nome))}</span>`;
}
async function carregarMapaPost(post) {
    const mapa = {};
    const ids = (post.blocos || []).filter(b => b.tipo === 'ficha').map(b => b.personagem_id);
    if (ids.length) {
        mapa.__pers = {};
        const todas = await API.personagens();
        ids.forEach(id => { const c = todas.find(x => x.id === id); if (c) mapa.__pers[id] = c; });
    }
    if ((post.blocos || []).some(b => b.tipo === 'segredo')) {
        (await API.segredos(post.id)).forEach(s => { mapa[s.id] = s; });
    }
    return mapa;
}
function corpoPost(post, mapa) {
    return (post.blocos || []).map(b => { const h = renderBloco(b, mapa, post); return h ? `<div class="bloco">${h}</div>` : ''; }).join('');
}
function reacoesHtml(postId, reac) {
    const rs = reac.filter(r => r.post_id === postId);
    return SELOS.map(s => {
        const n = rs.filter(r => r.selo === s.id).length;
        const minha = rs.some(r => r.selo === s.id && r.user_id === S.me.id);
        return `<button class="reacao ${minha ? 'minha' : ''}" data-acao="reagir" data-pid="${esc(postId)}" data-selo="${s.id}" aria-pressed="${minha}" title="${esc(s.nome)}"><span class="gl">${s.gl}</span>${s.nome}${n ? ` · ${n}` : ''}</button>`;
    }).join('');
}
function comentariosHtml(coms) {
    const raiz = coms.filter(c => !c.pai_id);
    const um = (c, filho) => {
        const a = perfil(c.autor_id);
        const filhos = filho ? '' : coms.filter(x => x.pai_id === c.id).map(x => um(x, true)).join('');
        return `<div class="coment" id="c-${esc(c.id)}">${avatarHtml(a, 'av-p')}<div class="conteudo">
            <div class="quem"><b>${esc(a.nome)}</b><small title="${esc(dataCompleta(c.criado))}">${quando(c.criado)}</small></div>
            <div class="txt">${mdInline(c.texto)}</div>
            <div class="acoes">${filho ? '' : `<button class="link-suave" data-acao="responder" data-id="${esc(c.id)}" data-nome="${esc(a.nome)}">Responder</button>`}
                ${podeMexer(c.autor_id) ? `<button class="link-suave" data-acao="apagar-coment" data-id="${esc(c.id)}">Apagar</button>` : ''}</div>
            ${filhos ? `<div class="filhos">${filhos}</div>` : ''}</div></div>`;
    };
    return raiz.length ? raiz.map(c => um(c, false)).join('') : '<p style="color:var(--claro-2)">Ninguém comentou ainda.</p>';
}
async function vPost(id) {
    const post = await API.post(id);
    if (!post) return { html: vazio('Post não encontrado', 'Ele pode ter sido apagado ou não estar visível para você.', '<a class="btn" href="#/">Voltar ao início</a>'), ativo: 'mural' };
    const [mapa, reac, coms, salvos] = await Promise.all([carregarMapaPost(post), API.reacoes(), API.comentarios(id), API.salvos()]);
    if ((post.blocos || []).some(b => b.tipo === 'enquete')) mapa.__votos = await API.votos(id);
    S._post = { id, post, mapa, reac, coms, salvo: salvos.includes(id) }; S.respondendo = null;
    const a = perfil(post.autor_id);
    const segue = S.follows.some(f => f.follower_id === S.me.id && f.followed_id === a.id);
    const miss = post.tipo === 'missao' && post.meta && post.meta.status ? `<span class="estado-missao estado-${esc(post.meta.status)}">${esc(ESTADOS_MISSAO[post.meta.status] || '')}</span>` : '';
    const html = `<div class="migalhas">${migalhasPost(post)}</div>
        <article class="post papel ${post.capa ? 'com-capa' : ''}">
            ${post.fixado ? '<span class="fita" title="Em destaque"></span>' : ''}
            ${post.capa ? `<div class="capa-grande" ${bg(post.capa)}></div>` : ''}
            <header class="post-cab">${seloHtml(post.tipo, 'selo-g')}
                <h1>${esc(post.titulo || 'Sem título')}</h1>
                <div class="meta">${avatarHtml(a, 'av-pp')}<a class="assina" href="#/perfil/${esc(a.id)}" style="text-decoration:none">${esc(a.nome)}</a>
                    ${a.id !== S.me.id ? `<button class="btn btn-peq btn-seguir ${segue ? 'seguindo' : ''}" data-acao="seguir" data-id="${esc(a.id)}">${segue ? 'Seguindo' : 'Seguir'}</button>` : ''}
                    <span title="${esc(dataCompleta(post.criado))}">${quando(post.criado)}${post.editado ? ' (editado)' : ''}</span>${miss}${etiquetaMeta(post)}
                    ${post.rascunho ? '<span class="aviso-vis">Rascunho, só você vê</span>' : ''}${visLabel(post) ? `<span class="aviso-vis">${visLabel(post)}</span>` : ''}</div>
                ${(post.tags || []).length ? `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${post.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
            </header>
            <div class="post-corpo">${metaPost(post)}${corpoPost(post, mapa)}</div>
            ${mencoesHtml(post)}
            <div class="reacoes" id="reacoes">${reacoesHtml(id, reac)}</div>
        </article>
        <div class="barra-acoes" style="padding:14px 0 0">
            <button class="btn" id="btn-salvar" data-acao="salvar">${S._post.salvo ? '★ Salvo' : '☆ Salvar'}</button>
            <button class="btn" data-acao="copiar-link">Copiar link</button>
            ${podeMexer(post.autor_id) ? `<a class="btn" href="#/editar/${esc(id)}">Editar</a>` : ''}
            ${ehMestre() ? `<button class="btn" data-acao="fixar" data-id="${esc(id)}" data-v="${post.fixado ? 0 : 1}">${post.fixado ? 'Tirar dos destaques' : 'Destacar'}</button>` : ''}
            ${podeMexer(post.autor_id) ? `<button class="btn btn-perigo" data-acao="apagar-post" data-id="${esc(id)}">Apagar</button>` : ''}</div>
        <section class="comentarios"><h2>Comentários · ${coms.length}</h2>
            <div id="lista-coments">${comentariosHtml(coms)}</div>
            <div class="form-coment"><div id="resp-aviso"></div>
                <textarea id="novo-coment" placeholder="Escreva um comentário…" aria-label="Novo comentário"></textarea>
                <div><button class="btn btn-primario" data-acao="comentar">Comentar</button></div></div></section>`;
    return { html, ativo: ativoPost(post), estreita: true };
}

/* =====================================================
   REGISTROS (fichas)
   ===================================================== */
function carimboStatus(dados) {
    const st = (STATUS && STATUS[dados.StatusInquisitorial]) || STATUS.VIGIADO;
    return `<span class="carimbo" style="--c:${st.cor};--r:${st.rot}">${esc(st.rotulo)}</span>`;
}
async function vRegistros() {
    const todas = await API.personagens();
    const minhas = todas.filter(c => c.dono_id === S.me.id), outras = todas.filter(c => c.dono_id !== S.me.id);
    const card = c => {
        const d = c.dados || {};
        return `<a class="cartao-ficha papel" href="#/registro/${esc(c.id)}">${avatarFicha(c)}
            <h3>${esc(c.nome)}</h3><div class="sub">${esc(d.Apelido ? `“${d.Apelido}”` : (d.Titulo || ''))}</div>
            <div class="linha-chips">${[d.Raca, d.Classe].filter(Boolean).map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>
            <div style="margin-top:12px">${carimboStatus(d)}</div>
            <div class="sub" style="margin-top:8px">por ${esc(perfil(c.dono_id).nome)}${c.publico ? '' : ' · privada'}</div></a>`;
    };
    const html = `<div class="cab-vista"><div><h1>Registros</h1><p>Os dossiês dos personagens de Verden Af.</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-acao="importar-ficha">Importar dossiê (.json)</button>
        <a class="btn btn-primario" href="#/registro-novo">Novo registro</a></div></div>
        <input type="file" id="arq-ficha" accept=".json,application/json" hidden>
        ${minhas.length ? `<h2 class="sec-titulo" style="margin-top:0">Seus personagens</h2><div class="grade-cards">${minhas.map(card).join('')}</div>` : vazio('Você ainda não tem personagens', 'Crie um registro novo ou importe o .json gerado pelo site de fichas antigo.', '<a class="btn btn-primario" href="#/registro-novo">Criar meu primeiro registro</a>')}
        ${outras.length ? `<h2 class="sec-titulo">Da mesa</h2><div class="grade-cards">${outras.map(card).join('')}</div>` : ''}`;
    return { html, ativo: 'registros' };
}
function pericias(d) {
    const ps = ['Pericia1', 'Pericia2', 'Pericia3'].map(k => d[k]).filter(Boolean);
    const porAttr = {};
    ps.forEach(p => { const a = PERICIAS[p]; if (a) (porAttr[a] = porAttr[a] || []).push(p); });
    const sin = Object.entries(porAttr).filter(([, l]) => l.length >= 2);
    return { ps, porAttr, sin };
}
function avisoAptidao(d) {
    if (!d.Raca || !d.Classe || !CLASSES[d.Classe]) return '';
    const cl = CLASSES[d.Classe]; const sub = d.Subclasse && cl.subs[d.Subclasse];
    if (sub && sub.exclusiva && sub.exclusiva !== d.Raca) return `<div class="aviso-apt erro">${esc(d.Subclasse)} é exclusiva da raça ${esc(sub.exclusiva)} no Tomo.</div>`;
    if (!cl.racas.includes(d.Raca)) return `<div class="aviso-apt alerta">${esc(d.Raca)} não está entre as raças aptas de ${esc(d.Classe)} no Tomo (aptas: ${esc(cl.racas.join(', '))}). Combine com o Mestre.</div>`;
    return `<div class="aviso-apt ok">${esc(d.Raca)} é uma raça apta para ${esc(d.Classe)}.</div>`;
}
function dadosFicha(d) {
    return SCHEMA_FICHA.map(sec => {
        const itens = sec.campos.map(c => {
            const v = String(d[c.id] == null ? '' : d[c.id]).trim();
            return `<div class="d ${c.full ? 'cheio' : ''}"><dt>${esc(c.label)}</dt><dd class="${v ? '' : 'nd'}">${v ? esc(v) : 'não informado'}</dd></div>`;
        }).join('');
        return `<section class="secao-ficha"><h2><span class="gl">${sec.icone}</span>${esc(sec.titulo)}</h2><dl class="dados-ficha">${itens}</dl></section>`;
    }).join('');
}
async function vFicha(id) {
    const c = await API.personagem(id);
    if (!c) return { html: vazio('Registro não encontrado', 'Ele pode ser privado ou ter sido apagado.', '<a class="btn" href="#/registros">Voltar aos Registros</a>'), ativo: 'registros' };
    const d = c.dados || {};
    const dono = perfil(c.dono_id);
    const cl = CLASSES[d.Classe]; const sub = cl && cl.subs[d.Subclasse];
    const { sin } = pericias(d);
    const link = (tipo, nome) => nome ? `<a class="chip" href="#/tomo/${tipo}/${encodeURIComponent(nome)}">${esc(nome)}</a>` : '';
    const subHtml = sub ? `<section class="secao-ficha"><h2><span class="gl">⚔</span>${esc(d.Subclasse)}</h2>
        <p style="margin:0 0 6px">${esc(sub.desc || '')}</p>
        <div class="res-wrap"><div style="font-size:.95rem">Resistência: <b>${esc(sub.res)}</b> ataques certeiros</div><div class="res-barra"><i style="width:${Math.min(100, sub.res / 15 * 100)}%"></i></div></div>
        <ul class="hab-lista">${sub.hab.map(h => { const [n, t] = h.split('|'); return `<li><b>${esc(n)}</b>${esc(t || '')}</li>`; }).join('')}</ul></section>` : '';
    const perHtml = pericias(d).ps.length ? `<div class="ficha-chips" style="margin:0 0 6px">${pericias(d).ps.map(p => `<span class="chip">${esc(p)} <small>(${esc(PERICIAS[p] || '?')})</small></span>`).join('')}</div>
        ${sin.length ? `<div class="sinergia">Sinergia: ${sin.map(([a, l]) => `${esc(l.join(' + '))} compartilham <b>${esc(a)}</b>`).join('; ')}. Rolagens dessas perícias ganham <b>+2</b> no resultado final.</div>` : ''}` : '';
    const html = `<div class="migalhas"><a href="#/registros">Registros</a> / ${esc(c.nome)}</div>
        <article class="ficha papel">
            <div class="ficha-topo">${avatarFicha(c)}
                <div class="info"><h1>${esc(c.nome)}</h1>
                    ${d.Apelido || d.Titulo ? `<div class="alcunha">${esc([d.Apelido && `“${d.Apelido}”`, d.Titulo].filter(Boolean).join(' · '))}</div>` : ''}
                    <div class="ficha-chips">${link('raca', d.Raca)}${link('classe', d.Classe)}${d.Subclasse ? `<span class="chip">${esc(d.Subclasse)}</span>` : ''}${d.Faccao ? `<span class="chip">${esc(d.Faccao)}</span>` : ''}</div>
                    <div>${carimboStatus(d)}</div>
                    <div class="meta" style="margin-top:12px">Registrado por <a class="assina" href="#/perfil/${esc(dono.id)}" style="text-decoration:none">${esc(dono.nome)}</a>
                        <span>${quando(c.criado)}</span>${c.publico ? '' : '<span class="aviso-vis">🔒 Privada</span>'}</div></div></div>
            ${avisoAptidao(d)}
            ${subHtml}
            ${perHtml ? `<section class="secao-ficha"><h2><span class="gl">⚔</span>Perícias</h2>${perHtml}</section>` : ''}
            ${dadosFicha(d)}
            <div class="meta" style="margin-top:8px">Inquisidor responsável: <b>${esc(d.InquisidorAssinatura || '—')}</b> · ${esc(d.DataInquisitorial || '')}</div>
        </article>
        <div class="barra-acoes" style="padding:14px 0 0">
            <a class="btn btn-primario" href="#/novo/ficha/${esc(c.id)}">Postar no Mural</a>
            <button class="btn" data-acao="baixar-ficha" data-id="${esc(c.id)}">Baixar .json</button>
            ${podeMexer(c.dono_id) ? `<a class="btn" href="#/registro-editar/${esc(c.id)}">Editar</a><button class="btn btn-perigo" data-acao="apagar-ficha" data-id="${esc(c.id)}">Apagar</button>` : ''}</div>`;
    return { html, ativo: 'registros', estreita: true };
}

/* =====================================================
   TOMO
   ===================================================== */
async function vTomo(tipo, nome) {
    const migalha = x => `<div class="migalhas"><a href="#/tomo">Tomo</a>${x}</div>`;
    if (tipo === 'raca' && nome) {
        const r = RACAS[nome];
        if (!r) {
            const sem = RACAS_SEM_VERBETE.includes(nome);
            return { html: migalha(` / ${esc(nome)}`) + vazio(esc(nome), sem ? 'Esta raça é citada no Tomo, mas ainda não tem verbete próprio.' : 'Raça não encontrada.', '<a class="btn" href="#/tomo">Voltar ao Tomo</a>'), ativo: 'tomo' };
        }
        const aptas = Object.entries(CLASSES).filter(([, c]) => c.racas.includes(nome)).map(([n]) => n);
        const rot = { atributos: 'Atributos', desvantagens: 'Desvantagens', racial: 'Habilidade racial' };
        return { ativo: 'tomo', estreita: true, html: migalha(` / Raças / ${esc(nome)}`) + `<article class="papel texto-tomo"><h1>${esc(nome)}</h1>
            ${Object.keys(rot).filter(k => r[k]).map(k => `<h2>${rot[k]}</h2><p>${esc(r[k])}</p>`).join('')}
            <h2>Classes aptas</h2><div class="ficha-chips">${aptas.length ? aptas.map(a => `<a class="chip" href="#/tomo/classe/${encodeURIComponent(a)}">${esc(a)}</a>`).join('') : '<span>Nenhuma classe cita esta raça como apta.</span>'}</div></article>` };
    }
    if (tipo === 'classe' && nome) {
        const c = CLASSES[nome];
        if (!c) return { html: migalha('') + vazio('Classe não encontrada', '', '<a class="btn" href="#/tomo">Voltar ao Tomo</a>'), ativo: 'tomo' };
        const subs = Object.entries(c.subs).map(([n, s]) => `<article class="papel sub-tomo"><h3>${esc(n)}</h3><p style="margin:0">${esc(s.desc || '')}</p>
            ${s.exclusiva ? `<p class="aviso-vis">Exclusiva da raça ${esc(s.exclusiva)}.</p>` : ''}
            <div class="linha"><span><b>Armas</b>${esc(s.armas || '—')}</span><span><b>Proteção</b>${esc(s.prot || '—')}</span><span><b>Resistência</b>${esc(s.res)} ataques certeiros</span></div>
            <div class="res-barra" style="margin-bottom:12px"><i style="width:${Math.min(100, s.res / 15 * 100)}%"></i></div>
            <ul class="hab-lista">${s.hab.map(h => { const [a, t] = h.split('|'); return `<li><b>${esc(a)}</b>${esc(t || '')}</li>`; }).join('')}</ul></article>`).join('');
        return { ativo: 'tomo', estreita: true, html: migalha(` / Classes / ${esc(nome)}`) + `<h1 style="margin-bottom:6px">${esc(nome)}</h1><p style="color:var(--claro-2);margin:0 0 14px">${esc(c.resumo || '')}</p>
            <div class="rotulo" style="margin-bottom:6px">Raças aptas</div><div class="filtros">${c.racas.map(r => `<a class="filtro" href="#/tomo/raca/${encodeURIComponent(r)}">${esc(r)}</a>`).join('')}</div>${subs}` };
    }
    const aba = tipo === 'classes' ? 'classes' : 'racas';
    const racas = Object.keys(RACAS).map(n => `<a class="tomo-item" href="#/tomo/raca/${encodeURIComponent(n)}"><b>${esc(n)}</b><small>${esc((RACAS[n].atributos || '').slice(0, 90))}…</small></a>`).join('') +
        RACAS_SEM_VERBETE.map(n => `<a class="tomo-item sem" href="#/tomo/raca/${encodeURIComponent(n)}"><b>${esc(n)}</b><small>Citada, sem verbete</small></a>`).join('');
    const classes = Object.entries(CLASSES).map(([n, c]) => `<a class="tomo-item" href="#/tomo/classe/${encodeURIComponent(n)}"><b>${esc(n)}</b><small>${Object.keys(c.subs).length} subclasse${Object.keys(c.subs).length > 1 ? 's' : ''}</small></a>`).join('');
    return { ativo: 'tomo', html: `<div class="cab-vista"><div><h1>Tomo</h1><p>Enciclopédia das Raças e Classes, Biblioteca da Academia do Norte de Montainézz.</p></div></div>
        <div class="abas"><a class="aba ${aba === 'racas' ? 'on' : ''}" href="#/tomo" style="text-decoration:none">Raças</a><a class="aba ${aba === 'classes' ? 'on' : ''}" href="#/tomo/classes" style="text-decoration:none">Classes</a></div>
        <div class="grade-tomo">${aba === 'racas' ? racas : classes}</div>` };
}

/* =====================================================
   PERFIL, MESA, BUSCA
   ===================================================== */
async function vAvisos() {
    const lista = await API.notificacoes();
    const item = n => {
        const de = n.de_id ? perfil(n.de_id) : { nome: 'Alguém', avatar: null };
        const href = n.post_id ? `#/post/${n.post_id}` : (n.tipo === 'recado' ? `#/perfil/${S.me.id}/recados` : (n.de_id ? `#/perfil/${n.de_id}` : '#/'));
        return `<a class="aviso ${n.lida ? '' : 'nova'}" href="${esc(href)}">${avatarHtml(de, 'av-m')}<span class="aviso-txt"><b>${esc(de.nome)}</b> ${esc(n.texto)}<small>${quando(n.criado)}</small></span></a>`;
    };
    const html = `<div class="cab-vista"><div><h1>Avisos</h1><p>Respostas, reações e novos seguidores.</p></div></div>
        ${lista.length ? `<div class="avisos">${lista.map(item).join('')}</div>` : vazio('Nenhum aviso ainda', 'Quando alguém comentar, reagir ou seguir você, aparece aqui.')}`;
    return { ativo: 'avisos', estreita: true, html, depois() {
        if (lista.some(n => !n.lida)) API.marcarLidas().then(() => { S.naoLidas = 0; const c = $('.nav a[href="#/avisos"] .contador'); if (c) c.remove(); }).catch(() => { });
    } };
}
async function vPerfil(id, aba) {
    const p = S.perfis.get(id);
    if (!p) return { html: vazio('Perfil não encontrado', '', '<a class="btn" href="#/">Voltar</a>'), ativo: '' };
    aba = ['posts', 'personagens', 'recados', 'seguidores'].includes(aba) ? aba : 'posts';
    const [dados, recados] = await Promise.all([dadosSociais(), API.recados(id)]);
    const { posts, pers, coms, reac } = dados;
    const st = calcStats(id, dados), eu = id === S.me.id;
    const segue = S.follows.some(f => f.follower_id === S.me.id && f.followed_id === id);
    const meus = posts.filter(x => x.autor_id === id && !x.rascunho).sort((a, b) => b.criado.localeCompare(a.criado));
    const fichas = pers.filter(x => x.dono_id === id);
    const seguidoresLista = S.follows.filter(f => f.followed_id === id).map(f => perfil(f.follower_id));
    const ins = insignias(id, st);
    const tab = (k, nome, n) => `<a class="aba-i ${aba === k ? 'on' : ''}" href="#/perfil/${esc(id)}/${k}">${nome} <small>${n}</small></a>`;
    let corpo;
    if (aba === 'posts') corpo = meus.length ? `<div class="lista-posts">${meus.map(x => cartaoPost(x, { reac, coms })).join('')}</div>` : vazio('Nenhum post ainda', eu ? 'Publique o primeiro para ele aparecer aqui.' : 'Quando publicar, os posts aparecem aqui.', eu ? '<a class="btn btn-primario" href="#/novo">Criar post</a>' : '');
    else if (aba === 'personagens') corpo = fichas.length ? `<div class="grade-cards">${fichas.map(c => `<a class="cartao-ficha papel" href="#/registro/${esc(c.id)}">${avatarFicha(c)}<h3>${esc(c.nome)}</h3><div class="sub">${esc([(c.dados || {}).Raca, (c.dados || {}).Classe].filter(Boolean).join(' · '))}</div></a>`).join('')}</div>` : vazio('Nenhum personagem', eu ? 'Registre o seu primeiro personagem.' : 'Ainda não registrou personagens.', eu ? '<a class="btn btn-primario" href="#/registro-novo">Novo registro</a>' : '');
    else if (aba === 'recados') corpo = `<div class="form-coment"><textarea id="novo-recado" maxlength="400" placeholder="${eu ? 'Deixe um recado no seu próprio mural…' : 'Deixe um recado para ' + esc(p.nome) + '…'}" aria-label="Novo recado"></textarea>
        <div><button class="btn btn-primario" data-acao="enviar-recado" data-id="${esc(id)}">Deixar recado</button></div></div>
        <div style="margin-top:14px">${recados.length ? recados.map(r => { const a = perfil(r.autor_id); return `<div class="coment">${avatarHtml(a, 'av-p')}<div class="conteudo"><div class="quem"><a href="#/perfil/${esc(a.id)}"><b>${esc(a.nome)}</b></a><small>${quando(r.criado)}</small></div><div class="txt">${mdInline(r.texto)}</div>
            ${(r.autor_id === S.me.id || id === S.me.id || ehMestre()) ? `<div class="acoes"><button class="link-suave" data-acao="apagar-recado" data-id="${esc(r.id)}">Apagar</button></div>` : ''}</div></div>`; }).join('') : vazio('O mural está vazio', 'Seja o primeiro a deixar um recado.')}</div>`;
    else corpo = seguidoresLista.length ? seguidoresLista.map(a => `<a class="membro" href="#/perfil/${esc(a.id)}">${avatarHtml(a, 'av-m')}<div class="info"><b>${esc(a.nome)}</b><div style="color:var(--claro-2);font-size:.95rem">${esc(a.titulo || '')}</div></div></a>`).join('') : vazio('Ninguém segue ainda', eu ? 'Publique e participe para ganhar seguidores.' : 'Seja o primeiro a seguir.');
    const html = `<article class="perfil-amino">
            <div class="perfil-banner" ${bg(p.banner)}></div>
            <div class="perfil-cab">${avatarHtml(p, 'av-g')}
                <div class="perfil-id"><h1>${esc(p.nome)}<span class="papel-etiqueta">${p.papel === 'mestre' ? 'Mestre' : 'Jogador'}</span></h1>
                    <div class="titulo">${esc(p.titulo || (p.papel === 'mestre' ? 'Mestre de Verden Af' : 'Viajante de Verden'))}</div></div>
                <div class="perfil-acoes">${eu ? '<button class="btn" data-acao="editar-perfil">Editar perfil</button>'
                    : `<button class="btn btn-seguir ${segue ? 'seguindo' : 'btn-primario'}" data-acao="seguir" data-id="${esc(id)}">${segue ? 'Seguindo' : 'Seguir'}</button>`}</div></div>
            <div class="perfil-stats"><div><b>${st.posts}</b><span>posts</span></div><div><b>${st.seguidores}</b><span>seguidores</span></div><div><b>${st.seguindo}</b><span>seguindo</span></div><div><b>${st.pontos}</b><span>pontos</span></div></div>
            ${nivelBarra(st)}
            <p class="perfil-bio">${esc(p.bio || (eu ? 'Escreva uma biografia para a comunidade conhecer você.' : 'Sem biografia ainda.'))}</p>
            ${ins.length ? `<div class="insignias">${ins.map(([gl, nome, desc]) => `<span class="insignia" title="${esc(desc)}"><span aria-hidden="true">${gl}</span>${esc(nome)}</span>`).join('')}</div>` : ''}
            <div class="meta" style="margin-top:10px;color:var(--claro-2)">Na comunidade desde ${esc(new Date(p.criado).toLocaleDateString('pt-BR'))}${st.sequencia ? ` · sequência de ${st.sequencia} dia${st.sequencia > 1 ? 's' : ''}` : ''}</div>
        </article>
        <div class="abas-inicio" style="margin-top:22px">${tab('posts', 'Posts', meus.length)}${tab('personagens', 'Personagens', fichas.length)}${tab('recados', 'Recados', recados.length)}${tab('seguidores', 'Seguidores', seguidoresLista.length)}</div>
        ${corpo}`;
    return { html, ativo: eu ? '' : 'mesa', estreita: true };
}
async function vMembros() {
    const dados = await dadosSociais();
    const lista = Array.from(S.perfis.values());
    const pend = lista.filter(p => !p.aprovado);
    const ok = lista.filter(p => p.aprovado).map(p => ({ p, st: calcStats(p.id, dados) })).sort((a, b) => b.st.pontos - a.st.pontos);
    const segs = new Set(S.follows.filter(f => f.follower_id === S.me.id).map(f => f.followed_id));
    const linhaPend = p => `<div class="membro pendente">${avatarHtml(p, 'av-m')}<div class="info"><b>${esc(p.nome)}</b><div style="color:var(--claro-2);font-size:.95rem">Pediu para entrar ${quando(p.criado)}</div></div>
        ${ehMestre() ? `<button class="btn btn-primario btn-peq" data-acao="aprovar" data-id="${esc(p.id)}">Aprovar entrada</button>` : ''}</div>`;
    const card = ({ p, st }) => `<div class="membro-card"><a class="mc-banner" href="#/perfil/${esc(p.id)}" ${bg(p.banner)} aria-label="Perfil de ${esc(p.nome)}"></a>
        <div class="mc-corpo">${avatarHtml(p, 'av-m')}<div class="mc-info"><a href="#/perfil/${esc(p.id)}"><b>${esc(p.nome)}</b></a>${p.papel === 'mestre' ? '<span class="papel-etiqueta">Mestre</span>' : ''}<small>Nível ${st.nivel.n} · ${esc(st.nivel.nome)}</small></div></div>
        <div class="mc-stats"><span><b>${st.seguidores}</b> seguidores</span><span><b>${st.pontos}</b> pontos</span></div>
        <div class="mc-acoes">${p.id !== S.me.id ? `<button class="btn btn-peq btn-seguir ${segs.has(p.id) ? 'seguindo' : 'btn-primario'}" data-acao="seguir" data-id="${esc(p.id)}">${segs.has(p.id) ? 'Seguindo' : 'Seguir'}</button>` : '<a class="btn btn-peq" href="#/perfil/' + esc(p.id) + '">Meu perfil</a>'}
            ${ehMestre() && p.id !== S.me.id ? `<button class="btn btn-peq" data-acao="papel" data-id="${esc(p.id)}" data-v="${p.papel === 'mestre' ? 'jogador' : 'mestre'}">${p.papel === 'mestre' ? 'Tornar jogador' : 'Tornar Mestre'}</button><button class="btn btn-peq btn-perigo" data-acao="suspender" data-id="${esc(p.id)}">Suspender</button>` : ''}</div></div>`;
    return { ativo: 'mesa', html: `<div class="cab-vista"><div><h1>Comunidade</h1><p>Quem faz parte de Verden Af, dos mais ativos aos recém-chegados.</p></div></div>
        ${pend.length && ehMestre() ? `<h2 class="sec-titulo" style="margin-top:0">Aguardando aprovação</h2>${pend.map(linhaPend).join('')}<h2 class="sec-titulo">Membros</h2>` : ''}
        <div class="grade-membros">${ok.map(card).join('')}</div>` };
}
async function vBusca(termo) {
    const q = (termo || '').trim();
    const form = `<form class="busca-form" data-acao="busca"><input type="search" id="q-busca" placeholder="Buscar posts, personagens, raças, classes, habilidades…" value="${esc(q)}" aria-label="Buscar"><button class="btn btn-primario">Buscar</button></form>`;
    if (!q) return { ativo: 'busca', estreita: true, html: `<div class="cab-vista"><div><h1>Buscar</h1><p>Tudo o que a mesa já registrou, num lugar só.</p></div></div>${form}` };
    const n = q.toLowerCase();
    const tem = (...c) => c.some(x => String(x || '').toLowerCase().includes(n));
    const [posts, pers] = await Promise.all([API.posts(), API.personagens()]);
    const rp = posts.filter(p => tem(p.titulo, (p.tags || []).join(' '), (p.blocos || []).map(b => b.texto || b.titulo || '').join(' ')));
    const rc = pers.filter(c => tem(c.nome, Object.values(c.dados || {}).join(' ')));
    const rr = [...Object.keys(RACAS), ...RACAS_SEM_VERBETE].filter(r => tem(r) || (RACAS[r] && tem(RACAS[r].atributos, RACAS[r].racial)));
    const rcl = Object.entries(CLASSES).filter(([nm, c]) => tem(nm, c.resumo));
    const rs = [];
    Object.entries(CLASSES).forEach(([cn, c]) => Object.entries(c.subs).forEach(([sn, s]) => {
        if (tem(sn, s.desc)) rs.push({ cn, txt: sn, sub: s.desc });
        s.hab.forEach(h => { const [hn, ht] = h.split('|'); if (tem(hn, ht)) rs.push({ cn, txt: hn, sub: `${sn}: ${(ht || '').slice(0, 90)}` }); });
    }));
    const grupo = (t, itens) => itens.length ? `<div class="res-grupo"><h2>${t} · ${itens.length}</h2>${itens.join('')}</div>` : '';
    const item = (href, a, b) => `<a class="res-item" href="${href}"><span>${esc(a)}</span><small>${esc(b || '')}</small></a>`;
    const tudo = grupo('Posts', rp.map(p => item(`#/post/${esc(p.id)}`, p.titulo, `${TIPOS[p.tipo] ? TIPOS[p.tipo].nome : ''} · ${perfil(p.autor_id).nome}`))) +
        grupo('Personagens', rc.map(c => item(`#/registro/${esc(c.id)}`, c.nome, [(c.dados || {}).Raca, (c.dados || {}).Classe].filter(Boolean).join(' · ')))) +
        grupo('Raças', rr.map(r => item(`#/tomo/raca/${encodeURIComponent(r)}`, r, 'Tomo'))) +
        grupo('Classes', rcl.map(([nm]) => item(`#/tomo/classe/${encodeURIComponent(nm)}`, nm, 'Tomo'))) +
        grupo('Subclasses e habilidades', rs.slice(0, 25).map(x => item(`#/tomo/classe/${encodeURIComponent(x.cn)}`, x.txt, x.sub)));
    return { ativo: 'busca', estreita: true, html: `<div class="cab-vista"><div><h1>Buscar</h1></div></div>${form}${tudo || vazio('Nada encontrado', `Nenhum resultado para “${q}”. Tente outra palavra.`)}` };
}

/* =====================================================
   AÇÕES (cliques)
   ===================================================== */
const ACOES = {
    async 'entrar-demo'(el) { S.me = await API.entrar(el.dataset.id); location.hash = '#/'; rotear(); },
    async entrar() { try { await API.entrar(); } catch (e) { S.erro = e.message; telaEntrada(); } },
    async sair() { await API.sair(); S.me = null; location.hash = '#/'; rotear(); },
    recarregar() { location.reload(); },
    aba(el) { S.aba = el.dataset.a; rotear(); },
    async checkin() { await API.fazerCheckin(hojeStr()); toast('Presença marcada'); rotear(); },
    async salvar(el) {
        const v = await API.alternarSalvo(S._post.id); S._post.salvo = v;
        el.textContent = v ? '★ Salvo' : '☆ Salvar'; toast(v ? 'Post salvo' : 'Removido dos salvos');
    },
    async 'copiar-link'() {
        const url = location.href;
        try { await navigator.clipboard.writeText(url); toast('Link copiado'); } catch (e) { window.prompt('Copie o link:', url); }
    },
    async seguir(el) {
        const agora = await API.alternarSeguir(el.dataset.id);
        if (agora) await API.notificar({ user_id: el.dataset.id, tipo: 'seguiu', texto: 'começou a seguir você' });
        S.follows = await API.seguidores();
        if (/^#\/perfil\//.test(location.hash)) return rotear();
        el.textContent = agora ? 'Seguindo' : 'Seguir'; el.classList.toggle('seguindo', agora); el.classList.toggle('btn-primario', !agora);
        toast(agora ? 'Você começou a seguir' : 'Você deixou de seguir');
    },
    async votar(el) {
        await API.votar(S._post.id, el.dataset.bloco, el.dataset.op);
        S._post.mapa.__votos = await API.votos(S._post.id);
        const b = S._post.post.blocos.find(x => x.id === el.dataset.bloco);
        el.closest('.bloco').innerHTML = renderBloco(b, S._post.mapa, S._post.post); toast('Voto registrado');
    },
    async 'enviar-recado'(el) {
        const t = $('#novo-recado'), txt = t.value.trim();
        if (!txt) return toast('Escreva o recado antes de enviar.', true);
        await API.enviarRecado(el.dataset.id, txt);
        await API.notificar({ user_id: el.dataset.id, tipo: 'recado', texto: 'deixou um recado no seu perfil' });
        toast('Recado enviado'); rotear();
    },
    async 'apagar-recado'(el) {
        if (!await confirmar('Apagar este recado?', 'Ele some do mural.', 'Apagar', true)) return;
        await API.apagarRecado(el.dataset.id); rotear();
    },
    'menu-mais'() {
        const m = abrirModal(`<h2>Mais</h2><div class="menu-mais"><a href="#/cronicas">✎ Crônicas</a><a href="#/sistemas">⚙ Sistemas</a><a href="#/tomo">☾ Tomo</a><a href="#/membros">☉ Comunidade</a><a href="#/busca">✦ Buscar</a><a href="#/perfil/${esc(S.me.id)}">Meu perfil</a><button data-acao="sair">Sair</button></div>`);
        m.onclick = e => { if (e.target.closest('a,button') || e.target.id === 'modal') fecharModal(); };
    },
    'reiniciar-demo'() { confirmar('Reiniciar demonstração?', 'Os posts, fichas e comentários de teste voltam ao começo. Nada disso afeta a rede real.', 'Reiniciar', true).then(ok => { if (ok) { API.reiniciar(); location.hash = '#/'; location.reload(); } }); },
    filtro(el) {
        S.filtro = el.dataset.f; rotear();
    },
    tag(el) { S.tag = el.dataset.t; rotear(); },
    ampliar(el) { const l = $('#lightbox'); $('img', l).src = el.src; l.hidden = false; },
    async reagir(el) {
        const tinha = S._post.reac.some(r => r.post_id === el.dataset.pid && r.user_id === S.me.id && r.selo === el.dataset.selo);
        await API.alternarReacao(el.dataset.pid, el.dataset.selo);
        if (!tinha) await API.notificar({ user_id: S._post.post.autor_id, tipo: 'reacao', post_id: el.dataset.pid, texto: 'reagiu ao seu post' });
        S._post.reac = await API.reacoes();
        $('#reacoes').innerHTML = reacoesHtml(S._post.id, S._post.reac);
    },
    async revelar(el) { await API.revelarSegredo(el.dataset.sid, el.dataset.v === '1'); toast(el.dataset.v === '1' ? 'Segredo revelado' : 'Segredo ocultado'); rotear(); },
    async fixar(el) { await API.fixar(el.dataset.id, el.dataset.v === '1'); toast(el.dataset.v === '1' ? 'Post em destaque' : 'Fora dos destaques'); rotear(); },
    async 'apagar-post'(el) {
        if (!await confirmar('Apagar este post?', 'Os comentários e reações também serão apagados. Isso não pode ser desfeito.', 'Apagar', true)) return;
        await API.apagarPost(el.dataset.id); S.wiki = null; toast('Post apagado'); location.hash = '#/';
    },
    responder(el) {
        S.respondendo = el.dataset.id;
        $('#resp-aviso').innerHTML = `<div class="resp-aviso">Respondendo a ${esc(el.dataset.nome)} <button class="link-suave" data-acao="cancelar-resp">cancelar</button></div>`;
        $('#novo-coment').focus();
    },
    'cancelar-resp'() { S.respondendo = null; $('#resp-aviso').innerHTML = ''; },
    async comentar() {
        const t = $('#novo-coment'); const txt = t.value.trim();
        if (!txt) return toast('Escreva algo antes de comentar.', true);
        const pai = S.respondendo ? S._post.coms.find(c => c.id === S.respondendo) : null;
        await API.comentar(S._post.id, txt, S.respondendo);
        if (pai) await API.notificar({ user_id: pai.autor_id, tipo: 'resposta', post_id: S._post.id, texto: 'respondeu ao seu comentário' });
        if (!pai || pai.autor_id !== S._post.post.autor_id) await API.notificar({ user_id: S._post.post.autor_id, tipo: 'comentario', post_id: S._post.id, texto: 'comentou no seu post' });
        S.respondendo = null; t.value = ''; $('#resp-aviso').innerHTML = '';
        S._post.coms = await API.comentarios(S._post.id);
        $('#lista-coments').innerHTML = comentariosHtml(S._post.coms);
        $('.comentarios h2').textContent = `Comentários · ${S._post.coms.length}`;
        toast('Comentário publicado');
    },
    async 'apagar-coment'(el) {
        if (!await confirmar('Apagar comentário?', 'As respostas a ele também serão apagadas.', 'Apagar', true)) return;
        await API.apagarComentario(el.dataset.id);
        S._post.coms = await API.comentarios(S._post.id);
        $('#lista-coments').innerHTML = comentariosHtml(S._post.coms);
        $('.comentarios h2').textContent = `Comentários · ${S._post.coms.length}`;
    },
    async aprovar(el) { await API.gerenciarMembro(el.dataset.id, { aprovado: true }); toast('Entrada aprovada'); rotear(); },
    async suspender(el) { if (await confirmar('Suspender este membro?', 'Ele volta para a sala de espera e deixa de ver a mesa.', 'Suspender', true)) { await API.gerenciarMembro(el.dataset.id, { aprovado: false }); rotear(); } },
    async papel(el) { await API.gerenciarMembro(el.dataset.id, { papel: el.dataset.v }); toast('Papel alterado'); rotear(); },
    'editar-perfil'() {
        const m = S.me;
        abrirModal(`<h2>Editar perfil</h2>
            <div class="campo"><label for="pf-nome">Nome</label><input type="text" id="pf-nome" value="${esc(m.nome)}" maxlength="40"></div>
            <div class="campo"><label for="pf-titulo">Título</label><input type="text" id="pf-titulo" value="${esc(m.titulo || '')}" maxlength="40" placeholder="Ex: Sobrevivente da Sessão 12"></div>
            <div class="campo"><label for="pf-bio">Biografia</label><textarea id="pf-bio" maxlength="400">${esc(m.bio || '')}</textarea></div>
            <div class="campo"><label for="pf-banner">Banner do perfil</label><input type="file" id="pf-banner" accept="image/*"></div>
            <div class="campo"><label for="pf-av">Foto</label><input type="file" id="pf-av" accept="image/*"><p class="dica">A foto é reduzida automaticamente.</p></div>
            <div class="modal-acoes"><button class="btn" data-acao="fechar-modal">Cancelar</button><button class="btn btn-primario" data-acao="salvar-perfil">Salvar</button></div>`);
    },
    'fechar-modal'() { fecharModal(); },
    async 'salvar-perfil'() {
        const patch = { nome: $('#pf-nome').value.trim() || S.me.nome, titulo: $('#pf-titulo').value.trim(), bio: $('#pf-bio').value.trim() };
        const f = $('#pf-av').files[0];
        try {
            if (f) { toast('Enviando foto…'); patch.avatar = await API.enviarImagem(f, 400); }
            const fb = $('#pf-banner').files[0];
            if (fb) { toast('Enviando banner…'); patch.banner = await API.enviarImagem(fb, 1400); }
            S.me = await API.atualizarPerfil(patch); fecharModal(); toast('Perfil atualizado'); rotear();
        } catch (e) { toast(e.message, true); }
    },
    busca(el, ev) { ev.preventDefault(); location.hash = '#/busca/' + encodeURIComponent($('#q-busca').value.trim()); },
    'importar-ficha'() { $('#arq-ficha').click(); },
    async 'baixar-ficha'(el) {
        const c = await API.personagem(el.dataset.id);
        const obj = Object.assign({}, c.dados, { avatar: c.avatar || '' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
        a.download = `Dossie_Clave_${(c.nome || 'ficha').replace(/[^\w-]+/g, '_')}.json`; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    async 'apagar-ficha'(el) {
        if (!await confirmar('Apagar este registro?', 'A ficha some da rede. Posts que a citam passam a mostrar "ficha indisponível".', 'Apagar', true)) return;
        await API.apagarPersonagem(el.dataset.id); toast('Registro apagado'); location.hash = '#/registros';
    }
};

document.addEventListener('click', async ev => {
    const el = ev.target.closest('[data-acao]');
    if (!el || el.tagName === 'FORM') return;
    const fn = ACOES[el.dataset.acao] || (typeof ACOES_EDITOR !== 'undefined' && ACOES_EDITOR[el.dataset.acao]);
    if (!fn) return;
    if (el.tagName === 'A') ev.preventDefault();
    try { await fn(el, ev); } catch (e) { console.error(e); toast(e.message || 'Algo deu errado.', true); }
});
document.addEventListener('submit', ev => {
    const f = ev.target.closest('[data-acao]'); if (!f) return;
    if (ACOES[f.dataset.acao]) ACOES[f.dataset.acao](f, ev);
});
document.addEventListener('change', async ev => {
    if (ev.target.id === 'arq-ficha' && ev.target.files[0]) {
        try { await importarFicha(ev.target.files[0]); } catch (e) { toast(e.message, true); }
        ev.target.value = '';
    }
});
document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { if (!$('#lightbox').hidden) $('#lightbox').hidden = true; else if (!$('#modal').hidden) fecharModal(); }
});
$('#lightbox').addEventListener('click', () => { $('#lightbox').hidden = true; });
$('#modal').addEventListener('click', ev => { if (ev.target.id === 'modal' && !ev.target.querySelector('[data-m]')) fecharModal(); });

/* ---------- Início ---------- */
(async function iniciar() {
    const hErro = new URLSearchParams(location.hash.replace(/^#/, ''));
    if (hErro.get('error')) {
        const d = (hErro.get('error_description') || '').replace(/\+/g, ' ');
        S.erro = /exchange external code/i.test(d)
            ? 'O Discord recusou a conexão. Quase sempre é o Client Secret ou o Client ID colados errado no Supabase. Confira os dois e tente de novo.'
            : (d || 'Não foi possível entrar. Tente de novo.');
        history.replaceState(null, '', location.pathname);
    }
    try {
        const r = await API.init();
        S.modo = r.modo; S.me = r.me; S.usuariosDemo = r.usuariosDemo || [];
    } catch (e) { S.erro = e.message; S.modo = (window.API && window.API.modo) || 'demo'; }
    window.addEventListener('hashchange', rotear);
    rotear();
})();
