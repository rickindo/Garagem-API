// UI Manager
class UI {
    constructor() {
        // Cache dos elementos do DOM
        this.notificationsContainer = document.getElementById('notifications');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');

        // Inicialização
        this.init();
    }

    // Inicializa os event listeners
    init() {
        // Formulário de Login
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
            this.setupPasswordToggle(this.loginForm);
        }

        // Formulário de Registro
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', this.handleRegister.bind(this));
            this.setupPasswordToggle(this.registerForm);
            this.setupPasswordStrengthMeter(this.registerForm);
        }
    }

    // Manipula o envio do formulário de login
    async handleLogin(e) {
        e.preventDefault();
        const email = this.loginForm.email.value;
        const password = this.loginForm.password.value;

        try {
            await auth.login({ email, password });
            this.showNotification('Login realizado com sucesso!', 'success');
            window.location.href = '/index.html';
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // Manipula o envio do formulário de registro
    showPasswordRequirements() {
        const requirements = [
            'Mínimo de 8 caracteres',
            'Pelo menos uma letra maiúscula',
            'Pelo menos uma letra minúscula',
            'Pelo menos um número',
            'Pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)'
        ];
        this.showNotification(
            'Requisitos da senha:\n' + requirements.map(req => '- ' + req).join('\n'),
            'info'
        );
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = this.registerForm.name.value;
        const email = this.registerForm.email.value;
        const password = this.registerForm.password.value;
        const confirmPassword = this.registerForm.confirmPassword.value;

        // Validações
        if (password !== confirmPassword) {
            this.showNotification('As senhas não coincidem', 'error');
            return;
        }

        if (!this.validatePassword(password)) {
            this.showNotification('A senha não atende aos requisitos mínimos', 'error');
            return;
        }

        try {
            await auth.register({ name, email, password });
            this.showNotification('Conta criada com sucesso!', 'success');
            window.location.href = '/index.html';
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // Configura o toggle de visualização da senha
    setupPasswordToggle(form) {
        const toggleButtons = form.querySelectorAll('.toggle-password');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;

                // Atualiza o ícone
                const path = button.querySelector('path');
                if (type === 'text') {
                    path.setAttribute('d', 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z');
                } else {
                    path.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
                }
            });
        });
    }

    // Configura o medidor de força da senha
    setupPasswordStrengthMeter(form) {
        const passwordInput = form.querySelector('#password');
        const meter = form.querySelector('.strength-meter');
        const text = form.querySelector('.strength-text');

        // Mostra os requisitos quando o usuário clica no campo
        passwordInput.addEventListener('focus', () => this.showPasswordRequirements());

        passwordInput.addEventListener('input', () => {
            const strength = this.checkPasswordStrength(passwordInput.value);
            meter.style.width = strength.percentage + '%';
            meter.style.backgroundColor = strength.color;
            text.textContent = strength.message;
            text.style.color = strength.color;
        });
    }

    // Verifica a força da senha
    checkPasswordStrength(password) {
        let strength = {
            percentage: 0,
            message: 'Muito fraca',
            color: '#d93025'
        };

        if (password.length === 0) {
            return strength;
        }

        let score = 0;
        
        // Comprimento mínimo
        if (password.length >= 8) score += 25;
        
        // Letras maiúsculas e minúsculas
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
        
        // Pelo menos um número
        if (/\d/.test(password)) score += 25;
        
        // Caracteres especiais
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 25;

        // Define a força com base na pontuação
        if (score >= 100) {
            strength = {
                percentage: 100,
                message: 'Muito forte',
                color: '#0f9d58'
            };
        } else if (score >= 75) {
            strength = {
                percentage: 75,
                message: 'Forte',
                color: '#4caf50'
            };
        } else if (score >= 50) {
            strength = {
                percentage: 50,
                message: 'Média',
                color: '#fb8c00'
            };
        } else if (score >= 25) {
            strength = {
                percentage: 25,
                message: 'Fraca',
                color: '#f4511e'
            };
        }

        return strength;
    }

    // Valida a senha de acordo com os requisitos
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return (
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumbers &&
            hasSpecialChar
        );
    }

    // Exibe uma notificação
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Ícone da notificação
        const icon = document.createElement('div');
        icon.className = 'notification-icon';
        icon.innerHTML = type === 'error' 
            ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';

        // Mensagem
        const messageElement = document.createElement('span');
        messageElement.textContent = message;

        // Botão de fechar
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
        closeButton.addEventListener('click', () => this.removeNotification(notification));

        // Monta a notificação
        notification.appendChild(icon);
        notification.appendChild(messageElement);
        notification.appendChild(closeButton);

        // Adiciona ao container
        this.notificationsContainer.appendChild(notification);

        // Adiciona a classe show após um pequeno delay para ativar a animação
        requestAnimationFrame(() => notification.classList.add('show'));

        // Remove automaticamente após 5 segundos
        setTimeout(() => this.removeNotification(notification), 5000);
    }

    // Remove uma notificação
    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }
}

// Exporta uma única instância do UI
const ui = new UI();
export default ui;