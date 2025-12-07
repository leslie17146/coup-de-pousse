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
        "modéré": [1],
        "important": [2]
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

// Gestion des étapes du formulaire
let currentStep = 1;
const totalSteps = 8;

function showStep(step) {
    // Masquer toutes les étapes
    document.querySelectorAll('.form-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Afficher l'étape courante
    document.getElementById(`step-${step}`).classList.add('active');
    
    // Mettre à jour l'indicateur de progression
    updateProgressIndicator(step);
    
    // Gérer le défilement selon l'étape
    scrollToCurrentStep();
    
    // Mettre à jour le texte du bouton sur la dernière étape
    const submitButton = document.querySelector('.button[type="submit"]');
    if (step === totalSteps && submitButton) {
        submitButton.textContent = 'Trouver mes plantes';
    }
}

function scrollToCurrentStep() {
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    if (currentStepElement) {
        if (currentStep === 1) {
            // Pour la première question, on reste en haut de la page
            window.scrollTo({ 
                top: 0, 
                behavior: 'smooth' 
            });
        } else {
            const elementTop = currentStepElement.offsetTop;
            // Pour les autres questions, on centre la question
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
    
    // Créer la structure si elle n'existe pas
    if (!progressHeader) {
        progressHeader = document.createElement('div');
        progressHeader.className = 'progress-header';
        
        // Créer la flèche précédente
        const prevArrow = document.createElement('button');
        prevArrow.type = 'button';
        prevArrow.className = 'prev-arrow';
        prevArrow.setAttribute('aria-label', 'Question précédente');
        prevArrow.innerHTML = '←';
        prevArrow.addEventListener('click', prevStep);
        
        // Créer l'indicateur de progression
        progressIndicator = document.createElement('div');
        progressIndicator.className = 'progress-indicator';
        
        progressHeader.appendChild(prevArrow);
        progressHeader.appendChild(progressIndicator);
        
        // Insérer au début du formulaire
        document.getElementById('plante-form').insertBefore(progressHeader, document.getElementById('plante-form').firstChild);
    } else {
        // Récupérer l'indicateur existant
        progressIndicator = progressHeader.querySelector('.progress-indicator');
    }
    
    // Mettre à jour le texte
    progressIndicator.textContent = `Question ${step} sur ${totalSteps}`;
    
    // Gérer la visibilité de la flèche
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

// Fonction pour afficher l'aide sur les types de sol
function showSoilHelp() {
    const modal = document.getElementById("soilHelpModal");
    
    if (!modal) return;
    
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    
    // Gestion de la fermeture
    const closeModal = () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        modal.onclick = null;
    };
    
    // Boutons de fermeture
    document.getElementById("closeSoilHelp").onclick = closeModal;
    document.getElementById("closeSoilHelpBtn").onclick = closeModal;
    
    // Fermeture en cliquant hors de la modale
    modal.onclick = (event) => { 
        if (event.target === modal) closeModal(); 
    };
}

// Fonction pour filtrer les plantes selon les réponses
function filterPlants() {
    const formData = new FormData(document.getElementById('plante-form'));
    
    let filteredPlants = plantes;
    
    // Filtre sol (checkbox - peut être multiple)
    const solTypes = formData.getAll('sol');
    if (solTypes.length > 0) {
        filteredPlants = filteredPlants.filter(plant => {
            return solTypes.some(solType => 
                mapping.sol[solType] && mapping.sol[solType].includes(plant.Soil)
            );
        });
    }
    
    // Filtre exposition
    const exposition = formData.get('exposition');
    if (exposition && mapping.exposition[exposition]) {
        filteredPlants = filteredPlants.filter(plant => 
            mapping.exposition[exposition].includes(plant.Sunlight)
        );
    }
    
    // Filtre arrosage
    const arrosage = formData.get('arrosage');
    if (arrosage && mapping.eau[arrosage]) {
        filteredPlants = filteredPlants.filter(plant => 
            mapping.eau[arrosage].includes(plant.Watering)
        );
    }
    
    // Filtre potager
    const potager = formData.get('potager');
    if (potager && mapping.potager[potager]) {
        filteredPlants = filteredPlants.filter(plant => 
            mapping.potager[potager].includes(plant.Usage_vegetable)
        );
    }
    
    // Filtre arbres
    const arbres = formData.get('arbres');
    if (arbres && mapping.arbres[arbres]) {
        filteredPlants = filteredPlants.filter(plant => 
            mapping.arbres[arbres].includes(plant.Type_tree)
        );
    }
    
    return filteredPlants;
}

// Événements pour les boutons
document.addEventListener('DOMContentLoaded', function() {
    // Afficher la première étape
    showStep(1);
    
    // Boutons Suivant
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', nextStep);
    });
    
    // Boutons Précédent
    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', prevStep);
    });
});

