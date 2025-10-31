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
                // Requisição para o seu backend Garagem-API
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

                // Salva os dados do usuário (token e informações) no localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showNotification('Conta criada com sucesso!', 'success');

                // Aguarda 2 segundos antes de redirecionar para a página inicial
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
                } else if (password.length > 0) {
                    message = 'Muito fraca';
                } else {
                    message = '';
                }

                meter.style.width = strength + '%';
                meter.style.backgroundColor = color;
                text.textContent = message;
                text.style.color = color;
            });
        }

        // Configura o toggle de visualização da senha usando a função comum
        setupPasswordVisibilityToggle(form);
    }
});