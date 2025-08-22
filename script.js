document.addEventListener('DOMContentLoaded', () => {
    const profilesContainer = document.getElementById('profiles-container');
    const profileCountSpan = document.getElementById('profile-count');
    const loadingIndicator = document.getElementById('loading-indicator');

    const statusFilter = document.getElementById('status-filter');
    const cargoFilter = document.getElementById('cargo-filter');
    const hardskillFilter = document.getElementById('hardskill-filter');
    const softskillFilter = document.getElementById('softskill-filter');
    const segmentoFilter = document.getElementById('segmento-filter');
    const comunidadeFilter = document.getElementById('comunidade-filter');
    const estadoFilter = document.getElementById('estado-filter');
    const cidadeFilter = document.getElementById('cidade-filter');
    const showFavoritesFilter = document.getElementById('show-favorites-filter');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    const FAVORITES_KEY = 'talentHubFavorites';
    const MAX_PROFILES_PER_LOAD = 12;

    let allProfiles = [];
    let filteredProfiles = [];
    let currentRenderedProfiles = 0;
    let favorites = getFavorites();
    let isLoading = false;

    async function fetchData() {
        try {
            const response = await fetch('./data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allProfiles = await response.json();
            
            allProfiles.forEach(p => {
                if (p.status === 'Procurando Emprego') p.status = 'Disponível';
            });

            updateFilterOptions(allProfiles);
            getQueryParams(); // Set filter values from URL
            applyFilters(); // Initial render with URL filters
            setupEventListeners();
        } catch (error) {
            console.error('Could not fetch data:', error);
            profilesContainer.innerHTML = '<p class="text-danger">Erro ao carregar os dados.</p>';
        }
    }

    function getFavorites() {
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        return storedFavorites ? JSON.parse(storedFavorites) : [];
    }

    function saveFavorites(favs) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    }

    function toggleFavorite(profileName) {
        if (favorites.includes(profileName)) {
            favorites = favorites.filter(name => name !== profileName);
        } else {
            favorites.push(profileName);
        }
        saveFavorites(favorites);
        applyFilters(); // Re-render to update star icons and apply favorite filter if active
    }

    function renderProfiles(profilesToRender) {
        // Clear only if it's a new filter application, not just loading more
        if (currentRenderedProfiles === 0) {
            profilesContainer.innerHTML = '';
        }

        if (profilesToRender.length === 0 && currentRenderedProfiles === 0) {
            profilesContainer.innerHTML = '<p class="text-muted">Nenhum perfil encontrado.</p>';
            profileCountSpan.textContent = `0 de ${allProfiles.length}`;
            return;
        }

        profilesToRender.forEach(profile => {
            const statusClass = profile.status === 'Contratando' ? 'status-contratando' : (profile.status === 'Disponível' ? 'status-disponivel' : '');
            const isFavorite = favorites.includes(profile.nome);
            const favoriteIconClass = isFavorite ? 'bi-star-fill' : 'bi-star';
            const uniqueIdBase = profile.nome.replace(/\s/g, '').toLowerCase(); // Use profile name for unique IDs

            const card = document.createElement('div');
            card.className = 'col-md-6 col-xxl-4';
            card.innerHTML = `
                <div class="card profile-card text-center ${statusClass}">
                    ${statusClass ? `<div class="status-badge-corner"><span>${profile.status}</span></div>` : ''}
                    <div class="card-body">
                        <i class="bi ${favoriteIconClass} favorite-btn" data-id="${profile.nome}"></i>
                        <div class="photo-wrapper">
                            <img src="${profile.foto}" alt="Foto de ${profile.nome}" class="profile-photo">
                        </div>
                        <h5 class="card-title mb-0">${profile.nome}</h5>
                        <p class="text-muted">${profile.cargo}</p>
                        <p class="text-muted small">${profile.local.cidade} - ${profile.local.estado}</p>
                        <p class="w-100 text-center fw-bold">${profile.empresa}</p>
                        
                        ${createSkillsSection(profile.hardskills, 'Hard Skills', `hs-${uniqueIdBase}`, hardskillFilter.value)}
                        ${createSkillsSection(profile.softskills, 'Soft Skills', `ss-${uniqueIdBase}`, softskillFilter.value)}
                        ${createCommunitiesSection(profile.comunidades, `comm-${uniqueIdBase}`, comunidadeFilter.value)}

                        <div class="d-flex justify-content-center mt-3">
                            ${Object.entries(profile.links).map(([key, value]) => `
                                <a href="${value}" target="_blank" rel="noopener noreferrer" class="link-icon" title="${key.charAt(0).toUpperCase() + key.slice(1)}">
                                    <i class="bi bi-${key.toLowerCase()}"></i>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            profilesContainer.appendChild(card);
        });
        addBootstrapIcons();
        checkSkillsOverflow();
        profileCountSpan.textContent = `${filteredProfiles.length} de ${allProfiles.length}`;
    }

    function createSkillsSection(skills, title, uniqueId, filterValue) {
        if (!skills || skills.length === 0) return '';

        let sortedSkills = [...skills];
        if (filterValue) {
            const index = sortedSkills.findIndex(s => s.toLowerCase() === filterValue.toLowerCase());
            if (index > -1) {
                const [filteredSkill] = sortedSkills.splice(index, 1);
                sortedSkills.unshift(filteredSkill);
            }
        }

        return `
            <div class="skills-section mb-3 text-start">
                <strong class="d-block mb-1">${title}:</strong>
                <div class="skills-list-wrapper" id="wrapper-${uniqueId}">
                    <div class="skills-list" id="${uniqueId}">
                        ${sortedSkills.map(skill => `<span class="badge bg-secondary me-1 mb-1">${skill}</span>`).join('')}
                    </div>
                    <button class="expand-btn" data-target="${uniqueId}">+</button>
                </div>
            </div>
        `;
    }

    function createCommunitiesSection(comunidades, uniqueId, filterValue) {
        if (!comunidades || comunidades.length === 0) return '';

        let sortedCommunities = [...comunidades];
        if (filterValue) {
            const index = sortedCommunities.findIndex(c => c.toLowerCase() === filterValue.toLowerCase());
            if (index > -1) {
                const [filteredCommunity] = sortedCommunities.splice(index, 1);
                sortedCommunities.unshift(filteredCommunity);
            }
        }

        return `
            <div class="communities-section text-start mt-2">
                <strong class="d-block mb-1">Comunidades:</strong>
                <div class="skills-list-wrapper" id="wrapper-${uniqueId}">
                    <div class="skills-list" id="${uniqueId}">
                        ${sortedCommunities.map(comm => `<span class="badge bg-info text-dark me-1 mb-1">${comm}</span>`).join('')}
                    </div>
                    <button class="expand-btn" data-target="${uniqueId}">+</button>
                </div>
            </div>
        `;
    }

    function checkSkillsOverflow() {
        document.querySelectorAll('.skills-list').forEach(list => {
            const wrapper = list.parentElement;
            if (list.scrollHeight > wrapper.clientHeight) {
                wrapper.classList.add('collapsible');
            } else {
                 wrapper.classList.remove('collapsible');
            }
        });
    }

    function updateFilterOptions(profilesToCount) {
        // Helper to clear and populate a select element
        function clearAndPopulateSelect(selectElement, optionsMap) {
            // Store the current selected value
            const currentValue = selectElement.value;

            // Clear all options except the first (e.g., "Todos")
            while (selectElement.options.length > 1) {
                selectElement.remove(1);
            }

            // Sort options alphabetically by value
            const sortedOptions = Object.entries(optionsMap).sort((a, b) => a[0].localeCompare(b[0]));

            sortedOptions.forEach(([value, count]) => {
                if (count > 0) {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = `${value} (${count})`;
                    selectElement.appendChild(option);
                }
            });

            // Restore the previously selected value if it still exists
            if (currentValue && selectElement.querySelector(`option[value="${currentValue}"]`)) {
                selectElement.value = currentValue;
            } else {
                selectElement.value = ''; // Reset if the current value is no longer available
            }
        }

        // Calculate counts for each filter category
        const statusCounts = {};
        const segmentoCounts = {};
        const comunidadeCounts = {};
        const estadoCounts = {};
        const cidadeCounts = {};

        profilesToCount.forEach(profile => {
            if (profile.status) statusCounts[profile.status] = (statusCounts[profile.status] || 0) + 1;
            if (profile.segmento) segmentoCounts[profile.segmento] = (segmentoCounts[profile.segmento] || 0) + 1;
            
            if (profile.comunidades) {
                profile.comunidades.forEach(comm => {
                    comunidadeCounts[comm] = (comunidadeCounts[comm] || 0) + 1;
                });
            }
            if (profile.local && profile.local.estado) estadoCounts[profile.local.estado] = (estadoCounts[profile.local.estado] || 0) + 1;
            if (profile.local && profile.local.cidade) cidadeCounts[profile.local.cidade] = (cidadeCounts[profile.local.cidade] || 0) + 1;
        });

        // Populate each filter dropdown
        clearAndPopulateSelect(statusFilter, statusCounts);
        clearAndPopulateSelect(segmentoFilter, segmentoCounts);
        clearAndPopulateSelect(comunidadeFilter, comunidadeCounts);
        clearAndPopulateSelect(estadoFilter, estadoCounts);
        clearAndPopulateSelect(cidadeFilter, cidadeCounts);
    }

    function applyFilters() {
        const status = statusFilter.value;
        const cargo = cargoFilter.value.toLowerCase();
        const hardskill = hardskillFilter.value.toLowerCase();
        const softskill = softskillFilter.value.toLowerCase();
        const segmento = segmentoFilter.value;
        const comunidade = comunidadeFilter.value;
        const estado = estadoFilter.value;
        const cidade = cidadeFilter.value;
        const showFavorites = showFavoritesFilter.checked;

        filteredProfiles = allProfiles.filter(profile => {
            const matchesStatus = !status || profile.status === status;
            const matchesCargo = !cargo || profile.cargo.toLowerCase().includes(cargo);
            const matchesSegmento = !segmento || profile.segmento === segmento;
            const matchesHardskill = !hardskill || (profile.hardskills && profile.hardskills.some(s => s.toLowerCase().includes(hardskill)));
            const matchesSoftskill = !softskill || (profile.softskills && profile.softskills.some(s => s.toLowerCase().includes(softskill)));
            const matchesComunidade = !comunidade || (profile.comunidades && profile.comunidades.includes(comunidade));
            const matchesEstado = !estado || (profile.local && profile.local.estado === estado);
            const matchesCidade = !cidade || (profile.local && profile.local.cidade === cidade);
            const matchesFavorite = !showFavorites || favorites.includes(profile.nome);

            return matchesStatus && matchesCargo && matchesSegmento && matchesHardskill && matchesSoftskill && matchesComunidade && matchesEstado && matchesCidade && matchesFavorite;
        });

        currentRenderedProfiles = 0;
        profilesContainer.innerHTML = ''; // Clear profiles before rendering new ones
        loadMoreProfiles(); // Load initial batch
        updateUrlQueryParams();
        updateFilterOptions(filteredProfiles);

        // Show/hide clear filters button
        const anyFilterActive = status || cargo || hardskill || softskill || segmento || comunidade || estado || cidade || showFavorites;
        if (anyFilterActive) {
            clearFiltersBtn.style.display = 'block';
        } else {
            clearFiltersBtn.style.display = 'none';
        }
    }

    function updateUrlQueryParams() {
        const params = new URLSearchParams();
        if (statusFilter.value) params.set('status', statusFilter.value);
        if (cargoFilter.value) params.set('cargo', cargoFilter.value);
        if (hardskillFilter.value) params.set('hardskill', hardskillFilter.value);
        if (softskillFilter.value) params.set('softskill', softskillFilter.value);
        if (segmentoFilter.value) params.set('segmento', segmentoFilter.value);
        if (comunidadeFilter.value) params.set('comunidade', comunidadeFilter.value);
        if (estadoFilter.value) params.set('estado', estadoFilter.value);
        if (cidadeFilter.value) params.set('cidade', cidadeFilter.value);
        if (showFavoritesFilter.checked) params.set('favorites', 'true');

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }

    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        statusFilter.value = params.get('status') || '';
        cargoFilter.value = params.get('cargo') || '';
        hardskillFilter.value = params.get('hardskill') || '';
        softskillFilter.value = params.get('softskill') || '';
        segmentoFilter.value = params.get('segmento') || '';
        comunidadeFilter.value = params.get('comunidade') || '';
        estadoFilter.value = params.get('estado') || '';
        cidadeFilter.value = params.get('cidade') || '';
        showFavoritesFilter.checked = params.get('favorites') === 'true';
    }

    function clearAllFilters() {
        statusFilter.value = '';
        cargoFilter.value = '';
        hardskillFilter.value = '';
        softskillFilter.value = '';
        segmentoFilter.value = '';
        comunidadeFilter.value = '';
        estadoFilter.value = '';
        cidadeFilter.value = '';
        showFavoritesFilter.checked = false;
        applyFilters();
    }

    function loadMoreProfiles() {
        if (isLoading || currentRenderedProfiles >= filteredProfiles.length) {
            return;
        }

        isLoading = true;
        loadingIndicator.style.display = 'block';

        const nextBatch = filteredProfiles.slice(currentRenderedProfiles, currentRenderedProfiles + MAX_PROFILES_PER_LOAD);
        renderProfiles(nextBatch);
        currentRenderedProfiles += nextBatch.length;

        isLoading = false;
        loadingIndicator.style.display = 'none';
    }

    // Debounce function for scroll event
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    function setupEventListeners() {
        [statusFilter, cargoFilter, hardskillFilter, softskillFilter, segmentoFilter, comunidadeFilter, estadoFilter, cidadeFilter].forEach(input => {
            input.addEventListener('input', applyFilters);
        });
        showFavoritesFilter.addEventListener('change', applyFilters);
        clearFiltersBtn.addEventListener('click', clearAllFilters);

        profilesContainer.addEventListener('click', e => {
            if (e.target.classList.contains('expand-btn')) {
                const btn = e.target;
                const listId = btn.dataset.target;
                const wrapper = document.getElementById(`wrapper-${listId}`);
                wrapper.classList.toggle('expanded');
                btn.textContent = wrapper.classList.contains('expanded') ? '–' : '+';
            } else if (e.target.classList.contains('favorite-btn')) {
                const profileName = e.target.dataset.id;
                toggleFavorite(profileName);
            } else if (e.target.classList.contains('badge')) {
                const badgeText = e.target.textContent;
                const parentSection = e.target.closest('.skills-section, .communities-section');

                if (parentSection) {
                    if (parentSection.querySelector('strong').textContent.includes('Hard Skills')) {
                        if (hardskillFilter.value === badgeText) {
                            hardskillFilter.value = '';
                        } else {
                            hardskillFilter.value = badgeText;
                        }
                    } else if (parentSection.querySelector('strong').textContent.includes('Soft Skills')) {
                        if (softskillFilter.value === badgeText) {
                            softskillFilter.value = '';
                        } else {
                            softskillFilter.value = badgeText;
                        }
                    }
                    // Assuming 'Comunidades' is the only other badge type
                    else if (parentSection.querySelector('strong').textContent.includes('Comunidades')) {
                        if (comunidadeFilter.value === badgeText) {
                            comunidadeFilter.value = '';
                        } else {
                            comunidadeFilter.value = badgeText;
                        }
                    }
                    applyFilters();
                }
            }
        });
        
        window.addEventListener('scroll', debounce(() => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) { // 500px from bottom
                loadMoreProfiles();
            }
        }, 100));

        window.addEventListener('resize', checkSkillsOverflow);
    }

    function addBootstrapIcons() {
        if (document.querySelector('.link-icon') || document.querySelector('.favorite-btn')) {
            const existingLink = document.querySelector('link[href*="bootstrap-icons.css"]');
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css';
                document.head.appendChild(link);
            }
        }
    }

    fetchData();
});
