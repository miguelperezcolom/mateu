using System.Reflection;
using Mateu.AspNetCore;
using Mateu.Uidl;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

// Workshop, lab 06: the Keycloak of labs/06-sign-in/keycloak (WORKSHOP_ISSUER overrides it).
var issuer = Environment.GetEnvironmentVariable("WORKSHOP_ISSUER") ?? "http://localhost:8180/realms/workshop";

// Mateu OFFERS the sign-in to every client (web, phone, desktop): the browser runs OpenID Connect
// against Keycloak and sends `Authorization: Bearer <token>` on every Mateu call...
builder.Services.AddMateu(o =>
{
    o.SignIn = [new SignInProvider("keycloak") { Label = "Workshop SSO", Issuer = issuer, ClientId = "mateu-ui" }];
}, Assembly.GetExecutingAssembly());

// ...and ASP.NET VALIDATES that token, as for any other client of your API. Mateu reads the
// identity it establishes (HttpContext.User: its name and its "roles" claims).
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.Authority = issuer;
        o.Audience = "mateu-ui";
        o.RequireHttpsMetadata = false; // the workshop's Keycloak is plain http on localhost
        o.MapInboundClaims = false;     // keep Keycloak's claim names ("roles", "preferred_username")
    });
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseAuthentication();
// The page and its assets stay open (the client has to load to sign in); every Mateu call needs a
// valid token and answers 401 without one — which is what makes the client sign in.
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Path.Value?.Contains("/mateu/v3/") == true && ctx.User.Identity?.IsAuthenticated != true)
    {
        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return;
    }
    await next();
});

// Serves POST /mateu/v3/sync/{route}: the same wire the Java backends answer, so any Mateu renderer
// renders this app. With MATEU_UI=<the io.mateu:mateu-vaadin jar, or its static/ folder> it also
// serves the web page at http://localhost:8080 (MapMateu(ui: "...") does the same).
app.MapMateu();

// Where it listens: `--urls` / ASPNETCORE_URLS (ASP.NET's own switch) win, then MATEU_URL, then :8080.
app.Run(string.IsNullOrWhiteSpace(app.Configuration["urls"])
    ? Environment.GetEnvironmentVariable("MATEU_URL") ?? "http://localhost:8080"
    : null);
