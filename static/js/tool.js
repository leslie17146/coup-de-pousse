let plantes = [];

const mapping = {
    sol: {
        "drainé": [3],
        "sableux": [0],
        "limoneux": [2],
        "humide": [4],
        "acide": [1]
    },
    exposition: {
        "soleil_constant": [2],
        "soleil_partiel": [1],
        "peu_soleil": [0]
    },
    eau: {
        "faible": [0],
        "modéré": [0, 1, 2],
        "important": [0, 1, 2, 3]
    },
    potager: {
        "oui": [0, 1], 
        "non": [0]   
    },
    arbres: {
        "oui": [0, 1],  
        "non": [0]   
    }
};

let currentStep = 1;
const totalSteps = 8;

function showStep(step) {
    document.querySelectorAll('.form-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    document.getElementById(`step-${step}`).classList.add('active');
    updateProgressIndicator(step);
    scrollToCurrentStep();
    
    const submitButton = document.querySelector('.button[type="submit"]');
    if (step === totalSteps && submitButton) {
        submitButton.textContent = 'Trouver mes plantes';
    }
}

function scrollToCurrentStep() {
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    if (currentStepElement) {
        if (currentStep === 1) {
            window.scrollTo({ 
                top: 0, 
                behavior: 'smooth' 
            });
        } else {
            const elementTop = currentStepElement.offsetTop;
            const desiredPosition = 130; 
            window.scrollTo({
                top: elementTop - desiredPosition,
                behavior: 'smooth' 
            });
        }
    }
}

function updateProgressIndicator(step) {
    let progressHeader = document.querySelector('.progress-header');
    let progressIndicator = document.querySelector('.progress-indicator');
    
    if (!progressHeader) {
        progressHeader = document.createElement('div');
        progressHeader.className = 'progress-header';
        
        const prevArrow = document.createElement('button');
        prevArrow.type = 'button';
        prevArrow.className = 'prev-arrow';
        prevArrow.setAttribute('aria-label', 'Question précédente');
        prevArrow.innerHTML = '←';
        prevArrow.addEventListener('click', prevStep);
        
        progressIndicator = document.createElement('div');
        progressIndicator.className = 'progress-indicator';
        
        progressHeader.appendChild(prevArrow);
        progressHeader.appendChild(progressIndicator);
        
        document.getElementById('plante-form').insertBefore(progressHeader, document.getElementById('plante-form').firstChild);
    } else {
        progressIndicator = progressHeader.querySelector('.progress-indicator');
    }
    
    progressIndicator.textContent = `Question ${step} sur ${totalSteps}`;
    
    const prevArrow = progressHeader.querySelector('.prev-arrow');
    if (step === 1) {
        prevArrow.style.visibility = 'hidden';
        prevArrow.style.opacity = '0';
        prevArrow.style.pointerEvents = 'none';
    } else {
        prevArrow.style.visibility = 'visible';
        prevArrow.style.opacity = '1';
        prevArrow.style.pointerEvents = 'auto';
    }
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function showSoilHelp() {
    const modal = document.getElementById("soilHelpModal");
    
    if (!modal) return;
    
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    
    const closeModal = () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        modal.onclick = null;
    };
    
    document.getElementById("closeSoilHelp").onclick = closeModal;
    document.getElementById("closeSoilHelpBtn").onclick = closeModal;
    
    modal.onclick = (event) => { 
        if (event.target === modal) closeModal(); 
    };
}

function filterPlants() {
    const formData = new FormData(document.getElementById('plante-form'));
    
    let filteredPlants = plantes;
    
    const solTypes = formData.getAll('sol');
    if (solTypes.length > 0) {
        filteredPlants = filteredPlants.filter(plant => {
            return solTypes.some(solType => 
                mapping.sol[solType] && mapping.sol[solType].includes(plant.Soil)
            );
        });
    }
    
    const exposition = formData.get('exposition');
    if (exposition && mapping.exposition[exposition]) {
        filteredPlants = filteredPlants.filter(plant => 
            mapping.exposition[exposition].includes(plant.Sunlight)
        );
    }
    
    const arrosage = formData.get('arrosage');
    if (arrosage && mapping.eau[arrosage]) {
        filteredPlants = filteredPlants.filter(plant => 
            mapping.eau[arrosage].includes(plant.Watering)
        );
    }
    
    const potager = formData.get('potager');
    if (potager && mapping.potager[potager]) {
        filteredPlants = filteredPlants.filter(plant => 
            mapping.potager[potager].includes(plant.Usage_vegetable)
        );
    }
    
    const arbres = formData.get('arbres');
    if (arbres && mapping.arbres[arbres]) {
        filteredPlants = filteredPlants.filter(plant => 
            mapping.arbres[arbres].includes(plant.Type_tree)
        );
    }
    
    return filteredPlants;
}

document.addEventListener('DOMContentLoaded', function() {
    showStep(1);
    
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', nextStep);
    });
    
    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', prevStep);
    });
});

