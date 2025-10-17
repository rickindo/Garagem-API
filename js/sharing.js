// js/sharing.js

const API_URL = 'http://localhost:3000';

// Função para compartilhar um veículo com outro usuário
export async function shareVehicle(vehicleId, userEmail) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${API_URL}/api/veiculos/${vehicleId}/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email: userEmail })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao compartilhar veículo');
        }

        showNotification('Veículo compartilhado com sucesso!', 'success');
        return data;
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}

// Função para adicionar um ícone de compartilhamento aos cards de veículos
export function addSharingButtons() {
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    vehicleCards.forEach(card => {
        const ownerId = card.dataset.ownerId;
        
        // Só adiciona o botão de compartilhamento se o usuário for o dono
        if (ownerId === currentUser.id) {
            const shareButton = document.createElement('button');
            shareButton.className = 'share-button';
            shareButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
                </svg>
                Compartilhar
            `;
            
            shareButton.addEventListener('click', (e) => {
                e.preventDefault();
                const vehicleId = card.dataset.id;
                showSharingDialog(vehicleId);
            });

            card.querySelector('.card-actions').appendChild(shareButton);
        }

        // Adiciona indicador visual se o veículo for compartilhado
        if (ownerId !== currentUser.id) {
            const sharedBadge = document.createElement('div');
            sharedBadge.className = 'shared-badge';
            sharedBadge.textContent = `Compartilhado por: ${card.dataset.ownerEmail}`;
            card.querySelector('.card-header').appendChild(sharedBadge);
        }
    });
}

// Função para mostrar o diálogo de compartilhamento
function showSharingDialog(vehicleId) {
    const dialog = document.createElement('div');
    dialog.className = 'sharing-dialog';
    dialog.innerHTML = `
        <div class="sharing-dialog-content">
            <h3>Compartilhar Veículo</h3>
            <form id="sharingForm">
                <div class="form-group">
                    <label for="shareEmail">Email do usuário:</label>
                    <input type="email" id="shareEmail" required placeholder="email@exemplo.com">
                </div>
                <div class="dialog-buttons">
                    <button type="button" class="btn-secondary" onclick="this.closest('.sharing-dialog').remove()">Cancelar</button>
                    <button type="submit" class="btn-primary">Compartilhar</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(dialog);

    dialog.querySelector('#sharingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = dialog.querySelector('#shareEmail').value;
        
        try {
            await shareVehicle(vehicleId, email);
            dialog.remove();
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
        }
    });
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Adiciona os estilos necessários
const styles = `
    .sharing-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .sharing-dialog-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        width: 90%;
    }

    .shared-badge {
        background: #e2e8f0;
        color: #4a5568;
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        margin-top: 0.5rem;
    }

    .share-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
    }

    .share-button:hover {
        background: #f7fafc;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);