package ${pkgName};

import io.mateu.core.infra.InputStreamReader;
import io.mateu.core.infra.JsonSerializer;
import io.vertx.core.http.HttpServerRequest;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.jboss.resteasy.reactive.RestResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.Map;

@Path("${path}")
@Slf4j
public class ${simpleClassName}Controller {

    @Value("${r"${spring.devtools.livereload.enabled:false}"}")
    private boolean liveReloadEnabled;

    @Path("*")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String getIndexAlways(HttpServerRequest request) {
        return getIndex(request);
    }


    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String getIndex(HttpServerRequest request) {
        String html = InputStreamReader.readFromClasspath(this.getClass(), "/index/index.html");
        <#list externalScripts as x>
        html = html.replaceAll("<title>AQUIELTITULODELAPAGINA</title>", "<script type='module' src='${x}'></script><title>AQUIELTITULODELAPAGINA</title>");
        </#list>
        html = html.replaceAll("<!-- AQUIFAVICON -->", "");
        html = html.replaceAll("AQUIELTITULODELAPAGINA", "Hello world");
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
    private String getContextData(HttpServerRequest request) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        request.params().forEach((key, value) -> params.add(key, value));

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

    @Path("/assets/**")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public RestResponse getAssets(HttpServerRequest request) {
        return getFromClasspath(request.uri().toString(), "assets", "/npm/mateu/assets/");
    }

    private RestResponse getFromClasspath(String uri, String key, String pkg) {
        String[] tokens = uri.split("/" + key);
        String path = tokens.length > 1 ? tokens[1] : "";
        String suffix =
        path.contains(".") ? path.substring(path.lastIndexOf('.')).replaceAll("\\.", "") : "";
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        String html = InputStreamReader.readFromClasspath(this.getClass(), pkg + path);
        return RestResponse.ResponseBuilder.ok(html).header("Content-Type",
        Map.of("js", "application/javascript", "css", "text/css")
            .getOrDefault(suffix, MediaType.TEXT_HTML.toString())).build();
    }

    @Path("/dist/**")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public RestResponse getDist(HttpServerRequest request) {
        return getFromClasspath(request.uri().toString(), "dist", "/npm/mateu/dist/");
    }
}

