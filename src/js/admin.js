// Configuração do Supabase
let SUPABASE_URL;
let SUPABASE_ANON_KEY;
let supabase;
let isSupabaseInitialized = false;

// Função para inicializar o Supabase
async function initializeSupabase() {
    if (isSupabaseInitialized) {
        console.log('Supabase já foi inicializado.');
        return;
    }

    try {
        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            throw new Error('O script do Supabase não foi carregado corretamente.');
        }

        const response = await fetch('/.netlify/functions/api/env');
        if (!response.ok) {
            throw new Error('Erro ao buscar variáveis de ambiente');
        }

        const env = await response.json();

        if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
            throw new Error('Variáveis de ambiente não encontradas');
        }

        SUPABASE_URL = env.SUPABASE_URL;
        SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Cliente Supabase inicializado com sucesso');

        isSupabaseInitialized = true;
        
        // Carregar a lista de campeões após inicializar o Supabase
        setTimeout(() => {
            loadChampionsList();
        }, 0);
        
        return true;
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        showNotification('Erro', 'Erro ao conectar com o servidor', 'error');
        return false;
    }
}

// Função para verificar se o usuário está autenticado
function checkAuth() {
    const session = localStorage.getItem('session');
    if (!session) {
        window.location.href = '/';
        return false;
    }

    const userSession = JSON.parse(session);
    if (userSession.expires < Date.now()) {
        localStorage.removeItem('session');
        window.location.href = '/';
        return false;
    }

    return userSession;
}

// Função para verificar se o usuário é admin
function checkAdminAuth() {
    const session = checkAuth();
    if (!session) return false;

    if (session.user.role !== 'admin') {
        window.location.href = '/matchups';
        return false;
    }

    return true;
}

// Elementos do DOM
const championsList = document.getElementById('championsList');
const matchupForm = document.getElementById('matchupForm');
const championName = document.getElementById('championName');
const championImage = document.getElementById('championImage');
const description = document.getElementById('description');
const spellsContainer = document.getElementById('spellsContainer');
const runesContainer = document.getElementById('runesContainer');
const saveButton = document.getElementById('saveButton');

// Verificar se todos os elementos foram encontrados
function checkElements() {
    const elements = {
        championsList,
        matchupForm,
        championName,
        championImage,
        description,
        spellsContainer,
        runesContainer,
        saveButton
    };
    
    let missingElements = [];
    
    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            missingElements.push(name);
            console.warn(`Elemento ${name} não encontrado no DOM`);
        }
    }
    
    if (missingElements.length > 0) {
        console.error(`Os seguintes elementos não foram encontrados: ${missingElements.join(', ')}`);
        return false;
    }
    
    return true;
}

// Função para adicionar um novo campeão
function addNewChampion() {
    // Criar um modal para inserir o nome do novo campeão
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Adicionar Novo Campeão</h2>
            <div class="form-group">
                <label>Nome do Campeão</label>
                <input type="text" id="newChampionName" placeholder="Ex: Briar">
            </div>
            <div class="form-group">
                <label>Nome da API (sem espaços ou caracteres especiais)</label>
                <input type="text" id="newChampionApiName" placeholder="Ex: Briar">
                <small>Este nome deve corresponder ao nome usado pela API do League of Legends</small>
            </div>
            <div class="modal-buttons">
                <button id="cancelAddChampion">Cancelar</button>
                <button id="confirmAddChampion">Adicionar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Preencher automaticamente o nome da API ao digitar o nome do campeão
    const nameInput = document.getElementById('newChampionName');
    const apiNameInput = document.getElementById('newChampionApiName');
    
    nameInput.addEventListener('input', () => {
        apiNameInput.value = nameInput.value.replace(/[^a-zA-Z0-9]/g, '');
    });
    
    // Adicionar eventos aos botões
    document.getElementById('cancelAddChampion').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('confirmAddChampion').addEventListener('click', () => {
        const name = nameInput.value.trim();
        const apiName = apiNameInput.value.trim();
        
        if (!name || !apiName) {
            showNotification('Erro', 'Por favor, preencha todos os campos', 'error');
            return;
        }
        
        // Verificar se o campeão já existe
        const exists = topChampions.some(champ => 
            champ.name.toLowerCase() === name.toLowerCase() || 
            champ.apiName.toLowerCase() === apiName.toLowerCase()
        );
        
        if (exists) {
            showNotification('Erro', 'Este campeão já existe na lista', 'error');
            return;
        }
        
        // Verificar se a imagem existe (opcional)
        const img = new Image();
        img.onload = function() {
            // A imagem existe, adicionar o campeão
            addChampionToList(name, apiName);
        };
        
        img.onerror = function() {
            // A imagem não existe, perguntar se deseja continuar
            if (confirm(`Aviso: Não foi possível encontrar a imagem para ${apiName}. Deseja adicionar o campeão mesmo assim?`)) {
                addChampionToList(name, apiName);
            }
        };
        
        img.src = `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${apiName}.png`;
    });
    
    // Função para adicionar o campeão à lista
    function addChampionToList(name, apiName) {
        // Adicionar o novo campeão à lista
        topChampions.push({ name, apiName });
        
        // Ordenar a lista alfabeticamente
        topChampions.sort((a, b) => a.name.localeCompare(b.name));
        
        // Salvar a lista atualizada no localStorage
        saveChampionsToLocalStorage();
        
        // Recarregar a lista de campeões
        loadChampionsList();
        
        // Fechar o modal
        modal.remove();
        
        // Mostrar notificação de sucesso
        showNotification('Sucesso', `Campeão ${name} adicionado com sucesso!`);
        
        // Selecionar o novo campeão
        setTimeout(() => {
            const newChampItem = document.querySelector(`[data-champion="${name}"]`);
            if (newChampItem) {
                newChampItem.click();
            }
        }, 100);
    }
}

