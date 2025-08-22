document.addEventListener('DOMContentLoaded', () => {
    const vennDiagramContainer = document.getElementById('venn-diagram');

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

    let allProfiles = [];
    let filteredProfiles = [];
    let favorites = getFavorites();

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
            vennDiagramContainer.innerHTML = '<p class="text-danger">Erro ao carregar os dados.</p>';
        }
    }

    function getFavorites() {
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        return storedFavorites ? JSON.parse(storedFavorites) : [];
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

        renderVennDiagram(filteredProfiles);
        updateFilterOptions(filteredProfiles);
        updateUrlQueryParams();

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

    function updateFilterOptions(profilesToCount) {
        function clearAndPopulateSelect(selectElement, optionsMap) {
            const currentValue = selectElement.value;
            while (selectElement.options.length > 1) {
                selectElement.remove(1);
            }

            const sortedOptions = Object.entries(optionsMap).sort((a, b) => a[0].localeCompare(b[0]));

            sortedOptions.forEach(([value, count]) => {
                if (count > 0) {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = `${value} (${count})`;
                    selectElement.appendChild(option);
                }
            });

            if (currentValue && selectElement.querySelector(`option[value="${currentValue}"]`)) {
                selectElement.value = currentValue;
            } else {
                selectElement.value = '';
            }
        }

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

    function setupEventListeners() {
        [statusFilter, cargoFilter, hardskillFilter, softskillFilter, segmentoFilter, comunidadeFilter, estadoFilter, cidadeFilter].forEach(input => {
            input.addEventListener('input', applyFilters);
        });
        showFavoritesFilter.addEventListener('change', applyFilters);
        clearFiltersBtn.addEventListener('click', clearAllFilters);

        // No badge click filtering on insights page, as there are no profile cards
    }

    function renderVennDiagram(profiles) {
        const communities = {}; // Map community name to a set of profile names
        let allCommunityNames = new Set();

        profiles.forEach(profile => {
            if (profile.comunidades) {
                profile.comunidades.forEach(comm => {
                    if (!communities[comm]) {
                        communities[comm] = new Set();
                    }
                    communities[comm].add(profile.nome);
                    allCommunityNames.add(comm);
                });
            }
        });

        // Sort communities by size to identify the top 10
        const sortedCommunities = Array.from(allCommunityNames)
            .map(commName => ({ name: commName, size: communities[commName].size }))
            .sort((a, b) => b.size - a.size);

        const top15CommunityNames = new Set(sortedCommunities.slice(0, 15).map(c => c.name));
        const otherCommunitiesProfiles = new Set();

        // Group communities not in the top 15 into "Outras comunidades"
        allCommunityNames.forEach(commName => {
            if (!top15CommunityNames.has(commName)) {
                communities[commName].forEach(profileName => otherCommunitiesProfiles.add(profileName));
            }
        });

        // Update allCommunityNames to only include top 15 and "Outras comunidades" if applicable
        allCommunityNames = new Set(top15CommunityNames); // Start with only top 15
        if (otherCommunitiesProfiles.size > 0) {
            allCommunityNames.add('Outras comunidades');
            communities['Outras comunidades'] = otherCommunitiesProfiles;
        }

        const sets = [];
        const overlaps = [];

        // Create sets for Venn diagram
        allCommunityNames.forEach(commName => {
            sets.push({ sets: [commName], size: communities[commName].size, label: commName });
        });

        // Calculate overlaps for all pairs of communities
        const communityNamesArray = Array.from(allCommunityNames);
        for (let i = 0; i < communityNamesArray.length; i++) {
            for (let j = i + 1; j < communityNamesArray.length; j++) {
                const commA = communityNamesArray[i];
                const commB = communityNamesArray[j];

                const intersection = new Set([...communities[commA]].filter(x => communities[commB].has(x)));
                if (intersection.size > 0) {
                    overlaps.push({ sets: [commA, commB], size: intersection.size });
                }
            }
        }

        // Handle triple overlaps (and more if needed, but venn.js handles up to 3 well)
        if (communityNamesArray.length >= 3) {
            for (let i = 0; i < communityNamesArray.length; i++) {
                for (let j = i + 1; j < communityNamesArray.length; j++) {
                    for (let k = j + 1; k < communityNamesArray.length; k++) {
                        const commA = communityNamesArray[i];
                        const commB = communityNamesArray[j];
                        const commC = communityNamesArray[k];

                        const intersectionAB = new Set([...communities[commA]].filter(x => communities[commB].has(x)));
                        const intersectionABC = new Set([...intersectionAB].filter(x => communities[commC].has(x)));

                        if (intersectionABC.size > 0) {
                            overlaps.push({ sets: [commA, commB, commC], size: intersectionABC.size });
                        }
                    }
                }
            }
        }

        // Combine sets and overlaps
        const vennData = sets.concat(overlaps);

        // Clear previous diagram
        d3.select(vennDiagramContainer).select('svg').remove();

        if (vennData.length === 0) {
            vennDiagramContainer.innerHTML = '<p class="text-muted text-center">Nenhum dado de comunidade para exibir com os filtros atuais.</p>';
            return;
        }

        // Draw Venn diagram
        const chart = venn.VennDiagram()
            .width(vennDiagramContainer.clientWidth)
            .height(vennDiagramContainer.clientHeight);

        d3.select(vennDiagramContainer).datum(vennData).call(chart);

        // Add tooltips
        d3.selectAll('g')
            .on('mouseover', function(d, i) {
                // Sort all the passed in descriptions by size
                const tooltip = d3.select('.venntooltip');
                tooltip.transition().duration(400).style('opacity', .9);
                tooltip.text(d.size + ' pessoas em ' + d.sets.join(' e '));
            })
            .on('mousemove', function() {
                d3.select('.venntooltip')
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY - 28) + 'px');
            })
            .on('mouseout', function(d, i) {
                const tooltip = d3.select('.venntooltip');
                tooltip.transition().duration(400).style('opacity', 0);
            });

        // Create a tooltip div if it doesn't exist
        if (d3.select('.venntooltip').empty()) {
            d3.select('body').append('div')
                .attr('class', 'venntooltip')
                .style('position', 'absolute')
                .style('text-align', 'center')
                .style('width', '120px')
                .style('min-height', '28px')
                .style('padding', '2px')
                .style('font', '12px sans-serif')
                .style('background', 'var(--purple)')
                .style('color', 'var(--bg-color)')
                .style('border', '0px')
                .style('border-radius', '8px')
                .style('pointer-events', 'none')
                .style('z-index', '999999')
                .style('opacity', 0);
        }
    }

    fetchData();

    // Get references to the toggle button and filter sidebar
    const filterToggleBtn = document.getElementById('filter-toggle-btn');
    const filterSidebar = document.querySelector('.filter-sidebar');

    // Add event listener to the toggle button
    if (filterToggleBtn && filterSidebar) {
        filterToggleBtn.addEventListener('click', () => {
            filterSidebar.classList.toggle('active');
        });
    }
});