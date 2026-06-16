package ${pkgName};

import io.mateu.core.infra.InputStreamReader;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import lombok.extern.slf4j.Slf4j;

@Controller("<#if path?has_content>${path}<#else>/</#if>")
@Slf4j
public class ${simpleClassName}Controller {

    @Get(value = "/{+path:[\\-a-zA-Z0-9/]+}", produces = MediaType.TEXT_HTML)
    public String getIndexAlways(String path) {
        return getIndex();
    }

    @Get(produces = MediaType.TEXT_HTML)
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
""";
    html = html.replaceAll("<!-- AQUIKEYCLOAK -->", keycloakStuff);
    html = html.replaceAll("<body>", """<body>
<script type="module">
    import Keycloak from 'keycloak-js';

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
            /*
            const s = document.createElement('script');
            s.setAttribute('type', 'module')
            //s.setAttribute('src', 'https://unpkg.com/mateu-ui/dist/assets/mateu.js')
            s.setAttribute('src', '${path}/dist/assets/mateu.js')
                document.head.appendChild(s);
                */

            const u = document.createElement('mateu-ui');
            u.setAttribute('baseUrl', '${path}');
            u.setAttribute('pathPrefix', '${path}');
            u.setAttribute('style', 'width:100%;height:100vh;');
            document.body.appendChild(u);

        }
    }).catch(function(e) {
        console.log('failed to initialize', e);
    });
</script>
""");
<#else >
    html = html.substring(0, html.indexOf("<!-- AQUIUI -->"))
    + "<mateu-ui baseUrl=\"${path}\" pathPrefix=\"${path}\" style=\"width:100%;height:100vh;\"></mateu-ui>"
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
