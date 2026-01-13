// Get data from tool.js
const gardenData = JSON.parse(localStorage.getItem('gardenPlanData') || '{}');
const selectedPlants = gardenData.plantes || [];
const largeur = gardenData.largeur || '0';
const longueur = gardenData.longueur || '0';
const style = gardenData.style || 'autre';

const styleMap = {
    "francais": "jardin à la française (le jardin doit être géométrique et très structuré, organisé autour d'axes de symétrie clair)",
    "anglais": "jardin à l'anglaise (le jardin doit être naturel, avec des formes irrégulières et peu de symétrie)", 
    "japonais": "jardin japonais (le jardin doit être minimaliste et épuré)",
    "mediterraneen": "jardin méditerranéen",
    "contemporain": "jardin contemporain (le jardin doit être épuré et graphique, aux lignes simples et aux formes nettes)",
    "autre": "sans style particulier"
};

const styleText = styleMap[style] || "sans style particulier";

const styleDescriptions = {
    "francais": "Privilégiez la symétrie et les formes géométriques. Haies taillées, parterres ordonnés et gravier clair. Sculptures et fontaines ajoutent élégance et perspective. Optez pour des matériaux nobles comme la pierre et le marbre.",
    "anglais": "Favorisez un style romantique et naturel, avec massifs floraux mélangés et pelouses ondulantes. Chemins en gravier ou pierre, pergolas et bancs en bois. Mélangez textures et couleurs pour un effet champêtre raffiné et accueillant.",
    "japonais": "Misez sur la simplicité et l'harmonie. Utilisez bambou, pierre, sable et eau. Ponts, lanternes et rocailles créent sérénité et équilibre. Plantes sculptées et tapis de mousse renforcent l'atmosphère zen et contemplative.",
    "mediterraneen": "Privilégiez les couleurs chaudes et la lumière. Terrasses en pierre ou céramique, oliviers et lavande. Pots en terre cuite, fontaines et pergolas ombragées apportent authenticité et ambiance conviviale.",
    "contemporain": "Optez pour des lignes épurées et matériaux modernes : béton, acier, verre. Minimalisme et contrastes de textures. Éclairage discret, bassins ou sculptures design pour créer un jardin chic, fonctionnel et résolument actuel.",
    "autre": "Mélangez styles, couleurs et matériaux selon vos envies. Variez textures, formes et végétaux pour un jardin unique. Mobilier, décorations et chemins peuvent être choisis librement pour allier confort, esthétique et créativité."
};

const styleDescription = styleDescriptions[style] || styleDescriptions.autre;

document.addEventListener('DOMContentLoaded', function() {
    const confirmationCard = document.getElementById('confirmationCard');
    if (confirmationCard) {
        confirmationCard.style.display = 'none';
    }
    
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.style.display = 'block';
    }
});

document.getElementById('plantList').textContent = 
    selectedPlants.join(', ') || 'Aucune plante sélectionnée';

// Prompt
const promptText = selectedPlants.length > 0
    ? `Tu es un expert en jardinage.
J'ai un jardin de ${largeur} m sur ${longueur} m et j'aimerais y planter les plantes suivantes : ${selectedPlants.join(', ')}.
Propose un plan de jardinage dans un style ${styleText}. Les plantes doivent être en priorité sur les BORDURES pour laisser de l'espace central libre.

IMPORTANT : Renvoie UNIQUEMENT un JSON avec ce format exact :
{
"zones": [
{"plante": "nom1", "x": 20, "y": 30, "rayon": 8, "couleur": "#4CAF50"}
]
}

Règles :
- "x" et "y" : coordonnées entre 10 et 90
- Place les plantes principalement sur les bordures 
- "rayon" : entre 3 et 12
- "couleur" : code hexadécimal
- Une entrée par plante (une même plante peut apparaître plusieurs fois)
- Prends garde aux collisions : les plantes ne doivent pas se superposer`
    : "Erreur : aucune plante sélectionnée";

document.getElementById('prompt').value = promptText;

// API configuration
let MY_API_KEY = "";

