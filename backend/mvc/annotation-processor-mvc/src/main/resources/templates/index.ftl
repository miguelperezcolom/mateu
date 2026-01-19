package ${pkgName};

import lombok.SneakyThrows;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import io.mateu.core.infra.InputStreamReader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController("${pkgName}.${simpleClassName}Controller")
@RequestMapping("${path}")
@Slf4j
public class ${simpleClassName}Controller {

    @Value("${r"${spring.devtools.livereload.enabled:false}"}")
    private boolean liveReloadEnabled;

    @GetMapping(value = "", produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex() {
        String html = InputStreamReader.readFromClasspath(this.getClass(), "${indexHtmlPath}");
<#list externalScripts as x>
        html = html.replaceAll("<title>AQUIELTITULODELAPAGINA</title>", "<script type='module' src='${x}'></script><title>AQUIELTITULODELAPAGINA</title>");
</#list>
        html = html.replaceAll("<!-- AQUIFAVICON -->", "${favicon}");
        html = html.replaceAll("AQUIELTITULODELAPAGINA", "${pageTitle}");
<#if keycloak??>
        String keycloakStuff = """
<script type="module">
    import Keycloak from '${keycloak.jsUrl}';

    // 1. Iniciamos la descarga del script de la UI inmediatamente,
    // sin esperar al init de Keycloak
    const mateuScript = document.createElement('link');
    mateuScript.rel = 'modulepreload';
    mateuScript.href = '${path}/assets/mateu-vaadin.js';
    document.head.appendChild(mateuScript);

    const keycloak = new Keycloak({
        url: '${keycloak.url}',
        realm: '${keycloak.realm}',
        clientId: '${keycloak.clientId}'
    });

    async function initKeycloak() {

        keycloak.onTokenExpired = function () {
            console.log('token expired')
            keycloak.updateToken(30)
                .then(function (refreshed) {
                    if (refreshed) {
                        console.log('token refreshed');
                        // write any code you required here
                        localStorage.setItem('__mateu_auth_token', keycloak.token);
                        localStorage.setItem('__mateu_auth_subject', keycloak.subject);
                    } else {
                        console.log('token is still valid now');
                    }
                }).catch(function (e) {
                console.log('failed to refresh the token, or the session has expired', e);
            });
        }
        keycloak.init({
            onLoad: 'login-required',
        }).then(function(authenticated) {
            console.log(authenticated ? 'authenticated' : 'not authenticated');
            if (authenticated) {
                localStorage.setItem('__mateu_auth_token', keycloak.token);
                localStorage.setItem('__mateu_auth_subject', keycloak.subject);
                const s = document.createElement('script');
                s.setAttribute('type', 'module')
                s.setAttribute('src', '${path}/assets/mateu-vaadin.js')
                document.head.appendChild(s);

                const u = document.createElement('mateu-ui');
                u.setAttribute('baseUrl', '${path}');
                u.setAttribute('style', 'width:100%;height:100vh;');
                document.body.appendChild(u);

            }
        }).catch(function(e) {
            console.log('failed to initialize', e);
        });
    }

    async function logout() {

        console.log('logout');

        // 1. Limpiamos local storage
        localStorage.removeItem('__mateu_auth_token');
        localStorage.removeItem('__mateu_auth_subject');

        // 2. Ejecutamos el logout de Keycloak
        keycloak.logout({
            redirectUri: window.location.origin,
            post_logout_redirect_uri: '${path}'
        });
    }

    // EXPOSICIÓN GLOBAL:
    window.logout = logout;

    // Ejecutamos la función
    initKeycloak();
</script>
""";
        html = html.replaceAll("<!-- AQUIKEYCLOAK -->", keycloakStuff);
        //html = html.replaceAll("<body>", "<body onload='initKeycloak()'>");
        html = html.substring(0, html.indexOf("<!-- AQUIUI -->"))
        + html.substring(html.indexOf("<!-- HASTAAQUIUI -->"));
html = html.substring(0, html.indexOf("<!-- AQUIJS -->"))
+ """
<link rel="modulepreload"
           href="${path}/assets/mateu-vaadin.js" />"""
+ html.substring(html.indexOf("<!-- HASTAAQUIJS -->"));
html = html.replaceAll(
"<script type=\"module\" crossorigin src=\"/assets/mateu-vaadin.js\"></script>",
"");
html = html.replaceAll(
"<link rel=\"stylesheet\" crossorigin href=\"/assets/index.css\">",
"");
<#else >
    html = html.substring(0, html.indexOf("<!-- AQUIUI -->"))
    + "<mateu-ui baseUrl=\"${path}\" style=\"width:100%;height:100vh;\"></mateu-ui>"
    + html.substring(html.indexOf("<!-- HASTAAQUIUI -->"));
</#if>
        return html;
    }

}
