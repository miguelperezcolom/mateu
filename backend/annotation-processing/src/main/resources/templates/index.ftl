package ${pkgName};

import io.mateu.core.domain.UIRegistry;
import io.mateu.util.Helper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;


@RestController
@RequestMapping("${path}")
@Slf4j
public class ${simpleClassName}Controller {

    @GetMapping(value = "", produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex() {
        String html = Helper.leerFichero(this.getClass(), "/index/index.html");
<#list externalScripts as x>
        html = html.replaceAll("<title>AQUIELTITULODELAPAGINA</title>", "<script type='module' src='${x}'></script><title>AQUIELTITULODELAPAGINA</title>");
</#list>
        html = html.replaceAll("AQUIELTITULODELAPAGINA", "${caption}");
        html = html.replaceAll("http:\\/\\/localhost:8081\\/mateu\\/v1", "/mateu/v1");
        html = html.replaceAll("com\\.example\\.demoremote\\.ui\\.demoApp\\.DemoApp", "${className}");
<#if keycloak??>
        String keycloakStuff = """
<script src='https://www.unpkg.com/keycloak-js/dist/keycloak.min.js'></script>
<script>
    function initKeycloak() {
        const keycloak = new Keycloak({
            url: '${keycloak.url}',
            realm: '${keycloak.realm}',
            clientId: '${keycloak.clientId}'
        });
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
                //s.setAttribute('src', 'https://unpkg.com/mateu-ui/dist/assets/mateu.js')
                s.setAttribute('src', '/mateu/dist/assets/mateu.js')
                document.head.appendChild(s);

                const u = document.createElement('mateu-ui');
                u.setAttribute('uiId', '${className}')
                u.setAttribute('baseUrl', '/mateu/v1')
                document.body.appendChild(u);

            }
        }).catch(function(e) {
            console.log('failed to initialize', e);
        });
    }
</script>
""";
        html = html.replaceAll("<!-- AQUIKEYCLOAK -->", keycloakStuff);
        html = html.replaceAll("<body>", "<body onload='initKeycloak()'>");
<#else >
    //html = html.replaceAll("<!-- AQUIMATEU -->", "<script type='module' src='https://unpkg.com/mateu-ui/dist/assets/mateu.js'></script>");
    html = html.replaceAll("<!-- AQUIMATEU -->", "<script type='module' src='/mateu/dist/assets/mateu.js'></script>");
    html = html.replaceAll("<!-- AQUIUI -->", "<mateu-ui uiId='${className}' baseUrl='${path}/mateu/v1'></mateu-ui>");
</#if>
        return html;
    }

    @Autowired
    UIRegistry uiRegistry;

    @PostConstruct
    public void init() {
        try {
            uiRegistry.add(Class.forName("${className}"));
        } catch (ClassNotFoundException e) {
            log.error("Unable to find class ${className} for UI registration");
        }
    }

}
