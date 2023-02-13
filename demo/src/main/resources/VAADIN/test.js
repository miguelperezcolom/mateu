function initKeycloak() {
    const keycloak = new Keycloak({
        url: 'https://id-dev.wefox.com/auth',
        realm: 'employees',
        clientId: 'wefox-bowie-poc'
    });
    console.log(keycloak);

    keycloak.init({onLoad: 'check-sso'}).then(function(authenticated) {
        alert(authenticated ? 'authenticated' : 'not authenticated');
    }).catch(function() {
        alert('failed to initialize');
    });

    keycloak.onTokenExpired = () => {
        console.log('token expired', keycloak.token);
        keycloak.updateToken(30).success(() => {
            console.log('successfully get a new token', keycloak.token);
        }).error((e) => {
            alert(e);
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    initKeycloak();
});
