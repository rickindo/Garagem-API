// js/ui.js

// --- Referências de Elementos ---
const garagemSection = document.getElementById('garage-section');
const addVehicleSection = document.getElementById('add-vehicle-section');
const detalhesSection = document.getElementById('detalhes-veiculo-section');
// Garante que a lista global de veículos existe
window.veiculos = window.veiculos || [];
const detalhesTituloElement = document.getElementById('detalhes-veiculo-titulo');
const agendamentoPlacaInput = document.getElementById('agendamento-veiculo-placa');
const listaHistoricoElement = document.getElementById('lista-historico');
const listaAgendamentosElement = document.getElementById('lista-agendamentos');
const listaGaragemElement1 = document.getElementById('lista-garagem');
const veiculoTipoSelect1 = document.getElementById('veiculo-tipo');

const camposCarro = document.getElementById('campos-carro');
const camposCarroEsportivo = document.getElementById('campos-carroesportivo');
const camposCaminhao = document.getElementById('campos-caminhao');

const detalhesExtrasApiElement = document.getElementById('detalhes-extras-api');
const btnVerDetalhesExtras = document.getElementById('btn-ver-detalhes-extras');
const previsaoTempoResultadoElement = document.getElementById('previsao-tempo-resultado');
const notificacoesContainer = document.getElementById('notificacoes-container');
const previsaoFiltrosContainer1 = document.getElementById('previsao-filtros');


