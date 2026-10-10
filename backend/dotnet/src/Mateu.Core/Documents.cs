using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Where an action's <see cref="Document"/> waits until the browser fetches it from
/// <c>{baseUrl}/mateu/v3/documents/{token}</c>. The token (256 random bits) is the capability:
/// minted only in the response to an action the user was allowed to run, valid ONCE and for a short
/// time (5 minutes by default). Bounded (500 documents / 256 MB of eager content, oldest dropped
/// first); in memory, per process. (Mirrors Java's DocumentStore.)</summary>
public sealed class DocumentStore
{
    public const int MaxEntries = 500;
    public const long MaxParkedBytes = 256L * 1024 * 1024;

    /// <summary>Documents up to this many bytes travel inline (base64) in the action response.</summary>
    public static int InlineMaxBytes { get; set; } = 256 * 1024;

    /// <summary>The store the endpoint serves from.</summary>
    public static DocumentStore Shared { get; set; } = new(TimeSpan.FromMinutes(5));

    public sealed record Parked(string Filename, string MediaType, DocumentDisposition Disposition,
        Func<byte[]> Content, long EagerBytes, DateTimeOffset ExpiresAt);

    private readonly TimeSpan _ttl;
    private readonly Func<DateTimeOffset> _now;
    private readonly LinkedList<string> _order = new();
    private readonly Dictionary<string, (Parked Doc, LinkedListNode<string> Node)> _parked = new();
    private long _bytes;

    public DocumentStore(TimeSpan ttl, Func<DateTimeOffset>? now = null)
    {
        _ttl = ttl;
        _now = now ?? (() => DateTimeOffset.UtcNow);
    }

    public string Park(Document document)
    {
        var eager = document.Content?.LongLength ?? 0;
        Func<byte[]> content = document.Content is { } bytes ? () => bytes : document.LazyContent!;
        var token = Base64Url(RandomNumberGenerator.GetBytes(32));
        lock (_parked)
        {
            PurgeExpired();
            var node = _order.AddLast(token);
            _parked[token] = (new Parked(document.Filename, document.MediaType, document.Disposition, content,
                eager, _now() + _ttl), node);
            _bytes += eager;
            while ((_parked.Count > MaxEntries || _bytes > MaxParkedBytes) && _order.First is { } oldest)
                Remove(oldest.Value);
        }
        return token;
    }

    /// <summary>Takes the document parked under <paramref name="token"/> — once; null when unknown,
    /// already taken or expired.</summary>
    public Parked? Take(string? token)
    {
        if (token is null) return null;
        lock (_parked)
        {
            if (!_parked.TryGetValue(token, out var entry)) return null;
            Remove(token);
            return _now() < entry.Doc.ExpiresAt ? entry.Doc : null;
        }
    }

    public int Count
    {
        get { lock (_parked) { PurgeExpired(); return _parked.Count; } }
    }

    private void PurgeExpired()
    {
        var now = _now();
        foreach (var token in _parked.Where(e => now >= e.Value.Doc.ExpiresAt).Select(e => e.Key).ToList())
            Remove(token);
    }

    private void Remove(string token)
    {
        if (!_parked.Remove(token, out var entry)) return;
        _order.Remove(entry.Node);
        _bytes -= entry.Doc.EagerBytes;
    }

    private static string Base64Url(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}

/// <summary><c>GET {baseUrl}/mateu/v3/documents/{token}</c>: the response for a parked document —
/// single use, <c>no-store</c>, <c>nosniff</c>, a sandboxed active type, and a Content-Disposition
/// with no CR/LF/quotes/path in it. (Mirrors Java's DocumentDownloads.)</summary>
public static class DocumentDownloads
{
    public const string PathMarker = "/mateu/v3/documents/";

    public sealed record Response(int Status, IReadOnlyDictionary<string, string> Headers, byte[] Body);

    private static readonly Regex Token = new("^[A-Za-z0-9_-]{16,128}$", RegexOptions.Compiled);
    private static readonly Regex MediaType = new(
        "^[!#$&^_.+A-Za-z0-9-]{1,127}/[!#$&^_.+A-Za-z0-9-]{1,127}(\\s*;\\s*[!#$&^_.+A-Za-z0-9-]{1,127}=([!#$&^_.+A-Za-z0-9-]{1,127}|\"[^\"\\\\\\p{Cc}]{0,127}\"))*$",
        RegexOptions.Compiled);