// Função para salvar a lista de campeões no localStorage
function saveChampionsToLocalStorage() {
    localStorage.setItem('topChampions', JSON.stringify(topChampions));
}

// Função para carregar a lista de campeões do localStorage
function loadChampionsFromLocalStorage() {
    const savedChampions = localStorage.getItem('topChampions');
    if (savedChampions) {
        // Mesclar os campeões salvos com a lista padrão, evitando duplicatas
        const parsedChampions = JSON.parse(savedChampions);
        
        // Verificar se há novos campeões na lista padrão que não estão nos salvos
        const defaultChampionsNotInSaved = defaultTopChampions.filter(defaultChamp => 
            !parsedChampions.some(savedChamp => 
                savedChamp.name === defaultChamp.name || 
                savedChamp.apiName === defaultChamp.apiName
            )
        );
        
        // Adicionar os campeões padrão que não estão na lista salva
        const mergedChampions = [...parsedChampions, ...defaultChampionsNotInSaved];
        
        // Ordenar a lista alfabeticamente
        mergedChampions.sort((a, b) => a.name.localeCompare(b.name));
        
        // Atualizar a lista global
        topChampions.length = 0; // Limpar o array
        topChampions.push(...mergedChampions); // Adicionar os itens mesclados
    }
}

// Lista padrão de campeões do top lane com nomes corrigidos para a API
const defaultTopChampions = [
    { name: 'Aatrox', apiName: 'Aatrox' },
    { name: 'Akali', apiName: 'Akali' },
    { name: 'Camille', apiName: 'Camille' },
    { name: 'Chogath', apiName: 'Chogath' },
    { name: 'Darius', apiName: 'Darius' },
    { name: 'Fiora', apiName: 'Fiora' },
    { name: 'Gangplank', apiName: 'Gangplank' },
    { name: 'Garen', apiName: 'Garen' },
    { name: 'Gnar', apiName: 'Gnar' },
    { name: 'Gragas', apiName: 'Gragas' },
    { name: 'Gwen', apiName: 'Gwen' },
    { name: 'Heimerdinger', apiName: 'Heimerdinger' },
    { name: 'Illaoi', apiName: 'Illaoi' },
    { name: 'Irelia', apiName: 'Irelia' },
    { name: 'Jax', apiName: 'Jax' },
    { name: 'Jayce', apiName: 'Jayce' },
    { name: 'Kayle', apiName: 'Kayle' },
    { name: 'Kennen', apiName: 'Kennen' },
    { name: 'Kled', apiName: 'Kled' },
    { name: 'Malphite', apiName: 'Malphite' },
    { name: 'Maokai', apiName: 'Maokai' },
    { name: 'Mordekaiser', apiName: 'Mordekaiser' },
    { name: 'Nasus', apiName: 'Nasus' },
    { name: 'Ornn', apiName: 'Ornn' },
    { name: 'Pantheon', apiName: 'Pantheon' },
    { name: 'Poppy', apiName: 'Poppy' },
    { name: 'Quinn', apiName: 'Quinn' },
    { name: 'Renekton', apiName: 'Renekton' },
    { name: 'Riven', apiName: 'Riven' },
    { name: 'Rumble', apiName: 'Rumble' },
    { name: 'Sett', apiName: 'Sett' },
    { name: 'Shen', apiName: 'Shen' },
    { name: 'Singed', apiName: 'Singed' },
    { name: 'Sion', apiName: 'Sion' },
    { name: 'Tahm Kench', apiName: 'TahmKench' },
    { name: 'Teemo', apiName: 'Teemo' },
    { name: 'Tryndamere', apiName: 'Tryndamere' },
    { name: 'Urgot', apiName: 'Urgot' },
    { name: 'Vayne', apiName: 'Vayne' },
    { name: 'Volibear', apiName: 'Volibear' },
    { name: 'Warwick', apiName: 'Warwick' },
    { name: 'Wukong', apiName: 'MonkeyKing' },
    { name: 'Yasuo', apiName: 'Yasuo' },
    { name: 'Yone', apiName: 'Yone' },
    { name: 'Yorick', apiName: 'Yorick' },
    { name: 'Zac', apiName: 'Zac' }
];

