using System.Text.Json.Nodes;
using Mateu.AspNetCore;
using Mateu.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// conformance/client/sign-in.json: settings (+ the providers declared in code) → the manifest's auth
// block and the page's <meta name="mateu-auth">, byte for byte as Java (the reference) and Python.
// In this port a setting is read from its environment variable; the corpus is run through the
// settings lookup, so no process-wide state is touched.
public class SignInProvidersTests
{
    static JsonArray Cases()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !Directory.Exists(Path.Combine(dir.FullName, "conformance", "client"))) dir = dir.Parent;
        Assert.NotNull(dir);
        var corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(dir!.FullName, "conformance", "client", "sign-in.json")))!;
        return corpus["cases"]!.AsArray();
    }

    static SignInDeclared Declared(JsonNode? code)
    {
        if (code is null) return SignInDeclared.None;
        var providers = new List<SignInProvider>();
        foreach (var p in code["providers"]?.AsArray() ?? [])
        {
            providers.Add(new SignInProvider((string)p!["id"]!)
            {
                Type = (string?)p["type"],
                Label = (string?)p["label"],
                Icon = (string?)p["icon"],
                Issuer = (string?)p["issuer"],
                ClientId = (string?)p["clientId"],
                Scopes = p["scopes"]?.AsArray().Select(s => (string)s!).ToList(),
                Audience = (string?)p["audience"],
                Url = (string?)p["url"],
                Platforms = p["platforms"]?.AsArray().Select(s => (string)s!).ToList(),
                ContinueParam = (bool?)p["continueParam"],
            });
        }
        return new SignInDeclared(providers, (bool?)code["loginOnStart"], (string?)code["logoutUrl"]);
    }

    [Fact]
    public void Every_corpus_case_resolves_as_the_corpus_says()
    {
        foreach (var node in Cases())
        {
            var c = node!.AsObject();
            var name = (string)c["name"]!;
            // the corpus names the settings by key; here they are environment variables
            var env = c["settings"]!.AsObject().ToDictionary(e => SignInProviders.EnvName(e.Key), e => (string?)e.Value);
            var warnings = new List<string>();
            var auth = SignInProviders.AuthBlock(
                key => env.GetValueOrDefault(SignInProviders.EnvName(key)), Declared(c["code"]), null, warnings.Add);
            var expected = c["auth"];
            Assert.True(
                (expected is null ? null : SignInProviders.ToJson(expected)) == (auth is null ? null : SignInProviders.ToJson(auth)),
                name + ": " + (auth is null ? "null" : SignInProviders.ToJson(auth)));
            Assert.True((string?)c["meta"] == SignInProviders.Meta(auth), name + ": " + SignInProviders.Meta(auth));
            Assert.True((int)c["warnings"]! == warnings.Count, name + ": " + string.Join(" | ", warnings));
        }
    }

    [Fact]
    public void The_page_carries_the_web_providers_before_the_head_ends()
    {
        var declared = new SignInDeclared([new SignInProvider("github")]);
        var html = SignInProviders.Head("<html><head><title>T</title></head><body></body></html>", declared, null);
        Assert.Contains(
            "<meta name=\"mateu-auth\" content=\"{&quot;loginOnStart&quot;:true,&quot;providers&quot;:"
            + "[{&quot;id&quot;:&quot;github&quot;,&quot;type&quot;:&quot;redirect&quot;,"
            + "&quot;label&quot;:&quot;GitHub&quot;,&quot;icon&quot;:&quot;github&quot;,"
            + "&quot;url&quot;:&quot;/oauth2/authorization/github&quot;,"
            + "&quot;platforms&quot;:[&quot;web&quot;]}]}\"></head>",
            html);
        Assert.DoesNotContain("mateu-auth", SignInProviders.Head("<html><head></head></html>", SignInDeclared.None, null));
    }

    [Fact]
    public void The_code_declared_providers_reach_the_manifest()
    {
        var declared = new SignInDeclared(
            [new SignInProvider("acme") { Type = "oidc", Label = "Acme SSO", Issuer = "https://idp.acme.com", ClientId = "ui" }],
            LogoutUrl: "/logout");
        var manifest = JsonNode.Parse(MobileManifest.Json(typeof(MobilePlainApp), null, null, declared))!;
        Assert.Equal(
            "{\"type\":\"oidc\",\"issuer\":\"https://idp.acme.com\",\"clientId\":\"ui\",\"scopes\":[\"openid\",\"profile\"],"
            + "\"loginOnStart\":true,\"providers\":[{\"id\":\"acme\",\"type\":\"oidc\",\"label\":\"Acme SSO\",\"icon\":\"key\","
            + "\"issuer\":\"https://idp.acme.com\",\"clientId\":\"ui\",\"scopes\":[\"openid\",\"profile\"],"
            + "\"platforms\":[\"web\",\"mobile\",\"desktop\"]}],\"logoutUrl\":\"/logout\"}",
            SignInProviders.ToJson(manifest["auth"]!));
    }

    [Fact]
    public async Task MateuOptions_SignIn_reaches_the_served_page_and_the_manifest()
    {
        var dir = Directory.CreateTempSubdirectory("mateu-sign-in");
        try
        {
            File.WriteAllText(Path.Combine(dir.FullName, UiPage.Index),
                "<html><head><title>AQUIELTITULODELAPAGINA</title></head><body><!-- AQUIUI --><!-- HASTAAQUIUI --></body></html>");
            var builder = WebApplication.CreateBuilder();
            builder.WebHost.UseUrls("http://127.0.0.1:0");
            builder.Environment.EnvironmentName = "Production";
            builder.Services.AddMateu(
                o => o.SignIn = [new SignInProvider("github"), new SignInProvider("partners") { Url = "/login/partners" }],
                typeof(MobilePlainApp).Assembly);
            await using var web = builder.Build();
            web.MapMateu("sign-in-app", dir.FullName);
            await web.StartAsync();
            var address = web.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
            using var http = new HttpClient { BaseAddress = new Uri(address) };
            http.DefaultRequestHeaders.Accept.ParseAdd("text/html");
            var page = await http.GetStringAsync("/sign-in-app");
            Assert.Contains("<meta name=\"mateu-auth\" content=\"{&quot;loginOnStart&quot;:true,&quot;providers&quot;:[{&quot;id&quot;:&quot;github&quot;", page);
            Assert.Contains("/login/partners", page);
            var manifest = await http.GetStringAsync("/sign-in-app/mateu/v3/manifest");
            Assert.Contains("\"auth\":{\"loginOnStart\":true,\"providers\":[{\"id\":\"github\"", manifest);
            await web.StopAsync();
        }
        finally
        {
            dir.Delete(true);
        }
    }

    [Fact]
    public void An_unusable_provider_is_reported_at_startup()
    {
        var logged = new List<string>();
        SignInProviders.WarnOnStartup(new SignInDeclared([new SignInProvider("okta") { ClientId = "x" }]), null, logged.Add);
        Assert.Contains(logged, m => m.Contains("'okta'") && m.Contains("issuer"));
    }
}
