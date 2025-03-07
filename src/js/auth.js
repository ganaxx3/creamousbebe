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

// Função para verificar se o usuário tem permissão de admin
function checkAdminAuth() {
    const session = checkAuth();
    if (!session) return false;

    if (session.user.role !== 'admin') {
        window.location.href = '/matchups';
        return false;
    }

    return true;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('session');
    window.location.href = '/';
}

// Adicionar eventos após o carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    const session = checkAuth();
    if (!session) return;

    // Verificar se o usuário é admin para mostrar o botão "Config"
    const configButton = document.getElementById('configButton');
    if (session.user.role === 'admin' && configButton) {
        configButton.style.display = 'inline-block';
        configButton.addEventListener('click', () => {
            window.location.href = '/admin.html';
        });
    }

    // Adicionar evento de logout ao botão
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});