try {
    if (window.APP_CONFIG && window.APP_CONFIG.GEMINI_API_KEY) {
        MY_API_KEY = window.APP_CONFIG.GEMINI_API_KEY;
        console.log("✅ Clé API chargée depuis config.js");
    }
    else if (window.GEMINI_API_KEY) {
        MY_API_KEY = window.GEMINI_API_KEY;
        console.log("✅ Clé API chargée depuis variable globale");
    }
    else {
        console.warn("⚠️  Clé API non trouvée. Vérifiez que config.js existe.");
        
        const statusEl = document.getElementById('statusMessage');
        if (statusEl) {
            statusEl.innerHTML = `
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #856404; margin-top: 0;">Configuration requise</h3>
                    <p>Créez un fichier <code>.env</code> à la racine avec votre clé API :</p>
                    <pre style="background: #f8f9fa; padding: 10px; border-radius: 3px;">
MY_API_KEY="votre_clé_api_ici"</pre>
                    <p>Puis exécutez : <code>node generate-config.js</code></p>
                </div>
            `;
        }
    }
} catch (error) {
    console.error("❌ Erreur de configuration:", error);
}

let currentPlanData = null;

// Cut plant name if too long
function formatPlantName(plantName, maxWidth = 100) {
    const fontSize = 13;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px Arial`;
    
    const textWidth = ctx.measureText(plantName).width;
    
    if (textWidth > maxWidth) {
        let shortName = plantName;
        while (shortName.length > 3) {
            shortName = shortName.substring(0, shortName.length - 1);
            const shortWidth = ctx.measureText(shortName + '...').width;
            if (shortWidth <= maxWidth) {
                return shortName + '...';
            }
        }
        return shortName.substring(0, 3) + '...';
    }
    
    return plantName;
}

// Cut text in lines
function wrapText(text, maxCharsPerLine) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        if ((currentLine + ' ' + word).length > maxCharsPerLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = currentLine ? currentLine + ' ' + word : word;
        }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
}

function formatPlantList(plants) {
    return plants.map((plant, index) => `${index + 1}. ${plant}`).join(', ');
}

function createSVGForPNG(planData) {
    const gardenWidth = Number(largeur);
    const gardenHeight = Number(longueur);
    const ratio = gardenWidth / gardenHeight;

    const zones = planData.zones || [];
    
    // A4 (297mm x 210mm) in pixels (96 DPI)
    const width = 1123;  // 297mm * 96/25.4 ≈ 1123px
    const height = 1584; // 420mm * 96/25.4 ≈ 1584px
    const margin = 80;
    
    const maxPlanWidth = 600;
    const maxPlanHeight = 1000;

    let planWidth, planHeight;

    if (ratio >= 1) {
        planWidth = Math.min(maxPlanWidth, maxPlanHeight * ratio);
        planHeight = planWidth / ratio;
    } else {
        planHeight = Math.min(maxPlanHeight, maxPlanWidth / ratio);
        planWidth = planHeight * ratio;
    }

    const planX = (width - planWidth) / 2;
    const planY = margin + 100;
    
    const listStartY = planY + planHeight + 80;
    
    const plantListText = formatPlantList(selectedPlants);
    const wrappedPlantList = wrapText(plantListText, 120);
    const wrappedStyleDescription = wrapText(styleDescription, 120);
    const lineHeight = 25;
    
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
     xmlns="http://www.w3.org/2000/svg">
    
    <!-- Fond blanc -->
    <rect width="100%" height="100%" fill="white"/>
    
    <!-- Titre -->
    <text x="${width/2}" y="80" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#2E7D32">
        Plan de jardin
    </text>
    
    <!-- Informations -->
    <text x="${width/2}" y="130" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="20" fill="#333">
        ${largeur}m × ${longueur}m
    </text>
    <text x="${width/2}" y="160" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="14" fill="#666">
        Représentation schématique : l’échelle n’est pas nécessairement respectée afin de préserver la lisibilité du document. 
    </text>
    
    <!-- Zone du plan (rectangle proportionnel) -->
    <g transform="translate(${planX}, ${planY})">
        <!-- Cadre du jardin -->
        <rect x="0" y="0" width="${planWidth}" height="${planHeight}"
              fill="#f9fff9" stroke="#4CAF50" stroke-width="3"/>
        
        <!-- Plantes avec noms formatés -->
        ${zones.map((zone) => {
            const x = (zone.x || 50) * planWidth / 100;
            const y = (zone.y || 50) * planHeight / 100;
            const rayon = (zone.rayon || 5) * Math.min(planWidth, planHeight) / 100;
            const couleur = zone.couleur || "#4CAF50";
            const plante = zone.plante || "Plante";
            
            const maxTextWidth = rayon * 1.8;
            const displayName = formatPlantName(plante, maxTextWidth);
            
            return `
        <g>
            <circle cx="${x}" cy="${y}" r="${rayon}" 
                    fill="${couleur}" stroke="#2E7D32" stroke-width="2"/>
            <text x="${x}" y="${y}" text-anchor="middle" dy="0.35em" 
                  font-family="Arial, sans-serif" font-size="14" 
                  fill="white">
                ${displayName}
            </text>
        </g>`;
        }).join('')}
    </g>
    
    <!-- Liste des plantes sous le plan -->
    <g transform="translate(${80}, ${listStartY})">
        <!-- Titre liste -->
        <text x="0" y="0" font-family="Arial, sans-serif" font-size="18" 
              font-weight="bold" fill="#2E7D32">
            Liste des plantes :
        </text>
        
        <!-- Liste découpée en plusieurs lignes -->
        ${wrappedPlantList.map((line, index) => `
        <text x="0" y="${30 + (index * lineHeight)}" 
              font-family="Arial, sans-serif" font-size="18" fill="#333">
            ${line}
        </text>
        `).join('')}
        
    </g>

    <!-- Description du style -->
    <g transform="translate(${80}, ${listStartY + 60 + (wrappedPlantList.length * lineHeight)})">
        <text x="0" y="0" font-family="Arial, sans-serif" font-size="18" 
            font-weight="bold" fill="#2E7D32">
            Style ${style} :
        </text>
        
        <!-- Description découpée en plusieurs lignes -->
        ${wrappedStyleDescription.map((line, index) => `
        <text x="0" y="${30 + (index * lineHeight)}" 
              font-family="Arial, sans-serif" font-size="18" fill="#333">
            ${line}
        </text>
        `).join('')}
    </g>
    
    <!-- Pied de page -->
    <text x="${width/2}" y="${height - 40}" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="14" fill="#666">
        Généré par Coup de Pousse • ${new Date().toLocaleDateString('fr-FR')}
    </text>
    
</svg>`;
    
    return svg;
}

