// Função para mostrar notificações
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = document.createElement('div');
    icon.className = 'notification-icon';
    icon.innerHTML = type === 'error' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';

    const messageElement = document.createElement('span');
    messageElement.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    closeButton.onclick = () => notification.remove();

    notification.appendChild(icon);
    notification.appendChild(messageElement);
    notification.appendChild(closeButton);
    container.appendChild(notification);

    setTimeout(() => notification.remove(), 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const password = form.password.value;
            const confirmPassword = form.confirmPassword.value;

            // Validação básica
            if (!name || !email || !password || !confirmPassword) {
                showNotification('Todos os campos são obrigatórios', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('As senhas não coincidem', 'error');
                return;
            }

            // Validação da senha
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                showNotification(
                    'A senha deve ter:\n' +
                    '- No mínimo 8 caracteres\n' +
                    '- Uma letra maiúscula\n' +
                    '- Uma letra minúscula\n' +
                    '- Um número\n' +
                    '- Um caractere especial (@$!%*?&)',
                    'error'
                );
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error('Erro na resposta:', data);
                    throw new Error(data.message || 'Erro ao criar conta');
                }

                console.log('Resposta do servidor:', data);

                // Salva os dados do usuário
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showNotification('Conta criada com sucesso!', 'success');
                
                // Aguarda 2 segundos antes de redirecionar
                console.log('Aguardando redirecionamento...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                console.log('Redirecionando para index.html');
                window.location.href = 'index.html';

            } catch (error) {
                showNotification(error.message, 'error');
            }
        });

        // Configuração do medidor de força da senha
        const passwordInput = form.querySelector('#password');
        const meter = form.querySelector('.strength-meter');
        const text = form.querySelector('.strength-text');

        if (passwordInput && meter && text) {
            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                let strength = 0;
                let message = '';
                let color = '#d93025';

                if (password.length >= 8) strength += 25;
                if (/[A-Z]/.test(password)) strength += 25;
                if (/[a-z]/.test(password)) strength += 25;
                if (/[0-9]/.test(password)) strength += 12.5;
                if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;

                if (strength >= 100) {
                    message = 'Muito forte';
                    color = '#0f9d58';
                } else if (strength >= 75) {
                    message = 'Forte';
                    color = '#4caf50';
                } else if (strength >= 50) {
                    message = 'Média';
                    color = '#fb8c00';
                } else if (strength >= 25) {
                    message = 'Fraca';
                    color = '#f4511e';
                } else {
                    message = 'Muito fraca';
                }

                meter.style.width = strength + '%';
                meter.style.backgroundColor = color;
                text.textContent = message;
                text.style.color = color;
            });
        }

        // Toggle de visualização da senha
        const toggleButtons = form.querySelectorAll('.toggle-password');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;

                const path = button.querySelector('path');
                if (type === 'text') {
                    path.setAttribute('d', 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z');
                } else {
                    path.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
                }
            });
        });
    }
});