const getWaterIcons = (value) => {
    let count = 1;
    if (value === 0) count = 1;
    else if (value === 1) count = 2;
    else if (value === 2) count = 2;
    else if (value >= 3) count = 3;
    return '<img src="static/images/icons8-water-30.png" alt="water drop">'.repeat(count);
};

const getSunIcons = (value) => {
    let count = 1;
    if (value === 0) count = 1;
    else if (value === 1) count = 2;
    else if (value >= 2) count = 3;
    return '<img src="static/images/icons8-sun-48.png" alt="sun">'.repeat(count);
};

const getLifeCycle = (value) => {
    switch (value) {
        case 0: return "Annuelle";
        case 1: return "Bisannuelle";
        case 2: return "Vivace";
        default: return "—";
    }
};

const getTypeText = (plant) => {
    const types = {
        Type_subshrub: "Sous-arbrisseau",
        Type_climbing: "Plante grimpante",
        Type_succulent: "Plante succulente",
        Type_tree: "Arbre",
        Type_epiphytic: "Plante épiphyte",
        Type_shrub: "Arbuste",
        Type_herbaceous: "Plante herbacée"
    };

    for (let key in types) {
        if (plant[key] === 1) return types[key];
    }
    return "";
};

const getDetailsHTML = (plant) => {
    const phrases = {
        Watering: [
            "Un arrosage hebdomadaire est suffisant.",
            "Il est important de laissez le sol respirer : arrosez seulement quand la terre commence à sécher.",
            "Évitez les excès d'eau : la terre doit rester humide sans être boueuse.",
            "Un arrosage quotidien est recommandé, surtout pendant les périodes chaudes."
        ],
        Sunlight: [
            "Plante d'ombre : elle préfère les endroits peu exposés à la lumière.",
            "Plante de mi-ombre : un peu de lumière oui, mais pas trop ! Elle s'épanouit avec une lumière douce, sans soleil brûlant.",
            "Plante de plein soleil : elle a besoin d'un maximum de lumière pour prospérer."
        ],
        Life_cycle: [
            "Cycle annuel : elle vit vite, elle vit bien — une saison, et puis s'en va. Elle germe, pousse, fleurit et meurt au cours d'une seule saison.",
            "Cycle bisannuel : elle pousse la première année, puis fleurit et meurt la deuxième.",
            "Cycle vivace : elle repousse chaque année sans qu'il soit nécessaire de la replanter."
        ],
        Growth: [
            "Patience et longueur de temps font plus que force, ni que rage... Cette plante a une croissance lente.",
            "",
            "Croissance rapide : la sprinteuse du potager ! Tu la vois grandir presque à vue d'œil."
        ],
        Soil: [
            "Sol bien drainé : l'eau doit s'infiltrer facilement sans stagner.",
            "Sol sableux : léger, aéré et qui sèche rapidement.",
            "Sol limoneux ou terre franche : équilibré, riche et facile à travailler.",
            "Sols humides : veillez à éviter la stagnation d'eau prolongée.",
            "Sol légèrement acide."
        ],
        Usage: {
            Usage_industrial: "Traditionnellement, cette plante est utilisée dans l'industrie pour fabriquer des fibres, des huiles ou des teintures.",
            Usage_ornamental: "Appréciée pour sa beauté et son élégance, cette plante attire le regard. Comment y résister ?",
            Usage_aromatic: "Cette plante aromatique est reconnaissable à son parfum.",
            Usage_medicinal: "Cette plante médicinale est connue pour ses vertus naturelles. C'est l'ingrédient phare des remèdes de nos grands-mères !",
            Usage_melliferae: "En la plantant vous faites un geste pour les pollinisateurs. C'est une plante méllifère.",
            Usage_fodder: "Source de nourriture pour les animaux, elle fournit un fourrage nutritif et apprécié du bétail.",
            Usage_vegetable: "Ce légume trouve naturellement sa place dans le potager... Et dans l'assiette !",
            Usage_fruit: "Quoi de mieux que de manger les fruits de son jardin ?",
            Usage_spice: "Petite mais puissante ! Elle réveille les plats (et parfois les papilles).",
            Usage_oil: "Riche en huiles naturelles."
        }
    };

    let html = "";

    for (let key in phrases) {
        if (Array.isArray(phrases[key])) {
            const val = plant[key];
            if (val !== undefined && phrases[key][val] !== undefined && phrases[key][val] !== "") {
                html += `<p>${phrases[key][val]}</p>`;
            }
        }
    }

    for (let key in phrases.Usage) {
        if (plant[key] === 1) {
            html += `<p>${phrases.Usage[key]}</p>`;
        }
    }

    return html;
};