function createSimpleSVG(planData) {
    const zones = planData.zones || [];
    
    const gardenWidth = Number(largeur);
    const gardenHeight = Number(longueur);
    const ratio = gardenWidth / gardenHeight;
    
    let viewBoxWidth, viewBoxHeight;
    if (ratio >= 1) {
        viewBoxWidth = 100;
        viewBoxHeight = 100 / ratio;
    } else {
        viewBoxHeight = 100;
        viewBoxWidth = 100 * ratio;
    }
    
    let svg = `<svg width="800" height="650" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" 
         xmlns="http://www.w3.org/2000/svg">
    
    <!-- Fond du jardin -->
    <rect width="${viewBoxWidth}" height="${viewBoxHeight}" fill="#f9fff9" stroke="#4CAF50" stroke-width="0.5"/>
    
    <!-- Plantes avec noms formatés -->
    ${zones.map((zone) => {
        const x = (zone.x || 50) * viewBoxWidth / 100;
        const y = (zone.y || 50) * viewBoxHeight / 100;
        const rayon = (zone.rayon || 5) * Math.min(viewBoxWidth, viewBoxHeight) / 100;
        const couleur = zone.couleur || "#4CAF50";
        const plante = zone.plante || "Plante";
        
        const maxTextWidth = rayon * 8;
        const displayName = formatPlantName(plante, maxTextWidth);
        
        return `
    <g>
        <circle cx="${x}" cy="${y}" r="${rayon}" fill="${couleur}" stroke="#2E7D32" stroke-width="0.3"/>
        <text x="${x}" y="${y}" text-anchor="middle" dy="0.35em" 
              font-size="9" fill="white" font-weight="bold">
            ${displayName}
        </text>
    </g>`;
    }).join('')}
    
    <!-- Dimensions -->
    <text x="${viewBoxWidth/2}" y="5" text-anchor="middle" font-size="3" fill="#666">
        ${largeur}m × ${longueur}m
    </text>
    
</svg>`;
    
    return svg;
}