    public static Response Serve(string? token, DocumentStore? store = null)
    {
        var noStore = new Dictionary<string, string> { ["Cache-Control"] = "no-store" };
        if (token is null || !Token.IsMatch(token)) return new Response(404, noStore, []);
        var doc = (store ?? DocumentStore.Shared).Take(token);
        if (doc is null) return new Response(404, noStore, []);
        byte[] body;
        try { body = doc.Content() ?? []; }
        catch (Exception) { return new Response(500, noStore, []); }
        var mediaType = SafeMediaType(doc.MediaType);
        var headers = new Dictionary<string, string>
        {
            ["Content-Type"] = mediaType,
            ["Content-Disposition"] = ContentDisposition(doc.Disposition, doc.Filename),
            ["Cache-Control"] = "no-store",
            ["X-Content-Type-Options"] = "nosniff",
            ["Referrer-Policy"] = "no-referrer",
        };
        if (IsActive(mediaType)) headers["Content-Security-Policy"] = "sandbox";
        return new Response(200, headers, body);
    }

    public static string ContentDisposition(DocumentDisposition disposition, string? filename)
    {
        var clean = SafeFilename(filename);
        var ascii = new StringBuilder();
        foreach (var c in clean) ascii.Append(c >= 0x20 && c < 0x7f && c != '"' && c != '\\' && c != '%' ? c : '_');
        return (disposition == DocumentDisposition.Inline ? "inline" : "attachment")
               + "; filename=\"" + ascii + "\"; filename*=UTF-8''" + Rfc5987(clean);
    }

    public static string SafeFilename(string? filename)
    {
        if (filename is null) return "document";
        var sb = new StringBuilder();
        foreach (var rune in filename.EnumerateRunes())
        {
            var cat = Rune.GetUnicodeCategory(rune);
            sb.Append(Rune.IsControl(rune) || rune.Value is '/' or '\\' or 0x2028 or 0x2029
                      || cat == UnicodeCategory.Format ? "_" : rune.ToString());
        }
        var clean = sb.ToString().Trim().TrimStart('.');
        if (clean.Length > 200) clean = clean[..200];
        return string.IsNullOrWhiteSpace(clean) ? "document" : clean;
    }

    public static string SafeMediaType(string? mediaType)
    {
        var trimmed = mediaType?.Trim() ?? "";
        return MediaType.IsMatch(trimmed) ? trimmed : "application/octet-stream";
    }

    private static bool IsActive(string mediaType)
    {
        var b = mediaType.Split(';')[0].Trim().ToLowerInvariant();
        return b == "text/html" || b.Contains("xml") || b.Contains("svg") || b.Contains("javascript") || b == "text/xsl";
    }

    private static string Rfc5987(string value)
    {
        var sb = new StringBuilder();
        foreach (var b in Encoding.UTF8.GetBytes(value))
        {
            var c = (char)b;
            if (char.IsAsciiLetterOrDigit(c) || "!#$&+-.^_`|~".Contains(c)) sb.Append(c);
            else sb.Append('%').Append(b.ToString("X2", CultureInfo.InvariantCulture));
        }
        return sb.ToString();
    }
}

/// <summary>The DownloadFile payload (same fields as Java's FileDownload).</summary>
public sealed record FileDownloadDto(string Filename, string MimeType, string? Base64Content, string? Url,
    string? Disposition, bool Print);

/// <summary>Lowers a <see cref="Document"/> to the DownloadFile payload: inline when small, a
/// single-use URL when large or lazy. (Mirrors Java's DocumentCommands.)</summary>
public static class DocumentCommands
{
    public static FileDownloadDto ToFileDownload(Document document, string? baseUrl, DocumentStore? store = null,
        int? inlineMaxBytes = null)
    {
        var filename = DocumentDownloads.SafeFilename(document.Filename);
        var mediaType = DocumentDownloads.SafeMediaType(document.MediaType);
        var disposition = document.Disposition == DocumentDisposition.Inline ? "inline" : "attachment";
        if (document.Content is { } bytes && bytes.Length <= (inlineMaxBytes ?? DocumentStore.InlineMaxBytes))
            return new FileDownloadDto(filename, mediaType, Convert.ToBase64String(bytes), null, disposition, document.Print);
        var token = (store ?? DocumentStore.Shared).Park(document);
        return new FileDownloadDto(filename, mediaType, null, UrlFor(baseUrl, token), disposition, document.Print);
    }

    public static string UrlFor(string? baseUrl, string token) =>
        (baseUrl ?? "").TrimEnd('/') + DocumentDownloads.PathMarker + token;
}