function showPlantModal(plant, imageUrl) {
    const modal = document.getElementById("plantModal");
    const title = document.getElementById("modalTitle");
    const details = document.getElementById("modalDetails");

    title.innerHTML = `
        <h2>${plant.Nom || plant.Name}</h2>
        <h3>${getTypeText(plant)}</h3>
    `;

    details.innerHTML = getDetailsHTML(plant);

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.getElementById("modalClose").onclick = closeModal;
    document.getElementById("closeModalBtn").onclick = closeModal;

    modal.onclick = (event) => { if (event.target === modal) closeModal(); };

    function closeModal() {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    }
}

function showNavigationHelpModal() {
    const modal = document.getElementById("navigationHelpModal");
    
    if (!modal) return;
    
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    
    const closeModal = () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        modal.onclick = null;
    };
    
    document.getElementById("closeNavigationHelp").onclick = closeModal;
    document.getElementById("closeNavigationHelpBtn").onclick = closeModal;
    
    modal.onclick = (event) => { 
        if (event.target === modal) closeModal(); 
    };
}

function setupScrollDetectionForHelp() {
    const selectedSection = document.getElementById("selected-section");
    
    if (!selectedSection) return;
    
    let hasShownHelp = false;
    
    const checkSectionVisibility = () => {
        if (hasShownHelp) return;
        
        const sectionRect = selectedSection.getBoundingClientRect();
        
        if (sectionRect.top <= 100 && sectionRect.bottom > 200) {
            showNavigationHelpModal();
            hasShownHelp = true;
            
            window.removeEventListener("scroll", scrollHandler);
            window.removeEventListener("resize", resizeHandler);
        }
    };
    
    const scrollHandler = () => {
        checkSectionVisibility();
    };
    
    const resizeHandler = () => {
        checkSectionVisibility();
    };
    
    window.addEventListener("scroll", scrollHandler);
    window.addEventListener("resize", resizeHandler);
    
    setTimeout(checkSectionVisibility, 100);
    
    const backButton = document.querySelector(".back-to-form-btn");
    if (backButton) {
        const originalClick = backButton.onclick;
        backButton.onclick = function() {
            window.removeEventListener("scroll", scrollHandler);
            window.removeEventListener("resize", resizeHandler);
            
            if (originalClick) originalClick();
        };
    }
}

function toggleMenu() {
    document.getElementById("radialMenu").classList.toggle("active");
}

const form = document.getElementById("plante-form");
const divResultats = document.getElementById("resultats");

fetch("static/data/plants.json")
    .then(res => res.json())
    .then(data => {
        plantes = data;
        console.log("✅ Data loaded from static/data/plants.json :", plantes.length, "plants");
    })
    .catch(err => console.error("JSON error :", err));

function updatePlantCounters() {
    const selectedCount = document.querySelectorAll('#gallery-selected .plant-card').length;
    const othersCount = document.querySelectorAll('#gallery-others .plant-card').length;
    
    const selectedTitle = document.querySelector('#selected-section .section-title');
    const othersTitle = document.querySelector('#others-section .section-title');
    
    if (selectedTitle) {
        selectedTitle.textContent = `Plantes correspondant à vos critères (${selectedCount})`;
    }
    if (othersTitle) {
        othersTitle.textContent = `Autres plantes disponibles (${othersCount})`;
    }
}