// === INÍCIO ATIVIDADE B2.P1.A9: Novas funções de UI ===
function exibirVeiculosDestaque(veiculos) {
    const container = document.getElementById('cards-veiculos-destaque');
    if (!container) return;

    container.innerHTML = ''; // Limpa a mensagem "Carregando..."
    if (!veiculos || veiculos.length === 0) {
        container.innerHTML = '<p>Nenhum veículo em destaque no momento.</p>';
        return;
    }
    
    veiculos.forEach(veiculo => {
        const card = document.createElement('div');
        card.className = 'veiculo-card-destaque'; // Classe para estilização
        card.innerHTML = `
            <img src="${veiculo.imagemUrl}" alt="Foto do ${veiculo.modelo}">
            <div class="card-content">
                <h3>${veiculo.modelo} (${veiculo.ano})</h3>
                <p>${veiculo.destaque}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function exibirServicosGaragem(servicos) {
    const lista = document.getElementById('lista-servicos-oferecidos');
    if (!lista) return;

    lista.innerHTML = ''; // Limpa a mensagem "Carregando..."
    if (!servicos || servicos.length === 0) {
        lista.innerHTML = '<li>Nenhum serviço disponível no momento.</li>';
        return;
    }

    servicos.forEach(servico => {
        const item = document.createElement('li');
        item.innerHTML = `
            <strong>${servico.nome}</strong>
            <p>${servico.descricao}</p>
            <em>Preço Estimado: ${servico.precoEstimado}</em>
        `;
        lista.appendChild(item);
    });
}
// === FIM ATIVIDADE B2.P1.A9 ===

// --- Funções de UI para Veículos e Detalhes ---
function exibirVeiculos(veiculos) {
    if (!listaGaragemElement1) return;
    listaGaragemElement1.innerHTML = '';
    if (veiculos.length === 0) {
        listaGaragemElement1.innerHTML = '<p>Nenhum veículo na garagem.</p>';
        return;
    }
    veiculos.forEach(veiculo => {
        const li = document.createElement('li');
        li.innerHTML = `
            <p><strong>${veiculo.placa}</strong> - ${veiculo.modelo} (${veiculo.cor}) - <em>${veiculo.status}</em></p>
            <div class="botoes-container">
                <button class="btn-detalhes" data-placa="${veiculo.placa}">Detalhes / Interagir</button>
            </div>
        `;
        if (veiculo._tipoVeiculo) {
            li.classList.add(`veiculo-${veiculo._tipoVeiculo.toLowerCase()}`);
        }
        listaGaragemElement1.appendChild(li);
    });
}

function atualizarDetalhesInteracao(veiculo) {
    if (!veiculo) return;
    const statusElement = document.getElementById('detalhes-veiculo-status');
    if (statusElement) {
        statusElement.innerHTML = `
            <p><strong>Status:</strong> ${veiculo.status}</p>
            <p><strong>Ligado:</strong> ${veiculo.ligado ? 'Sim' : 'Não'}</p>
            <p><strong>Velocidade:</strong> ${veiculo.velocidade} km/h</p>
            ${veiculo instanceof CarroEsportivo ? `<p><strong>Turbo:</strong> ${veiculo.turboAtivado ? 'Ativado' : 'Desativado'}</p>` : ''}
            ${veiculo instanceof Caminhao ? `<p><strong>Carga:</strong> ${veiculo.cargaAtual}kg / ${veiculo.capacidadeCarga}kg</p>` : ''}
        `;
    }

    const btnLigar = document.getElementById('btn-detail-ligar');
    const btnDesligar = document.getElementById('btn-detail-desligar');
    const btnAcelerar = document.getElementById('btn-detail-acelerar');
    const btnBuzinar = document.getElementById('btn-detail-buzinar');
    if(btnLigar) btnLigar.disabled = veiculo.ligado;
    if(btnDesligar) btnDesligar.disabled = !veiculo.ligado || veiculo.velocidade > 0;
    if(btnAcelerar) btnAcelerar.disabled = !veiculo.ligado;
    if(btnBuzinar) btnBuzinar.disabled = !veiculo.ligado;

    const btnTurbo = document.getElementById('btn-detail-turbo');
    const btnCarregar = document.getElementById('btn-detail-carregar');
    const btnDescarregar = document.getElementById('btn-detail-descarregar');

    if (btnTurbo) {
        if (veiculo instanceof CarroEsportivo) {
            btnTurbo.style.display = 'inline-block';
            btnTurbo.textContent = veiculo.turboAtivado ? "Desativar Turbo" : "Ativar Turbo";
            btnTurbo.disabled = !veiculo.ligado;
        } else {
            btnTurbo.style.display = 'none';
        }
    }
    if (btnCarregar && btnDescarregar) {
        if (veiculo instanceof Caminhao) {
            btnCarregar.style.display = 'inline-block';
            btnDescarregar.style.display = 'inline-block';
            btnCarregar.disabled = veiculo.ligado;
            btnDescarregar.disabled = veiculo.ligado;
        } else {
            btnCarregar.style.display = 'none';
            btnDescarregar.style.display = 'none';
        }
    }
}

function exibirDetalhesCompletos(veiculo) {
    window.veiculoSelecionado = veiculo; // <-- Adicione esta linha

    if (!veiculo) return;
    if (detalhesTituloElement) detalhesTituloElement.textContent = `Detalhes - ${veiculo.placa} (${veiculo.modelo})`;
    if (agendamentoPlacaInput) agendamentoPlacaInput.value = veiculo.placa;
    if (detalhesExtrasApiElement) detalhesExtrasApiElement.innerHTML = '<p>Clique no botão "Ver Detalhes Extras" para carregar.</p>';
    if (btnVerDetalhesExtras) btnVerDetalhesExtras.dataset.placa = veiculo.placa;

    atualizarDetalhesInteracao(veiculo);

    if (listaHistoricoElement) listaHistoricoElement.innerHTML = '';
    if (listaAgendamentosElement) listaAgendamentosElement.innerHTML = '';
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let historicoCount = 0;
    let agendamentoCount = 0;
    if (veiculo.historicoManutencao && Array.isArray(veiculo.historicoManutencao)) {
        const manutencoesOrdenadas = [...veiculo.historicoManutencao].sort((a, b) => new Date(b.data) - new Date(a.data));
        manutencoesOrdenadas.forEach(manutencao => {
            if (!(manutencao instanceof Manutencao)) return;
            const li = document.createElement('li');
            li.textContent = manutencao.formatar();
            const dataManutencao = new Date(manutencao.data);
            dataManutencao.setHours(0,0,0,0);
            if (dataManutencao <= hoje) {
                if(listaHistoricoElement) listaHistoricoElement.appendChild(li);
                historicoCount++;
            } else {
                if(listaAgendamentosElement) listaAgendamentosElement.appendChild(li);
                agendamentoCount++;
            }
        });
    }
    if (listaHistoricoElement && historicoCount === 0) listaHistoricoElement.innerHTML = '<li>Nenhum histórico registrado.</li>';
    if (listaAgendamentosElement && agendamentoCount === 0) listaAgendamentosElement.innerHTML = '<li>Nenhum agendamento futuro.</li>';

    if(detalhesSection) detalhesSection.style.display = 'block';
    if(garagemSection) garagemSection.style.display = 'none';
    if(addVehicleSection) addVehicleSection.style.display = 'none';
}

function mostrarGaragemView() {
    if(garagemSection) garagemSection.style.display = 'block';
    if(detalhesSection) detalhesSection.style.display = 'none';
    if(addVehicleSection) addVehicleSection.style.display = 'block';
}

function exibirNotificacao(mensagem, tipo = 'info', duracao = 3000) {
    if (!notificacoesContainer) return;
    const notificacaoDiv = document.createElement('div');
    notificacaoDiv.className = `notificacao ${tipo}`;
    notificacaoDiv.textContent = mensagem;
    notificacoesContainer.appendChild(notificacaoDiv);
    setTimeout(() => {
        notificacaoDiv.remove();
    }, duracao);
}

function limparFormulario(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        if (formId === 'form-add-veiculo' && veiculoTipoSelect1) {
            veiculoTipoSelect1.value = "Carro";
            atualizarCamposEspecificos();
        }
    }
}

function atualizarCamposEspecificos() {
    if (!veiculoTipoSelect1 || !camposCarro || !camposCarroEsportivo || !camposCaminhao) return;
    const tipoSelecionado = veiculoTipoSelect1.value;
    camposCarro.style.display = (tipoSelecionado === 'Carro') ? 'block' : 'none';
    camposCarroEsportivo.style.display = (tipoSelecionado === 'CarroEsportivo') ? 'block' : 'none';
    camposCaminhao.style.display = (tipoSelecionado === 'Caminhao') ? 'block' : 'none';
}

function exibirDetalhesExtrasAPI(data) {
    if (!detalhesExtrasApiElement) return;
    if (data) {
        detalhesExtrasApiElement.innerHTML = `
            <p><strong>Valor FIPE:</strong> ${data.valorFipe || 'N/D'}</p>
            <p><strong>Recall Pendente:</strong> ${data.recallPendente || 'N/D'}</p>
            <p><strong>Dica Manutenção:</strong> ${data.dicaManutencao || 'N/D'}</p>
            <p><strong>Última Localização (Simulada):</strong> ${data.ultimaLocalizacao || 'N/D'}</p>
        `;
    } else {
        detalhesExtrasApiElement.innerHTML = '<p>Nenhum detalhe extra encontrado para esta placa na API simulada.</p>';
    }
}

function exibirErroPrevisao(mensagem) {
    if (!previsaoTempoResultadoElement) return;
    previsaoTempoResultadoElement.innerHTML = `<p class="notificacao erro" style="padding: 10px; color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; border-radius: 4px;">Falha: ${mensagem}</p>`;
}

function exibirLoading(element, message = "Carregando...") {
    if (element) {
        element.innerHTML = `<p><em>${message}</em></p>`;
    }
}

function exibirPrevisaoFiltrada(dadosFiltrados, periodo, nomeCidade) {
    if (!previsaoTempoResultadoElement) return;
    previsaoTempoResultadoElement.innerHTML = '';

    if (!dadosFiltrados || (Array.isArray(dadosFiltrados) && dadosFiltrados.length === 0)) {
        previsaoTempoResultadoElement.innerHTML = `<p>Nenhuma previsão disponível para "${periodo}" em ${nomeCidade}.</p>`;
        return;
    }

    let htmlConteudo = `<h3>Previsão para ${nomeCidade}</h3>`;

    if (periodo === 'hoje' || periodo === 'amanha') {
        const tituloDia = periodo === 'hoje' ? 'Hoje' : 'Amanhã';
        htmlConteudo += `<div class="dia-previsao"><h4>${tituloDia} (${new Date(dadosFiltrados[0]?.dt * 1000).toLocaleDateString('pt-BR')})</h4>`;
        if (dadosFiltrados.length === 0) {
             htmlConteudo += `<p>Nenhuma previsão para ${tituloDia.toLowerCase()} nas próximas horas.</p>`;
        } else {
            dadosFiltrados.forEach(item => {
                const dataHora = new Date(item.dt * 1000);
                const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                htmlConteudo += `
                    <div class="hora-previsao">
                        <strong>${horaFormatada}:</strong> Temp: ${item.main.temp.toFixed(1)}°C (Sens.: ${item.main.feels_like.toFixed(1)}°C),
                        ${item.weather[0].description} <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}" style="vertical-align: middle; width: 32px; height: 32px;">,
                        Vento: ${(item.wind.speed * 3.6).toFixed(1)} km/h
                    </div>
                `;
            });
        }
        htmlConteudo += `</div>`;
    } else if (periodo === '3dias') {
        dadosFiltrados.forEach((previsoesDoDia) => {
            if (previsoesDoDia.length > 0) {
                const primeiroItemDoDia = previsoesDoDia[0];
                const dataDia = new Date(primeiroItemDoDia.dt * 1000);
                const diaSemana = dataDia.toLocaleDateString('pt-BR', { weekday: 'long' });
                const dataFormatada = dataDia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                let tempMinDia = previsoesDoDia[0].main.temp_min;
                let tempMaxDia = previsoesDoDia[0].main.temp_max;
                let descricoes = {};
                let icones = {};
                let umidadeTotal = 0;
                let ventoTotal = 0;

                previsoesDoDia.forEach(p => {
                    if (p.main.temp_min < tempMinDia) tempMinDia = p.main.temp_min;
                    if (p.main.temp_max > tempMaxDia) tempMaxDia = p.main.temp_max;
                    descricoes[p.weather[0].description] = (descricoes[p.weather[0].description] || 0) + 1;
                    icones[p.weather[0].icon.replace('n', 'd')] = (icones[p.weather[0].icon.replace('n', 'd')] || 0) + 1;
                    umidadeTotal += p.main.humidity;
                    ventoTotal += p.wind.speed;
                });

                const descMaisFrequente = Object.keys(descricoes).length ? Object.keys(descricoes).reduce((a, b) => descricoes[a] > descricoes[b] ? a : b, "") : "N/D";
                const iconeMaisFrequente = Object.keys(icones).length ? Object.keys(icones).reduce((a, b) => icones[a] > icones[b] ? a : b, "01d") : "01d";
                const umidadeMedia = (umidadeTotal / previsoesDoDia.length).toFixed(0);
                const ventoMedioKmH = ((ventoTotal / previsoesDoDia.length) * 3.6).toFixed(1);

                htmlConteudo += `
                    <div class="dia-previsao">
                        <h4>${diaSemana}, ${dataFormatada}</h4>
                        <p><img src="http://openweathermap.org/img/wn/${iconeMaisFrequente}@2x.png" alt="${descMaisFrequente}" style="vertical-align: middle; width: 40px; height: 40px;"> ${descMaisFrequente}</p>
                        <p><strong>Mín/Máx:</strong> ${tempMinDia.toFixed(1)}°C / ${tempMaxDia.toFixed(1)}°C</p>
                        <p><strong>Umidade Média:</strong> ${umidadeMedia}%</p>
                        <p><strong>Vento Médio:</strong> ${ventoMedioKmH} km/h</p>
                    </div>
                `;
            }
        });
    }
    previsaoTempoResultadoElement.innerHTML = htmlConteudo;
}

function atualizarBotaoFiltroAtivo(periodoAtivo) {
    if (!previsaoFiltrosContainer1) return;
    const botoes = previsaoFiltrosContainer1.querySelectorAll('.btn-filtro-clima');
    botoes.forEach(botao => {
        if (botao.dataset.periodo === periodoAtivo) {
            botao.classList.add('active');
        } else {
            botao.classList.remove('active');
        }
    });
}

document.getElementById('btn-detail-editar').addEventListener('click', function() {
    window.editandoVeiculo = true;
// Intercepta o submit do formulário de veículo para editar ou criar
const formAddVeiculo = document.getElementById('form-add-veiculo');
if (formAddVeiculo) {
    formAddVeiculo.addEventListener('submit', function(event) {
        event.preventDefault();
        const tipo = document.getElementById('veiculo-tipo').value;
        const placa = document.getElementById('veiculo-placa').value.trim().toUpperCase();
        const modelo = document.getElementById('veiculo-modelo').value.trim();
        const cor = document.getElementById('veiculo-cor').value.trim();
        let portas = null, eixos = null, capacidade = null;
        if (tipo === 'Carro') portas = document.getElementById('carro-portas').value;
        if (tipo === 'CarroEsportivo') portas = document.getElementById('carroesportivo-portas').value;
        if (tipo === 'Caminhao') {
            eixos = document.getElementById('caminhao-eixos').value;
            capacidade = document.getElementById('caminhao-capacidade').value;
        }
        if (!placa || !modelo || !cor) {
            exibirNotificacao("Placa, modelo e cor são obrigatórios.", "error"); return;
        }
        if (window.editandoVeiculo && window.veiculoSelecionado) {
            // Atualiza o veículo existente
            let veiculo = window.veiculos.find(v => v.placa === window.veiculoSelecionado.placa);
            if (veiculo) {
                veiculo.modelo = modelo;
                veiculo.cor = cor;
                veiculo._tipoVeiculo = tipo;
                veiculo.placa = placa;
                if (tipo === 'Carro' || tipo === 'CarroEsportivo') veiculo.portas = portas;
                if (tipo === 'Caminhao') {
                    veiculo.eixos = eixos;
                    veiculo.capacidade = capacidade;
                }
                exibirNotificacao('Veículo atualizado com sucesso!', 'sucesso');
                exibirVeiculos(window.veiculos);
                mostrarGaragemView();
                limparFormulario('form-add-veiculo');
                window.editandoVeiculo = false;
                window.veiculoSelecionado = null;
                return;
            }
        }
        // Se não estiver editando, cria novo (fluxo padrão)
        if (window.veiculos.find(v => v.placa === placa)) {
            exibirNotificacao(`Placa ${placa} já existe.`, "error"); return;
        }
        let novoVeiculo = null;
        try {
            switch (tipo) {
                case 'Carro':
                    novoVeiculo = new Carro(placa, modelo, cor, portas);
                    break;
                case 'CarroEsportivo':
                    novoVeiculo = new CarroEsportivo(placa, modelo, cor, portas);
                    break;
                case 'Caminhao':
                    novoVeiculo = new Caminhao(placa, modelo, cor, eixos, capacidade);
                    break;
                default:
                    exibirNotificacao("Tipo de veículo inválido.", "error"); return;
            }
            window.veiculos.push(novoVeiculo);
            exibirNotificacao(`${tipo} ${placa} adicionado com sucesso!`, "success");
            exibirVeiculos(window.veiculos);
            mostrarGaragemView();
            limparFormulario('form-add-veiculo');
        } catch (error) {
            console.error("Erro ao criar veículo:", error);
            exibirNotificacao(`Erro ao adicionar: ${error.message}`, "error");
        }
    });
}
    // Abre o formulário de edição preenchido com os dados do veículo selecionado
    if (!window.veiculoSelecionado) {
        exibirNotificacao('Nenhum veículo selecionado para edição.', 'erro');
        return;
    }
    // Mostra a aba de adicionar/editar veículo
    if (typeof addVehicleSection !== 'undefined' && addVehicleSection) {
        addVehicleSection.style.display = 'block';
    }
    if (typeof detalhesSection !== 'undefined' && detalhesSection) {
        detalhesSection.style.display = 'none';
    }
    if (typeof garagemSection !== 'undefined' && garagemSection) {
        garagemSection.style.display = 'none';
    }
    // Preenche o formulário com os dados do veículo
    document.getElementById('veiculo-tipo').value = window.veiculoSelecionado._tipoVeiculo || '';
    document.getElementById('veiculo-placa').value = window.veiculoSelecionado.placa || '';
    document.getElementById('veiculo-modelo').value = window.veiculoSelecionado.modelo || '';
    document.getElementById('veiculo-cor').value = window.veiculoSelecionado.cor || '';
    // Campos específicos
    if (window.veiculoSelecionado._tipoVeiculo === 'Carro' && document.getElementById('carro-portas')) {
        document.getElementById('carro-portas').value = window.veiculoSelecionado.portas || '';
    }
    if (window.veiculoSelecionado._tipoVeiculo === 'CarroEsportivo' && document.getElementById('carroesportivo-portas')) {
        document.getElementById('carroesportivo-portas').value = window.veiculoSelecionado.portas || '';
    }
    if (window.veiculoSelecionado._tipoVeiculo === 'Caminhao') {
        if (document.getElementById('caminhao-eixos')) document.getElementById('caminhao-eixos').value = window.veiculoSelecionado.eixos || '';
        if (document.getElementById('caminhao-capacidade')) document.getElementById('caminhao-capacidade').value = window.veiculoSelecionado.capacidade || '';
    }
    atualizarCamposEspecificos();
    exibirNotificacao('Edite os dados e salve para atualizar o veículo.', 'info');
});

document.getElementById('btn-detail-excluir').addEventListener('click', function() {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
        // Debug: mostra o estado das variáveis
        console.log('Veiculos:', window.veiculos);
        console.log('Selecionado:', window.veiculoSelecionado);
        if (window.veiculos && window.veiculoSelecionado) {
            window.veiculos = window.veiculos.filter(v => v.placa !== window.veiculoSelecionado.placa);
            if (typeof mostrarGaragemView === 'function') {
                mostrarGaragemView();
            }
            // Atualiza a lista na tela
            if (typeof exibirVeiculos === 'function') {
                exibirVeiculos(window.veiculos);
            }
            document.getElementById('detalhes-veiculo-section').style.display = 'none';
            exibirNotificacao('Veículo excluído com sucesso!', 'sucesso');
        } else {
            exibirNotificacao('Erro ao excluir: veículo não encontrado.', 'erro');
        }
    }
});