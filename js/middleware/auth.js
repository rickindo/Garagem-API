/**
 * Módulo de autenticação do front-end
 */
const auth = {
    token: null,
    user: null,

    /**
     * Inicializa o estado de autenticação
     */
    init() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        return this.checkAuth();
    },

    /**
     * Registra um novo usuário
     * @param {Object} userData - Dados do usuário (name, email, password)
     */
    async register(userData) {
        try {
            const response = await fetch('https://garagem-api-five.vercel.app/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erro no registro');
            }

            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            return { success: true, data };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Faz login do usuário
     * @param {Object} credentials - Credenciais (email, password)
     */
    async login(credentials) {
        try {
            const response = await fetch('https://garagem-api-five.vercel.app/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erro no login');
            }

            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            return { success: true, data };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Verifica se o usuário está autenticado
     */
    checkAuth() {
        const isAuthenticated = !!this.token;
        
        if (!isAuthenticated) {
            this.redirectToLogin();
            return false;
        }
        
        return true;
    },

    /**
     * Redireciona para a página de login
     */
    redirectToLogin() {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
            window.location.href = 'login.html';
        }
    },

    /**
     * Faz logout do usuário
     */
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.redirectToLogin();
    },

    /**
     * Obtém os dados do usuário
     */
    getUser() {
        return this.user;
    },

    /**
     * Obtém o token do usuário
     */
    getToken() {
        return this.token;
    }
};

// Inicializa o auth quando o módulo é carregado
auth.init();

// Exporta o módulo
export default auth;