package ${pkgName};

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import io.mateu.core.infra.InputStreamReader;
import lombok.extern.slf4j.Slf4j;
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
    mateuScript.href = '__MATEU_BUNDLE__';
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
                s.setAttribute('src', '__MATEU_BUNDLE__')
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
        // The module this page boots itself with, read off the page rather than assumed.
        //
        // This used to be the literal "/assets/mateu-vaadin.js", in four places, which quietly
        // made @KeycloakSecured a Vaadin-only annotation: a shell whose pom names a different
        // Mateu frontend got a bootstrap that preloads a bundle it does not ship. Whatever the
        // renderer calls its entry point, the page already says so.
        String mateuBundle = null;
        int moduleAt = html.indexOf("<script type=\"module\" crossorigin src=\"");
        if (moduleAt >= 0) {
            int from = moduleAt + "<script type=\"module\" crossorigin src=\"".length();
            int to = html.indexOf('"', from);
            if (to > from) {
                mateuBundle = html.substring(from, to);
            }
        }

        // Two shapes of page, and the difference is not cosmetic.
        //
        // A page that boots Mateu itself — a module script plus a <mateu-ui> root, which is what
        // the Vite-built renderers ship — has that boot DISABLED here and re-created after
        // authentication, so the UI never starts without a token and never loads twice. That is
        // what the AQUIJS/AQUIUI markers are for, and it is the "silent SSO, no double load"
        // behaviour this template exists to provide.
        //
        // A page that boots some other way has nothing for that surgery to operate on. It used to
        // reach indexOf("<!-- AQUIJS -->") anyway, get -1, and die on substring(0, -1) with a
        // StringIndexOutOfBoundsException — a 500 with no explanation.
        boolean bootsItself = mateuBundle != null
                && html.contains("<!-- AQUIJS -->") && html.contains("<!-- HASTAAQUIJS -->")
                && html.contains("<!-- AQUIUI -->") && html.contains("<!-- HASTAAQUIUI -->");

        // A page with nowhere to put the Keycloak script is REFUSED, loudly.
        //
        // The tempting fallback is to serve it anyway and leave its own boot alone, the way the
        // webflux template does. That is wrong here, and it is worth being explicit about why:
        // this @UI is @KeycloakSecured, and a page served without the script that acquires the
        // token is an UNAUTHENTICATED console that looks like it loaded. A 500 is a bad failure; a
        // console that opens and asks nobody for credentials is a worse one.
        //
        // It happens when a frontend artifact ships a page that is not a Mateu bootstrap: the
        // `redwood` artifact is an Oracle Visual Builder application, loaded by its own loader,
        // with no mateu-ui root and none of these markers. Swapping vaadin-lit for it in a shell's
        // pom is a one-line change that works for an unsecured app and cannot work for a secured
        // one until that page grows a bootstrap of its own.
        if (!html.contains("<!-- AQUIKEYCLOAK -->")) {
            throw new IllegalStateException(
                "This UI is @KeycloakSecured, but the Mateu frontend artifact on the classpath "
                + "ships an _index.html with no <!-- AQUIKEYCLOAK --> marker, so there is nowhere "
                + "to put the script that acquires the token. Serving the page anyway would "
                + "publish an unauthenticated console, so it is refused instead. That artifact "
                + "does not provide a Mateu bootstrap page.");
        }

        keycloakStuff = keycloakStuff.replace("__MATEU_BUNDLE__",
                bootsItself ? mateuBundle : "");
        html = html.replaceAll("<!-- AQUIKEYCLOAK -->", java.util.regex.Matcher.quoteReplacement(keycloakStuff));

        if (bootsItself) {
            html = html.substring(0, html.indexOf("<!-- AQUIUI -->"))
            + html.substring(html.indexOf("<!-- HASTAAQUIUI -->"));
            html = html.substring(0, html.indexOf("<!-- AQUIJS -->"))
            + "<link rel=\"modulepreload\" href=\"" + mateuBundle + "\" />"
            + html.substring(html.indexOf("<!-- HASTAAQUIJS -->"));
            html = html.replaceAll(java.util.regex.Pattern.quote(
                "<script type=\"module\" crossorigin src=\"" + mateuBundle + "\"></script>"), "");
            // The stylesheet is NOT stripped any more. It used to be, and nothing ever put it
            // back: every @KeycloakSecured page therefore rendered without its renderer's own
            // stylesheet, which on the Vaadin one meant the body kept its default 8px margin and
            // the whole app sat that far down its viewport, with the bottom of it — the chat
            // panel's input bar, among other things — hanging off the edge.
        }
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
        extraHead.append("<script<#if s.type?has_content> type=\"${s.type}\"</#if> src=\"${s.src}\"<#if s.crossorigin> crossorigin</#if><#if s.defer> defer</#if><#if s.async> async</#if></script>");
</#list>
        html = html.replace("</head>", extraHead + "</head>");
</#if>
        return html;
    }

}