// Fonctions d'icônes
const getWaterIcons = (value) => {
    let count = 1;
    if (value === 0) count = 1;
    else if (value === 1) count = 2;
    else if (value === 2) count = 2;
    else if (value >= 3) count = 3;
    return '<img src="icons8-water-30.png" alt="goutte">'.repeat(count);
};

const getSunIcons = (value) => {
    let count = 1;
    if (value === 0) count = 1;
    else if (value === 1) count = 2;
    else if (value >= 2) count = 3;
    return '<img src="icons8-sun-48.png" alt="soleil">'.repeat(count);
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

    // Champs à index numérique (ex : Watering, Sunlight…)
    for (let key in phrases) {
        if (Array.isArray(phrases[key])) {
            const val = plant[key];
            if (val !== undefined && phrases[key][val] !== undefined && phrases[key][val] !== "") {
                html += `<p>${phrases[key][val]}</p>`;
            }
        }
    }

    // Usages multiples possibles
    for (let key in phrases.Usage) {
        if (plant[key] === 1) {
            html += `<p>${phrases.Usage[key]}</p>`;
        }
    }

    return html;
};

// Fonction pour afficher la modale
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

    // Fermeture
    document.getElementById("modalClose").onclick = closeModal;
    document.getElementById("closeModalBtn").onclick = closeModal;

    // Fermeture si clic hors modale
    modal.onclick = (event) => { if (event.target === modal) closeModal(); };

    function closeModal() {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    }
}

// Fonction pour afficher la modale d'aide à la navigation
function showNavigationHelpModal() {
    const modal = document.getElementById("navigationHelpModal");
    
    if (!modal) return;
    
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    
    // Gestion de la fermeture
    const closeModal = () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        modal.onclick = null;
    };
    
    // Boutons de fermeture
    document.getElementById("closeNavigationHelp").onclick = closeModal;
    document.getElementById("closeNavigationHelpBtn").onclick = closeModal;
    
    // Fermeture en cliquant hors de la modale
    modal.onclick = (event) => { 
        if (event.target === modal) closeModal(); 
    };
}

// Fonction pour détecter le défilement jusqu'à la section des résultats
function setupScrollDetectionForHelp() {
    const selectedSection = document.getElementById("selected-section");
    
    if (!selectedSection) return;
    
    // Indicateur pour ne pas réafficher plusieurs fois
    let hasShownHelp = false;
    
    // Fonction pour vérifier la visibilité de la section
    const checkSectionVisibility = () => {
        if (hasShownHelp) return;
        
        const sectionRect = selectedSection.getBoundingClientRect();
        
        // Vérifier si la section est en haut de la fenêtre
        // (le haut de la section est proche du haut de la fenêtre)
        if (sectionRect.top <= 100 && sectionRect.bottom > 200) {
            showNavigationHelpModal();
            hasShownHelp = true;
            
            // Retirer l'écouteur pour ne pas réafficher
            window.removeEventListener("scroll", scrollHandler);
            window.removeEventListener("resize", resizeHandler);
        }
    };
    
    // Gérer le défilement
    const scrollHandler = () => {
        checkSectionVisibility();
    };
    
    // Gérer le redimensionnement
    const resizeHandler = () => {
        checkSectionVisibility();
    };
    
    // Ajouter les écouteurs d'événements
    window.addEventListener("scroll", scrollHandler);
    window.addEventListener("resize", resizeHandler);
    
    // Vérifier immédiatement (au cas où l'utilisateur est déjà en bas)
    setTimeout(checkSectionVisibility, 100);
    
    // Nettoyage si l'utilisateur retourne au formulaire
    const backButton = document.querySelector(".back-to-form-btn");
    if (backButton) {
        const originalClick = backButton.onclick;
        backButton.onclick = function() {
            // Nettoyer les écouteurs
            window.removeEventListener("scroll", scrollHandler);
            window.removeEventListener("resize", resizeHandler);
            
            // Appeler la fonction originale
            if (originalClick) originalClick();
        };
    }
}

// Menu radial
function toggleMenu() {
    document.getElementById("radialMenu").classList.toggle("active");
}

// Chargement des plantes
const form = document.getElementById("plante-form");
const divResultats = document.getElementById("resultats");

fetch("plants.json")
    .then(res => res.json())
    .then(data => {
        plantes = data;
        console.log("✅ Données chargées :", plantes);
    })
    .catch(err => console.error("Erreur JSON :", err));

