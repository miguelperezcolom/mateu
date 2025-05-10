package ${pkgName};

import io.mateu.core.infra.InputStreamReader;
import io.mateu.core.infra.JsonSerializer;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.Map;

@Controller("${path}")
@Slf4j
public class ${simpleClassName}Controller {

    @Value("${r"${spring.devtools.livereload.enabled:false}"}")
    private boolean liveReloadEnabled;

    @Get(value = "*", produces = MediaType.TEXT_HTML)
    public String getIndexAlways(HttpRequest request) {
        return getIndex(request);
    }


    @Get(value = "", produces = MediaType.TEXT_HTML)
    public String getIndex(HttpRequest request) {
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
</#if>
        return html;
    }

    @SneakyThrows
    private String getContextData(HttpRequest request) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.putAll(request.getParameters().asMap());

        Map<String, Object> data = new HashMap<>();
        params.forEach((key, value) -> {
            Object v = value;
            if (value.size() == 1) {
                v = value.get(0);
            }
            data.put(key, v);
        });

        return JsonSerializer.toJson(data).replaceAll("\\n","");
    }

    @Get(value = "/assets/**")
    public HttpResponse getAssets(HttpRequest request) {
        return getFromClasspath(request.getUri().toString(), "assets", "/npm/mateu/assets/");
    }

    private HttpResponse getFromClasspath(String uri, String key, String pkg) {
        String[] tokens = uri.split("/" + key);
        String path = tokens.length > 1 ? tokens[1] : "";
        String suffix =
        path.contains(".") ? path.substring(path.lastIndexOf('.')).replaceAll("\\.", "") : "";
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        String html = InputStreamReader.readFromClasspath(this.getClass(), pkg + path);
        return HttpResponse.ok(html).header("Content-Type",
        Map.of("js", "application/javascript", "css", "text/css")
            .getOrDefault(suffix, MediaType.TEXT_HTML.toString()));
    }

    @Get(value = "/dist/**")
    public HttpResponse getDist(HttpRequest request) {
        return getFromClasspath(request.getUri().toString(), "dist", "/npm/mateu/dist/");
    }
}