// Add generation plan button (easiest method)
function addPlanGenerationButton() {
    if (document.getElementById('plan-generation-button-container')) {
        return;
    }
    
    const planButtonContainer = document.createElement('div');
    planButtonContainer.id = 'plan-generation-button-container';
    planButtonContainer.style.textAlign = 'center';
    planButtonContainer.style.margin = '40px 0 80px 0'; 
    planButtonContainer.style.padding = '30px';
    planButtonContainer.style.backgroundColor = '#f9fff9';
    planButtonContainer.style.borderRadius = '15px';
    planButtonContainer.style.border = '2px solid #8BC34A';
    planButtonContainer.style.boxShadow = '0 4px 15px rgba(139, 195, 74, 0.2)';
    
    const planButton = document.createElement('button');
    planButton.className = 'button';
    planButton.id = 'generate-plan-button';
    planButton.innerHTML = 'Générer mon plan de jardin';
    planButton.style.fontSize = '1.3rem';
    planButton.style.padding = '18px 50px';
    planButton.style.width = 'auto';
    planButton.style.display = 'inline-flex';
    planButton.style.alignItems = 'center';
    planButton.style.gap = '15px';
    planButton.style.cursor = 'pointer';
    planButton.style.transition = 'all 0.3s ease';
    planButton.style.border = 'none';
    planButton.style.background = 'linear-gradient(135deg, #8BC34A, #4CAF50)';
    planButton.style.color = 'white';
    planButton.style.fontWeight = 'bold';
    
    planButton.onmouseover = function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
    };
    planButton.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    };
    
    const explanation = document.createElement('p');
    explanation.style.color = '#666';
    explanation.style.marginTop = '20px';
    explanation.style.fontSize = '1rem';
    explanation.style.maxWidth = '600px';
    explanation.style.margin = '20px auto 0 auto';
    explanation.style.lineHeight = '1.5';
    explanation.textContent = 'Notre IA va créer un plan personnalisé de votre jardin avec les plantes sélectionnées, optimisé selon vos dimensions et style préféré.';
    
    planButtonContainer.appendChild(planButton);
    planButtonContainer.appendChild(explanation);
    
    const footer = document.querySelector('footer');
    if (footer) {
        footer.parentNode.insertBefore(planButtonContainer, footer);
    } else {
        const othersSection = document.getElementById('others-section');
        if (othersSection) {
            othersSection.parentNode.insertBefore(planButtonContainer, othersSection.nextSibling);
        }
    }
    
    planButton.addEventListener('click', function() {
        generateGardenPlanFromSelection();
    });
}

function generateGardenPlanFromSelection() {
    // Send all the information to the next page
    const selectedPlants = [];
    document.querySelectorAll('.plant-card input[type="checkbox"]:checked').forEach(cb => {
        const plantCard = cb.closest('.plant-card');
        if (plantCard) {
            const plantName = plantCard.querySelector('h3').textContent;
            if (plantName && plantName.trim() !== '') {
                selectedPlants.push(plantName.trim());
            }
        }
    });
    
    if (selectedPlants.length === 0) {
        alert('Veuillez sélectionner au moins une plante avant de générer un plan.');
        return;
    }
    
    const largeurInput = document.querySelector('input[name="largeur"]');
    const longueurInput = document.querySelector('input[name="longueur"]');
    
    const styleInput = document.querySelector('input[name="style"]:checked');
    const styleValue = styleInput ? styleInput.value : 'autre';
    
    const gardenData = {
        plantes: selectedPlants,
        largeur: largeurInput ? largeurInput.value : '0',
        longueur: longueurInput ? longueurInput.value : '0',
        style: styleValue,
        timestamp: Date.now()
    };
    
    console.log('📤 Données du jardin:', gardenData);
    
    localStorage.setItem('gardenPlanData', JSON.stringify(gardenData));
    
    window.location.href = 'map_generation.html';
}

