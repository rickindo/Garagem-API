// Middleware de autenticação
class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.token = null;
        this.user = null;
        this.init();
    }

    // Inicializa o estado de autenticação
    init() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        this.isAuthenticated = !!this.token;
    }

    // Registra um novo usuário
    async register(userData) {
        try {
            // Salvar no banco de dados usando a API
            const response = await fetch('https://garagem-api-five.vercel.app/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro no registro');
            }

            const data = await response.json();
            this.setAuthData(data);
            
            // Aguarda um momento para garantir que os dados foram salvos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    // Realiza o login do usuário
    async login(credentials) {
        try {
            const response = await fetch('https://garagem-api-five.vercel.app/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro no login');
            }

            const data = await response.json();
            this.setAuthData(data);
            return data;
        } catch (error) {
            throw error;
        }
    }

    // Realiza o logout do usuário
    logout() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }

    // Define os dados de autenticação
    setAuthData(data) {
        this.token = data.token;
        this.user = data.user;
        this.isAuthenticated = true;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }

    // Verifica se o usuário está autenticado
    checkAuth() {
        if (!this.isAuthenticated) {
            const currentPath = window.location.pathname;
            if (currentPath !== '/login.html' && currentPath !== '/register.html') {
                window.location.href = '/login.html';
            }
            return false;
        }
        return true;
    }

    // Obtém o token de autenticação
    getToken() {
        return this.token;
    }

    // Obtém os dados do usuário
    getUser() {
        return this.user;
    }

    // Atualiza os dados do usuário
    updateUser(userData) {
        this.user = { ...this.user, ...userData };
        localStorage.setItem('user', JSON.stringify(this.user));
    }

    // Verifica se o usuário tem uma determinada permissão
    hasPermission(permission) {
        return this.user && this.user.permissions && this.user.permissions.includes(permission);
    }
}

// Exporta uma única instância do Auth
const auth = new Auth();
export default auth;