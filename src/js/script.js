let SUPABASE_URL;
let SUPABASE_ANON_KEY;
let supabase;

// Função para inicializar o Supabase
async function initializeSupabase() {
    try {
        // Buscar as variáveis de ambiente do backend
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

        // Inicializar o cliente Supabase
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Cliente Supabase inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        showError('Erro ao conectar com o servidor');
    }
}

// Elementos do DOM
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const loginForm = document.getElementById('login-form');

// Função para mostrar mensagem de erro
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Função para fazer login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    if (!username || !password) {
        showError('Por favor, preencha todos os campos');
        return;
    }
    
    try {
        loginButton.classList.add('loading');
        loginButton.textContent = 'Entrando...';
        
        // Buscar usuário na tabela de usuários
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('*');
        
        if (userError) {
            console.error('Erro ao buscar usuários:', userError);
            throw new Error('Erro ao conectar com o servidor');
        }
        
        // Encontrar o usuário específico
        const userData = users.find(user => user.username === username);
        
        if (!userData) {
            throw new Error('Usuário não encontrado');
        }
        
        // Verificar senha
        if (userData.password !== password) {
            throw new Error('Senha incorreta');
        }
        
        // Login bem-sucedido
        const sessionToken = btoa(Date.now() + Math.random().toString(36).substr(2));
        const userSession = {
            token: sessionToken,
            user: userData,
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
        };
        
        localStorage.setItem('session', JSON.stringify(userSession));
        window.location.href = '/matchups';
    } catch (error) {
        console.error('Erro no login:', error);
        showError(error.message);
        loginButton.classList.remove('loading');
        loginButton.textContent = 'Entrar';
    }
}

// Event Listeners
loginForm.addEventListener('submit', handleLogin);

// Adicionar evento de tecla Enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLogin(e);
    }
});

// Verificar se já está autenticado
function checkAuth() {
    const session = localStorage.getItem('session');
    if (session) {
        const userSession = JSON.parse(session);
        if (userSession.expires > Date.now()) {
            window.location.href = '/matchups';
        } else {
            localStorage.removeItem('session');
        }
    }
}

// Inicializar o aplicativo
async function initializeApp() {
    await initializeSupabase();
    checkAuth();
}

// Iniciar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeApp);