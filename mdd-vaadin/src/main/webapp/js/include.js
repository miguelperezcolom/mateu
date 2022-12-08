document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    console.log('Programando customización spinner')
    setTimeout(() => {
        console.log('Customizando spinner')
        document.querySelector('.v-loading-indicator').innerHTML = '<div class="spinner"></div>'
    }, 2000);

});