// Lista de campeões do top lane (será inicializada a partir do localStorage ou da lista padrão)
let topChampions = [...defaultTopChampions];

// Adiciona evento de clique ao botão de adicionar campeão
const addChampionButton = document.getElementById('addChampionButton');
const addChampionContainer = document.querySelector('.add-champion-button');

if (addChampionContainer) {
    addChampionContainer.addEventListener('click', addNewChampion);
}

// Lista de spells disponíveis
const spells = [
    { id: 4, name: 'Flash', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerFlash.png' },
    { id: 14, name: 'Ignite', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerDot.png' },
    { id: 12, name: 'Teleport', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerTeleport.png' },
    { id: 21, name: 'Barrier', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerBarrier.png' },
    { id: 3, name: 'Exhaust', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerExhaust.png' },
    { id: 6, name: 'Ghost', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerHaste.png' },
    { id: 7, name: 'Heal', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerHeal.png' }
]

// Lista de campeões que usam runa de poke
const pokeChampions = ['Rumble', 'Jayce', 'Vayne', 'Quinn', 'Teemo', 'Heimerdinger']

// Estado atual
let currentChampion = null
let selectedSpells = []
let selectedRune = null

// Função para carregar a lista de campeões
function loadChampionsList() {
    try {
        if (!championsList) {
            console.warn('Elemento championsList não encontrado');
            return;
        }
        
        championsList.innerHTML = topChampions.map(champion => `
            <div class="champion-item" data-champion="${champion.name}" data-api-name="${champion.apiName}">
                <img src="https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${champion.apiName}.png" alt="${champion.name}" class="champion-image">
                <span class="champion-name">${champion.name}</span>
            </div>
        `).join('');

        // Adicionar eventos de clique
        document.querySelectorAll('.champion-item').forEach(item => {
            item.addEventListener('click', () => {
                try {
                    selectChampion(item.dataset.champion, item.dataset.apiName);
                } catch (error) {
                    console.error('Erro ao selecionar campeão:', error);
                    showNotification('Erro', 'Erro ao selecionar campeão', 'error');
                }
            });
        });
    } catch (error) {
        console.error('Erro ao carregar lista de campeões:', error);
        showNotification('Erro', 'Erro ao carregar lista de campeões', 'error');
    }
}

// Função para selecionar um campeão
async function selectChampion(champion, apiName) {
    currentChampion = champion
    
    // Atualizar UI
    document.querySelectorAll('.champion-item').forEach(item => {
        item.classList.remove('active')
        if (item.dataset.champion === champion) {
            item.classList.add('active')
        }
    })
    
    // Verificar se os elementos existem antes de definir seus valores
    if (championName) {
        championName.value = champion;
    } else {
        console.warn('Elemento championName não encontrado');
    }
    
    const imageUrl = `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${apiName}.png`;
    
    if (championImage) {
        championImage.value = imageUrl;
    } else {
        console.warn('Elemento championImage não encontrado');
    }
    
    // Atualizar a prévia da imagem
    const imagePreview = document.getElementById('championImagePreview');
    if (imagePreview) {
        imagePreview.src = imageUrl;
        imagePreview.style.display = 'block';
    }
    
    try {
        // Carregar dados do campeão
        const { data: matchups, error } = await supabase
            .from('champion_matchups')
            .select('*')
            .eq('champion_name', champion)
        
        if (error) throw error
        
        if (matchups && matchups.length > 0) {
            const matchup = matchups[0]
            
            // Verificar se o elemento description existe
            if (description) {
                description.value = matchup.description || '';
            }
            
            // Converter string de spells para array
            selectedSpells = matchup.spells ? matchup.spells.split(',').map(Number) : []
            selectedRune = matchup.runes || null
            
            // Atualizar seleção de runa
            if (selectedRune) {
                document.querySelectorAll('.rune-option').forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.runeId === selectedRune) {
                        option.classList.add('selected');
                    }
                });
            }
            
            // Atualizar seleção de dificuldade
            document.querySelectorAll('.difficulty-option').forEach(option => {
                option.classList.remove('active')
                if (option.dataset.difficulty === matchup.difficulty) {
                    option.classList.add('active')
                }
            })
        } else {
            // Limpar campos se não houver dados
            if (description) {
                description.value = '';
            }
            selectedSpells = []
            selectedRune = null
            
            // Limpar seleção de runas
            document.querySelectorAll('.rune-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            document.querySelectorAll('.difficulty-option').forEach(option => {
                option.classList.remove('active')
            })
        }
        
        updateSpellsUI()
    } catch (error) {
        console.error('Erro ao carregar dados do campeão:', error)
        // Em caso de erro, limpar os campos
        if (description) {
            description.value = '';
        }
        selectedSpells = []
        selectedRune = null
        
        // Limpar seleção de runas
        document.querySelectorAll('.rune-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.classList.remove('active')
        })
        updateSpellsUI()
    }
}

// Função para alternar seleção de spell
function toggleSpell(spellId) {
    const index = selectedSpells.indexOf(spellId)
    
    if (index > -1) {
        // Remover spell se já estiver selecionada
        selectedSpells.splice(index, 1)
    } else {
        // Adicionar spell se não estiver no limite de 2
        if (selectedSpells.length < 2) {
            selectedSpells.push(spellId)
        } else {
            // Substituir a primeira spell se já houver 2 selecionadas
            selectedSpells.shift()
            selectedSpells.push(spellId)
        }
    }
    
    updateSpellsUI()
}

// Função para atualizar UI das spells
function updateSpellsUI() {
    if (!spellsContainer) {
        console.warn('Elemento spellsContainer não encontrado');
        return;
    }
    
    spellsContainer.innerHTML = spells.map(spell => `
        <div class="spell-item ${selectedSpells.includes(spell.id) ? 'selected' : ''}" 
             data-spell-id="${spell.id}">
            <img class="spell-image" src="${spell.image}" alt="${spell.name}" loading="lazy">
            <span>${spell.name}</span>
        </div>
    `).join('');
    
    // Adicionar eventos de clique
    document.querySelectorAll('.spell-item').forEach(item => {
        item.addEventListener('click', () => {
            const spellId = parseInt(item.dataset.spellId);
            toggleSpell(spellId);
        });
    });
}

// Adicionar eventos de clique
document.querySelectorAll('.rune-image-container').forEach(container => {
    container.addEventListener('click', () => {
        const runeId = container.dataset.runeId;
        selectRune(runeId);
    });
});

// Função para selecionar uma runa
function selectRune(runeId) {
    // Remove a seleção de todas as runas
    document.querySelectorAll('.rune-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Adiciona a seleção à runa clicada
    const selectedRuneElement = document.querySelector(`.rune-option[data-rune-id="${runeId}"]`);
    if (selectedRuneElement) {
        selectedRuneElement.classList.add('selected');
    }

    // Armazena a runa selecionada na variável global
    selectedRune = runeId;
    console.log('Runa selecionada:', selectedRune);
}

// Adiciona eventos de clique às runas
document.querySelectorAll('.rune-option').forEach(option => {
    option.addEventListener('click', () => {
        const runeId = option.getAttribute('data-rune-id');
        selectRune(runeId);
    });
});

// Função para mostrar notificações
function showNotification(title, message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-close">×</div>
    `;
    
    container.appendChild(notification);
    
    // Forçar reflow para animação
    notification.offsetHeight;
    notification.classList.add('show');
    
    // Adicionar evento de fechar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.classList.contains('show')) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Função para salvar configuração
async function saveConfiguration() {
    if (!currentChampion) {
        showNotification('Atenção', 'Por favor, selecione um campeão primeiro!', 'error');
        return;
    }
    
    if (selectedSpells.length !== 2) {
        showNotification('Atenção', 'Por favor, selecione exatamente 2 spells!', 'error');
        return;
    }
    
    if (!selectedRune) {
        showNotification('Atenção', 'Por favor, selecione uma runa!', 'error');
        return;
    }
    
    const difficulty = document.querySelector('.difficulty-option.active')?.dataset.difficulty;
    if (!difficulty) {
        showNotification('Atenção', 'Por favor, selecione a dificuldade do matchup!', 'error');
        return;
    }
    
    // Dados do matchup para salvar (sem o campo champion_image)
    const matchupData = {
        champion_name: currentChampion,
        description: description.value,
        spells: selectedSpells.join(','),
        runes: selectedRune,
        difficulty: difficulty
    };
    
    console.log('Dados a serem salvos:', matchupData);
    
    try {
        saveButton.disabled = true;
        saveButton.textContent = 'Salvando...';
        
        const { error } = await supabase
            .from('champion_matchups')
            .upsert(matchupData, {
                onConflict: 'champion_name'
            });
        
        if (error) throw error;
        
        showNotification('Sucesso', `Configuração do ${currentChampion} salva com sucesso!`);
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showNotification('Erro', 'Erro ao salvar configuração. Tente novamente.', 'error');
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'Salvar Configuração';
    }
}

// Event Listeners
document.querySelectorAll('.difficulty-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-option').forEach(opt => opt.classList.remove('active'))
        option.classList.add('active')
    })
})

saveButton.addEventListener('click', saveConfiguration)

// Inicialização - único event listener para DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação primeiro
    if (!checkAdminAuth()) {
        return; // Redireciona se o usuário não for admin
    }
    
    // Se chegou aqui, o usuário é admin e pode acessar a página
    console.log('Acesso permitido para admin.');
    
    // Verificar se todos os elementos do DOM foram encontrados
    if (!checkElements()) {
        console.error('Alguns elementos necessários não foram encontrados. A aplicação pode não funcionar corretamente.');
        showNotification('Erro', 'Erro ao inicializar a aplicação. Verifique o console para mais detalhes.', 'error');
    }
    
    // Adicionar eventos de clique às runas
    document.querySelectorAll('.rune-option').forEach(option => {
        option.addEventListener('click', () => {
            const runeId = option.getAttribute('data-rune-id');
            selectRune(runeId);
        });
    });
    
    // Carregar campeões do localStorage
    loadChampionsFromLocalStorage();
    
    // Inicializar o Supabase apenas uma vez
    try {
        initializeSupabase();
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        showNotification('Erro', 'Erro ao conectar com o servidor', 'error');
    }
});

// Função para adicionar uma nova conta
function addNewAccount() {
    // Criar um modal para inserir os dados da conta
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Adicionar Nova Conta</h2>
            <div class="form-group">
                <label>Nome de Usuário</label>
                <input type="text" id="newUsername" placeholder="Ex: joao123" class="form-input">
            </div>
            <div class="form-group">
                <label>Senha</label>
                <input type="password" id="newPassword" placeholder="Digite a senha" class="form-input">
            </div>
            <div class="form-group">
                <label>Tipo de Conta</label>
                <select id="accountType" class="form-select">
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>
            <div class="modal-buttons">
                <button id="cancelAddAccount">Cancelar</button>
                <button id="confirmAddAccount">Adicionar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar eventos aos botões
    document.getElementById('cancelAddAccount').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('confirmAddAccount').addEventListener('click', async () => {
        const username = document.getElementById('newUsername').value.trim();
        const password = document.getElementById('newPassword').value;
        const accountType = document.getElementById('accountType').value;
        
        // Validações básicas
        if (!username || !password) {
            showNotification('Erro', 'Por favor, preencha todos os campos', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Erro', 'A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }
        
        try {
            // Verificar se o usuário já existe
            const { data: existingUsers, error: checkError } = await supabase
                .from('users')
                .select('username')
                .eq('username', username);
            
            if (checkError) throw checkError;
            
            if (existingUsers && existingUsers.length > 0) {
                showNotification('Erro', 'Este nome de usuário já está em uso', 'error');
                return;
            }
            
            // Adicionar o usuário ao banco de dados com a senha em texto puro
            const { error: insertError } = await supabase
                .from('users')
                .insert([
                    { 
                        username: username,
                        password: password, // Senha em texto puro, sem hash
                        role: accountType
                    }
                ]);
            
            if (insertError) throw insertError;
            
            // Fechar o modal
            modal.remove();
            
            // Mostrar notificação de sucesso
            showNotification('Sucesso', `Conta ${username} adicionada com sucesso!`);
            
        } catch (error) {
            console.error('Erro ao adicionar conta:', error);
            showNotification('Erro', 'Erro ao adicionar conta. Tente novamente.', 'error');
        }
    });
}

// Adiciona evento de clique ao botão de adicionar conta
const addAccountButton = document.getElementById('addAccountButton');
const addAccountContainer = document.querySelector('.add-account-button');

if (addAccountContainer) {
    addAccountContainer.addEventListener('click', addNewAccount);
}