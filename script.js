document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000';
    const navContainer = document.getElementById('main-nav');
    const uploadSection = document.getElementById('upload-section');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const datasetListContainer = document.getElementById('dataset-list-container');

    // AUTENTICAÇÃO
    function setupAuthUI() {
        const token = localStorage.getItem('scientia_token');

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const nomeUsuario = payload.nome;

                // Atualiza o menu
                if (navContainer) {
                    navContainer.innerHTML = `
                        <span class="welcome-message">Bem-vindo(a), ${nomeUsuario}!</span>
                        <a href="#" id="logout-button" class="btn btn-secondary">Sair</a>
                    `;
                    
                    document.getElementById('logout-button').addEventListener('click', handleLogout);
                }
                
                // Se o botão de upload existir nesta página, mostra-o
                if (uploadSection) {
                    uploadSection.style.display = 'block';
                }

            } catch (e) {
                console.error('Erro token:', e);
                handleLogout(null);
            }
        } else {
            // Não logado
            if (navContainer) {
                navContainer.innerHTML = `<a href="login.html" class="btn btn-primary">Login / Registar</a>`;
            }
            if (uploadSection) {
                uploadSection.style.display = 'none';
            }
        }
    }

    function handleLogout(e) {
        if (e) e.preventDefault();
        localStorage.removeItem('scientia_token');
        window.location.href = 'index.html'; // Volta sempre ao início ao sair
    }

    // API & DADOS
    async function fetchTodosDatasets() {
        if (!datasetListContainer) return; // Proteção

        try {
            const response = await fetch(`${API_URL}/api/datasets`);
            if (!response.ok) throw new Error('Falha ao carregar dados');
            const datasets = await response.json();
            renderizarDatasets(datasets, 'Datasets Recentes');
        } catch (error) {
            console.error(error);
            datasetListContainer.innerHTML = '<p class="error-message">Erro ao carregar dados.</p>';
        }
    }

    async function fetchDatasetsPorTermo(termo) {
        if (!datasetListContainer) return; // Proteção

        try {
            const url = `${API_URL}/api/datasets/buscar?termo=${encodeURIComponent(termo)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro na API');
            const datasets = await response.json();
            renderizarDatasets(datasets, 'Resultados da Busca');
        } catch (error) {
            console.error(error);
        }
    }
    
    // --- 4. RENDERIZAÇÃO ---
    function renderizarDatasets(datasets, tituloSecao) {
        if (!datasetListContainer) return; // Proteção

        datasetListContainer.innerHTML = `<h2>${tituloSecao}</h2>`;
        if (datasets.length === 0) {
            datasetListContainer.innerHTML += '<p>Nenhum dataset encontrado.</p>';
            return;
        }

        datasets.forEach(dataset => {
            const dataFormatada = new Date(dataset.data_upload).toLocaleDateString('pt-BR');
            const cardHTML = `
                <article class="dataset-card">
                    <h3>${dataset.titulo}</h3>
                    <p class="card-meta">
                        <span class="author">Por: ${dataset.autor_nome || 'Desconhecido'}</span>
                        <span class="date">Upload em: ${dataFormatada}</span>
                    </p>
                    <p class="description">${dataset.descricao}</p>
                    <a href="detalhe.html?id=${dataset.id}" class="btn btn-secondary">Ver Detalhes e Comentar</a>
                </article>
            `;
            datasetListContainer.innerHTML += cardHTML;
        });
    }

    // EVENTOS E INICIALIZAÇÃO
    function handleSearchSubmit(evento) {
        evento.preventDefault();
        const termo = searchInput.value.trim();
        if (termo) fetchDatasetsPorTermo(termo);
        else fetchTodosDatasets();
    }

    function init() {
        // 1. Configura Login (Sempre)
        setupAuthUI();
        
        // 2. Configura Busca (SÓ se o formulário existir na página atual)
        if (searchForm) {
            searchForm.addEventListener('submit', handleSearchSubmit);
        }

        // 3. Carrega Lista (SÓ se a lista existir na página atual)
        if (datasetListContainer) {
            fetchTodosDatasets();
        }
    }
    
    init();

});