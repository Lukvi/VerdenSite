/* ==========================================================
   CLAVE — A REDE · camada de dados
   Dois "motores" com a MESMA interface:
     • demo  → guarda tudo no navegador (localStorage). Serve para ver o site funcionando.
     • real  → usa o Supabase (login Discord, banco e imagens compartilhados).
   O motor é escolhido pelo config.js: se SUPABASE_URL estiver vazio, é demo.
   ========================================================== */
(function () {
    'use strict';

    const CFG = window.CLAVE_CONFIG || {};
    const REAL = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
    const agora = () => new Date().toISOString();
    const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

    /* ---------- Imagem: redimensiona antes de enviar ---------- */
    function redimensionar(arquivo, max, qualidade) {
        return new Promise((resolve, reject) => {
            if (!arquivo || !/^image\//.test(arquivo.type)) return reject(new Error('Escolha um arquivo de imagem.'));
            const url = URL.createObjectURL(arquivo);
            const img = new Image();
            img.onload = () => {
                let { width: w, height: h } = img;
                const f = Math.min(1, max / Math.max(w, h));
                w = Math.max(1, Math.round(w * f)); h = Math.max(1, Math.round(h * f));
                const c = document.createElement('canvas');
                c.width = w; c.height = h;
                const x = c.getContext('2d');
                x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
                x.drawImage(img, 0, 0, w, h);
                URL.revokeObjectURL(url);
                c.toBlob(b => b ? resolve(b) : reject(new Error('Não foi possível processar a imagem.')), 'image/jpeg', qualidade || 0.82);
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Imagem inválida.')); };
            img.src = url;
        });
    }
    const blobParaDataURL = b => new Promise((res, rej) => {
        const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b);
    });
    const dataURLparaBlob = d => {
        const [cab, b64] = d.split(',');
        const tipo = (cab.match(/:(.*?);/) || [])[1] || 'image/jpeg';
        const bin = atob(b64); const u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        return new Blob([u8], { type: tipo });
    };

    /* =====================================================
       MOTOR DEMO
       ===================================================== */
    const LS = 'verden_rede_demo_v3';

    function capaSVG(c1, c2, glifo) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<radialGradient id="v" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>
<rect width="1200" height="420" fill="url(#g)"/>
<g stroke="#fff" stroke-opacity=".06" stroke-width="2">${Array.from({ length: 22 }, (_, i) => `<line x1="${i * 60 - 200}" y1="0" x2="${i * 60 + 200}" y2="420"/>`).join('')}</g>
<circle cx="600" cy="210" r="150" fill="none" stroke="#e9dcbf" stroke-opacity=".35" stroke-width="3"/>
<circle cx="600" cy="210" r="128" fill="none" stroke="#e9dcbf" stroke-opacity=".2" stroke-width="1.5"/>
<text x="600" y="276" text-anchor="middle" font-size="190" fill="#e9dcbf" fill-opacity=".85" font-family="serif">${glifo}</text>
<rect width="1200" height="420" fill="url(#v)"/></svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function semear() {
        const t = n => new Date(Date.now() - n * 3600e3).toISOString();
        const U = {
            mestre: { id: 'u-mestre', nome: 'Valerius Voss', avatar: null, bio: 'Inquisidor-Chefe do Tribunal de Controle Arcano. Narra a campanha e guarda os segredos de Verden Af.', titulo: 'Mestre do Tribunal', papel: 'mestre', aprovado: true, criado: t(900) },
            cicero: { id: 'u-cicero', nome: 'Cícero', avatar: null, bio: 'Jogador. Acha que toda fechadura é um convite.', titulo: 'Registrando', papel: 'jogador', aprovado: true, criado: t(800) },
            liah: { id: 'u-liah', nome: 'Liah', avatar: null, bio: 'Jogadora. Anota tudo, inclusive o que não devia.', titulo: 'Registranda', papel: 'jogador', aprovado: true, criado: t(700) },
            novo: { id: 'u-novo', nome: 'Viajante Anônimo', avatar: null, bio: '', titulo: '', papel: 'jogador', aprovado: false, criado: t(2) }
        };
        const P = {
            cicero: { id: 'p-cicero', dono_id: U.cicero.id, nome: 'Cícero Vane', publico: true, criado: t(300), atualizado: t(300), avatar: null, dados: { Nome: 'Cícero', Sobrenome: 'Vane', Pronuncia: 'Sí-ce-ro', Idade: '34', Signo: 'Escorpião', Altura: '1.82m', Genero: 'Masculino', Raca: 'Humano', Olhos: 'Castanhos', Cabelo: 'Grisalho', Pele: 'Pálida', Marcas: 'Uma cicatriz fina cruza a sobrancelha esquerda.', Medos: 'Ficar preso em lugares sem saída.', Ambicoes: 'Descobrir quem vende registros falsos à Clave.', Gostos: 'Vinho barato, telhados à noite.', Desgostos: 'Inquisidores de bom humor.', Hobbies: 'Abrir fechaduras', Pericia1: 'Furtividade', Pericia2: 'Agilidade', Pericia3: 'Iniciativa', Classe: 'Ladino', Subclasse: 'Ladino Mercenário', Faccao: 'Nenhuma (ainda)', Titulo: 'Registrando', Apelido: 'Sombra de Aluguel', StatusInquisitorial: 'VIGIADO', InquisidorAssinatura: 'Cícero Vane', DataInquisitorial: '560 DGA' } },
            liah: { id: 'p-liah', dono_id: U.liah.id, nome: 'Liah McClair', publico: true, criado: t(250), atualizado: t(250), avatar: null, dados: { Nome: 'Liah', Sobrenome: 'McClair', Pronuncia: 'Lí-a', Idade: '212', Signo: 'Peixes', Altura: '1.40m', Genero: 'Feminino', Raca: 'Fada', Olhos: 'Violeta', Cabelo: 'Prateado', Pele: 'Luminosa', Marcas: 'Asas com bordas queimadas.', Medos: 'Ser catalogada como espécime.', Ambicoes: 'Provar que há magia que a Clave não entende.', Gostos: 'Chuva, livros proibidos.', Desgostos: 'Gaiolas de ferro.', Hobbies: 'Colecionar runas', Pericia1: 'Intuição', Pericia2: 'Percepção', Pericia3: 'Sensibilidade à Magia', Classe: 'Mago', Subclasse: 'Mago Arcano', Faccao: 'Academia do Norte', Titulo: 'Registranda', Apelido: 'Centelha', StatusInquisitorial: 'SUSPEITO', InquisidorAssinatura: 'Morana Cross', DataInquisitorial: '560 DGA' } }
        };
        const txt = t => ({ id: uid(), tipo: 'texto', texto: t });
        const posts = [
            { id: 'po-1', autor_id: U.mestre.id, tipo: 'decreto', titulo: 'Edito de Registro Obrigatório', capa: capaSVG('#5a1414', '#1a0808', '⚜'), tags: ['clave', 'regras'], visibilidade: 'todos', para: [], fixado: true, rascunho: false, meta: {}, criado: t(120), editado: null,
                blocos: [
                    txt('Por ordem do **Tribunal de Controle Arcano**, todo viajante que cruzar as fronteiras de Verden Af deve apresentar o seu *Registro Inquisitorial* antes da próxima lua cheia.\n\n- Registros incompletos serão devolvidos.\n- Registros falsos serão **expurgados**.\n- A Clave não pune a curiosidade, apenas a que se esconde.'),
                    { id: uid(), tipo: 'citacao', texto: 'Não deve existir magia fora da Clave.', autor: 'Lema do Tribunal' },
                    { id: uid(), tipo: 'divisor' },
                    txt('Crie o seu personagem na aba **Registros** e poste a ficha no Mural. O Mestre dará o carimbo.')
                ] },
            { id: 'po-2', autor_id: U.mestre.id, tipo: 'missao', titulo: 'O Sumiço na Biblioteca do Norte', capa: capaSVG('#1b3a4b', '#0b141a', '☾'), tags: ['missão', 'montainézz'], visibilidade: 'todos', para: [], fixado: false, rascunho: false, meta: { status: 'aberta' }, criado: t(60), editado: null,
                blocos: [
                    txt('Três volumes da **Biblioteca da Academia do Norte de Montainézz** desapareceram durante a noite. Os guardas juram que as portas não foram abertas.\n\nA Clave oferece recompensa a quem trouxer os livros, ou o culpado, intactos.'),
                    { id: uid(), tipo: 'documento', titulo: 'Aviso de recompensa', texto: 'Procura-se informação sobre o desaparecimento dos tomos de catalogação arcana. Discrição será paga em dobro.', assinatura: 'Valerius Voss', selo: 'Selado pela Clave' },
                    { id: uid(), tipo: 'segredo', sid: 's-demo-1', dica: 'Algo que só um olhar atento notaria' }
                ] },
            { id: 'po-3', autor_id: U.mestre.id, tipo: 'relato', titulo: 'Sessão 3 — A Noite dos Sinos', capa: capaSVG('#3b2a14', '#120c06', '✎'), tags: ['sessão', 'diário'], visibilidade: 'todos', para: [], fixado: false, rascunho: false, meta: { sessao: 3, data: new Date(Date.now() - 3 * 86400e3).toISOString().slice(0, 10), participantes: [U.mestre.id, U.cicero.id, U.liah.id], pendencias: ['Descobrir quem tocou os sinos fora de hora', 'Devolver os tomos desaparecidos à Biblioteca'] }, criado: t(30), editado: null,
                blocos: [
                    txt('Os sinos de [[Montainézz]] tocaram fora de hora e todo o grupo foi acordado pela guarda.\n\n## O que aconteceu\n- Cícero escapou por um telhado e foi visto, claro.\n- Liah sentiu uma **onda de magia** vinda da [[Academia do Norte|biblioteca]]. Ela suspeita do [[Sino de Cera]].\n- Ninguém ficou ferido. Dessa vez.'),
                    { id: uid(), tipo: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', legenda: 'Trilha que tocou durante a perseguição (exemplo de vídeo por link)' }
                ] },
            { id: 'po-4', autor_id: U.cicero.id, tipo: 'ficha', titulo: 'Registro de Cícero Vane', capa: null, tags: ['ficha', 'ladino'], visibilidade: 'todos', para: [], fixado: false, rascunho: false, meta: {}, criado: t(20), editado: null,
                blocos: [
                    txt('Cheguei a Montainézz com pouco dinheiro e menos escrúpulos. Aqui está o meu registro, como exigido. Não me perguntem o que tem *nas entrelinhas*.'),
                    { id: uid(), tipo: 'ficha', personagem_id: P.cicero.id }
                ] },
            { id: 'po-5', autor_id: U.liah.id, tipo: 'sistema', titulo: 'Sinergia de perícias: como calcular', capa: capaSVG('#2a2a4a', '#0d0d1a', '⚙'), tags: ['sistema', 'regra'], visibilidade: 'todos', para: [], fixado: false, rascunho: false, meta: { versao: '1.0', situacao: 'oficial' }, criado: t(10), editado: null,
                blocos: [
                    txt('Resumo para quem está começando: se **duas ou mais perícias** do personagem usam a mesma Habilidade-Chave, o resultado final da rolagem ganha **+2**.\n\n> Exemplo: Furtividade, Agilidade e Iniciativa dependem de Destreza.')
                ] },
            { id: 'po-6', autor_id: U.mestre.id, tipo: 'lore', titulo: 'Segredos do Tribunal', capa: null, tags: ['segredo'], visibilidade: 'mestre', para: [], fixado: false, rascunho: false, meta: {}, criado: t(5), editado: null,
                blocos: [txt('Este post só o Mestre vê. Jogadores não recebem nem o título.')] }
        ];
        const segredos = [{ id: 's-demo-1', post_id: 'po-2', conteudo: 'Há **pegadas de cera** no parapeito da janela mais alta, e a janela está trancada por dentro.', para: [U.liah.id], revelado: false }];
        const comentarios = [
            { id: uid(), post_id: 'po-1', autor_id: U.cicero.id, pai_id: null, texto: 'Registro entregue. Podem parar de me olhar assim.', criado: t(100) },
            { id: uid(), post_id: 'po-1', autor_id: U.mestre.id, pai_id: null, texto: 'Ninguém está olhando, Cícero. O Tribunal apenas **vê**.', criado: t(98) },
            { id: uid(), post_id: 'po-3', autor_id: U.liah.id, pai_id: null, texto: 'Aquela magia não era da Clave. Eu juro.', criado: t(25) }
        ];
        const reacoes = [
            { post_id: 'po-1', user_id: U.cicero.id, selo: 'selado' }, { post_id: 'po-1', user_id: U.liah.id, selo: 'selado' },
            { post_id: 'po-3', user_id: U.cicero.id, selo: 'epico' }, { post_id: 'po-3', user_id: U.liah.id, selo: 'sombrio' },
            { post_id: 'po-4', user_id: U.mestre.id, selo: 'belo' }
        ];
        U.mestre.banner = capaSVG('#3b1a1a', '#0e0807', '⚔');
        U.cicero.banner = capaSVG('#1b3a4b', '#0b141a', '☾');
        U.liah.banner = capaSVG('#2a2a4a', '#0d0d1a', '✦');
        posts.push({ id: 'po-7', autor_id: U.mestre.id, tipo: 'enquete', titulo: 'Qual o melhor dia para a próxima sessão?', capa: null, tags: ['sessão', 'enquete'], visibilidade: 'todos', para: [], fixado: false, rascunho: false, meta: {}, criado: t(3), editado: null,
            blocos: [txt('Vote para fecharmos a data. Quem não puder, comente.'),
                { id: 'bl-enq-1', tipo: 'enquete', pergunta: 'Dia da sessão', opcoes: [{ id: 'o1', texto: 'Sexta à noite' }, { id: 'o2', texto: 'Sábado à tarde' }, { id: 'o3', texto: 'Domingo à noite' }] }] });
        const ve = (id, titulo, categoria, resumo, campos, capa, texto, autor, h) => ({ id, autor_id: autor, tipo: 'verbete', titulo, capa, tags: ['verbete', categoria], visibilidade: 'todos', para: [], fixado: false, rascunho: false, meta: { categoria, resumo, campos }, criado: t(h), editado: null, blocos: [txt(texto)] });
        posts.push(
            ve('ve-1', 'Montainézz', 'local', 'Cidade universitária do norte, sede da Academia e dos sinos que nunca param.', { 'Região': 'Norte', 'Governante': 'Conselho da Academia', 'População': 'Cerca de 40 mil', 'Clima': 'Frio e úmido' }, capaSVG('#1b3a4b', '#0b141a', '⌂'),
                'Montainézz cresceu em volta da [[Academia do Norte]] e vive de livros, de estudantes e de segredos. A [[Clave]] mantém um posto de vigilância na praça central.\n\n## Curiosidades\n- Os sinos tocam a cada hora, menos na noite de Lua Nova.\n- A [[Madre Ilvane]] diz ter visto o [[Sino de Cera]] ali.', U.mestre.id, 50),
            ve('ve-2', 'Academia do Norte', 'faccao', 'Escola de magia e catalogação arcana de Montainézz.', { 'Líder': 'Madre Ilvane', 'Sede': 'Montainézz', 'Objetivo': 'Estudar e catalogar a magia' }, capaSVG('#2a2a4a', '#0d0d1a', '⚑'),
                'Fundada para guardar o saber arcano, a Academia tem a maior biblioteca de [[Montainézz]]. Mantém uma relação tensa com a [[Clave]].', U.liah.id, 45),
            ve('ve-3', 'Madre Ilvane', 'npc', 'Diretora da Academia, guardiã dos tomos de catalogação.', { 'Raça': 'Humana', 'Idade': '71', 'Afiliação': 'Academia do Norte', 'Ocupação': 'Diretora', 'Situação': 'Viva' }, null,
                'Ilvane dirige a [[Academia do Norte]] há três décadas. Não gosta de inquisidores, mas respeita quem lê.', U.mestre.id, 40),
            ve('ve-4', 'Clave', 'faccao', 'Organização que registra e controla toda magia em Verden Af.', { 'Líder': 'Valerius Voss', 'Sede': 'Tribunal de Controle Arcano', 'Objetivo': 'Nenhuma magia fora da Clave' }, capaSVG('#5a1414', '#1a0808', '⚜'),
                'A Clave exige o Registro Inquisitorial de todo viajante. Vê a [[Academia do Norte]] como aliada e como risco.', U.mestre.id, 38),
            ve('ve-5', 'Sino de Cera', 'item', 'Sino sem badalo que, dizem, toca sozinho perto de magia proibida.', { 'Tipo': 'Artefato', 'Raridade': 'Único', 'Origem': 'Desconhecida', 'Portador atual': 'Ninguém sabe' }, null,
                'Há pegadas de cera onde ele aparece. A [[Madre Ilvane]] nega que exista.', U.liah.id, 12)
        );
        posts.push({ id: 'po-8', autor_id: U.mestre.id, tipo: 'relato', titulo: 'Sessão 2 — Chegada a Montainézz', capa: null, tags: ['sessão'], visibilidade: 'todos', para: [], fixado: false, rascunho: false,
            meta: { sessao: 2, data: new Date(Date.now() - 10 * 86400e3).toISOString().slice(0, 10), participantes: [U.mestre.id, U.cicero.id, U.liah.id], pendencias: ['Registrar-se no posto da Clave'] }, criado: t(70), editado: null,
            blocos: [txt('O grupo chegou a [[Montainézz]] sob chuva e foi parado pela [[Clave]] na entrada. Cícero ficou nervoso, Liah ficou curiosa.')] });
        const hoje = new Date();
        const dia = n => { const x = new Date(hoje); x.setDate(x.getDate() - n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
        return {
            users: Object.values(U), posts, segredos, comentarios, reacoes, personagens: Object.values(P), sessao: null,
            follows: [{ follower_id: U.cicero.id, followed_id: U.mestre.id }, { follower_id: U.liah.id, followed_id: U.mestre.id }, { follower_id: U.liah.id, followed_id: U.cicero.id }, { follower_id: U.mestre.id, followed_id: U.liah.id }],
            notificacoes: [
                { id: uid(), user_id: U.mestre.id, de_id: U.cicero.id, tipo: 'comentario', post_id: 'po-1', texto: 'comentou no seu post', lida: false, criado: t(100) },
                { id: uid(), user_id: U.mestre.id, de_id: U.liah.id, tipo: 'seguiu', post_id: null, texto: 'começou a seguir você', lida: false, criado: t(50) }
            ],
            recados: [{ id: uid(), perfil_id: U.mestre.id, autor_id: U.cicero.id, texto: 'Mestre, a sessão passada foi incrível!', criado: t(40) },
                { id: uid(), perfil_id: U.liah.id, autor_id: U.mestre.id, texto: 'Boa pesquisa na biblioteca, Liah.', criado: t(20) }],
            salvos: [], votos: [{ post_id: 'po-7', bloco_id: 'bl-enq-1', user_id: U.cicero.id, opcao: 'o1' }, { post_id: 'po-7', bloco_id: 'bl-enq-1', user_id: U.liah.id, opcao: 'o1' }],
            checkins: [{ user_id: U.mestre.id, dia: dia(0) }, { user_id: U.mestre.id, dia: dia(1) }, { user_id: U.mestre.id, dia: dia(2) }, { user_id: U.liah.id, dia: dia(1) }, { user_id: U.cicero.id, dia: dia(3) }]
        };
    }

    function lerDB() {
        try {
            const d = JSON.parse(localStorage.getItem(LS));
            if (d && d.users) { ['follows', 'notificacoes', 'recados', 'salvos', 'votos', 'checkins'].forEach(k => { if (!d[k]) d[k] = []; }); return d; }
        } catch (e) { }
        const d = semear(); gravarDB(d); return d;
    }
    function gravarDB(d) {
        try { localStorage.setItem(LS, JSON.stringify(d)); }
        catch (e) { throw new Error('O navegador ficou sem espaço (modo demonstração). Use imagens menores ou reinicie a demonstração.'); }
    }

    const Demo = {
        modo: 'demo',
        async init() {
            const d = lerDB();
            const me = d.users.find(u => u.id === d.sessao) || null;
            return { modo: 'demo', me, usuariosDemo: d.users };
        },
        async entrar(id) { const d = lerDB(); d.sessao = id; gravarDB(d); return d.users.find(u => u.id === id); },
        async sair() { const d = lerDB(); d.sessao = null; gravarDB(d); },
        reiniciar() { localStorage.removeItem(LS); },
        _me(d) { return d.users.find(u => u.id === d.sessao); },
        _vePost(p, me) {
            if (!me || !me.aprovado) return false;
            if (p.rascunho && p.autor_id !== me.id) return false;
            return p.visibilidade === 'todos' || p.autor_id === me.id || me.papel === 'mestre' || (p.para || []).includes(me.id);
        },
        async perfis() { return lerDB().users; },
        async atualizarPerfil(patch) {
            const d = lerDB(); const me = this._me(d); Object.assign(me, patch); gravarDB(d); return me;
        },
        async gerenciarMembro(id, patch) {
            const d = lerDB(); const me = this._me(d);
            if (me.papel !== 'mestre') throw new Error('Só o Mestre pode fazer isso.');
            Object.assign(d.users.find(u => u.id === id), patch); gravarDB(d);
        },
        async posts() {
            const d = lerDB(); const me = this._me(d);
            return d.posts.filter(p => this._vePost(p, me))
                .sort((a, b) => (b.fixado - a.fixado) || (b.criado.localeCompare(a.criado)));
        },
        async post(id) {
            const d = lerDB(); const p = d.posts.find(x => x.id === id);
            return p && this._vePost(p, this._me(d)) ? p : null;
        },
        async salvarPost(p, segs, novo) {
            const d = lerDB(); const me = this._me(d);
            if (['decreto', 'missao'].includes(p.tipo) && me.papel !== 'mestre') throw new Error('Só o Mestre publica este tipo de post.');
            if (p.fixado && me.papel !== 'mestre') p.fixado = false;
            if (novo) { p.id = p.id || uid(); p.autor_id = me.id; p.criado = agora(); p.editado = null; d.posts.push(p); }
            else {
                const i = d.posts.findIndex(x => x.id === p.id);
                if (i < 0) throw new Error('Post não encontrado.');
                if (d.posts[i].autor_id !== me.id && me.papel !== 'mestre') throw new Error('Sem permissão.');
                p.autor_id = d.posts[i].autor_id; p.criado = d.posts[i].criado; p.editado = agora(); d.posts[i] = p;
            }
            const ids = new Set(segs.map(s => s.id));
            d.segredos = d.segredos.filter(s => s.post_id !== p.id || ids.has(s.id));
            segs.forEach(s => {
                const i = d.segredos.findIndex(x => x.id === s.id);
                const linha = { id: s.id, post_id: p.id, conteudo: s.conteudo, para: s.para || [], revelado: !!s.revelado };
                if (i >= 0) d.segredos[i] = linha; else d.segredos.push(linha);
            });
            gravarDB(d); return p;
        },
        async apagarPost(id) {
            const d = lerDB();
            d.posts = d.posts.filter(p => p.id !== id);
            d.segredos = d.segredos.filter(s => s.post_id !== id);
            d.comentarios = d.comentarios.filter(c => c.post_id !== id);
            d.reacoes = d.reacoes.filter(r => r.post_id !== id);
            d.votos = d.votos.filter(v => v.post_id !== id);
            d.salvos = d.salvos.filter(s => s.post_id !== id);
            d.notificacoes = d.notificacoes.filter(n => n.post_id !== id);
            gravarDB(d);
        },
        async fixar(id, valor) {
            const d = lerDB(); const p = d.posts.find(x => x.id === id); p.fixado = !!valor; gravarDB(d);
        },
        async segredos(postId) {
            const d = lerDB(); const me = this._me(d); const p = d.posts.find(x => x.id === postId);
            return d.segredos.filter(s => s.post_id === postId &&
                (s.revelado || (s.para || []).includes(me.id) || me.papel === 'mestre' || (p && p.autor_id === me.id)));
        },
        async revelarSegredo(id, valor) {
            const d = lerDB(); const s = d.segredos.find(x => x.id === id); s.revelado = !!valor; gravarDB(d);
        },
        async comentarios(postId) {
            return lerDB().comentarios.filter(c => c.post_id === postId).sort((a, b) => a.criado.localeCompare(b.criado));
        },
        async todosComentarios() { return lerDB().comentarios; },
        async comentar(postId, texto, paiId) {
            const d = lerDB(); const me = this._me(d);
            const c = { id: uid(), post_id: postId, autor_id: me.id, pai_id: paiId || null, texto, criado: agora() };
            d.comentarios.push(c); gravarDB(d); return c;
        },
        async apagarComentario(id) {
            const d = lerDB();
            const filhos = d.comentarios.filter(c => c.pai_id === id).map(c => c.id);
            d.comentarios = d.comentarios.filter(c => c.id !== id && !filhos.includes(c.id)); gravarDB(d);
        },
        async reacoes() { return lerDB().reacoes; },
        async alternarReacao(postId, selo) {
            const d = lerDB(); const me = this._me(d);
            const i = d.reacoes.findIndex(r => r.post_id === postId && r.user_id === me.id && r.selo === selo);
            if (i >= 0) d.reacoes.splice(i, 1); else d.reacoes.push({ post_id: postId, user_id: me.id, selo });
            gravarDB(d);
        },
        async personagens() {
            const d = lerDB(); const me = this._me(d);
            return d.personagens.filter(p => p.publico || p.dono_id === me.id || me.papel === 'mestre')
                .sort((a, b) => (b.atualizado || b.criado).localeCompare(a.atualizado || a.criado));
        },
        async personagem(id) { return (await this.personagens()).find(p => p.id === id) || null; },
        async salvarPersonagem(p, novo) {
            const d = lerDB(); const me = this._me(d);
            if (novo) { p.id = p.id || uid(); p.dono_id = me.id; p.criado = agora(); p.atualizado = agora(); d.personagens.push(p); }
            else {
                const i = d.personagens.findIndex(x => x.id === p.id);
                const o = d.personagens[i];
                if (o.dono_id !== me.id && me.papel !== 'mestre') throw new Error('Sem permissão.');
                p.dono_id = o.dono_id; p.criado = o.criado; p.atualizado = agora(); d.personagens[i] = p;
            }
            gravarDB(d); return p;
        },
        async apagarPersonagem(id) { const d = lerDB(); d.personagens = d.personagens.filter(p => p.id !== id); gravarDB(d); },
        async seguidores() { return lerDB().follows; },
        async alternarSeguir(id) {
            const d = lerDB(); const me = this._me(d);
            const i = d.follows.findIndex(f => f.follower_id === me.id && f.followed_id === id);
            if (i >= 0) d.follows.splice(i, 1); else d.follows.push({ follower_id: me.id, followed_id: id });
            gravarDB(d); return i < 0;
        },
        async notificacoes() {
            const d = lerDB(); const me = this._me(d);
            return d.notificacoes.filter(n => n.user_id === me.id).sort((a, b) => b.criado.localeCompare(a.criado));
        },
        async notificar(n) {
            const d = lerDB(); const me = this._me(d);
            if (!n.user_id || n.user_id === me.id) return;
            d.notificacoes.push({ id: uid(), user_id: n.user_id, de_id: me.id, tipo: n.tipo, post_id: n.post_id || null, texto: n.texto || '', lida: false, criado: agora() });
            gravarDB(d);
        },
        async marcarLidas() {
            const d = lerDB(); const me = this._me(d);
            d.notificacoes.forEach(n => { if (n.user_id === me.id) n.lida = true; }); gravarDB(d);
        },
        async recados(perfilId) { return lerDB().recados.filter(r => r.perfil_id === perfilId).sort((a, b) => b.criado.localeCompare(a.criado)); },
        async enviarRecado(perfilId, texto) {
            const d = lerDB(); const me = this._me(d);
            d.recados.push({ id: uid(), perfil_id: perfilId, autor_id: me.id, texto, criado: agora() }); gravarDB(d);
        },
        async apagarRecado(id) { const d = lerDB(); d.recados = d.recados.filter(r => r.id !== id); gravarDB(d); },
        async salvos() { const d = lerDB(); const me = this._me(d); return d.salvos.filter(s => s.user_id === me.id).map(s => s.post_id); },
        async alternarSalvo(postId) {
            const d = lerDB(); const me = this._me(d);
            const i = d.salvos.findIndex(s => s.user_id === me.id && s.post_id === postId);
            if (i >= 0) d.salvos.splice(i, 1); else d.salvos.push({ user_id: me.id, post_id: postId, criado: agora() });
            gravarDB(d); return i < 0;
        },
        async votos(postId) { return lerDB().votos.filter(v => v.post_id === postId); },
        async votar(postId, blocoId, opcao) {
            const d = lerDB(); const me = this._me(d);
            if (d.votos.some(v => v.post_id === postId && v.bloco_id === blocoId && v.user_id === me.id)) throw new Error('Você já votou nesta enquete.');
            d.votos.push({ post_id: postId, bloco_id: blocoId, user_id: me.id, opcao }); gravarDB(d);
        },
        async checkins() { return lerDB().checkins; },
        async fazerCheckin(dia) {
            const d = lerDB(); const me = this._me(d);
            if (!d.checkins.some(c => c.user_id === me.id && c.dia === dia)) d.checkins.push({ user_id: me.id, dia }); gravarDB(d);
        },
        async enviarImagem(arquivo, max) {
            const b = await redimensionar(arquivo, max || 1400, 0.8);
            return blobParaDataURL(b);
        }
    };

    /* =====================================================
       MOTOR REAL (Supabase)
       ===================================================== */
    const Real = {
        modo: 'real', sb: null, _me: null,
        async _carregarLib() {
            if (window.supabase) return;
            await new Promise((ok, falha) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.3';
                s.onload = ok; s.onerror = () => falha(new Error('Não foi possível carregar o Supabase. Verifique a internet.'));
                document.head.appendChild(s);
            });
        },
        _ok(r) { if (r.error) throw new Error(traduzir(r.error)); return r.data; },
        async init() {
            await this._carregarLib();
            this.sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
                auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true }
            });
            const { data } = await this.sb.auth.getSession();
            if (new URLSearchParams(location.search).has('code') || location.search.includes('error')) {
                history.replaceState(null, '', location.pathname + location.hash);
            }
            if (!data.session) return { modo: 'real', me: null };
            this._me = await this._buscarPerfil(data.session.user.id);
            return { modo: 'real', me: this._me };
        },
        async _buscarPerfil(id) {
            let ultimoErro = null;
            for (let i = 0; i < 6; i++) {
                const { data, error } = await this.sb.from('profiles').select('*').eq('id', id).maybeSingle();
                if (data) return data;
                ultimoErro = error;
                if (error) break;
                await new Promise(r => setTimeout(r, 500));
            }
            if (ultimoErro) throw new Error('Não consegui ler o seu perfil: ' + (ultimoErro.message || ultimoErro.code) + ' (código ' + (ultimoErro.code || '?') + ').');
            throw new Error('Seu perfil ainda não foi criado. Confira se o arquivo supabase.sql foi executado por inteiro.');
        },
        async entrar() {
            const { error } = await this.sb.auth.signInWithOAuth({
                provider: 'discord',
                options: { redirectTo: location.origin + location.pathname, scopes: 'identify' }
            });
            if (error) throw new Error(traduzir(error));
        },
        async sair() { await this.sb.auth.signOut(); this._me = null; },
        async perfis() { return this._ok(await this.sb.from('profiles').select('*').order('criado')); },
        async atualizarPerfil(patch) {
            const r = await this.sb.from('profiles').update(patch).eq('id', this._me.id).select().single();
            this._me = this._ok(r); return this._me;
        },
        async gerenciarMembro(id, patch) { this._ok(await this.sb.from('profiles').update(patch).eq('id', id)); },
        async posts() {
            return this._ok(await this.sb.from('posts').select('*').order('fixado', { ascending: false })
                .order('criado', { ascending: false }).limit(300));
        },
        async post(id) { return this._ok(await this.sb.from('posts').select('*').eq('id', id).maybeSingle()); },
        async salvarPost(p, segs, novo) {
            const linha = {
                tipo: p.tipo, titulo: p.titulo, capa: p.capa || null, tags: p.tags || [],
                visibilidade: p.visibilidade, para: p.para || [], blocos: p.blocos, meta: p.meta || {},
                fixado: !!p.fixado, rascunho: !!p.rascunho
            };
            let id = p.id;
            if (novo) {
                id = id || uid();
                this._ok(await this.sb.from('posts').insert(Object.assign({ id, autor_id: this._me.id }, linha)));
            } else {
                this._ok(await this.sb.from('posts').update(Object.assign({ editado: agora() }, linha)).eq('id', id));
            }
            const atuais = this._ok(await this.sb.from('segredos').select('id').eq('post_id', id)).map(s => s.id);
            const manter = new Set(segs.map(s => s.id));
            const apagar = atuais.filter(x => !manter.has(x));
            if (apagar.length) this._ok(await this.sb.from('segredos').delete().in('id', apagar));
            for (const s of segs) {
                const l = { post_id: id, conteudo: s.conteudo, para: s.para || [], revelado: !!s.revelado };
                if (atuais.includes(s.id)) this._ok(await this.sb.from('segredos').update(l).eq('id', s.id));
                else this._ok(await this.sb.from('segredos').insert(Object.assign({ id: s.id }, l)));
            }
            return Object.assign({}, p, { id });
        },
        async apagarPost(id) { this._ok(await this.sb.from('posts').delete().eq('id', id)); },
        async fixar(id, v) { this._ok(await this.sb.from('posts').update({ fixado: !!v }).eq('id', id)); },
        async segredos(postId) { return this._ok(await this.sb.from('segredos').select('*').eq('post_id', postId)); },
        async revelarSegredo(id, v) { this._ok(await this.sb.from('segredos').update({ revelado: !!v }).eq('id', id)); },
        async comentarios(postId) {
            return this._ok(await this.sb.from('comentarios').select('*').eq('post_id', postId).order('criado'));
        },
        async todosComentarios() { return this._ok(await this.sb.from('comentarios').select('id,post_id,autor_id')); },
        async comentar(postId, texto, paiId) {
            return this._ok(await this.sb.from('comentarios')
                .insert({ post_id: postId, autor_id: this._me.id, texto, pai_id: paiId || null }).select().single());
        },
        async apagarComentario(id) { this._ok(await this.sb.from('comentarios').delete().eq('id', id)); },
        async reacoes() { return this._ok(await this.sb.from('reacoes').select('*')); },
        async alternarReacao(postId, selo) {
            const q = { post_id: postId, user_id: this._me.id, selo };
            const { data } = await this.sb.from('reacoes').select('post_id').match(q);
            if (data && data.length) this._ok(await this.sb.from('reacoes').delete().match(q));
            else this._ok(await this.sb.from('reacoes').insert(q));
        },
        async personagens() {
            return this._ok(await this.sb.from('personagens').select('*').order('criado', { ascending: false }));
        },
        async personagem(id) { return this._ok(await this.sb.from('personagens').select('*').eq('id', id).maybeSingle()); },
        async salvarPersonagem(p, novo) {
            if (p.avatar && p.avatar.startsWith('data:')) p.avatar = await this._enviarBlob(dataURLparaBlob(p.avatar));
            const linha = { nome: p.nome, dados: p.dados, avatar: p.avatar || null, publico: !!p.publico };
            if (novo) {
                const id = p.id || uid();
                this._ok(await this.sb.from('personagens').insert(Object.assign({ id, dono_id: this._me.id }, linha)));
                return Object.assign({}, p, { id });
            }
            this._ok(await this.sb.from('personagens').update(Object.assign({ atualizado: agora() }, linha)).eq('id', p.id));
            return p;
        },
        async apagarPersonagem(id) { this._ok(await this.sb.from('personagens').delete().eq('id', id)); },
        async seguidores() { return this._ok(await this.sb.from('follows').select('follower_id,followed_id')); },
        async alternarSeguir(id) {
            const q = { follower_id: this._me.id, followed_id: id };
            const { data } = await this.sb.from('follows').select('followed_id').match(q);
            if (data && data.length) { this._ok(await this.sb.from('follows').delete().match(q)); return false; }
            this._ok(await this.sb.from('follows').insert(q)); return true;
        },
        async notificacoes() {
            return this._ok(await this.sb.from('notificacoes').select('*').eq('user_id', this._me.id).order('criado', { ascending: false }).limit(80));
        },
        async notificar(n) {
            if (!n.user_id || n.user_id === this._me.id) return;
            try { await this.sb.from('notificacoes').insert({ user_id: n.user_id, de_id: this._me.id, tipo: n.tipo, post_id: n.post_id || null, texto: n.texto || '' }); } catch (e) { }
        },
        async marcarLidas() { this._ok(await this.sb.from('notificacoes').update({ lida: true }).eq('user_id', this._me.id).eq('lida', false)); },
        async recados(perfilId) { return this._ok(await this.sb.from('recados').select('*').eq('perfil_id', perfilId).order('criado', { ascending: false }).limit(100)); },
        async enviarRecado(perfilId, texto) { this._ok(await this.sb.from('recados').insert({ perfil_id: perfilId, autor_id: this._me.id, texto })); },
        async apagarRecado(id) { this._ok(await this.sb.from('recados').delete().eq('id', id)); },
        async salvos() { return this._ok(await this.sb.from('salvos').select('post_id').eq('user_id', this._me.id)).map(s => s.post_id); },
        async alternarSalvo(postId) {
            const q = { user_id: this._me.id, post_id: postId };
            const { data } = await this.sb.from('salvos').select('post_id').match(q);
            if (data && data.length) { this._ok(await this.sb.from('salvos').delete().match(q)); return false; }
            this._ok(await this.sb.from('salvos').insert(q)); return true;
        },
        async votos(postId) { return this._ok(await this.sb.from('votos').select('*').eq('post_id', postId)); },
        async votar(postId, blocoId, opcao) {
            const r = await this.sb.from('votos').insert({ post_id: postId, bloco_id: blocoId, user_id: this._me.id, opcao });
            if (r.error) throw new Error(/duplicate|unique/i.test(r.error.message) ? 'Você já votou nesta enquete.' : traduzir(r.error));
        },
        async checkins() { return this._ok(await this.sb.from('checkins').select('user_id,dia')); },
        async fazerCheckin(dia) {
            const r = await this.sb.from('checkins').insert({ user_id: this._me.id, dia });
            if (r.error && !/duplicate|unique/i.test(r.error.message)) throw new Error(traduzir(r.error));
        },
        async _enviarBlob(blob) {
            const caminho = `${this._me.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
            this._ok(await this.sb.storage.from('midia').upload(caminho, blob, { contentType: 'image/jpeg', cacheControl: '31536000' }));
            return this.sb.storage.from('midia').getPublicUrl(caminho).data.publicUrl;
        },
        async enviarImagem(arquivo, max) {
            const b = await redimensionar(arquivo, max || 1400, 0.82);
            return this._enviarBlob(b);
        }
    };

    function traduzir(e) {
        const m = (e && e.message) || String(e);
        if (/row-level security|violates row-level/i.test(m)) return 'Você não tem permissão para fazer isso.';
        if (/JWT|expired/i.test(m)) return 'Sua sessão expirou. Entre de novo.';
        if (/Failed to fetch|NetworkError/i.test(m)) return 'Sem conexão com o servidor. Verifique a internet.';
        if (/Bucket not found/i.test(m)) return 'O armazenamento de imagens não foi criado. Rode o supabase.sql de novo.';
        return m;
    }

    window.API = REAL ? Real : Demo;
    window.API.redimensionar = redimensionar;
    window.API.uid = uid;
})();