form.addEventListener("submit", function (e) {
    e.preventDefault();
    
    document.getElementById("plante-form").style.display = "none";
    document.getElementById("resultats").style.display = "block";
    document.getElementById("selected-section").style.display = "block";
    document.getElementById("others-section").style.display = "block";
    
    if (divResultats) divResultats.innerHTML = "";
    document.getElementById("gallery-selected").innerHTML = "";
    document.getElementById("gallery-others").innerHTML = "";

    const backButton = document.createElement('button');
    backButton.className = 'back-to-form-btn';
    backButton.innerHTML = '← Retour au questionnaire';
    backButton.onclick = backToForm;
    divResultats.appendChild(backButton);

    const formData = new FormData(form);
    const sols = Array.from(document.querySelectorAll('input[name="sol"]:checked')).map(cb => cb.value);
    const exposition = formData.get('exposition');
    const arrosage = formData.get('arrosage');
    const potager = formData.get('potager');
    const arbres = formData.get('arbres');

    console.log("🔍 Filters appliqués :", { 
        sols, 
        exposition, 
        arrosage,
        potager, 
        arbres 
    });

    const resultat = filterPlants();
    const autres = plantes.filter(p => !resultat.includes(p));

    const selectedSection = document.getElementById("selected-section");
    const othersSection = document.getElementById("others-section");
    
    selectedSection.innerHTML = '';
    othersSection.innerHTML = '';
    
    const selectedTitle = document.createElement('h2');
    selectedTitle.className = 'section-title';
    selectedTitle.textContent = `Plantes correspondant à vos critères (${resultat.length})`;
    selectedSection.appendChild(selectedTitle);
    
    const selectedGallery = document.createElement('div');
    selectedGallery.className = 'gallery';
    selectedGallery.id = 'gallery-selected';
    selectedSection.appendChild(selectedGallery);
    
    const othersTitle = document.createElement('h2');
    othersTitle.className = 'section-title';
    othersTitle.textContent = `Autres plantes disponibles (${autres.length})`;
    othersSection.appendChild(othersTitle);
    
    const othersGallery = document.createElement('div');
    othersGallery.className = 'gallery';
    othersGallery.id = 'gallery-others';
    othersSection.appendChild(othersGallery);

    const displayPlantCard = (plant, container, checked = false) => {
        let imageUrl = "static/images/no-picture-picture.png"; // Chemin corrigé
        if (plant.photo_url && plant.photo_url.trim() !== "" && plant.photo_url !== "no-picture-picture.png") {
            // Si c'est une URL complète, l'utiliser, sinon ajouter le chemin static
            if (plant.photo_url.startsWith('http') || plant.photo_url.startsWith('//')) {
                imageUrl = plant.photo_url;
            } else if (plant.photo_url.includes('/')) {
                imageUrl = plant.photo_url;
            } else {
                imageUrl = "static/images/" + plant.photo_url;
            }
        }
        createCard(plant, imageUrl, container, checked);
    };

    const createCard = (plant, imageUrl, container, checked = false) => {
        const waterIcons = getWaterIcons(plant.Watering);
        const sunIcons = getSunIcons(plant.Sunlight);
        const lifeCycleText = getLifeCycle(plant.Life_cycle);

        const card = document.createElement("div");
        card.className = "plant-card";
        card.innerHTML = `
            <div class="checkbox-container">
                <input type="checkbox" class="select-checkbox" ${checked ? "checked" : ""}>
            </div>
            <img src="${imageUrl}" alt="${plant.Nom}" onerror="this.src='static/images/no-picture-picture.png'">
            <h3>${plant.Nom}</h3>
            <div class="plant-info">
                <div class="water-line">${waterIcons}</div>
                <div class="sun-line">${sunIcons}</div>
                <div class="life-line">Cycle de vie : ${lifeCycleText}</div>
            </div>
        `;

        const checkbox = card.querySelector(".select-checkbox");
        checkbox.addEventListener("change", () => {
            card.classList.add('card-moving');
            
            setTimeout(() => {
                if (checkbox.checked) {
                    document.getElementById("gallery-selected").appendChild(card);
                } else {
                    const othersContainer = document.getElementById("gallery-others");
                    othersContainer.insertBefore(card, othersContainer.firstChild);
                }

                updatePlantCounters();
                
                setTimeout(() => {
                    card.classList.remove('card-moving');
                }, 50);
            }, 300);
        });

        card.addEventListener("click", (e) => {
            if (!e.target.classList.contains("select-checkbox")) {
                showPlantModal(plant, imageUrl);
            }
        });

        container.appendChild(card);
    };

    resultat.forEach(plant => displayPlantCard(plant, selectedGallery, true));
    autres.forEach(plant => displayPlantCard(plant, othersGallery, false));
    
    setTimeout(() => {
        setupScrollDetectionForHelp();
        addPlanGenerationButton();
    }, 100);
});

function backToForm() {
    document.getElementById("resultats").style.display = "none";
    document.getElementById("selected-section").style.display = "none";
    document.getElementById("others-section").style.display = "none";
    document.getElementById("plante-form").style.display = "block";
    
    const planButtonContainer = document.getElementById('plan-generation-button-container');
    if (planButtonContainer) {
        planButtonContainer.remove();
    }
    
    currentStep = 1;
    showStep(currentStep);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}