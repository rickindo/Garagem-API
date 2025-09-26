// Importa as dependências
import auth from './middleware/auth.js';
import ui from './ui.js';

// Event Listeners para páginas específicas
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    // Página de login
    if (currentPath.includes('login.html')) {
        setupLoginPage();
    }
    // Página de registro
    else if (currentPath.includes('register.html')) {
        setupRegisterPage();
    }
    // Outras páginas
    else {
        checkAuthStatus();
    }
});

// Configuração da página de login
function setupLoginPage() {
    // Se já estiver autenticado, redireciona para a página inicial
    if (auth.checkAuth()) {
        window.location.href = 'index.html';
        return;
    }

    // Configuração do formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = loginForm.email.value;
            const password = loginForm.password.value;

            try {
                // Tenta realizar o login
                await auth.login({ email, password });
                ui.showNotification('Login realizado com sucesso!', 'success');
                window.location.href = 'index.html';
            } catch (error) {
                ui.showNotification(error.message || 'Erro ao realizar login', 'error');
            }
        });
    }
}

// Configuração da página de registro
function setupRegisterPage() {
    // Se já estiver autenticado, redireciona para a página inicial
    if (auth.checkAuth()) {
        window.location.href = '/index.html';
        return;
    }

    // Configuração do formulário de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = registerForm.name.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm.confirmPassword.value;

            // Validações básicas
            if (!name || !email || !password || !confirmPassword) {
                ui.showNotification('Todos os campos são obrigatórios', 'error');
                return;
            }

            if (password !== confirmPassword) {
                ui.showNotification('As senhas não coincidem', 'error');
                return;
            }

            try {
                // Tenta realizar o registro
                const result = await auth.register({ name, email, password });
                if (result && result.token) {
                    ui.showNotification('Conta criada com sucesso!', 'success');
                    // Força o redirecionamento caso o automático não funcione
                    setTimeout(() => {
                        if (window.location.pathname.includes('register.html')) {
                            window.location.href = 'index.html';
                        }
                    }, 500);
                }
            } catch (error) {
                ui.showNotification(error.message || 'Erro ao criar conta', 'error');
            }
        });
    }
}

// Verifica o status de autenticação
function checkAuthStatus() {
    if (!auth.checkAuth()) {
        // Se não estiver autenticado e não estiver em uma página de autenticação,
        // redireciona para a página de login
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
            window.location.href = '/login.html';
        }
    }
}

// Expõe funções úteis globalmente
window.auth = {
    logout: () => {
        auth.logout();
        ui.showNotification('Logout realizado com sucesso!', 'success');
    }
};