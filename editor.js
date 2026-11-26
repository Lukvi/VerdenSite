/* ==========================================================
   CLAVE — A REDE · editor de posts (blocos) e formulário de ficha
   Carregado ANTES do app.js. As funções daqui usam as do app.js
   apenas quando são chamadas (depois que tudo já carregou).
   ========================================================== */
'use strict';

/* =====================================================
   FICHA (formulário)
   ===================================================== */
const SCHEMA_FICHA = [
    { id: 'identidade', titulo: 'Identidade e Origem', icone: '✦', campos: [
        { id: 'Nome', label: 'Nome', ph: 'Ex: Cícero' }, { id: 'Sobrenome', label: 'Sobrenome', ph: 'Ex: Vane' },
        { id: 'Pronuncia', label: 'Pronúncia', ph: 'Ex: Sí-ce-ro' }, { id: 'Idade', label: 'Idade', ph: 'Ex: 34' },
        { id: 'Signo', label: 'Signo', tipo: 'signo' }
    ] },
    { id: 'fisico', titulo: 'Traços Físicos e Marcas', icone: '☉', campos: [
        { id: 'Altura', label: 'Altura', ph: 'Ex: 1.82m' }, { id: 'Genero', label: 'Gênero', ph: 'Ex: Masculino' },
        { id: 'Raca', label: 'Raça', tipo: 'raca' }, { id: 'Olhos', label: 'Olhos', ph: 'Ex: Castanhos' },
        { id: 'Cabelo', label: 'Cabelo', ph: 'Ex: Grisalho' }, { id: 'Pele', label: 'Pele', ph: 'Ex: Pálida' },
        { id: 'Marcas', label: 'Marcas', ph: 'Cicatrizes, estigmas ou selos de contenção…', full: true }
    ] },
    { id: 'psique', titulo: 'Psique e Desvios', icone: '☾', campos: [
        { id: 'Medos', label: 'Medos', tipo: 'textarea', ph: 'Fraquezas catalogadas para coerção…', full: true },
        { id: 'Ambicoes', label: 'Ambições', tipo: 'textarea', ph: 'Desejos sob estrita vigilância inquisitorial…', full: true },
        { id: 'Gostos', label: 'Gostos', tipo: 'textarea', ph: 'Preferências toleradas…', full: true },
        { id: 'Desgostos', label: 'Desgostos', tipo: 'textarea', ph: 'Aversões perigosas…', full: true },
        { id: 'Hobbies', label: 'Hobbies', ph: 'Passatempo vigiado', full: true }
    ] },
    { id: 'pericias', titulo: 'Perícias e Especialidades (até 3)', icone: '⚔', campos: [
        { id: 'Pericia1', label: 'Perícia I', tipo: 'pericia' }, { id: 'Pericia2', label: 'Perícia II', tipo: 'pericia' },
        { id: 'Pericia3', label: 'Perícia III', tipo: 'pericia' }
    ] },
    { id: 'estatuto', titulo: 'Estatuto e Linhagem', icone: '♜', campos: [
        { id: 'Classe', label: 'Classe', tipo: 'classe' }, { id: 'Subclasse', label: 'Subclasse', tipo: 'subclasse' },
        { id: 'Faccao', label: 'Facção', ph: 'Ex: Servil à Clave' }, { id: 'Arvore', label: 'Árvore Genealógica', ph: 'Rastreio de sangue arcano' }
    ] },
    { id: 'suplementar', titulo: 'Registros Suplementares', icone: '✎', campos: [
        { id: 'EstadoCivil', label: 'Estado Civil', ph: 'Ex: Sozinho' }, { id: 'Orientacao', label: 'Orientação Sexual', ph: 'Ex: Indiferente' },
        { id: 'Apelido', label: 'Apelido', ph: 'Alcunha nos registros' }, { id: 'Titulo', label: 'Título', ph: 'Grau perante a Clave' }
    ] }
];
const CAMPOS_FICHA = new Set(SCHEMA_FICHA.flatMap(s => s.campos.map(c => c.id)).concat(['StatusInquisitorial', 'InquisidorAssinatura', 'DataInquisitorial']));

let FF = {};

