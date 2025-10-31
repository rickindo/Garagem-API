document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = form.email.value.trim();
            const password = form.password.value;

            // Validação básica
            if (!email || !password) {
                showNotification('Todos os campos são obrigatórios', 'error');
                return;
            }

            try {
                // Requisição para o seu backend Garagem-API
                const response = await fetch('http://localhost:3000/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error('Erro na resposta:', data);
                    throw new Error(data.message || 'Erro ao fazer login');
                }

                console.log('Resposta do servidor:', data);

                // Salva os dados do usuário (token e informações) no localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showNotification('Login realizado com sucesso!', 'success');

                // Aguarda 1 segundo antes de redirecionar para a página inicial
                console.log('Aguardando redirecionamento...');
                await new Promise(resolve => setTimeout(resolve, 1000));

                console.log('Redirecionando para index.html');
                window.location.href = 'index.html';

            } catch (error) {
                showNotification(error.message, 'error');
            }
        });

        // Configura o toggle de visualização da senha usando a função comum
        setupPasswordVisibilityToggle(form);
    }
});