package ${pkgName};

import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIMapper;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.uidl.interfaces.ReflectionHelper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import io.mateu.core.domain.model.util.InputStreamReader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;

import java.util.Map;


@RestController("${pkgName}.${simpleClassName}Controller")
@RequestMapping("${path}")
@Slf4j
public class ${simpleClassName}Controller {

    @Value("${r"${spring.devtools.livereload.enabled:false}"}")
    private boolean liveReloadEnabled;
    @Autowired
    private UIMapper uiMapper;
    @Autowired
    private ReflectionHelper reflectionHelper;

    @GetMapping(value = "", produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex() {
        String html = InputStreamReader.readFromClasspath(this.getClass(), "${indexHtmlPath}");
<#list externalScripts as x>
        html = html.replaceAll("<title>AQUIELTITULODELAPAGINA</title>", "<script type='module' src='${x}'></script><title>AQUIELTITULODELAPAGINA</title>");
</#list>
        html = html.replaceAll("<!-- AQUIFAVICON -->", "${favicon}");
        html = html.replaceAll("AQUIELTITULODELAPAGINA", "${caption}");
<#if keycloak??>
        String keycloakStuff = """
<script src='${keycloak.jsUrl}'></script>
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
                s.setAttribute('src', '${path}/dist/assets/mateu.js')
                document.head.appendChild(s);

                const u = document.createElement('mateu-ui');
                u.setAttribute('uiId', '${className}')
                u.setAttribute('baseUrl', '${path}')
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
    html = html.replaceAll("<!-- AQUIMATEU -->", "<script type='module' src='${frontendPath}'></script>"
                            + (liveReloadEnabled?
                                    "<script src='http://localhost:35729/livereload.js'></script>":""));
    html = html.replaceAll("<!-- AQUIUI -->", "<mateu-ui baseUrl='${path}'></mateu-ui>");
</#if>
        return html;
    }


@GetMapping(value = "/assets/**")
public ResponseEntity<String> getAssets(ServerHttpRequest request) {
    return getFromClasspath(request.getURI().toString(), "assets", "/npm/mateu/assets/");
    }

    private ResponseEntity<String> getFromClasspath(String uri, String key, String pkg) {
        String[] tokens = uri.split("/" + key);
        String path = tokens.length > 1 ? tokens[1] : "";
        String suffix =
        path.contains(".") ? path.substring(path.lastIndexOf('.')).replaceAll("\\.", "") : "";
        final HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(
        "Content-Type",
        Map.of("js", "application/javascript", "css", "text/css")
        .getOrDefault(suffix, MediaType.TEXT_PLAIN_VALUE.toString()));
        if (path.startsWith("/")) {
        path = path.substring(1);
        }
        String html = InputStreamReader.readFromClasspath(this.getClass(), pkg + path);
        return new ResponseEntity(html, httpHeaders, HttpStatus.OK);
        }

        @GetMapping(value = "/dist/**")
        public ResponseEntity<String> getDist(ServerHttpRequest request) {
            return getFromClasspath(request.getURI().toString(), "dist", "/npm/mateu/dist/");
            }



            }
