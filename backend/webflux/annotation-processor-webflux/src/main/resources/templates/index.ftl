package ${pkgName};

import io.mateu.core.infra.InputStreamReader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("${pkgName}.${simpleClassName}Controller")
@RequestMapping("<#if path?has_content>${path}<#else>/</#if>")
@Slf4j
public class ${simpleClassName}Controller {

    @Value("${r"${spring.devtools.livereload.enabled:false}"}")
    private boolean liveReloadEnabled;

    @Value("${r"${mateu.debug:false}"}")
    private boolean debug;

    @GetMapping(value = "*", produces = MediaType.TEXT_HTML_VALUE)
    public String getIndexAlways() {
        return getIndex();
    }

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
<script src='${keycloak.jsUrl}'></script>
<script>
    function initKeycloak() {
        const keycloak = new Keycloak({
            url: '${keycloak.url}',
            realm: '${keycloak.realm}',
            clientId: '${keycloak.clientId}'
        });
        // The token as the renderers read it: every request carries localStorage.__mateu_auth_token.
        function storeToken() {
            localStorage.setItem('__mateu_auth_token', keycloak.token);
            localStorage.setItem('__mateu_auth_subject', keycloak.subject);
        }
        // Refreshes the token (minValidity seconds ahead; -1 forces it). A refresh that fails means the
        // Keycloak session itself is gone — expired, revoked, or the realm was reset — and no request can
        // succeed any more, so the page goes back to the login instead of leaving the user in front of
        // "your session is no longer valid" with a retry that resends the same dead token.
        function refreshToken(minValidity) {
            return keycloak.updateToken(minValidity).then(function (refreshed) {
                if (refreshed) {
                    storeToken();
                }
                return refreshed;
            }).catch(function (e) {
                console.log('failed to refresh the token, or the session has expired', e);
                keycloak.login();
                throw e;
            });
        }
        keycloak.onTokenExpired = function () {
            refreshToken(30).catch(function () {});
        }
        // Timers do not run in a background tab or on a sleeping laptop, so onTokenExpired can fire too
        // late: check again whenever the page comes back into view.
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible' && keycloak.authenticated) {
                refreshToken(30).catch(function () {});
            }
        });
        // A request answered 401 (the token expired between two checks): the renderers raise the
        // cancelable 'mateu-session-expired' event with {retry, giveUp}. Take it, force a refresh and
        // retry the request once — the action goes through and the user's work is not lost.
        document.addEventListener('mateu-session-expired', function (e) {
            e.preventDefault();
            refreshToken(-1).then(function () {
                e.detail.retry();
            }, function () {
                e.detail.giveUp();
            });
        });
        keycloak.init({
            onLoad: 'login-required',
        }).then(function(authenticated) {
            console.log(authenticated ? 'authenticated' : 'not authenticated');
            if (authenticated) {
                storeToken();
                const s = document.createElement('script');
                s.setAttribute('type', 'module')
                //s.setAttribute('src', 'https://unpkg.com/mateu-ui/dist/assets/mateu.js')
                s.setAttribute('src', '${path}/dist/assets/mateu.js')
                document.head.appendChild(s);

                const u = document.createElement('mateu-ui');
                u.setAttribute('baseUrl', '${path}');
                u.setAttribute('pathPrefix', '${path}');
                u.setAttribute('style', 'width:100%;height:100vh;');
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
        html = html.substring(0, html.indexOf("<!-- AQUIUI -->"))
        + "<mateu-ui baseUrl=\"${path}\" pathPrefix=\"${path}\"" + (debug ? " debug=\"true\"" : "") + " style=\"width:100%;height:100vh;\"></mateu-ui>"
        + html.substring(html.indexOf("<!-- HASTAAQUIUI -->"));
</#if>
<#if metas?has_content || links?has_content || scripts?has_content>
        StringBuilder extraHead = new StringBuilder();
<#list metas as m>
        extraHead.append("<meta<#if m.name?has_content> name=\"${m.name}\"</#if><#if m.httpEquiv?has_content> http-equiv=\"${m.httpEquiv}\"</#if><#if m.charset?has_content> charset=\"${m.charset}\"</#if> content=\"${m.content}\">");
</#list>
<#list links as l>
        extraHead.append("<link rel=\"${l.rel}\" href=\"${l.href}\"<#if l.type?has_content> type=\"${l.type}\"</#if><#if l.as?has_content> as=\"${l.as}\"</#if><#if l.crossorigin> crossorigin</#if>>");
</#list>
<#list scripts as s>
        extraHead.append("<script<#if s.type?has_content> type=\"${s.type}\"</#if> src=\"${s.src}\"<#if s.crossorigin> crossorigin</#if><#if s.defer> defer</#if><#if s.async> async</#if>></script>");
</#list>
        html = html.replace("</head>", extraHead + "</head>");
</#if>
        return html;
    }

}
