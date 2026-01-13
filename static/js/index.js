function toggleMenu() {
    document.getElementById("radialMenu").classList.toggle("active");
}

function scrollToHowItWorks() {
    const section = document.querySelector('.how-it-works');
    
    const yOffset = -80; 
    const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
    
    window.scrollTo({
        top: y,
        behavior: 'smooth'
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const section = document.querySelector(".how-it-works");

    function checkScroll() {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight - 100) {
            section.classList.add("visible");
            window.removeEventListener("scroll", checkScroll); 
        }
    }

    window.addEventListener("scroll", checkScroll);
});