function opcoesFicha(tipo, atual) {
    let lista = [];
    if (tipo === 'signo') lista = SIGNOS;
    else if (tipo === 'raca') lista = Object.keys(RACAS).concat(RACAS_SEM_VERBETE).sort((a, b) => a.localeCompare(b, 'pt'));
    else if (tipo === 'classe') lista = Object.keys(CLASSES);
    else if (tipo === 'pericia') lista = Object.keys(PERICIAS);
    else if (tipo === 'subclasse') lista = FF.dados.Classe && CLASSES[FF.dados.Classe] ? Object.keys(CLASSES[FF.dados.Classe].subs) : [];
    if (atual && !lista.includes(atual)) lista = lista.concat([atual]);
    const vazio = tipo === 'subclasse' && !FF.dados.Classe ? 'Escolha a classe primeiro' : 'Selecione…';
    return `<option value="">${vazio}</option>` + lista.map(o => `<option ${o === atual ? 'selected' : ''}>${esc(o)}</option>`).join('');
}
function campoFicha(c) {
    const v = FF.dados[c.id] || '';
    let ctl;
    if (c.tipo === 'textarea') ctl = `<textarea id="ff-${c.id}" data-ff="${c.id}" placeholder="${esc(c.ph || '')}" maxlength="600">${esc(v)}</textarea>`;
    else if (c.tipo) ctl = `<select id="ff-${c.id}" data-ff="${c.id}">${opcoesFicha(c.tipo, v)}</select>`;
    else ctl = `<input type="text" id="ff-${c.id}" data-ff="${c.id}" value="${esc(v)}" placeholder="${esc(c.ph || '')}" maxlength="120">`;
    return `<div class="campo ${c.full ? 'cheio' : ''}"><label for="ff-${c.id}">${esc(c.label)}</label>${ctl}</div>`;
}
function feedbackFicha() {
    const el = $('#ff-feedback'); if (!el) return;
    const { sin, ps } = pericias(FF.dados);
    el.innerHTML = avisoAptidao(FF.dados) +
        (ps.length ? (sin.length ? `<div class="sinergia" style="color:var(--claro);border-color:var(--musgo)">Sinergia: ${sin.map(([a, l]) => `${esc(l.join(' + '))} (${esc(a)})`).join('; ')}. Essas perícias ganham +2 no resultado final.</div>` : '') : '');
}
async function vFormFicha(id) {
    if (id) {
        const c = await API.personagem(id);
        if (!c || !podeMexer(c.dono_id)) return { html: vazio('Sem acesso', 'Você não pode editar este registro.', '<a class="btn" href="#/registros">Voltar</a>'), ativo: 'registros' };
        FF = { id, novo: false, dados: Object.assign({}, c.dados), avatar: c.avatar || '', publico: c.publico };
    } else {
        FF = { id: API.uid(), novo: true, avatar: '', publico: true,
            dados: { StatusInquisitorial: 'VIGIADO', InquisidorAssinatura: INQUISIDORES[Math.floor(Math.random() * INQUISIDORES.length)], DataInquisitorial: '560 DGA' } };
    }
    const secoes = SCHEMA_FICHA.map(s => `<section class="sec-form"><h2><span>${s.icone}</span>${esc(s.titulo)}</h2>
        <div class="grade">${s.campos.map(campoFicha).join('')}</div>
        ${s.id === 'estatuto' ? '<div id="ff-feedback"></div>' : ''}</section>`).join('');
    const statusOpts = Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${FF.dados.StatusInquisitorial === k ? 'selected' : ''}>${esc(v.rotulo)}</option>`).join('');
    const html = `<div class="migalhas"><a href="#/registros">Registros</a> / ${id ? 'Editar' : 'Novo registro'}</div>
        <div class="cab-vista"><div><h1>${id ? 'Editar registro' : 'Novo registro'}</h1><p>Preencha o que souber. Dá para voltar e completar depois.</p></div></div>
        <div class="ed-painel" id="ff-raiz">
            <h2>Retrato</h2>
            <div class="capa-ed"><div class="previa" id="ff-prev" style="width:110px;height:140px"></div>
                <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn btn-peq">Escolher retrato<input type="file" accept="image/*" hidden data-ff-arq="1"></label>
                <button class="btn btn-peq" data-acao="ff-avatar-rm">Remover</button></div></div>
            ${secoes}
            <section class="sec-form"><h2><span>⚜</span>Controle</h2><div class="grade">
                <div class="campo"><label for="ff-status">Status do registro</label>${ehMestre() ? `<select id="ff-status" data-ff="StatusInquisitorial">${statusOpts}</select>` : `<input type="text" disabled value="${esc((STATUS[FF.dados.StatusInquisitorial] || STATUS.VIGIADO).rotulo)}"><p class="dica">Só o Mestre altera o carimbo.</p>`}</div>
                <div class="campo"><label>Visibilidade</label><label style="display:flex;gap:10px;align-items:center;font-family:var(--f-texto);font-size:1.05rem;color:var(--claro)"><input type="checkbox" id="ff-publico" ${FF.publico ? 'checked' : ''}> Visível para toda a mesa</label><p class="dica">Desmarcado, só você e o Mestre veem.</p></div>
            </div></section>
        </div>
        <div class="barra-fixa"><a class="btn" href="${id ? '#/registro/' + esc(id) : '#/registros'}">Cancelar</a><button class="btn btn-primario" data-acao="ff-salvar">Salvar registro</button></div>`;
    return { html, ativo: 'registros', estreita: true, depois() { prevRetrato(); feedbackFicha(); } };
}
function prevRetrato() {
    const p = $('#ff-prev'); if (!p) return;
    const u = urlSegura(FF.avatar);
    p.style.backgroundImage = u ? `url("${u.replace(/"/g, '%22')}")` : ''; p.textContent = u ? '' : 'sem retrato';
}
async function importarFicha(arquivo) {
    const texto = await arquivo.text();
    let obj; try { obj = JSON.parse(texto); } catch (e) { throw new Error('Esse arquivo não é um dossiê válido (.json).'); }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Esse arquivo não é um dossiê válido.');
    const dados = {};
    Object.keys(obj).forEach(k => { if (CAMPOS_FICHA.has(k) && typeof obj[k] === 'string') dados[k] = obj[k].slice(0, 600); });
    if (dados.Raca && RACA_LEGACY[dados.Raca]) dados.Raca = RACA_LEGACY[dados.Raca];
    if (dados.Subclasse && SUB_LEGACY[dados.Subclasse]) dados.Subclasse = SUB_LEGACY[dados.Subclasse];
    if (!STATUS[dados.StatusInquisitorial] || !ehMestre()) dados.StatusInquisitorial = 'VIGIADO';
    const nome = `${dados.Nome || ''} ${dados.Sobrenome || ''}`.trim();
    if (!nome) throw new Error('O dossiê não tem nome de personagem.');
    const avatar = typeof obj.avatar === 'string' && /^data:image\//.test(obj.avatar) ? obj.avatar : '';
    const c = await API.salvarPersonagem({ id: API.uid(), nome, dados, avatar, publico: true }, true);
    toast('Dossiê importado'); selar(); location.hash = '#/registro/' + c.id;
}

/* =====================================================
   EDITOR DE POSTS
   ===================================================== */
let ED = {};
const BLOCOS = {
    texto: { nome: 'Texto', gl: 'T', novo: () => ({ texto: '' }) },
    imagem: { nome: 'Imagem', gl: '▣', novo: () => ({ url: '', legenda: '' }) },
    galeria: { nome: 'Galeria', gl: '▦', novo: () => ({ urls: [] }) },
    video: { nome: 'Vídeo', gl: '▶', novo: () => ({ url: '', legenda: '' }) },
    citacao: { nome: 'Citação', gl: '❝', novo: () => ({ texto: '', autor: '' }) },
    documento: { nome: 'Documento', gl: '✉', novo: () => ({ titulo: '', texto: '', assinatura: S.me.nome, selo: 'Selado pela Clave' }) },
    ficha: { nome: 'Ficha', gl: '♜', novo: () => ({ personagem_id: '' }) },
    segredo: { nome: 'Segredo', gl: '🗝', novo: () => ({ sid: API.uid(), dica: '' }) },
    enquete: { nome: 'Enquete', gl: '☷', novo: () => ({ pergunta: '', opcoes: [{ id: API.uid(), texto: '' }, { id: API.uid(), texto: '' }] }) },
    divisor: { nome: 'Divisor', gl: '⚜', novo: () => ({}) }
};
const chaveRascunho = () => 'clave_rascunho_' + (ED.novo ? 'novo' : ED.post.id);
function novoBloco(tipo) {
    const b = Object.assign({ id: API.uid(), tipo }, BLOCOS[tipo].novo());
    if (tipo === 'segredo') ED.segs[b.sid] = { id: b.sid, conteudo: '', para: [], revelado: false };
    return b;
}
let _autoT;
function agendarAutosave() {
    clearTimeout(_autoT);
    _autoT = setTimeout(() => {
        try {
            const vazio = !ED.post.titulo.trim() && ED.post.blocos.every(b => b.tipo === 'texto' && !(b.texto || '').trim());
            if (vazio) return localStorage.removeItem(chaveRascunho());
            localStorage.setItem(chaveRascunho(), JSON.stringify({ post: ED.post, segs: ED.segs, tagsTxt: ED.tagsTxt, em: Date.now() }));
            const s = $('#ed-status'); if (s) s.textContent = 'Cópia guardada neste aparelho';
        } catch (e) { }
    }, 700);
}
async function vEditor(id, tipoPre, persId) {
    const membros = Array.from(S.perfis.values()).filter(p => p.aprovado && p.id !== S.me.id);
    const pers = await API.personagens();
    let post, segs = {}, novo = !id;
    if (id) {
        post = await API.post(id);
        if (!post) return { html: vazio('Post não encontrado', '', '<a class="btn" href="#/">Voltar ao Mural</a>'), ativo: 'mural' };
        if (!podeMexer(post.autor_id)) return { html: vazio('Sem permissão', 'Só o autor ou o Mestre editam este post.', '<a class="btn" href="#/">Voltar</a>'), ativo: 'mural' };
        (await API.segredos(id)).forEach(s => { segs[s.id] = { id: s.id, conteudo: s.conteudo, para: s.para || [], revelado: !!s.revelado }; });
        post = JSON.parse(JSON.stringify(post));
    } else {
        const tipo = tipoPre && TIPOS[tipoPre] && (!TIPOS[tipoPre].soMestre || ehMestre()) ? tipoPre : (ehMestre() ? 'decreto' : 'lore');
        post = { id: API.uid(), tipo, titulo: '', capa: null, tags: [], visibilidade: 'todos', para: [], blocos: [], meta: { status: 'aberta' }, fixado: false, rascunho: false };
    }
    ED = { post, segs, novo, membros, pers, previa: false, tagsTxt: (post.tags || []).join(', '), recuperavel: null };
    if (!post.meta) post.meta = {};
    metaPadrao(post, novo);
    if (novo && tipoPre === 'verbete' && persId) post.titulo = persId;
    if (novo) {
        const c = persId && pers.find(x => x.id === persId);
        if (tipoPre === 'ficha' && c) {
            post.titulo = `Registro de ${c.nome}`; post.tags = ['ficha']; ED.tagsTxt = 'ficha';
            post.blocos = [novoBloco('texto'), { id: API.uid(), tipo: 'ficha', personagem_id: c.id }];
        } else post.blocos = [novoBloco('texto')];
    }
    try {
        const salvo = JSON.parse(localStorage.getItem(chaveRascunho()) || 'null');
        if (salvo && salvo.post && (salvo.post.titulo || '').trim() + JSON.stringify(salvo.post.blocos) !== (post.titulo || '').trim() + JSON.stringify(post.blocos)) ED.recuperavel = salvo;
    } catch (e) { }
    return { html: `<div class="cab-vista"><div><h1>${novo ? 'Novo post' : 'Editar post'}</h1><p>Monte o post em blocos. Dá para reordenar, apagar e pré-visualizar.</p></div></div><div id="ed-raiz"></div>`, ativo: 'mural', estreita: true, depois: desenharEditor };
}
function blocoEd(b, i, n) {
    const def = BLOCOS[b.tipo]; if (!def) return '';
    const at = (c, extra) => `data-b="${esc(b.id)}" data-c="${c}" ${extra || ''}`;
    let m = '';
    switch (b.tipo) {
        case 'texto': m = `<div class="ferram-txt">
            ${[['b', '<b>N</b>', 'Negrito'], ['i', '<i>I</i>', 'Itálico'], ['h', 'Título', 'Título de seção'], ['q', '❝', 'Citação'], ['l', '• Lista', 'Lista'], ['a', 'Link', 'Inserir link']].map(([k, t, ti]) => `<button type="button" class="btn btn-peq" data-acao="ed-fmt" data-b="${esc(b.id)}" data-k="${k}" title="${ti}">${t}</button>`).join('')}</div>
            <textarea id="tx-${esc(b.id)}" ${at('texto')} rows="6" placeholder="Escreva aqui. **negrito**, *itálico*, ## título, - lista">${esc(b.texto)}</textarea>`; break;
        case 'imagem': m = `${urlSegura(b.url) ? `<img class="img-prev" src="${esc(b.url)}" alt="">` : ''}
            <label class="btn btn-peq">${b.url ? 'Trocar imagem' : 'Enviar imagem'}<input type="file" accept="image/*" hidden data-arq="img" data-b="${esc(b.id)}"></label>
            <div class="campo" style="margin:12px 0 0"><label>Legenda (opcional)</label><input type="text" ${at('legenda')} value="${esc(b.legenda)}" maxlength="160"></div>`; break;
        case 'galeria': m = `<div class="mini-galeria">${(b.urls || []).map((u, k) => `<div class="it" ${bg(u)}><button type="button" data-acao="ed-gal-rm" data-b="${esc(b.id)}" data-k="${k}" aria-label="Remover imagem">✕</button></div>`).join('')}</div>
            <label class="btn btn-peq">Adicionar imagens<input type="file" accept="image/*" multiple hidden data-arq="galeria" data-b="${esc(b.id)}"></label>`; break;
        case 'video': {
            const ok = videoEmbed(b.url);
            m = `<div class="campo"><label>Link do vídeo (YouTube ou Vimeo)</label><input type="url" ${at('url')} value="${esc(b.url)}" placeholder="https://www.youtube.com/watch?v=…"><p class="dica">${!b.url ? 'Cole o link do vídeo. Ele toca dentro do post.' : (ok ? 'Link reconhecido, o vídeo vai tocar no post.' : 'Link não reconhecido: vai aparecer como um link simples.')}</p></div>
            <div class="campo" style="margin:0"><label>Legenda (opcional)</label><input type="text" ${at('legenda')} value="${esc(b.legenda)}" maxlength="160"></div>`; break;
        }
        case 'citacao': m = `<div class="campo"><label>Frase</label><textarea ${at('texto')} rows="2">${esc(b.texto)}</textarea></div>
            <div class="campo" style="margin:0"><label>Autoria (opcional)</label><input type="text" ${at('autor')} value="${esc(b.autor)}" maxlength="80"></div>`; break;
        case 'documento': m = `<div class="grade"><div class="campo"><label>Título do documento</label><input type="text" ${at('titulo')} value="${esc(b.titulo)}" maxlength="80" placeholder="Ex: Mandado de busca"></div>
            <div class="campo"><label>Assinatura</label><input type="text" ${at('assinatura')} value="${esc(b.assinatura)}" maxlength="60"></div></div>
            <div class="campo"><label>Texto</label><textarea ${at('texto')} rows="5">${esc(b.texto)}</textarea></div>
            <div class="campo" style="margin:0"><label>Carimbo (opcional)</label><input type="text" ${at('selo')} value="${esc(b.selo)}" maxlength="40"></div>`; break;
        case 'ficha': m = `<div class="campo" style="margin:0"><label>Personagem</label><select ${at('personagem_id')}><option value="">Selecione…</option>
            ${ED.pers.map(c => `<option value="${esc(c.id)}" ${c.id === b.personagem_id ? 'selected' : ''}>${esc(c.nome)} (${esc(perfil(c.dono_id).nome)})</option>`).join('')}</select>
            ${ED.pers.length ? '' : '<p class="dica">Nenhum registro ainda. Crie um em Registros.</p>'}</div>`; break;
        case 'segredo': {
            const s = ED.segs[b.sid] || (ED.segs[b.sid] = { id: b.sid, conteudo: '', para: [], revelado: false });
            m = `<p class="dica" style="margin:0 0 10px">O texto fica guardado à parte: quem não tem permissão nem recebe o conteúdo. No post, os outros veem só a dica.</p>
            <div class="campo"><label>Dica visível para todos</label><input type="text" ${at('dica')} value="${esc(b.dica)}" maxlength="120" placeholder="Ex: Algo que só um olhar atento notaria"></div>
            <div class="campo"><label>Texto secreto</label><textarea ${at('segconteudo')} rows="4">${esc(s.conteudo)}</textarea></div>
            <div class="rotulo">Quem pode ler</div>
            <div class="lista-marcar">${ED.membros.map(p => `<label><input type="checkbox" data-seg-para="${esc(b.sid)}" value="${esc(p.id)}" ${(s.para || []).includes(p.id) ? 'checked' : ''}>${esc(p.nome)}</label>`).join('') || '<span class="dica">Não há outros membros ainda.</span>'}
                <label><input type="checkbox" data-seg-rev="${esc(b.sid)}" ${s.revelado ? 'checked' : ''}><b>Todos (revelado)</b></label></div>`; break;
        }
        case 'enquete': m = `<div class="campo"><label>Pergunta</label><input type="text" ${at('pergunta')} value="${esc(b.pergunta)}" maxlength="140" placeholder="Ex: Qual dia para a próxima sessão?"></div>
            <div class="rotulo" style="margin-bottom:6px">Opções (mínimo 2)</div>
            ${(b.opcoes || []).map((o, k) => `<div style="display:flex;gap:6px;margin-bottom:6px"><input type="text" data-b="${esc(b.id)}" data-opc="${k}" value="${esc(o.texto)}" maxlength="80" placeholder="Opção ${k + 1}" aria-label="Opção ${k + 1}">
                <button type="button" class="icone-btn" data-acao="ed-opc-rm" data-b="${esc(b.id)}" data-k="${k}" aria-label="Remover opção" ${(b.opcoes || []).length <= 2 ? 'disabled' : ''}>✕</button></div>`).join('')}
            <button type="button" class="btn btn-peq" data-acao="ed-opc-add" data-b="${esc(b.id)}" ${(b.opcoes || []).length >= 8 ? 'disabled' : ''}>Adicionar opção</button>
            <p class="dica" style="margin-top:10px">Cada pessoa vota uma vez, e o voto não pode ser mudado.</p>`; break;
        case 'divisor': m = '<p style="margin:0;color:var(--claro-2)">Uma linha ornamentada para separar partes do post.</p>'; break;
    }
    return `<div class="bloco-ed" data-bloco="${esc(b.id)}"><header><b><span aria-hidden="true">${def.gl}</span>${def.nome}</b>
        <button type="button" class="icone-btn" data-acao="ed-up" data-b="${esc(b.id)}" ${i === 0 ? 'disabled' : ''} aria-label="Mover para cima" title="Mover para cima">▲</button>
        <button type="button" class="icone-btn" data-acao="ed-down" data-b="${esc(b.id)}" ${i === n - 1 ? 'disabled' : ''} aria-label="Mover para baixo" title="Mover para baixo">▼</button>
        <button type="button" class="icone-btn" data-acao="ed-del" data-b="${esc(b.id)}" aria-label="Remover bloco" title="Remover bloco">✕</button></header>
        <div class="miolo">${m}</div></div>`;
}
function desenharEditor() {
    const raiz = $('#ed-raiz'); if (!raiz) return;
    const p = ED.post;
    if (ED.previa) { raiz.innerHTML = previaHtml() + barraEd(); return; }
    const tipos = Object.entries(TIPOS).map(([id, t]) => `<button type="button" class="tipo-op ${p.tipo === id ? 'on' : ''}" data-acao="ed-tipo" data-t="${id}" ${t.soMestre && !ehMestre() ? 'disabled title="Só o Mestre publica este tipo"' : `title="${esc(t.desc)}"`}>
        <span class="selo t-${id}"><span>${t.gl}</span></span>${t.nome}</button>`).join('');
    const para = p.visibilidade === 'escolhidos' ? `<div class="lista-marcar">${ED.membros.map(m => `<label><input type="checkbox" data-para="${esc(m.id)}" value="${esc(m.id)}" ${(p.para || []).includes(m.id) ? 'checked' : ''}>${esc(m.nome)}</label>`).join('') || '<span class="dica">Não há outros membros ainda.</span>'}</div>` : '';
    raiz.innerHTML = `
        ${ED.recuperavel ? `<div class="aviso-rec"><span>Há uma cópia não salva deste post neste aparelho (${quando(new Date(ED.recuperavel.em).toISOString())}).</span><span><button class="btn btn-peq" data-acao="ed-recuperar">Recuperar</button> <button class="btn btn-peq" data-acao="ed-descartar">Descartar</button></span></div>` : ''}
        <div class="ed-painel"><h2>Tipo do post</h2><div class="tipos">${tipos}</div></div>
        <div class="ed-painel"><h2>Cabeçalho</h2>
            <div class="campo"><label for="ed-titulo">Título</label><input type="text" id="ed-titulo" data-ed="titulo" value="${esc(p.titulo)}" maxlength="120" placeholder="Dê um título ao post"></div>
            <div class="campo"><label>Capa (opcional)</label><div class="capa-ed"><div class="previa" ${bg(p.capa)}>${urlSegura(p.capa) ? '' : 'sem capa'}</div>
                <label class="btn btn-peq">${p.capa ? 'Trocar capa' : 'Enviar capa'}<input type="file" accept="image/*" hidden data-arq="capa"></label>
                ${p.capa ? '<button type="button" class="btn btn-peq" data-acao="ed-capa-rm">Remover capa</button>' : ''}</div></div>
            <div class="grade">
                <div class="campo"><label for="ed-tags">Tags (separadas por vírgula)</label><input type="text" id="ed-tags" data-ed="tags" value="${esc(ED.tagsTxt)}" placeholder="sessão, montainézz"></div>
                <div class="campo"><label for="ed-vis">Quem pode ver</label><select id="ed-vis" data-ed="visibilidade">
                    <option value="todos" ${p.visibilidade === 'todos' ? 'selected' : ''}>Toda a mesa</option>
                    <option value="escolhidos" ${p.visibilidade === 'escolhidos' ? 'selected' : ''}>Só pessoas escolhidas</option>
                    <option value="mestre" ${p.visibilidade === 'mestre' ? 'selected' : ''}>Só o Mestre</option></select></div>
            </div>${para}
            ${p.tipo === 'missao' ? `<div class="campo"><label for="ed-st">Estado da missão</label><select id="ed-st" data-ed="status">${Object.entries(ESTADOS_MISSAO).map(([k, v]) => `<option value="${k}" ${(p.meta.status || 'aberta') === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>` : ''}
            ${metaEditorHtml(p)}
            ${ehMestre() ? `<label style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" data-ed="fixado" ${p.fixado ? 'checked' : ''}> Fixar no topo do Mural</label>` : ''}
        </div>
        <div class="ed-painel"><h2>Conteúdo</h2>
            <div class="blocos-ed">${p.blocos.map((b, i) => blocoEd(b, i, p.blocos.length)).join('') || '<p style="color:var(--claro-2)">Nenhum bloco ainda. Adicione abaixo.</p>'}</div>
            <div class="add-blocos"><span>Adicionar</span>${Object.entries(BLOCOS).map(([k, d]) => `<button type="button" class="btn btn-peq" data-acao="ed-add" data-t="${k}"><span aria-hidden="true">${d.gl}</span> ${d.nome}</button>`).join('')}</div>
        </div>${barraEd()}`;
}
function barraEd() {
    const publicado = !ED.novo && !ED.post.rascunho;
    return `<div class="barra-fixa"><span class="esq" id="ed-status"></span>
        <button class="btn" data-acao="ed-previa">${ED.previa ? 'Voltar a editar' : 'Pré-visualizar'}</button>
        ${publicado ? '' : '<button class="btn" data-acao="ed-rascunho">Salvar rascunho</button>'}
        <button class="btn btn-primario" data-acao="ed-publicar">${publicado ? 'Salvar alterações' : 'Publicar'}</button></div>`;
}
function previaHtml() {
    const p = ED.post;
    const mapa = { __pers: {} };
    ED.pers.forEach(c => { mapa.__pers[c.id] = c; });
    Object.values(ED.segs).forEach(s => { mapa[s.id] = s; });
    const prev = Object.assign({}, p, { id: '', autor_id: S.me.id });
    return `<div class="aviso-rec"><span>Pré-visualização: é assim que o post vai aparecer.</span></div>
        <article class="post papel ${p.capa ? 'com-capa' : ''}">
            ${p.fixado ? '<span class="fita"></span>' : ''}
            ${p.capa ? `<div class="capa-grande" ${bg(p.capa)}></div>` : ''}
            <header class="post-cab">${seloHtml(p.tipo, 'selo-g')}<h1>${esc(p.titulo || 'Sem título')}</h1>
                <div class="meta"><span class="assina">${esc(S.me.nome)}</span><span>agora</span>${visLabel(p) ? `<span class="aviso-vis">${visLabel(p)}</span>` : ''}</div></header>
            <div class="post-corpo">${corpoPost(prev, mapa) || '<p style="color:var(--letra-2)">Post sem conteúdo.</p>'}</div></article>`;
}
function tagsDe(txt) { return [...new Set(String(txt || '').split(',').map(t => t.trim().slice(0, 24)).filter(Boolean))].slice(0, 8); }

async function salvarPostEd(rascunho) {
    const p = ED.post;
    if (!p.titulo.trim()) return toast('Dê um título ao post antes de salvar.', true);
    const segs = [];
    for (const b of p.blocos.filter(x => x.tipo === 'segredo')) {
        const s = ED.segs[b.sid];
        if (!s || !s.conteudo.trim()) return toast('Há um bloco de segredo sem texto. Preencha ou remova.', true);
        segs.push({ id: b.sid, conteudo: s.conteudo, para: s.para || [], revelado: !!s.revelado });
    }
    for (const b of p.blocos.filter(x => x.tipo === 'enquete')) {
        if ((b.pergunta || '').trim() && b.opcoes.filter(o => o.texto.trim()).length < 2) return toast('A enquete precisa de ao menos duas opções preenchidas.', true);
    }
    if (p.tipo === 'verbete') { const dup = S.wiki && S.wiki.idx.get(normWiki(p.titulo)); if (dup && dup.id !== p.id) return toast('Já existe um verbete com esse nome. Edite o existente ou escolha outro título.', true); }
    const primeira = ED.novo || ED.post.rascunho;
    const blocos = p.blocos.map(b => b.tipo === 'enquete' ? Object.assign({}, b, { opcoes: b.opcoes.filter(o => o.texto.trim()) }) : b)
        .filter(b => !(b.tipo === 'enquete' && !(b.pergunta || '').trim())).filter(b => !(b.tipo === 'texto' && !(b.texto || '').trim()) && !(b.tipo === 'imagem' && !b.url) &&
        !(b.tipo === 'galeria' && !(b.urls || []).length) && !(b.tipo === 'video' && !b.url) && !(b.tipo === 'ficha' && !b.personagem_id) &&
        !(b.tipo === 'citacao' && !(b.texto || '').trim()));
    if (!rascunho && !blocos.length) return toast('Adicione algum conteúdo antes de publicar.', true);
    if (p.visibilidade === 'escolhidos' && !(p.para || []).length) return toast('Escolha ao menos uma pessoa, ou mude para "Só o Mestre".', true);
    const post = Object.assign({}, p, {
        blocos, rascunho, tags: tagsDe(ED.tagsTxt),
        para: p.visibilidade === 'escolhidos' ? p.para : [],
        meta: metaFinal(p)
    });
    const botoes = $$('.barra-fixa .btn'); botoes.forEach(b => b.disabled = true);
    try {
        const salvo = await API.salvarPost(post, segs, ED.novo); S.wiki = null;
        try { localStorage.removeItem(chaveRascunho()); } catch (e) { }
        ED.novo = false; ED.post.id = salvo.id; ED.post.rascunho = rascunho; ED.recuperavel = null;
        if (rascunho) { toast('Rascunho salvo'); desenharEditor(); }
        else {
            if (primeira) for (const sg of segs) for (const dest of (sg.para || [])) await API.notificar({ user_id: dest, tipo: 'segredo', post_id: salvo.id, texto: 'compartilhou um segredo com você' });
            selar(); toast('Publicado'); setTimeout(() => { location.hash = '#/post/' + salvo.id; }, 800);
        }
    } catch (e) { botoes.forEach(b => b.disabled = false); throw e; }
}

const ACOES_EDITOR = {
    'ed-tipo'(el) {
        ED.post.tipo = el.dataset.t; metaPadrao(ED.post, true);
        if (el.dataset.t === 'enquete' && !ED.post.blocos.some(b => b.tipo === 'enquete')) ED.post.blocos.unshift(novoBloco('enquete'));
        desenharEditor(); agendarAutosave();
    },
    'ed-opc-add'(el) { const b = ED.post.blocos.find(x => x.id === el.dataset.b); b.opcoes.push({ id: API.uid(), texto: '' }); desenharEditor(); agendarAutosave(); },
    'ed-opc-rm'(el) { const b = ED.post.blocos.find(x => x.id === el.dataset.b); b.opcoes.splice(+el.dataset.k, 1); desenharEditor(); agendarAutosave(); },
    'ed-add'(el) { ED.post.blocos.push(novoBloco(el.dataset.t)); desenharEditor(); agendarAutosave(); const b = $$('.bloco-ed').pop(); if (b) b.scrollIntoView({ block: 'center', behavior: 'smooth' }); },
    'ed-up'(el) { const a = ED.post.blocos, i = a.findIndex(b => b.id === el.dataset.b); if (i > 0) { [a[i - 1], a[i]] = [a[i], a[i - 1]]; desenharEditor(); agendarAutosave(); } },
    'ed-down'(el) { const a = ED.post.blocos, i = a.findIndex(b => b.id === el.dataset.b); if (i >= 0 && i < a.length - 1) { [a[i + 1], a[i]] = [a[i], a[i + 1]]; desenharEditor(); agendarAutosave(); } },
    async 'ed-del'(el) {
        const b = ED.post.blocos.find(x => x.id === el.dataset.b);
        const cheio = b && ((b.texto || '').trim() || b.url || (b.urls || []).length || (b.tipo === 'segredo' && (ED.segs[b.sid] || {}).conteudo));
        if (cheio && !await confirmar('Remover este bloco?', 'O conteúdo dele será perdido.', 'Remover', true)) return;
        ED.post.blocos = ED.post.blocos.filter(x => x.id !== el.dataset.b);
        if (b && b.tipo === 'segredo') delete ED.segs[b.sid];
        desenharEditor(); agendarAutosave();
    },
    'ed-fmt'(el) {
        const b = ED.post.blocos.find(x => x.id === el.dataset.b), ta = $('#tx-' + CSS.escape(el.dataset.b));
        if (!b || !ta) return;
        const ini = ta.selectionStart, fim = ta.selectionEnd, sel = ta.value.slice(ini, fim);
        const k = el.dataset.k; let novo, c1, c2;
        const linhas = f => (sel || 'texto').split('\n').map(f).join('\n');
        if (k === 'b') { novo = `**${sel || 'texto'}**`; c1 = ini + 2; c2 = c1 + (sel || 'texto').length; }
        else if (k === 'i') { novo = `*${sel || 'texto'}*`; c1 = ini + 1; c2 = c1 + (sel || 'texto').length; }
        else if (k === 'h') { novo = '## ' + (sel || 'Título'); c1 = ini + 3; c2 = ini + novo.length; }
        else if (k === 'q') { novo = linhas(l => '> ' + l); c1 = ini; c2 = ini + novo.length; }
        else if (k === 'l') { novo = linhas(l => '- ' + l); c1 = ini; c2 = ini + novo.length; }
        else { novo = `[${sel || 'texto do link'}](https://)`; c1 = ini + novo.length - 9; c2 = c1 + 8; }
        ta.value = ta.value.slice(0, ini) + novo + ta.value.slice(fim);
        b.texto = ta.value; ta.focus(); ta.setSelectionRange(c1, c2); agendarAutosave();
    },
    'ed-gal-rm'(el) { const b = ED.post.blocos.find(x => x.id === el.dataset.b); b.urls.splice(+el.dataset.k, 1); desenharEditor(); agendarAutosave(); },
    'ed-capa-rm'() { ED.post.capa = null; desenharEditor(); agendarAutosave(); },
    'ed-previa'() { ED.previa = !ED.previa; desenharEditor(); window.scrollTo(0, 0); },
    'ed-rascunho'() { return salvarPostEd(true); },
    'ed-publicar'() { return salvarPostEd(false); },
    'ed-recuperar'() {
        const r = ED.recuperavel; ED.post = r.post; ED.segs = r.segs || {}; ED.tagsTxt = r.tagsTxt || ''; ED.recuperavel = null;
        if (!ED.post.meta) ED.post.meta = {}; desenharEditor(); toast('Cópia recuperada');
    },
    'ed-descartar'() { try { localStorage.removeItem(chaveRascunho()); } catch (e) { } ED.recuperavel = null; desenharEditor(); },
    'ff-avatar-rm'() { FF.avatar = ''; prevRetrato(); },
    async 'ff-salvar'() {
        const d = FF.dados;
        if (!(d.Nome || '').trim()) return toast('Informe ao menos o nome do personagem.', true);
        const nome = `${d.Nome || ''} ${d.Sobrenome || ''}`.trim();
        const botoes = $$('.barra-fixa .btn'); botoes.forEach(b => b.disabled = true);
        try {
            const c = await API.salvarPersonagem({ id: FF.id, nome, dados: d, avatar: FF.avatar, publico: FF.publico }, FF.novo);
            selar(); toast('Registro salvo'); location.hash = '#/registro/' + c.id;
        } catch (e) { botoes.forEach(b => b.disabled = false); throw e; }
    }
};

/* ---------- Eventos dos formulários ---------- */
document.addEventListener('input', ev => {
    const t = ev.target;
    if (t.closest('#ed-raiz')) {
        if (t.dataset.ed) {
            const k = t.dataset.ed;
            if (k === 'titulo') ED.post.titulo = t.value;
            else if (k === 'tags') ED.tagsTxt = t.value;
            else if (k === 'visibilidade') { ED.post.visibilidade = t.value; if (ev.type === 'input' && t.tagName === 'SELECT') desenharEditor(); }
            else if (k === 'status') ED.post.meta.status = t.value;
            else if (k.startsWith('m-')) metaInput(t);
        } else if (t.dataset.opc != null && t.dataset.b) {
            const b = ED.post.blocos.find(x => x.id === t.dataset.b); if (b && b.opcoes[+t.dataset.opc]) b.opcoes[+t.dataset.opc].texto = t.value;
        } else if (t.dataset.b && t.dataset.c) {
            const b = ED.post.blocos.find(x => x.id === t.dataset.b); if (!b) return;
            if (t.dataset.c === 'segconteudo') ED.segs[b.sid].conteudo = t.value; else b[t.dataset.c] = t.value;
            if (t.dataset.c === 'url' && b.tipo === 'video') { const d = t.closest('.campo').querySelector('.dica'); if (d) d.textContent = !t.value ? 'Cole o link do vídeo. Ele toca dentro do post.' : (videoEmbed(t.value) ? 'Link reconhecido, o vídeo vai tocar no post.' : 'Link não reconhecido: vai aparecer como um link simples.'); }
        } else return;
        agendarAutosave();
    } else if (t.closest('#ff-raiz') && t.dataset.ff) {
        const k = t.dataset.ff; FF.dados[k] = t.value;
        if (k === 'Classe') {
            const sub = $('#ff-Subclasse');
            if (!CLASSES[t.value] || !CLASSES[t.value].subs[FF.dados.Subclasse]) FF.dados.Subclasse = '';
            sub.innerHTML = opcoesFicha('subclasse', FF.dados.Subclasse);
        }
        feedbackFicha();
    }
});
document.addEventListener('change', async ev => {
    const t = ev.target;
    if (t.closest('#ed-raiz')) {
        if (t.dataset.ed === 'fixado') { ED.post.fixado = t.checked; agendarAutosave(); }
        else if (t.dataset.ed === 'visibilidade') { ED.post.visibilidade = t.value; desenharEditor(); agendarAutosave(); }
        else if (t.dataset.ed === 'm-categoria') { ED.post.meta.categoria = t.value; desenharEditor(); agendarAutosave(); }
        else if (t.dataset.mpart) { const s = new Set(ED.post.meta.participantes || []); t.checked ? s.add(t.dataset.mpart) : s.delete(t.dataset.mpart); ED.post.meta.participantes = [...s]; agendarAutosave(); }
        else if (t.dataset.para) {
            const s = new Set(ED.post.para || []); t.checked ? s.add(t.value) : s.delete(t.value); ED.post.para = [...s]; agendarAutosave();
        } else if (t.dataset.segPara) {
            const sg = ED.segs[t.dataset.segPara], s = new Set(sg.para || []); t.checked ? s.add(t.value) : s.delete(t.value); sg.para = [...s]; agendarAutosave();
        } else if (t.dataset.segRev) { ED.segs[t.dataset.segRev].revelado = t.checked; agendarAutosave(); }
        else if (t.dataset.arq && t.files && t.files.length) {
            const arqs = Array.from(t.files); t.value = '';
            toast(arqs.length > 1 ? 'Enviando imagens…' : 'Enviando imagem…');
            try {
                if (t.dataset.arq === 'capa') ED.post.capa = await API.enviarImagem(arqs[0], 1600);
                else {
                    const b = ED.post.blocos.find(x => x.id === t.dataset.b);
                    if (t.dataset.arq === 'img') b.url = await API.enviarImagem(arqs[0], 1600);
                    else { b.urls = b.urls || []; for (const f of arqs) b.urls.push(await API.enviarImagem(f, 1400)); }
                }
                desenharEditor(); agendarAutosave(); toast('Imagem pronta');
            } catch (e) { toast(e.message, true); }
        }
    } else if (t.closest('#ff-raiz')) {
        if (t.id === 'ff-publico') FF.publico = t.checked;
        else if (t.dataset.ffArq && t.files[0]) {
            toast('Processando retrato…');
            try { FF.avatar = await API.enviarImagem(t.files[0], 500); prevRetrato(); toast('Retrato pronto'); } catch (e) { toast(e.message, true); }
            t.value = '';
        }
    }
});