async function downloadPNG() {
    if (!currentPlanData) {
        alert("❌ Aucun plan à télécharger");
        return;
    }
    
    try {
        const svgContent = createSVGForPNG(currentPlanData);
        
        const svgBlob = new Blob([svgContent], {type: 'image/svg+xml;charset=utf-8'});
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = 1123;   
            canvas.height = 1584;  
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const pngUrl = canvas.toDataURL('image/png', 1.0);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `plan-jardin-${largeur}x${longueur}m-A4.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(svgUrl);
        };
        
        img.onerror = function() {
            alert("❌ Erreur de conversion SVG → PNG");
            URL.revokeObjectURL(svgUrl);
        };
        
        img.src = svgUrl;
        
    } catch (error) {
        console.error("Erreur PNG:", error);
        alert("❌ Erreur lors de la conversion PNG");
    }
}

// Send to Gemini
async function sendToGemini() {
    const statusMessage = document.getElementById('statusMessage');
    const confirmationCard = document.getElementById('confirmationCard');
    const svgOutput = document.getElementById('svg-output');
    
    console.log("Envoi à Gemini...");
    console.log("Prompt:", promptText);
    
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${MY_API_KEY}`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    contents: [{
                        parts: [{text: promptText}]
                    }]
                })
            }
        );
        
        const data = await response.json();
        
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const resultText = data.candidates[0].content.parts[0].text;
            console.log("Réponse de Gemini:", resultText);
            
            const jsonMatch = resultText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const planData = JSON.parse(jsonMatch[0]);
                currentPlanData = planData;
                
                if (statusMessage) statusMessage.style.display = 'none';
                if (confirmationCard) confirmationCard.style.display = 'block';
                
                const detailsElement = document.querySelector('.confirmation-details');
                if (detailsElement) {
                    detailsElement.innerHTML = `
                        Dimensions : <strong>${largeur}m × ${longueur}m</strong> | 
                        Style : <strong>${style}</strong> | 
                        Plantes : <strong>${selectedPlants.length}</strong>
                    `;
                }
                
                console.log("✅ Plan généré avec succès !");
            }
            
        } else if (data.error) {
            console.error("❌ Erreur API:", data.error);
            if (statusMessage) statusMessage.style.display = 'none';
            if (confirmationCard) {
                confirmationCard.innerHTML = `
                    <div class="confirmation-content">
                        <div class="confirmation-icon">❌</div>
                        <div class="confirmation-text">
                            <h3>Erreur de génération</h3>
                            <p>Une erreur est survenue lors de la génération du plan.</p>
                            <p class="confirmation-details">${data.error.message || 'Erreur API'}</p>
                        </div>
                    </div>
                `;
                confirmationCard.style.display = 'block';
            }
        }
    } catch(e) {
        console.error("❌ Erreur réseau:", e);
        if (statusMessage) statusMessage.style.display = 'none';
        if (confirmationCard) {
            confirmationCard.innerHTML = `
                <div class="confirmation-content">
                    <div class="confirmation-icon">❌</div>
                    <div class="confirmation-text">
                        <h3>Erreur réseau</h3>
                        <p>Impossible de se connecter au serveur.</p>
                        <p class="confirmation-details">${e.message}</p>
                    </div>
                </div>
            `;
            confirmationCard.style.display = 'block';
        }
    }
}

setTimeout(sendToGemini, 1000);

document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendToGemini();
    }
});

function toggleMenu() {
    document.getElementById("radialMenu").classList.toggle("active");
}