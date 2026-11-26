/* ==========================================================
   DADOS DO TOMO — Enciclopédia das Raças e Classes
   Biblioteca da Academia do Norte de Montainézz
   Edite aqui para alterar raças, classes e habilidades.
   Habilidades usam o formato "Nome|Descrição".
   ========================================================== */

const SIGNOS = ["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];

const PERICIAS = {
    "Agilidade": "Destreza",
    "Lábia": "Carisma",
    "Intuição": "Sabedoria",
    "Intimidação": "Carisma",
    "Iniciativa": "Destreza",
    "Disfarce": "Carisma",
    "Sensibilidade à Magia": "Sabedoria",
    "Furtividade": "Destreza",
    "Percepção": "Sabedoria",
    "Sobrevivência": "Destreza",
    "Observação": "Carisma",
    "Raciocínio Rápido": "Sabedoria"
};

const INQUISIDORES = [
    "Valerius Voss", "Cícero Vane", "Thaddeus Thorne", "Morana Cross",
    "Alistair Vance", "Hecate Sterling", "Liah McClair", "Vespera Nyx",
    "Thoren Kael", "Canaaris Thtfoon", "Efraim Blackwood", "Kaelen Vost"
];

const STATUS = {
    VIGIADO:      { rotulo: "Sob Vigilância",           cor: "#1b4d3e", rot: "-3deg" },
    CLASSIFICADO: { rotulo: "Classificado / Aprovado",  cor: "#1c3b7a", rot: "-5deg" },
    SUSPEITO:     { rotulo: "Sob Suspeita de Heresia",  cor: "#85581A", rot: "-2deg" },
    EXPURGADO:    { rotulo: "Expurgado / Condenado",    cor: "#7a1c1c", rot: "-6deg" }
};

/* ---------------------------- RAÇAS ---------------------------- */

const RACAS = {
    "Humano": {
        atributos: "A raça humana, apesar de jovem, se destaca pela adaptabilidade. São habilidosos tanto na forja quanto nas artes arcanas, e sua coragem ergueu impérios. Em uma era marcada por conflitos, buscam reconstruir sua glória e guiar o mundo rumo a um novo destino.",
        desvantagens: "Fracos contra magias, doenças e pragas, se cansam rápido e precisam se alimentar muito.",
        racial: "Ótimos construtores e velejadores."
    },
    "Elfo Noturno": {
        atributos: "Esses seres altos e impressionantes são aqueles cuja proteção da natureza é seu foco, são ótimos com poções e herbologia, além de saberem muito sobre animais e criaturas da floresta, são uma raça muito superior que vive nas florestas do leste e oeste, tem grande capacidade para usar encantamentos e habilidades curativas.",
        desvantagens: "Por conterem delicadeza com a natureza os mesmos são extremamente naturalistas, sempre com vestes mais simples e a cor de suas peles é colorida e chamativa atraindo mais perigo para os mesmos.",
        racial: "Cura em massa."
    },
    "Elfo Cinzento": {
        atributos: "Descendentes dos Elfos Noturnos, foram corrompidos pela \"Matéria Escura\". Vivem reclusos nas montanhas, longe da luz do dia, dominando magias obscuras e o controle de seres nefastos.",
        desvantagens: "Vulneráveis à luz solar; se alimentam de sangue; sua pele fere com facilidade ao contato com luz intensa.",
        racial: "Vampirismo."
    },
    "Nørder": {
        atributos: "Crianças misteriosas com partes robóticas, dizem vir do futuro. Vivem entre goblins, ensinando novas tecnologias. São brincalhões, engenhosos e incrivelmente rápidos.",
        desvantagens: "Ingênuos, imprevisíveis e fisicamente frágeis.",
        racial: "Inteligência elevada e viagem no tempo (até 5 minutos no passado, 1x por semana)."
    },
    "Centauro": {
        atributos: "Metade humanos, metade cavalos, são rápidos, fortes e amantes de desafios. Costumam viver em tribos que valorizam o esporte, a honra e a tradição.",
        desvantagens: "Corpo grande limita mobilidade em locais fechados; são competitivos ao extremo.",
        racial: "Velocidade e resistência em combate."
    },
    "Gedemand": {
        atributos: "Chifrudos e ligados à natureza, podem se transformar em dragões. Escondidos por eras, agora retornam ao mundo com sabedoria e poder ancestral.",
        desvantagens: "Chifres dificultam locomoção; visão limitada; em forma dracônica, atraem ataques.",
        racial: "Transformação em dragão 1x/semana; lança gelo/fogo; ignora obstáculos."
    },
    "Sereia": {
        atributos: "Velozes nas águas, vivem em mares, rios e lagos. Algumas protegem os oceanos, outras devoram intrusos com magia negra. Seus cantos são irresistíveis.",
        desvantagens: "Só podem andar por 5h/dia; fome constante; não usam armas.",
        racial: "Canto hipnótico e nado veloz (reduz tempo de travessia)."
    },
    "Fada": {
        atributos: "Seres que alternam entre forma pequena e tamanho humano. Dominam magia desde o nascimento e podem voar, embora por pouco tempo.",
        desvantagens: "Extremamente frágeis em forma humana; ofendem-se com facilidade.",
        racial: "Voo de até 150 km/h por 5 min; mudança de tamanho."
    },
    "Tauren": {
        atributos: "Com cabeça de touro e corpo robusto, vivem nas montanhas preservando a natureza. São pacíficos, mas poderosos em combate corpo a corpo.",
        desvantagens: "Visão limitada; dano causa cegueira momentânea.",
        racial: "Ataques com a cabeça/chifres."
    },
    "Aerkeengel": {
        atributos: "Anjos caídos da guerra celestial. Representam a dualidade, podendo se tornar em versões sombrias e violentas de si mesmos ao perderem o controle.",
        desvantagens: "Quando perdem o controle viram ameaça até para aliados.",
        racial: "Modo Luz: Ressurreição em massa 1x/dia. Modo Sombrio: Paralisa o inimigo com seus medos por 5 min."
    },
    "Troll": {
        atributos: "Vivem em florestas do sul, seguindo deuses esquecidos. Dominam rituais antigos, xamanismo e vivem em harmonia com animais e espíritos.",
        desvantagens: "Instáveis, isolados e praticam canibalismo ritualístico.",
        racial: "Transe espiritual (corpo fica invulnerável por 5 min)."
    },
    "Anão": {
        atributos: "Vivem nas florestas e se destacam por sua precisão na caça e talento para o comércio. Não são sociáveis, mas sua presença é indispensável.",
        desvantagens: "Lentos; exigem muita comida; baixa mobilidade.",
        racial: "Ferreiros habilidosos."
    },
    "Pandarino": {
        atributos: "Vivem isolados no norte gelado. Meditam e treinam artes marciais. São tranquilos, mas quando provocados... rolam como bolas e destroem tudo.",
        desvantagens: "Lentos, dependem de comida e detestam tecnologia.",
        racial: "Paz interior (resistem ao pânico); rolagem reduz tempo de travessia."
    },
    "Morto-Vivo": {
        atributos: "São restos de todas as raças, revividos misteriosamente. Vivem nos subterrâneos, negociando o ilegal. Excelentes espiões e assassinos.",
        desvantagens: "Extremamente frágeis; não sentem emoções; membros quebram facilmente.",
        racial: "Furtividade extrema e passos silenciosos."
    }
};

/* Raças citadas nas listas de classes, mas sem verbete próprio no Tomo */
const RACAS_SEM_VERBETE = [
    "Fartil", "Orc", "Goblin", "Skjult", "Draconato", "Crou", "Yuantis",
    "Eladrin", "Mortil", "Tritão", "Gnomo", "Ninfa"
];

/* Nomes antigos do site -> nome canônico (para fichas já salvas) */
const RACA_LEGACY = {
    "Arcanjo": "Aerkeengel", "Aerkeengels": "Aerkeengel", "Centauros": "Centauro",
    "Sereias": "Sereia", "Fadas": "Fada", "Elfos Noturnos": "Elfo Noturno",
    "Elfos Cinzentos": "Elfo Cinzento", "Humanos": "Humano", "Trolls": "Troll",
    "Mortos-Vivos": "Morto-Vivo", "Pandarinos": "Pandarino", "Anões": "Anão"
};

const SUB_LEGACY = {
    "Bardo Banjistã": "Bardo Banjista",
    "Monge Alcoólatra": "Monge Álcoolotra"
};

/* --------------------------- CLASSES --------------------------- */
/* res = quantos "ataques certeiros" a subclasse suporta */

const CLASSES = {

"Assassino": {
    resumo: "Silêncio, veneno e sombras. Mestres do subterfúgio e da morte silenciosa: assassinos não atacam... eles finalizam.",
    racas: ["Morto-Vivo","Elfo Cinzento","Goblin","Humano","Skjult","Draconato","Crou","Yuantis"],
    subs: {
        "Assassino Salafrário": { res: 5, armas: "Adagas", prot: "Vestes ou armaduras leves",
            desc: "Um trapaceiro nato. O artista do caos urbano.",
            hab: ["Invisibilidade|Pode permanecer invisível por até 4 minutos.",
                  "Mãos Leves|Perito em furtar objetos e moedas de pessoas distraídas.",
                  "Clones Ilusórios|Cria ilusões idênticas a si mesmo (não atacam, servem para distração e somem após 1 ataque certeiro).",
                  "Parkour Exímio|Move-se com maestria entre prédios, paredes e obstáculos urbanos."] },
        "Assassino Venenoso": { res: 5, armas: "Adagas", prot: "Vestes ou armaduras leves",
            desc: "Para este, cada corte é uma sentença. Seu arsenal é impregnado com morte lenta.",
            hab: ["Veneno Mortal|Ao ferir um inimigo, aplica veneno. Se não for curado, o alvo morrerá em 1 dia.",
                  "Invisibilidade|Pode permanecer invisível por até 4 minutos.",
                  "Cheiro Imobilizador|Um aroma encantado que paralisa os inimigos por 4 minutos.",
                  "Parkour Exímio|Capaz de se mover por construções com agilidade incomum."] },
        "Assassino das Sombras": { res: 5, armas: "Adagas e machados de uma mão", prot: "Vestes ou armaduras leves",
            desc: "Quando a noite cai, ele se torna um com ela. Invisível nas trevas, mortal no silêncio.",
            hab: ["Camuflagem das Sombras|Durante a noite, torna-se invisível aos olhos comuns.",
                  "Velocidade Alta|Extremamente rápido.",
                  "Parkour Exímio|Escala, salta e corre por estruturas com leveza sobrenatural.",
                  "Sussurros de Matador|Atira uma shuriken silenciosa que atordoa o alvo por 4 minutos."] }
    }
},

"Bardo": {
    resumo: "Entre poesia e batalha, entre melodia e magia, o Bardo dança. Sua música pode tanto curar feridas quanto abrir túmulos.",
    racas: ["Sereia","Elfo Noturno","Pandarino","Aerkeengel","Humano","Fada","Tritão","Gnomo","Ninfa"],
    subs: {
        "Bardo Banjista": { res: 5, armas: "Banjo mágico (instrumento obrigatório)", prot: "Armaduras ou vestes leves",
            desc: "Acordes que brilham como lâminas. Toca com o espírito da tempestade e a língua da alegria.",
            hab: ["Notas Ofensivas|O banjo dispara acordes que ferem.",
                  "Check de Proteção|Melodia defensiva que aumenta a resistência em +2 ataques certeiros.",
                  "Música Dançante|Força o inimigo a dançar por 4 minutos (só pode ser anulado por outro Bardo).",
                  "Caminho Sonoro|Encanta os pés, permitindo andar sobre a água.",
                  "Encanto de Multidões|Suas músicas atraem grandes grupos de ouvintes e curiosos."] },
        "Bardo Flautista": { res: 5, armas: "Flauta mágica (instrumento obrigatório)", prot: "Armaduras ou vestes leves",
            desc: "Delicado e enigmático, conversa com a natureza e seduz o mundo com sopros mágicos.",
            hab: ["Notas Ofensivas|Sons que machucam tanto quanto flechas.",
                  "Encantador de Animais|Faz até 3 animais lutarem ao seu lado (inclui druidas transformados, duração: 4 minutos).",
                  "Encanto de Multidões|Sua melodia atrai grupos de pessoas.",
                  "Visão Noturna|Seus olhos se encantam ao som da flauta, permitindo enxergar no escuro."] },
        "Bardo Tamborista": { res: 5, armas: "Tambor mágico (instrumento obrigatório)", prot: "Armaduras ou vestes leves",
            desc: "Com ritmos tribais e batidas ancestrais, marcha para a guerra — e a própria terra o segue.",
            hab: ["Ritmos de Ruína|Faz o chão se dividir, jogando inimigos em um abismo.",
                  "Tambores Tempestuosos|Convoca raios que causam 2 ataques certeiros.",
                  "Ritmo Purificador|Anula venenos e pragas com sua batida.",
                  "Cura Melódica|Restaura completamente dois aliados (usado até 2 vezes ao dia)."] },
        "Bardo da Maré": { res: 5, armas: "Garras afiadas (causam 2 ataques certeiros)", prot: "Vestes leves ou nenhuma",
            exclusiva: "Sereia",
            desc: "Subclasse exclusiva das Sereias. A melodia do mar canta por meio delas.",
            hab: ["Cântico Irresistível|Voz encantadora que atrai os ouvintes em sua direção (duração: 4 minutos).",
                  "Metamorfose|Podem alterar sua aparência entre bela e grotesca à vontade.",
                  "Nado Veloz|Movimentam-se com incrível rapidez na água.",
                  "Domínio dos Peixes|Ordena que qualquer peixe lute por ela (por até 4 minutos)."] }
    }
},

"Bruxo": {
    resumo: "Sussurros proibidos nos corredores da magia. Manipuladores de maldições, invocadores de demônios e escravizadores de vontades.",
    racas: ["Morto-Vivo","Elfo Cinzento","Humano","Aerkeengel","Gedemand","Fartil","Troll","Ninfa","Sereia","Draconato","Crou","Tritão","Yuantis"],
    subs: {
        "Bruxo Necromante": { res: 5, armas: "Cajados, varinhas e espadas", prot: "Vestes ou armaduras leves",
            desc: "Mestre dos mortos, flagelo dos vivos.",
            hab: ["Dreno Vital|Rouba vida de aliados (equivalente a 2 ataques certeiros absorvidos).",
                  "Evocação Demoníaca|Invoca um demônio por até 4 minutos, 2 vezes por dia. Suporta 5 ataques; cada golpe equivale a 1 ataque certeiro.",
                  "Pragas Malditas|Infecta o inimigo com doenças mortais (sem cura, leva à morte após 2 dias).",
                  "Túmulos de Guerra|Cria até 5 túmulos no solo, dos quais surgem esqueletos (cada um luta por 4 minutos, suporta 2 ataques e causa 1 ataque certeiro). 2 vezes ao dia."] },
        "Bruxo Controlador": { res: 5, armas: "Cajados, varinhas e espadas", prot: "Vestes ou armaduras leves",
            desc: "Especialista em dobrar vontades: domina a mente alheia.",
            hab: ["Chamas Negras|Lança bolas de fogo negras com as mãos (cada acerto vale 2 ataques certeiros).",
                  "Marcação Abissal|Ao tocar o peito do inimigo, deixa nele uma matéria negra que o possui. O alvo obedece ao bruxo por 4 minutos, e sua resistência é igual aos atributos da classe possuída.",
                  "Vórtice Sombrio|Teleporte instantâneo de até 50 metros.",
                  "Evocação da Succubus|Invoca uma succubus sedutora por até 4 minutos. Suporta 2 ataques. Se o alvo for seduzido, fica sob controle do bruxo por 4 minutos."] },
        "Bruxo Ceifador": { res: 5, armas: "—", prot: "—",
            desc: "A própria sombra da morte: não apenas mata, apaga a essência dos inimigos.",
            hab: ["Roubo de Alma|Suga a alma do inimigo (vale 2 ataques certeiros).",
                  "Névoa do Vazio|Teleporte em forma de névoa (até 50 metros).",
                  "Evocação do Espírito Troll|Invoca um espírito de troll caído. Permanece por 4 minutos e não pode ser morto, pois é etéreo. Seus ataques valem 1 ataque certeiro.",
                  "Terror Psíquico|Manipula a mente do inimigo, forçando-o a encarar seu maior medo, deixando-o paralisado por 4 minutos."] }
    }
},

"Cartomante": {
    resumo: "A escória dourada do mundo: ilusionistas, mentirosos e profetas do destino com um baralho envenenado nas mãos.",
    racas: ["Gedemand","Troll","Nørder","Humano","Orc","Anão","Skjult","Goblin","Gnomo","Crou"],
    subs: {
        "Cartomante Baralhista": { res: 5, armas: "Cartas de baralho e adagas", prot: "Vestes leves",
            desc: "Mestre das cartas físicas, joga com a própria sorte — e raramente perde.",
            hab: ["Carta do Medo|Ao atingir o inimigo, o faz fugir em pânico por 4 minutos.",
                  "Leque de Cartas Flutuantes|Um círculo de cartas ataca em sequência com alta velocidade (até 10 cartas, cada uma causando 2 ataques certeiros).",
                  "Carta Cósmica|Permite trocar de posição com um inimigo ou aliado (2 vezes por dia).",
                  "Carta Móvel|Transforma-se em um tapete voador por 1 uso semanal. Se tocar o chão, desfaz-se. Reduz o tempo de travessia em 100%.",
                  "Carta Elementar|Envolve um alvo numa esfera protetora contra todos os ataques elementais (2 vezes por dia, duração de alguns minutos)."] },
        "Cartomante Enganador": { res: 5, armas: "Cartas de baralho e adagas", prot: "Vestes leves",
            desc: "Ilusões são suas armas, e a mentira é sua arte.",
            hab: ["Reflexos Falsos|Cria até 20 ilusões de si mesmo (duram 4 minutos, suportam 1 ataque certeiro cada).",
                  "Carta de Travessia|Uma carta no chão que abre um limbo ilusório — quem pisa nela \"cai\" 40 metros à frente.",
                  "Face Secreta|Transforma a aparência de alguém (ou de si mesmo) para quem quiser por 4 minutos.",
                  "Mentira do Destino|Se alguém mentir para o cartomante, uma carta revelará a mentira e paralisará o culpado por 4 minutos."] },
        "Cartomante Festeiro": { res: 5, armas: "Cartas de baralho e adagas", prot: "Vestes leves",
            desc: "O caos embriagado em música e dança. Ri no campo de batalha.",
            hab: ["Cartas Rítmicas|Espalha cartas encantadas que tocam músicas, obrigando todos a dançar por 4 minutos.",
                  "Cartas Harmonizadas|Lança até 10 cartas que causam 1 ataque certeiro cada. A cada carta lançada, o Cartomante fica mais rápido. Além disso, essas cartas dobram os atributos de aliados citados durante o lançamento (duração: 2 minutos por carta)."] }
    }
},

"Caçador": {
    resumo: "Predadores silenciosos: espreitam, observam, esperam... e disparam. Mestres da emboscada, do rastreio e da sobrevivência.",
    racas: ["Humano","Orc","Elfo Noturno","Troll","Skjult","Fartil","Draconato","Eladrin","Yuantis","Crou"],
    subs: {
        "Caçador Ágil": { res: 5, armas: "Arco e flecha ou bestas", prot: "Vestes leves",
            desc: "É a flecha antes do disparo.",
            hab: ["Velocidade Altíssima|Movimenta-se com rapidez sobrenatural.",
                  "Visão de Águia|Consegue enxergar alvos com nitidez até 50 metros de distância.",
                  "Suspiro de Foco|Pode acertar alvos em alta velocidade com precisão quase impossível.",
                  "Ilusões Táticas|Cria até 2 ilusões idênticas para confundir o inimigo (não atacam)."] },
        "Caçador Rastreador": { res: 5, armas: "Arcos, flechas, bestas e lanças", prot: "Vestes leves",
            desc: "Encontra o que está escondido. Mestre da trilha, da emboscada e da camuflagem.",
            hab: ["Rastreador Instintivo|Capaz de rastrear qualquer animal (ou inimigo) pelo cheiro.",
                  "Parkour Exímio|Move-se com grande agilidade por obstáculos naturais e urbanos.",
                  "Camuflagem Natural|Funde-se com o ambiente, tornando-se praticamente invisível na natureza.",
                  "Passos Leves|Quase impossível de detectar por som.",
                  "Armadilhas de Pé|Instala até 2 armadilhas."] },
        "Caçador de Feras": { res: 5, armas: "Arco e flecha ou bestas", prot: "Vestes leves",
            desc: "Não caça apenas... lidera as feras contra seus inimigos.",
            hab: ["Domínio Animal|Controla felinos (ou outras feras) por até 5 minutos.",
                  "Velocidade Extrema|Sua movimentação beira o impossível.",
                  "Assobios Atordoantes|Emite um assobio agudo que atordoa e ensurdece os inimigos por 5 minutos."] }
    }
},

"Druida": {
    resumo: "Guardião das forças primordiais, elo vivo entre o espírito e a floresta. A natureza responde ao seu chamado com fúria ou com cura.",
    racas: ["Humano","Elfo Noturno","Troll","Ninfa","Fada","Pandarino","Crou","Eladrin","Gnomo"],
    subs: {
        "Druida Pele de Árvore": { res: 15, armas: "Cajados, varinhas e espadas curtas", prot: "Vestes leves",
            desc: "Lento como o tempo, mas inabalável como um carvalho antigo.",
            hab: ["Forma de Urso Pardo|Pode transformar-se em um urso duas vezes por dia.",
                  "Rugido Ensurdecedor|Deixa os inimigos surdos por 2 minutos.",
                  "Garras Cortantes|Causam 3 ataques certeiros.",
                  "Forma de Pássaro|Pode voar 1 dia por semana (reduz tempo de travessia em 50%).",
                  "Lento e Pesado|Menor mobilidade e agilidade."] },
        "Druida Feral": { res: 5, armas: "Cajados, varinhas e espadas curtas", prot: "Vestes leves",
            desc: "Instinto, agilidade e ferocidade. Move-se como a própria sombra entre folhas e pedras.",
            hab: ["Forma de Pantera|Veloz, furtivo e letal.",
                  "Garras Afiadas|Causam 2 ataques certeiros.",
                  "Camuflagem Natural|Pode fundir-se ao ambiente como um camaleão (duração: 4 minutos).",
                  "Visão Noturna|Enxerga perfeitamente no escuro.",
                  "Olfato Aguçado|Capaz de rastrear, farejar e detectar presenças ocultas.",
                  "Forma de Pássaro|Pode voar 1 dia por semana (reduz tempo de travessia em 50%)."] },
        "Druida Verdeal": { res: 5, armas: "Cajados e varinhas", prot: "Vestes leves",
            desc: "Sábio, excêntrico e profundamente conectado à vida — e, às vezes, ao álcool.",
            hab: ["Cura Verdeal|Cura todos os aliados próximos em 3 pontos de HP, duas vezes ao dia.",
                  "Natureza Ofensiva|Usa raízes, vinhas e galhos como armas (2 ataques certeiros).",
                  "Enredamento|Prende os pés dos inimigos por 4 minutos com raízes.",
                  "Controle da Terra|Manipula o solo, causando 1 ataque certeiro.",
                  "Ressurreição em Massa|Uma vez ao dia, pode reviver aliados caídos.",
                  "Forma de Pássaro|Pode voar 1 dia por semana (reduz tempo de travessia em 50%).",
                  "Personalidade|Bêbado. Literalmente."] }
    }
},

"Feiticeiro": {
    resumo: "Nem mago, nem bruxo: algo entre o abismo e a estrela. Um dom inato que mistura magia arcana e obscura em equilíbrio explosivo.",
    racas: ["Humano","Anão","Orc","Elfo Cinzento","Eladrin","Draconato","Yuantis","Ninfa","Crou","Morto-Vivo","Troll","Gedemand","Skjult"],
    subs: {
        "Feiticeiro Rúnico": { res: 5, armas: "Varinhas ou cajados", prot: "Vestes leves",
            desc: "Cada runa traçada é uma sentença.",
            hab: ["Assalto Vital|Cria uma runa na mão que, ao toque, rouba energia vital do inimigo (equivale a 2 ataques certeiros).",
                  "Runa do Teleporte|Permite teletransportar-se até 50 metros.",
                  "Canalização Mágica|Lança uma rajada de magia pura pelas mãos ou varinha.",
                  "Runa da Vida|Se desenhada previamente no pulso, pode ressuscitar o feiticeiro ou um aliado uma vez ao dia."] },
        "Feiticeiro Impuro": { res: 5, armas: "Varinhas, cajados e espadas", prot: "Vestes leves",
            desc: "Desafiador das leis sagradas, encontra força em sua própria corrupção.",
            hab: ["Sacrifício Animal|Uma vez por dia, pode sacrificar um animal para recuperar 1 ponto de vida perdido.",
                  "Sangue Ardente|Ao cortar o próprio pulso e deixar o sangue cair no chão, ergue uma proteção flamejante ao seu redor.",
                  "Fogo Interior|Ao beber seu sangue, cospe uma rajada de fogo no oponente."] },
        "Feiticeiro Evocador": { res: 7, armas: "Cajados", prot: "—",
            desc: "Fala com os espíritos e comanda forças elementares.",
            hab: ["Comando Elemental|Pode controlar qualquer elemento, incluindo congelar água para formar gelo.",
                  "Raio de Luz|Dispara feixe mágico que causa 2 ataques certeiros.",
                  "Teleporte Sombrio|Uma vez por dia, pode se teleportar para qualquer local do mapa através de um vórtice negro.",
                  "Evocação Demoníaca|Invoca até 3 demônios (cada um ataca com 2 ataques certeiros e aguenta 3 ataques antes de desaparecer).",
                  "Fantasma de Guerra|Cria um vórtice que libera 5 fantasmas de guerreiros (cada um ataca com 2 ataques certeiros e aguenta 3 ataques). Após atingirem, somem."] }
    }
},

"Forfatter": {
    resumo: "Não empunham espadas nem lançam feitiços com gestos: escrevem — e o mundo responde. O que escrevem existe; o que desenham ganha forma.",
    racas: ["Gedemand","Fada","Ninfa","Troll","Nørder","Elfo Noturno","Humano","Gnomo"],
    subs: {
        "Forfatter Son": { res: 5, armas: "Livros de magia, papiros e pena de escritura (a tinta vem do próprio sangue mágico)", prot: "Vestes de couro",
            desc: "O mais puro elo entre tinta e realidade. O Son transforma a folha em campo de batalha.",
            hab: ["Big Daddy|Desenha um gigante que luta por ele (dura 4 minutos, suporta 5 ataques certeiros, causa 2 de ataque certeiro).",
                  "Constelações Vivas|Desenha estrelas que iluminam o caminho e guiam seu trajeto.",
                  "Frutos do Papel|Cria uma planta, um fruto e um legume por dia (cada um cura 1 ponto de vida).",
                  "Ressurreição Escrita|Desenha um aliado morto e o traz de volta à vida (1 vez por dia).",
                  "Fonte Curativa|Desenha uma pequena fonte sob o aliado, curando-o em 2 ataques certeiros (2 vezes por dia).",
                  "Golem de Montaria|Cria um golem gigante para transporte (dura 10 minutos, não ataca, desaparece se for atingido, 2 vezes por dia).",
                  "Morte Prevenida|Desenha sua morte iminente — e caso ocorra, volta à vida (1 vez por semana).",
                  "Barreiras de Pedra|Cria muros sólidos indestrutíveis que duram 4 minutos.",
                  "Destino Escrito|Desenha um local conhecido e se teletransporta até ele (1 vez por dia).",
                  "Barreira de Luz|Cria um escudo de luz com 40 metros de largura e 20 km de altura, totalmente impenetrável (duração: 5 minutos)."] }
    }
},

"Golemante": {
    resumo: "Na fronteira entre a alquimia e a criação divina: mestres da vida inanimada, capazes de infundir alma em pedra, metal ou montanha.",
    racas: ["Orc","Anão","Humano","Elfo Cinzento","Elfo Noturno","Troll","Gedemand","Skjult","Nørder"],
    subs: {
        "Golemante Artesão": { res: 5, armas: "Espadas e ferramentas mágicas", prot: "Vestes sujas ou armaduras enferrujadas",
            desc: "O artífice eterno. Cria obras que duram além da guerra e do tempo.",
            hab: ["Golem Companheiro|Um golem mecânico de ferro o acompanha permanentemente (HP 10, causa 3 ataques certeiros, utiliza armas). Se for destruído, requer 100 pepitas de ferro para reconstrução.",
                  "Golem Titânico|Constrói um colosso de 15 metros uma vez por semana, com no mínimo 1 hora de trabalho (HP 5, ataque: 3 ataques certeiros)."] },
        "Golemante Elemental": { res: 5, armas: "Cajados e adagas", prot: "Vestes leves",
            desc: "Invocador dos elementos primordiais.",
            hab: ["Golens Elementais|Criados com fogo, água, gelo, lava ou terra (duração: 4 minutos. HP 2, ataque: 3 ataques certeiros).",
                  "Golems de Lava|Invoca dois colossos de 12 metros (duração: 3 minutos, HP 3, ataque: 2 ataques certeiros).",
                  "Exército de Golemitas|Evoca 10 mini-golens de pedra (duração: 4 minutos. HP 2, ataque: 2 ataques certeiros cada)."] },
        "Golemante Criador": { res: 5, armas: "Cajados e espadas", prot: "Vestes leves",
            desc: "O verdadeiro escultor de almas. Com símbolos rúnicos e palavras antigas, dá vida até ao mais inerte monte de pedra.",
            hab: ["Golem Vivo|Pode animar qualquer objeto grande ou massa de rocha (até 5 golens por dia). Cada um dura 4 minutos (HP 3, ataque: 2 ataques certeiros).",
                  "Golem de Minério|Criado com runas e telecinese, é mais resistente e forte (HP 3, ataque: 2 ataques certeiros, duração: 4 minutos).",
                  "Golem de Pedra/Terra|Mais velozes e destrutivos (HP 2, ataque: 2 ataques certeiros, duração: 4 minutos)."] }
    }
},

"Ladino": {
    resumo: "Ladrão esperto ou assassino furtivo: silenciosos, eficientes e implacáveis. A definição de perigo silencioso.",
    racas: ["Humano","Crou","Elfo Noturno","Eladrin","Troll","Morto-Vivo","Nørder","Elfo Cinzento"],
    subs: {
        "Ladino Mercenário": { res: 10, armas: "Adagas, arcos, bestas e espadas curtas", prot: "Vestes leves",
            desc: "Não é apenas um ladino: é um profissional. Trabalha por contratos — e sempre entrega.",
            hab: ["Adagas Arremessadas|Lança adagas com precisão letal (causam 5 ataques certeiros).",
                  "Granadas de Fumaça|Artesanais e eficazes — cegam os inimigos por completo.",
                  "Desarme e Arrombamento|Especialista em desarmar armadilhas e destrancar fechaduras com rapidez.",
                  "Ilusões Táticas|Cria até 6 ilusões de si mesmo uma vez por dia (desaparecem ao serem atingidas).",
                  "Algemas Especiais|Ao prender um inimigo, este fica imóvel por 2 minutos."] }
    }
},

"Paladino": {
    resumo: "Portadores da luz, vozes da justiça, escudos vivos da bondade — moldados, dizem, por Casthiel, deus da compaixão. Mas até a luz mais pura projeta sombras.",
    racas: ["Humano","Fada","Pandarino","Aerkeengel","Fartil","Eladrin","Ninfa"],
    subs: {
        "Paladino Divino": { res: 15, armas: "Espadas, machados curtos, martelos, escudos", prot: "Armadura pesada",
            desc: "O verdadeiro enviado da luz. Protege os fracos e defende com o escudo da fé.",
            hab: ["Aura Protetora|Torna-se invulnerável a qualquer dano por 5 minutos (1 vez ao dia).",
                  "Modo Santo|Ao receber um ataque mínimo (1 acerto), entra em modo santo, dobrando sua velocidade e vitalidade (dura 5 minutos).",
                  "Escudo de Cura|Ao proteger um aliado e receber o dano no lugar dele, cura ambos em 2 pontos de vida."] },
        "Paladino Sombrio": { res: 5, armas: "Espada longa, machado longo e martelo", prot: "Armadura leve",
            desc: "A fé corrompida, a justiça distorcida. Um traidor de Casthiel, mas terrivelmente poderoso.",
            hab: ["Modo Brutal|Se for atingido de forma severa, dobra sua vida por 5 minutos (1 vez por dia).",
                  "Ressurreição Negra|Retorna dos mortos uma vez ao dia, envolto em trevas e ódio."] }
    }
},

"Pirata": {
    resumo: "Nascidos do caos e moldados pelo sal das marés, vindos de Maariz, a ilha sem rei, sem lei e sem piedade. Vivem por poder e pilhagem.",
    racas: ["Humano","Goblin","Orc","Nørder","Gedemand","Draconato","Crou","Yuantis"],
    subs: {
        "Pirata Pistoleiro": { res: 5, armas: "Armas de fogo, pólvora", prot: "Vestes esfarrapadas e leves",
            desc: "Especialista em pólvora, precisão e terror psicológico.",
            hab: ["Reflexos Rápidos|Dificilmente é surpreendido.",
                  "Jogo de Moedas|Arremessa moedas afiadas no inimigo (2 ataques certeiros).",
                  "Papagaio Real|Traduz idiomas e decifra enigmas.",
                  "Parkour Avançado|Move-se por navios e telhados com maestria.",
                  "Intimidação Natural|Sua presença causa medo em personagens mais fracos."] },
        "Pirata Duelista": { res: 5, armas: "Espadas", prot: "Vestes esfarrapadas e leves",
            desc: "Astuto, ágil e mortal em combates curtos. Prefere o aço à pólvora.",
            hab: ["Moedas Cortantes|Arremessa moedas como lâminas (2 ataques certeiros).",
                  "Rato de Navio|Um rato domesticado que morde o inimigo (1 ataque certeiro) e causa doença mortal se não tratada em 1 dia.",
                  "Riqueza Crescente|Ganha 1 mønter (moeda especial) por dia."] },
        "Pirata Caçador de Tesouros": { res: 5, armas: "Armas de fogo, pólvora ou espadas", prot: "Vestes esfarrapadas e leves",
            desc: "Nascido para encontrar o que ninguém mais pode.",
            hab: ["Perito em Parkour|Ágil em ambientes urbanos e portos.",
                  "Instinto de Tesouro|Tem facilidade em obter itens raros ou valiosos.",
                  "Movimentos Rápidos|Dificulta ataques corpo a corpo."] }
    }
},

"Monge": {
    resumo: "Firme como a montanha e fluido como o vento. Treinados pelos antigos mestres Pandarinos em busca do lendário Chi Supremo.",
    racas: ["Pandarino","Humano","Nørder","Skjult","Mortil","Fartil","Crou","Eladrin"],
    subs: {
        "Monge Álcoolotra": { res: 15, armas: "Espada ou cajado", prot: "Armadura pesada",
            desc: "O equilíbrio vem no copo — e a força, na barriga. Domina seu Chi entre goles e gargalhadas.",
            hab: ["Vitalidade Extraordinária|Aguenta 15 ataques certeiros.",
                  "Chi Etílico|Energia mística o envolve, ganhando +5 ataques certeiros de resistência por 4 minutos.",
                  "Bafo de Fogo|Após beber cerveja, exala chamas que causam 2 ataques certeiros.",
                  "Barrigada do Monge|Com um impulso abdominal, arremessa inimigos até 50 metros de distância."] },
        "Monge Espiritual": { res: 5, armas: "Espada e cajado", prot: "Vestes leves",
            desc: "Discípulo do vento e do silêncio. Uma alma que flutua entre os planos.",
            hab: ["Jejum de Corpo e Alma|Sua meditação permite viver dias sem se alimentar.",
                  "Punho Ventoso|Controla o ar, lançando rajadas que causam 2 ataques certeiros.",
                  "Golpes Contínuos|Seus punhos desferem uma sequência de ataques rápidos (2 ataques certeiros).",
                  "Agilidade Espiritual|Esquiva de golpes com facilidade."] },
        "Monge da Névoa": { res: 5, armas: "Cajados", prot: "Vestes leves",
            desc: "Discreto como um suspiro. Sua névoa cura, protege — e mata.",
            hab: ["Passo da Névoa|Envolve-se em névoa e se teleporta até 50 metros.",
                  "Transe Curativo|Entra em estado de meditação, emanando uma aura curativa que cura 2 de vida de quem o tocar (dura 5 minutos, termina se for atacado).",
                  "Bolinhos Espirituais|Cospe bolinhos místicos nos inimigos, causando 2 ataques certeiros (não subestime os bolinhos)."] }
    }
},

"Xamã": {
    resumo: "Guardião dos elementos e voz dos antigos espíritos. Caminha entre o visível e o invisível, invocando a fúria dos elementos e a sabedoria das almas.",
    racas: ["Anão","Troll","Pandarino","Gedemand","Skjult","Ninfa","Orc","Yuantis"],
    subs: {
        "Xamã Elemental": { res: 5, armas: "Cajados, machados pequenos, lanças e espadas", prot: "Vestes leves",
            desc: "A força da natureza em sua forma bruta, guiado por totens de fogo e tempestade.",
            hab: ["Magia Elemental|Cria raios que causam 2 de ataque certeiro.",
                  "Golem de Gelo|Invoca um guardião glacial que luta por ele (dura 4 minutos, usado 2x ao dia, aguenta 5 ataques certeiros, ataca com 1 ataque certeiro).",
                  "Controle Elementar|Pode controlar terra, fogo, ar e água (desde que haja fonte visível do elemento, cada uso causa 2 ataques certeiros).",
                  "Totem Flamejante|Cria um totem de fogo que o protege, lançando chamas contra quem invadir sua área."] },
        "Xamã Espiritual": { res: 5, armas: "Cajados, machados pequenos, lanças e espadas", prot: "Vestes leves",
            desc: "O elo com o mundo invisível. Domina espíritos e transforma-se em puro instinto.",
            hab: ["Forma Espiritual|Transforma-se em um lobo espírito 2x ao dia (ganha velocidade extrema, mas não pode atacar).",
                  "Magia Espiritual|Lança raios que causam 2 de ataque certeiro.",
                  "Possessão Espiritual|Entra no corpo do inimigo por até 4 minutos, assumindo seus atributos e habilidades.",
                  "Totem de Evocação|Conjura o espírito de qualquer animal para lutar ao seu lado.",
                  "Vigília Ancestral|Não precisa dormir."] }
    }
},

"Mago": {
    resumo: "Estudiosos do arcano, mestres dos elementos. A ponte entre o conhecimento ancestral e o caos da criação: calcula, observa e fulmina.",
    racas: ["Humano","Anão","Fada","Gedemand","Mortil","Pandarino","Draconato","Crou","Ninfa"],
    subs: {
        "Mago Arcano": { res: 5, armas: "Cajados e varinhas", prot: "Vestes leves",
            desc: "Domina a pura essência mágica, canalizando-a em feitiços mortais e encantamentos versáteis.",
            hab: ["Raio de Luz|Dispara uma rajada mágica que causa 2 ataques certeiros.",
                  "Teleporte|Move-se instantaneamente até 50 metros.",
                  "Golem Arcano|Conjura um golem místico por 4 minutos (2x ao dia, suporta 5 ataques, cada golpe vale 1 ataque certeiro).",
                  "Dimensão Alternativa|Torna-se invisível por até 4 minutos.",
                  "Livro Voador|Acompanha o mago disparando esferas de 2 metros (causa 1 ataque certeiro, suporta 1 ataque para ser desativado)."] },
        "Mago Vulcânico": { res: 5, armas: "Cajados", prot: "Vestes leves",
            desc: "Queima tudo em seu caminho com a fúria das entranhas da terra.",
            hab: ["Bola de Fogo|Arremessa esferas flamejantes com 2 de ataque certeiro.",
                  "Teleporte|Move-se instantaneamente até 50 metros.",
                  "Golem de Lava|Invoca um guardião ígneo (4 minutos, 2x ao dia, 5 ataques suportados, 1 ataque certeiro por golpe).",
                  "Escudo de Fogo|Cria uma barreira ígnea que resiste a 2 ataques certeiros."] },
        "Mago de Gelo": { res: 5, armas: "Cajados", prot: "Vestes leves",
            desc: "Frio e calculista, transforma a batalha em um campo congelado e intransponível.",
            hab: ["Chuva de Gelo|Invoca uma tempestade congelante (2 ataques certeiros).",
                  "Teleporte|Move-se instantaneamente até 50 metros.",
                  "Golem de Gelo|Cria um gigante glacial (4 minutos, 2x ao dia, 5 ataques suportados, 1 ataque certeiro por golpe).",
                  "Congelamento Total|Envolve-se em um bloco de gelo impenetrável (dura 4 minutos)."] }
    }
},

"Guerreiro": {
    resumo: "Fúria em punhos e força indomável. O titã que avança sem medo, com o sangue dos deuses da guerra pulsando nas veias.",
    racas: ["Humano","Orc","Anão","Aerkeengel","Gedemand","Mortil","Draconato","Crou","Tritão","Eladrin","Yuantis"],
    subs: {
        "Guerreiro de Ferro": { res: 15, armas: "Espada ou machado de uma mão pequena + escudo", prot: "Pesada",
            desc: "O escudo e a armadura que resistem às tempestades. Defensor implacável.",
            hab: ["Escudo Defletor|Pode reverter até 2 ataques certeiros, lançando-os de volta ao inimigo."] },
        "Guerreiro Sanguinário": { res: 10, armas: "Espada longa de uma mão ou machado de uma mão", prot: "Pesada",
            desc: "O flagelo da guerra, que se fortalece com o sangue derramado.",
            hab: ["Força Brutal|Seus ataques derrubam metade da vida de um tanque.",
                  "Sede de Sangue|A resistência pode aumentar de 10 para 12 conforme causa dano aos inimigos."] },
        "Guerreiro Assassino": { res: 7, armas: "Duas espadas curtas", prot: "Leve",
            desc: "Velocidade e precisão, uma sombra letal que não perde o alvo.",
            hab: ["Golpes Fatais|Pode eliminar um inimigo com um único ataque."] }
    }
},

"Sacerdote": {
    resumo: "Curandeiros abençoados, guias espirituais que caminham entre a luz e as sombras. Curam feridas profundas e trazem aliados de volta à vida.",
    racas: ["Humano","Elfo Noturno","Fada","Aerkeengel","Gedemand","Skjult","Mortil","Pandarino","Anão","Eladrin","Ninfa"],
    subs: {
        "Sacerdote Sombrio": { res: 5, armas: "Cajados e espadas curtas", prot: "—",
            desc: "Mestre das sombras, invoca forças obscuras para proteger e atacar.",
            hab: ["Invocações|Anjo das trevas (até 4 minutos, 2 vezes por dia; suporta 5 ataques; causa 1 ataque certeiro).",
                  "Magia|Drena vida dos inimigos (1 ataque certeiro).",
                  "Cura|Cura individual de 2 HP por aliado.",
                  "Sacrifício|Pode trocar sua própria vida pela de um aliado para salvá-lo.",
                  "Ressurreição|Pode se ressuscitar uma vez por dia."] },
        "Sacerdote da Luz": { res: 5, armas: "Cajados e espadas curtas", prot: "—",
            desc: "Portador da luz pura, capaz de curar multidões e enfrentar o mal com esferas sagradas.",
            hab: ["Invocações|Fantasma de luz (até 4 minutos, 2 vezes por dia; suporta 5 ataques; causa 1 ataque certeiro).",
                  "Cura em Massa|Sacrifica parte de sua energia para curar todos os aliados próximos.",
                  "Proteção|Posiciona esferas de luz que curam 2 HP ao toque.",
                  "Ataques|Raios ofensivos que causam 1 ataque certeiro.",
                  "Ressurreição|Ressuscita a si mesmo e um aliado uma vez ao dia."] },
        "Sacerdote Purificante": { res: 5, armas: "Cajados e espadas curtas", prot: "—",
            desc: "Guardião contra doenças e venenos, rápido e letal contra as pragas que assolam o mundo.",
            hab: ["Cura|Cura doenças e pragas.",
                  "Mobilidade|Teleporte de até 50 metros.",
                  "Ataques|Raios ofensivos que causam 1 ataque certeiro.",
                  "Imunidade|Totalmente imune a venenos.",
                  "Ressurreição|Ressuscita a si mesmo e um aliado uma vez ao dia."] }
    }
}

};
