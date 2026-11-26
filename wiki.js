/* ==========================================================
   VERDEN AF — enciclopédia, crônicas e biblioteca de sistemas
   (usa o mesmo banco dos posts: o que muda fica em post.meta)
   ========================================================== */
'use strict';

const CATEGORIAS = {
    npc: { nome: 'Personagem (NPC)', gl: '♟', campos: ['Raça', 'Idade', 'Origem', 'Afiliação', 'Ocupação', 'Situação'] },
    local: { nome: 'Local', gl: '⌂', campos: ['Região', 'Governante', 'População', 'Clima', 'Fundação'] },
    faccao: { nome: 'Facção', gl: '⚑', campos: ['Líder', 'Sede', 'Fundação', 'Objetivo', 'Símbolo'] },
    item: { nome: 'Item', gl: '⚗', campos: ['Tipo', 'Raridade', 'Origem', 'Portador atual', 'Efeito'] },
    criatura: { nome: 'Criatura', gl: '☠', campos: ['Tipo', 'Habitat', 'Perigo', 'Fraqueza'] },
    evento: { nome: 'Evento', gl: '⌛', campos: ['Data', 'Local', 'Envolvidos', 'Consequência'] },
    religiao: { nome: 'Religião', gl: '☥', campos: ['Divindade', 'Símbolo', 'Domínios', 'Sede'] }
};
const STATUS_SIS = { oficial: 'Oficial', homebrew: 'Homebrew', proposta: 'Proposta' };

const desesc = s => String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const normWiki = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/* ---------- Índice de verbetes e links [[assim]] ---------- */
function linkWiki(alvo, rotuloEsc) {
    const v = S.wiki && S.wiki.idx.get(normWiki(alvo));
    if (v) return `<a class="wiki-link" href="#/post/${esc(v.id)}">${rotuloEsc}</a>`;
    return `<a class="wiki-falta" href="#/novo/verbete/${encodeURIComponent(alvo)}" title="Esse verbete ainda não existe. Clique para criar.">${rotuloEsc}</a>`;
}
async function carregarWiki(forcar) {
    if (!forcar && S.wiki && Date.now() - S.wiki.t < 15000) return S.wiki;
    const posts = (await API.posts()).filter(p => !p.rascunho);
    const idx = new Map(), back = new Map();
    posts.filter(p => p.tipo === 'verbete').forEach(p => idx.set(normWiki(p.titulo), p));
    const re = /\[\[([^\]|]{1,80})(?:\|[^\]]{0,80})?\]\]/g;
    posts.forEach(p => {
        const txt = (p.blocos || []).map(b => b.texto || '').join('\n');
        const vistos = new Set(); let m;
        while ((m = re.exec(txt))) {
            const v = idx.get(normWiki(m[1]));
            if (v && v.id !== p.id && !vistos.has(v.id)) { vistos.add(v.id); if (!back.has(v.id)) back.set(v.id, []); back.get(v.id).push(p); }
        }
    });
    S.wiki = { t: Date.now(), posts, idx, back };
    return S.wiki;
}

