// Função para adicionar um veículo com imagem
async function adicionarVeiculo(event) {
    event.preventDefault();
    
    const formData = new FormData();
    
    // Adiciona os campos do formulário ao FormData
    formData.append('tipo', document.getElementById('veiculo-tipo').value);
    formData.append('placa', document.getElementById('veiculo-placa').value);
    formData.append('modelo', document.getElementById('veiculo-modelo').value);
    formData.append('cor', document.getElementById('veiculo-cor').value);
    
    // Adiciona a imagem se uma foi selecionada
    const imagemInput = document.getElementById('veiculo-imagem');
    if (imagemInput.files[0]) {
        formData.append('imagem', imagemInput.files[0]);
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/veiculos', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Não incluir Content-Type, o navegador vai configurar automaticamente para multipart/form-data
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar veículo');
        }

        const veiculo = await response.json();
        atualizarListaVeiculos(); // Função que você já deve ter para atualizar a lista
        limparFormulario();

        // Mostra mensagem de sucesso
        showNotification('Veículo adicionado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao adicionar veículo!', 'error');
    }
}

// Função para exibir os veículos com suas imagens
function renderizarVeiculo(veiculo) {
    const li = document.createElement('li');
    
    // Container flex para a imagem e informações
    li.className = 'veiculo-item';
    li.innerHTML = `
        <div class="veiculo-imagem">
            ${veiculo.imageUrl 
                ? `<img src="${veiculo.imageUrl}" alt="Foto do ${veiculo.modelo}" onerror="this.src='placeholder.png'">`
                : '<div class="sem-imagem">Sem imagem</div>'
            }
        </div>
        <div class="veiculo-info">
            <h3>${veiculo.modelo}</h3>
            <p>Placa: ${veiculo.placa}</p>
            <p>Cor: ${veiculo.cor}</p>
        </div>
        <div class="veiculo-acoes">
            <button onclick="verDetalhes('${veiculo._id}')" class="btn-detalhes">Ver Detalhes</button>
            <button onclick="excluirVeiculo('${veiculo._id}')" class="btn-excluir">Excluir</button>
        </div>
    `;
    
    return li;
}

// Função para limpar o formulário após adicionar um veículo
function limparFormulario() {
    document.getElementById('form-veiculo').reset();
}

// Adiciona os event listeners quando o documento carrega
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-veiculo');
    if (form) {
        form.addEventListener('submit', adicionarVeiculo);
    }
});