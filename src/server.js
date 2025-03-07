const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { supabase } = require('./supabase');

// Carregar variáveis de ambiente
dotenv.config();

// Verificar se as variáveis foram carregadas
console.log('Verificando variáveis de ambiente:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Presente' : 'Ausente');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Presente' : 'Ausente');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Servir arquivos estáticos das pastas html, css, js e assets
app.use(express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Rota para fornecer variáveis de ambiente
app.get('/env', (req, res) => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('Variáveis de ambiente não encontradas!');
        return res.status(500).json({ error: 'Variáveis de ambiente não configuradas' });
    }
    
    res.json({
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    });
});

// Rota principal que serve o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Rota para a página de matchups
app.get('/matchups', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'matchups.html'));
});

// Rota para a página de admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'admin.html'));
});

// Rota para buscar matchup de um campeão específico
app.get('/api/matchups/:championName', async (req, res) => {
    try {
        const { championName } = req.params;
        
        console.log('Buscando matchup para:', championName);
        
        // Modificado para não usar .single() e lidar com arrays vazios
        const { data, error } = await supabase
            .from('champion_matchups')
            .select('*')
            .eq('champion_name', championName);

        if (error) {
            console.error('Erro ao buscar matchup:', error);
            return res.status(500).json({ error: 'Erro ao buscar matchup' });
        }

        // Verificar se encontrou algum resultado
        if (!data || data.length === 0) {
            console.log('Matchup não encontrado para:', championName);
            // Retornar um objeto vazio com campos padrão em vez de erro 404
            return res.json({
                champion_name: championName,
                description: '',
                spells: '',
                difficulty: '',
                runes: ''
            });
        }

        // Pegar o primeiro resultado (deve ser único por champion_name)
        const matchup = data[0];

        // Garantir que os campos estejam no formato correto antes de enviar
        const formattedMatchup = {
            ...matchup,
            spells: matchup.spells || '',
            description: matchup.description || '',
            difficulty: matchup.difficulty || '',
            runes: matchup.runes || ''
        };

        console.log('Matchup encontrado e formatado:', formattedMatchup);
        res.json(formattedMatchup);
    } catch (error) {
        console.error('Erro na rota /api/matchups/:championName:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
}); 