/* ---------- Ajudantes ---------- */
const meta = p => p.meta || {};
function dataBonita(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00'); return isNaN(d) ? '' : d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function situacaoSis(p) { return STATUS_SIS[meta(p).situacao] ? meta(p).situacao : 'homebrew'; }
function etiquetaMeta(p) {
    const m = meta(p);
    if (p.tipo === 'relato' && m.sessao) return `<span class="etq">Sessão ${esc(m.sessao)}</span>`;
    if (p.tipo === 'verbete' && CATEGORIAS[m.categoria]) return `<span class="etq">${CATEGORIAS[m.categoria].gl} ${esc(CATEGORIAS[m.categoria].nome)}</span>`;
    if (p.tipo === 'sistema') return `<span class="etq etq-${situacaoSis(p)}">${esc(STATUS_SIS[situacaoSis(p)])}${m.versao ? ' · v' + esc(m.versao) : ''}</span>`;
    return '';
}
function migalhasPost(post) {
    const m = meta(post);
    if (post.tipo === 'verbete') {
        const c = CATEGORIAS[m.categoria];
        return `<a href="#/">Início</a> / <a href="#/wiki">Enciclopédia</a>${c ? ` / <a href="#/wiki/${esc(m.categoria)}">${esc(c.nome)}</a>` : ''}`;
    }
    if (post.tipo === 'relato') return '<a href="#/">Início</a> / <a href="#/cronicas">Crônicas</a>';
    if (post.tipo === 'sistema') return '<a href="#/">Início</a> / <a href="#/sistemas">Sistemas</a>';
    return `<a href="#/">Início</a> / ${esc(TIPOS[post.tipo] ? TIPOS[post.tipo].nome : 'Post')}`;
}
function ativoPost(post) { return { verbete: 'wiki', relato: 'cronicas', sistema: 'sistemas' }[post.tipo] || 'mural'; }

/* ---------- Dentro de um post ---------- */
function metaPost(post) {
    const m = meta(post);
    if (post.tipo === 'verbete') {
        const c = CATEGORIAS[m.categoria];
        const campos = Object.entries(m.campos || {}).filter(([, v]) => String(v || '').trim());
        return `<aside class="infobox" aria-label="Ficha do verbete"><div class="ib-cab">${c ? c.gl + ' ' + esc(c.nome) : 'Verbete'}</div>
            ${campos.length ? `<dl>${campos.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : '<p class="dica" style="padding:10px 12px">Sem dados na ficha.</p>'}</aside>
            ${m.resumo ? `<p class="wiki-lead">${esc(m.resumo)}</p>` : ''}`;
    }
    if (post.tipo === 'relato') {
        const ps = (m.participantes || []).map(id => perfil(id));
        const pend = (m.pendencias || []).filter(Boolean);
        return `<div class="sessao-barra">${m.sessao ? `<span><b>Sessão ${esc(m.sessao)}</b></span>` : ''}${m.data ? `<span>${esc(dataBonita(m.data))}</span>` : ''}
            ${ps.length ? `<span class="sessao-quem">${ps.map(p => `<a href="#/perfil/${esc(p.id)}" title="${esc(p.nome)}">${avatarHtml(p, 'av-pp')}</a>`).join('')}</span>` : ''}</div>
            ${pend.length ? `<div class="pend"><h3>Pendências</h3><ul>${pend.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}`;
    }
    if (post.tipo === 'sistema') {
        return `<div class="sessao-barra"><span class="etq etq-${situacaoSis(post)}">${esc(STATUS_SIS[situacaoSis(post)])}</span>${m.versao ? `<span>Versão ${esc(m.versao)}</span>` : ''}</div>`;
    }
    return '';
}
function mencoesHtml(post) {
    if (post.tipo !== 'verbete' || !S.wiki) return '';
    const l = S.wiki.back.get(post.id) || [];
    if (!l.length) return '';
    return `<section class="mencoes"><h2>Mencionado em · ${l.length}</h2><ul>${l.map(p => `<li><a href="#/post/${esc(p.id)}">${esc(p.titulo)}</a> <small>${esc(TIPOS[p.tipo] ? TIPOS[p.tipo].nome : '')}</small></li>`).join('')}</ul></section>`;
}

/* ---------- Enciclopédia ---------- */
function cartaoWiki(p) {
    const m = meta(p);
    const resumo = m.resumo || (p.tipo === 'sistema' ? '' : '');
    const t = (p.blocos || []).find(b => b.tipo === 'texto' && (b.texto || '').trim());
    const txt = resumo || (t ? textoPuro(t.texto).slice(0, 150) : '');
    return `<a class="wiki-card papel" href="#/post/${esc(p.id)}" data-busca="${esc(normWiki([p.titulo, txt, (p.tags || []).join(' ')].join(' ')))}">
        ${p.capa ? `<div class="capa" ${bg(p.capa)}></div>` : ''}
        <div class="corpo">${etiquetaMeta(p)}<h3>${esc(p.titulo || 'Sem título')}</h3>${txt ? `<p>${esc(txt)}</p>` : ''}</div></a>`;
}
async function vWiki(cat) {
    const w = await carregarWiki();
    const todos = w.posts.filter(p => p.tipo === 'verbete').sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
    const lista = CATEGORIAS[cat] ? todos.filter(p => meta(p).categoria === cat) : todos;
    const n = id => todos.filter(p => meta(p).categoria === id).length;
    const chips = `<a class="filtro ${!CATEGORIAS[cat] ? 'on' : ''}" href="#/wiki">Tudo · ${todos.length}</a>` +
        Object.entries(CATEGORIAS).map(([id, c]) => `<a class="filtro ${cat === id ? 'on' : ''}" href="#/wiki/${id}"><span class="gl">${c.gl}</span>${esc(c.nome)} · ${n(id)}</a>`).join('');
    const html = `<div class="cab-vista"><div><h1>Enciclopédia</h1><p>Tudo o que a mesa sabe sobre Verden Af. Qualquer membro pode criar um verbete.</p></div>
        <a class="btn btn-primario" href="#/novo/verbete">Novo verbete</a></div>
        <div class="wiki-busca"><input type="search" id="wiki-q" placeholder="Filtrar verbetes…" aria-label="Filtrar verbetes"></div>
        <div class="filtros">${chips}</div>
        ${lista.length ? `<div class="wiki-grade">${lista.map(cartaoWiki).join('')}</div><p class="dica" id="wiki-nada" hidden style="margin-top:14px">Nenhum verbete com esse termo.</p>`
        : vazio('Nenhum verbete aqui ainda', 'Crie o primeiro: um NPC, uma cidade, uma facção ou um item. Para ligar verbetes, escreva [[Nome do verbete]] no texto.', '<a class="btn btn-primario" href="#/novo/verbete">Criar verbete</a>')}`;
    return { html, ativo: 'wiki' };
}
document.addEventListener('input', ev => {
    if (ev.target.id !== 'wiki-q') return;
    const q = normWiki(ev.target.value); let vis = 0;
    $$('.wiki-card').forEach(c => { const o = !!q && !c.dataset.busca.includes(q); c.hidden = o; if (!o) vis++; });
    const n = $('#wiki-nada'); if (n) n.hidden = vis > 0;
});

/* ---------- Crônicas ---------- */
async function vCronicas() {
    const w = await carregarWiki();
    const num = p => +meta(p).sessao || 0;
    const lista = w.posts.filter(p => p.tipo === 'relato').sort((a, b) => (num(b) - num(a)) || b.criado.localeCompare(a.criado));
    const abertas = lista.slice(0, 2).flatMap(p => (meta(p).pendencias || []).filter(Boolean).map(t => ({ t, p })));
    const item = p => {
        const m = meta(p), ps = (m.participantes || []).map(id => perfil(id));
        const t = (p.blocos || []).find(b => b.tipo === 'texto' && (b.texto || '').trim());
        return `<li class="lt-item"><span class="lt-no">${m.sessao ? 'Sessão ' + esc(m.sessao) : 'Crônica'}</span>
            <a class="lt-card papel" href="#/post/${esc(p.id)}">
                <h3>${esc(p.titulo)}</h3>
                <div class="meta">${m.data ? `<span>${esc(dataBonita(m.data))}</span>` : `<span>${quando(p.criado)}</span>`}
                    <span class="sessao-quem">${ps.map(x => avatarHtml(x, 'av-pp')).join('')}</span></div>
                ${t ? `<p class="resumo">${esc(textoPuro(t.texto).slice(0, 220))}${textoPuro(t.texto).length > 220 ? '…' : ''}</p>` : ''}
                ${(m.pendencias || []).filter(Boolean).length ? `<span class="etq">${(m.pendencias || []).filter(Boolean).length} pendência(s)</span>` : ''}</a></li>`;
    };
    const html = `<div class="cab-vista"><div><h1>Crônicas</h1><p>A história da campanha, sessão por sessão.</p></div>
        <a class="btn btn-primario" href="#/novo/relato">Nova crônica</a></div>
        ${abertas.length ? `<div class="pend pend-topo"><h3>Pendências em aberto</h3><ul>${abertas.map(x => `<li>${esc(x.t)} <a href="#/post/${esc(x.p.id)}"><small>${esc(x.p.titulo)}</small></a></li>`).join('')}</ul></div>` : ''}
        ${lista.length ? `<ol class="linha-tempo">${lista.map(item).join('')}</ol>` : vazio('Nenhuma crônica ainda', 'Registre o que aconteceu na última sessão: resumo, quem jogou e o que ficou pendente.', '<a class="btn btn-primario" href="#/novo/relato">Escrever a primeira</a>')}`;
    return { html, ativo: 'cronicas', estreita: true };
}

/* ---------- Sistemas ---------- */
async function vSistemas(filtro) {
    const w = await carregarWiki();
    const todos = w.posts.filter(p => p.tipo === 'sistema').sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
    const lista = STATUS_SIS[filtro] ? todos.filter(p => situacaoSis(p) === filtro) : todos;
    const chips = `<a class="filtro ${!STATUS_SIS[filtro] ? 'on' : ''}" href="#/sistemas">Tudo · ${todos.length}</a>` +
        Object.entries(STATUS_SIS).map(([id, nome]) => `<a class="filtro ${filtro === id ? 'on' : ''}" href="#/sistemas/${id}">${nome} · ${todos.filter(p => situacaoSis(p) === id).length}</a>`).join('');
    const html = `<div class="cab-vista"><div><h1>Sistemas</h1><p>Regras, mecânicas e criações da mesa. O selo Oficial é do Mestre.</p></div>
        <a class="btn btn-primario" href="#/novo/sistema">Novo sistema</a></div>
        <div class="filtros">${chips}</div>
        ${lista.length ? `<div class="wiki-grade">${lista.map(cartaoWiki).join('')}</div>` : vazio('Nenhum sistema aqui', 'Publique uma regra, classe ou item criado pela mesa.', '<a class="btn btn-primario" href="#/novo/sistema">Publicar sistema</a>')}`;
    return { html, ativo: 'sistemas' };
}

/* ---------- Campos extras no editor de posts ---------- */
function hojeIso() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function metaPadrao(p, novo) {
    const m = p.meta = p.meta || {};
    if (p.tipo === 'verbete') { if (!CATEGORIAS[m.categoria]) m.categoria = 'npc'; m.campos = m.campos || {}; m.resumo = m.resumo || ''; }
    else if (p.tipo === 'relato') {
        if (novo && !m.sessao) { const ns = S.wiki ? S.wiki.posts.filter(x => x.tipo === 'relato').map(x => +meta(x).sessao || 0) : []; m.sessao = Math.max(0, ...ns) + 1; }
        if (novo && !m.data) m.data = hojeIso();
        if (!m.participantes) m.participantes = novo ? [S.me.id] : [];
        if (!m.pendencias) m.pendencias = [];
    } else if (p.tipo === 'sistema') { if (novo && !m.versao) m.versao = '1.0'; if (!STATUS_SIS[m.situacao]) m.situacao = 'proposta'; }
}
function metaFinal(p) {
    const m = p.meta || {};
    if (p.tipo === 'missao') return { status: m.status || 'aberta' };
    if (p.tipo === 'verbete') {
        const campos = {};
        Object.entries(m.campos || {}).forEach(([k, v]) => { if (String(v || '').trim()) campos[k] = String(v).trim().slice(0, 120); });
        return { categoria: CATEGORIAS[m.categoria] ? m.categoria : 'npc', resumo: String(m.resumo || '').trim().slice(0, 200), campos };
    }
    if (p.tipo === 'relato') return { sessao: m.sessao || '', data: m.data || '', participantes: m.participantes || [], pendencias: (m.pendencias || []).map(s => s.trim()).filter(Boolean).slice(0, 20) };
    if (p.tipo === 'sistema') {
        let s = STATUS_SIS[m.situacao] ? m.situacao : 'proposta';
        if (s === 'oficial' && !ehMestre()) s = 'homebrew';
        return { versao: String(m.versao || '').trim().slice(0, 20), situacao: s };
    }
    return {};
}
function metaEditorHtml(p) {
    const m = p.meta || {};
    if (p.tipo === 'verbete') {
        const c = CATEGORIAS[m.categoria] || CATEGORIAS.npc;
        return `<div class="meta-ed"><div class="grade">
            <div class="campo"><label for="ed-cat">Categoria</label><select id="ed-cat" data-ed="m-categoria">${Object.entries(CATEGORIAS).map(([id, x]) => `<option value="${id}" ${m.categoria === id ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></div>
            <div class="campo"><label for="ed-res">Resumo em uma frase</label><input type="text" id="ed-res" data-ed="m-resumo" maxlength="200" value="${esc(m.resumo || '')}" placeholder="Aparece na lista e no topo do verbete"></div></div>
            <div class="campo"><label>Ficha do verbete (preencha o que souber)</label><div class="grade">${c.campos.map((k, i) => `<div class="campo"><label for="ed-c${i}">${esc(k)}</label><input type="text" id="ed-c${i}" data-ed="m-campo" data-campo="${esc(k)}" maxlength="120" value="${esc((m.campos || {})[k] || '')}"></div>`).join('')}</div></div>
            <p class="dica">Para ligar a outro verbete, escreva <code>[[Nome do verbete]]</code> no texto. Se ele ainda não existir, o link aparece em vermelho e leva à criação.</p></div>`;
    }
    if (p.tipo === 'relato') {
        const todos = [S.me].concat(ED.membros);
        return `<div class="meta-ed"><div class="grade">
            <div class="campo"><label for="ed-ses">Número da sessão</label><input type="number" min="0" id="ed-ses" data-ed="m-sessao" value="${esc(m.sessao || '')}"></div>
            <div class="campo"><label for="ed-dat">Data</label><input type="date" id="ed-dat" data-ed="m-data" value="${esc(m.data || '')}"></div></div>
            <div class="campo"><label>Quem jogou</label><div class="lista-marcar">${todos.map(x => `<label><input type="checkbox" data-mpart="${esc(x.id)}" ${(m.participantes || []).includes(x.id) ? 'checked' : ''}>${esc(x.nome)}</label>`).join('')}</div></div>
            <div class="campo"><label for="ed-pen">Pendências (uma por linha)</label><textarea id="ed-pen" data-ed="m-pend" rows="3" placeholder="O que ficou em aberto para a próxima sessão">${esc((m.pendencias || []).join('\n'))}</textarea></div></div>`;
    }
    if (p.tipo === 'sistema') {
        return `<div class="meta-ed"><div class="grade">
            <div class="campo"><label for="ed-ver">Versão</label><input type="text" id="ed-ver" data-ed="m-versao" maxlength="20" value="${esc(m.versao || '')}" placeholder="1.0"></div>
            <div class="campo"><label for="ed-sit">Situação</label><select id="ed-sit" data-ed="m-situacao">${Object.entries(STATUS_SIS).filter(([id]) => id !== 'oficial' || ehMestre() || m.situacao === 'oficial').map(([id, nome]) => `<option value="${id}" ${m.situacao === id ? 'selected' : ''} ${id === 'oficial' && !ehMestre() ? 'disabled' : ''}>${nome}</option>`).join('')}</select></div></div></div>`;
    }
    return '';
}
function metaInput(t) {
    const m = ED.post.meta, k = t.dataset.ed;
    if (k === 'm-categoria') m.categoria = t.value;
    else if (k === 'm-resumo') m.resumo = t.value;
    else if (k === 'm-campo') { m.campos = m.campos || {}; m.campos[t.dataset.campo] = t.value; }
    else if (k === 'm-sessao') m.sessao = t.value ? +t.value : '';
    else if (k === 'm-data') m.data = t.value;
    else if (k === 'm-pend') m.pendencias = t.value.split('\n');
    else if (k === 'm-versao') m.versao = t.value;
    else if (k === 'm-situacao') m.situacao = t.value;
}