form.addEventListener("submit", function (e) {
    e.preventDefault();
    
    // Masquer le formulaire et afficher les résultats
    document.getElementById("plante-form").style.display = "none";
    document.getElementById("resultats").style.display = "block";
    document.getElementById("selected-section").style.display = "block";
    document.getElementById("others-section").style.display = "block";
    
    // Réinitialiser les résultats
    if (divResultats) divResultats.innerHTML = "";
    document.getElementById("gallery-selected").innerHTML = "";
    document.getElementById("gallery-others").innerHTML = "";

    // Créer et ajouter le bouton de retour
    const backButton = document.createElement('button');
    backButton.className = 'back-to-form-btn';
    backButton.innerHTML = '← Retour au questionnaire';
    backButton.onclick = backToForm;
    divResultats.appendChild(backButton);

    // Récupérer TOUS les champs du formulaire
    const formData = new FormData(form);
    const sols = Array.from(document.querySelectorAll('input[name="sol"]:checked')).map(cb => cb.value);
    const exposition = formData.get('exposition');
    const arrosage = formData.get('arrosage');
    const potager = formData.get('potager');
    const arbres = formData.get('arbres');

    console.log("🔍 Filtres appliqués:", { 
        sols, 
        exposition, 
        arrosage,
        potager, 
        arbres 
    });

    // CORRECTION : Utiliser la fonction filterPlants() qui fonctionne déjà
    const resultat = filterPlants();
    const autres = plantes.filter(p => !resultat.includes(p));

    // Créer les titres des sections
    const selectedSection = document.getElementById("selected-section");
    const othersSection = document.getElementById("others-section");
    
    // Vider les sections
    selectedSection.innerHTML = '';
    othersSection.innerHTML = '';
    
    // Ajouter le titre pour les plantes sélectionnées
    const selectedTitle = document.createElement('h2');
    selectedTitle.className = 'section-title';
    selectedTitle.textContent = `Plantes correspondant à vos critères (${resultat.length})`;
    selectedSection.appendChild(selectedTitle);
    
    // Ajouter la galerie pour les plantes sélectionnées
    const selectedGallery = document.createElement('div');
    selectedGallery.className = 'gallery';
    selectedGallery.id = 'gallery-selected';
    selectedSection.appendChild(selectedGallery);
    
    // Ajouter le titre pour les autres plantes
    const othersTitle = document.createElement('h2');
    othersTitle.className = 'section-title';
    othersTitle.textContent = `Autres plantes disponibles (${autres.length})`;
    othersSection.appendChild(othersTitle);
    
    // Ajouter la galerie pour les autres plantes
    const othersGallery = document.createElement('div');
    othersGallery.className = 'gallery';
    othersGallery.id = 'gallery-others';
    othersSection.appendChild(othersGallery);

    // Fonction d'affichage commune
    const displayPlantCard = (plant, container, checked = false) => {
        // utiliser l'URL Cloudinary du JSON
        let imageUrl = "no-picture-picture.png";  // fallback
        if (plant.photo_url && plant.photo_url.trim() !== "") {
            imageUrl = plant.photo_url;
        }
        createCard(plant, imageUrl, container, checked);
    };

    // Fonction séparée pour créer la carte (évite la duplication de code)
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
        <img src="${imageUrl}" alt="${plant.Nom}" onerror="this.src='no-picture-picture.png'">
        <h3>${plant.Nom}</h3>
        <div class="plant-info">
            <div class="water-line">${waterIcons}</div>
            <div class="sun-line">${sunIcons}</div>
            <div class="life-line">Cycle de vie : ${lifeCycleText}</div>
        </div>
    `;

    // Checkbox logic avec animation et repositionnement
    const checkbox = card.querySelector(".select-checkbox");
    checkbox.addEventListener("change", () => {
        // Ajouter une classe d'animation
        card.classList.add('card-moving');
        
        // Attendre un peu pour que l'animation soit visible
        setTimeout(() => {
            if (checkbox.checked) {
                // Déplacer vers la section sélectionnée et ajouter à la fin
                document.getElementById("gallery-selected").appendChild(card);
            } else {
                // Déplacer vers la section autres et ajouter au début
                const othersContainer = document.getElementById("gallery-others");
                othersContainer.insertBefore(card, othersContainer.firstChild);
            }
            
            // Retirer la classe d'animation après le déplacement
            setTimeout(() => {
                card.classList.remove('card-moving');
            }, 50);
        }, 300);
    });

    // Ouvre la modale au clic (hors checkbox)
    card.addEventListener("click", (e) => {
        if (!e.target.classList.contains("select-checkbox")) {
            showPlantModal(plant, imageUrl);
        }
    });

        container.appendChild(card);
    };

        // Affiche les résultats sélectionnés 
    resultat.forEach(plant => displayPlantCard(plant, selectedGallery, true));

    // Affiche les autres plantes 
    autres.forEach(plant => displayPlantCard(plant, othersGallery, false));
    
    // Attendre que le DOM soit mis à jour avant de configurer la détection
    setTimeout(() => {
        setupScrollDetectionForHelp();
    }, 100);
});

// Fonction pour revenir au formulaire
function backToForm() {
    // Masquer les résultats et afficher le formulaire
    document.getElementById("resultats").style.display = "none";
    document.getElementById("selected-section").style.display = "none";
    document.getElementById("others-section").style.display = "none";
    document.getElementById("plante-form").style.display = "block";
    
    // Réinitialiser à la première étape
    currentStep = 1;
    showStep(currentStep);
    
    // Remonter en haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });

}
