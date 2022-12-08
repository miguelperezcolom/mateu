document.addEventListener('DOMContentLoaded', () => {

    var f = () => {
        console.log('Customizando spinner');
        if (document.querySelector('.v-loading-indicator')) {
            document.querySelector('.v-loading-indicator').innerHTML = '<div class="spinner"></div>';
            console.log('spinner customizado')
        } else {
            console.log('Reprogramando customización spinner')
            setTimeout(f, 1000);
        }
    }

    // Get all "navbar-burger" elements
    console.log('Programando customización spinner')
    setTimeout(f, 1000);

});
