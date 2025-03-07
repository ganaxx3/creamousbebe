// Lista de campeões do top lane (mesma lista do admin.js)
const topChampions = [
    { name: 'Aatrox', apiName: 'Aatrox' },
    { name: 'Akali', apiName: 'Akali' },
    { name: 'Camille', apiName: 'Camille' },
    { name: 'Cho\'Gath', apiName: 'Chogath' },
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

// Lista de spells disponíveis
const spells = [
    { id: 4, name: 'Flash', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerFlash.png' },
    { id: 14, name: 'Ignite', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerDot.png' },
    { id: 12, name: 'Teleport', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerTeleport.png' },
    { id: 21, name: 'Barrier', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerBarrier.png' },
    { id: 3, name: 'Exhaust', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerExhaust.png' },
    { id: 6, name: 'Ghost', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerHaste.png' },
    { id: 7, name: 'Heal', image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/SummonerHeal.png' }
];

// Elementos do DOM
const championsGrid = document.querySelector('.champions-grid');
const matchupDetails = document.getElementById('matchupDetails');
const logoutButton = document.getElementById('logoutButton');

// Função para mostrar mensagem de erro
function showError(message) {
    if (championsGrid) {
        championsGrid.innerHTML = `<p class="error-message">${message}</p>`;
    }
}

// Função para carregar a grade de campeões
function loadChampionsGrid() {
    if (!championsGrid) {
        console.error('Container de campeões não encontrado');
        return;
    }

    championsGrid.innerHTML = topChampions.map(champion => `
        <div class="champion-card" data-champion="${champion.name}">
            <img src="https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${champion.apiName}.png" 
                 alt="${champion.name}" 
                 loading="lazy">
            <div class="champion-name">${champion.name}</div>
        </div>
    `).join('');

    // Adicionar eventos de clique
    document.querySelectorAll('.champion-card').forEach(card => {
        card.addEventListener('click', async () => {
            const championName = card.dataset.champion;
            // Encontrar o apiName correspondente ao nome do campeão
            const champion = topChampions.find(c => c.name === championName);
            if (champion) {
                await loadMatchupDetails(champion.apiName);
            } else {
                console.error('Campeão não encontrado:', championName);
                showError('Erro ao carregar os detalhes do matchup.');
            }
        });
    });
}

// Função para carregar detalhes do matchup
async function loadMatchupDetails(championName) {
    try {
        console.log('Buscando matchup para:', championName);
        
        // Adicionar log para depuração
        console.log('URL da API:', `/.netlify/functions/api/matchups/${encodeURIComponent(championName)}`);
        
        const response = await fetch(`/.netlify/functions/api/matchups/${encodeURIComponent(championName)}`);
        console.log('Status da resposta:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta de erro da API:', errorText);
            throw new Error(`Erro ao buscar matchup: ${response.status} ${response.statusText}`);
        }

        const matchup = await response.json();
        console.log('Dados do matchup recebidos:', matchup);
        
        // Mesmo que o servidor retorne um objeto vazio, vamos continuar e exibir os dados disponíveis
        // Atualizar título
        const championTitle = document.querySelector('.champion-title');
        if (championTitle) {
            championTitle.textContent = championName;
        }

        // Atualizar descrição
        const description = document.querySelector('.description');
        if (description) {
            if (matchup.description && matchup.description.trim() !== '') {
                description.textContent = matchup.description;
            } else {
                description.textContent = 'Nenhuma descrição disponível.';
            }
        }

        // Atualizar spells
        const spellsContainer = document.querySelector('.spells-container');
        if (spellsContainer) {
            // Verificar se spells existe e não está vazio
            if (matchup.spells && matchup.spells.trim() !== '') {
                const selectedSpells = matchup.spells.split(',').map(Number);
                const validSpells = selectedSpells.filter(spellId => {
                    return spells.some(s => s.id === spellId);
                });
                
                if (validSpells.length > 0) {
                    spellsContainer.innerHTML = validSpells.map(spellId => {
                        const spell = spells.find(s => s.id === spellId);
                        if (!spell) return '';
                        return `
                            <div class="spell-item">
                                <img src="${spell.image}" alt="${spell.name}" class="spell-image">
                                <span class="spell-name">${spell.name}</span>
                            </div>
                        `;
                    }).join('');
                } else {
                    spellsContainer.innerHTML = '<p>Nenhuma spell definida</p>';
                }
            } else {
                spellsContainer.innerHTML = '<p>Nenhuma spell definida</p>';
            }
        }

        // Atualizar dificuldade
        const difficulty = document.querySelector('.difficulty');
        if (difficulty) {
            if (matchup.difficulty && matchup.difficulty.trim() !== '') {
                difficulty.textContent = matchup.difficulty;
            } else {
                difficulty.textContent = 'Não definida';
            }
        }

        // Atualizar runas
        const runesContainer = document.querySelector('.runes-container');
        if (runesContainer) {
            if (matchup.runes && matchup.runes.trim() !== '') {
                // Verificar se a imagem da runa existe
                // Adicionar o prefixo 'runa_' ao nome da imagem
                const runeImageName = `runa_${matchup.runes}`;
                const runeImage = new Image();
                runeImage.src = `/assets/runes/${runeImageName}.png`;
                
                runeImage.onload = function() {
                    // A imagem existe, exibir normalmente
                    runesContainer.innerHTML = `
                        <img src="/assets/runes/${runeImageName}.png" alt="${matchup.runes}" class="rune-image">
                    `;
                };
                
                runeImage.onerror = function() {
                    // A imagem não existe, mostrar mensagem
                    runesContainer.innerHTML = '<p>Imagem da runa não encontrada</p>';
                    console.error(`Imagem da runa não encontrada: /assets/runes/${runeImageName}.png`);
                };
            } else {
                runesContainer.innerHTML = '<p>Nenhuma runa definida</p>';
            }
        }

        // Mostrar detalhes e rolar até eles
        if (matchupDetails) {
            matchupDetails.style.display = 'block';
            matchupDetails.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes do matchup:', error);
        console.error('Mensagem de erro:', error.message);
        console.error('Stack trace:', error.stack);
        showError('Erro ao carregar os detalhes do matchup. Por favor, tente novamente.');
    }
}

// Event Listeners
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('session');
        window.location.href = '/';
    });
}

// Inicializar o aplicativo
function initializeApp() {
    try {
        loadChampionsGrid();
    } catch (error) {
        console.error('Erro ao inicializar o aplicativo:', error);
        showError('Erro ao inicializar o aplicativo. Por favor, tente novamente.');
    }
}

// Iniciar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeApp);