using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>The server half of uploads through the <see cref="IFileStorage"/> port
/// (design/uploads/file-uploads-contract.md): which store a field uses, the signed tickets the mapper
/// hands an editable upload field and the endpoints verify, the size text and the accept rule.
/// EXPERIMENTAL.</summary>
internal sealed class FileUploads
{
    /// <summary>Where a client uploads (root path, whatever the mount).</summary>
    public const string UploadPath = "/mateu/v3/upload";

    /// <summary>Where a client asks a pre-signed target.</summary>
    public const string TargetPath = "/mateu/v3/upload/target";

    /// <summary>The header the ticket travels in.</summary>
    public const string TicketHeader = "X-Mateu-Upload-Ticket";

    /// <summary>The header the (percent-encoded) file name travels in.</summary>
    public const string FileNameHeader = "X-Mateu-File-Name";

    /// <summary>The setting the ticket secret is read from when no option names one.</summary>
    public const string SecretEnv = "MATEU_UPLOADS_SECRET";

    /// <summary>The largest file of a field declaring no <c>MaxBytes</c> (100 MB).</summary>
    public const long DefaultMaxBytes = 100L * 1024 * 1024;

    /// <summary>How long a ticket is valid.</summary>
    public static readonly TimeSpan TicketLifetime = TimeSpan.FromHours(8);

    /// <summary>The secret of a process whose deployment configured none (fine for one instance).</summary>
    private static readonly byte[] ProcessSecret = RandomNumberGenerator.GetBytes(32);

    private static readonly AsyncLocal<FileUploads?> CurrentLocal = new();

    private readonly IReadOnlyList<IFileStorage> _storages;
    private readonly byte[] _secret;

    public FileUploads(IEnumerable<IFileStorage> storages, string? secret = null, Func<string>? caller = null)
    {
        _storages = storages.ToList();
        var configured = string.IsNullOrEmpty(secret) ? Environment.GetEnvironmentVariable(SecretEnv) : secret;
        _secret = string.IsNullOrEmpty(configured) ? ProcessSecret : Encoding.UTF8.GetBytes(configured);
        Caller = caller ?? (() => CallerHash(null, null));
    }

    /// <summary>The caller hash of the request being handled (the adapter reads its HttpContext).</summary>
    public Func<string> Caller { get; }

    /// <summary>Whether any store is registered.</summary>
    public bool Any => _storages.Count > 0;

    /// <summary>The uploads of the request being handled (AsyncLocal: the handler is a singleton).</summary>
    public static FileUploads? Current => CurrentLocal.Value;

    internal static void SetCurrent(FileUploads? uploads) => CurrentLocal.Value = uploads;

    /// <summary>The store <paramref name="name"/> names: blank → the one named <c>""</c>, else the only
    /// one registered; null when none matches.</summary>
    public IFileStorage? Find(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return _storages.FirstOrDefault(s => string.IsNullOrEmpty(s.Name))
                   ?? (_storages.Count == 1 ? _storages[0] : null);
        return _storages.FirstOrDefault(s => s.Name == name);
    }

    /// <summary>What a ticket grants.</summary>
    public sealed record Ticket(string Storage, string FieldId, long MaxBytes, string Accept, bool Multiple,
        string CallerHash, long ExpiresEpochSeconds);

    /// <summary>A ticket for one field, for the current caller, valid <see cref="TicketLifetime"/>.</summary>
    public string Issue(string storage, string fieldId, long maxBytes, string accept, bool multiple,
        string callerHash, DateTimeOffset? now = null)
    {
        var expires = (now ?? DateTimeOffset.UtcNow).Add(TicketLifetime).ToUnixTimeSeconds();
        var payload = string.Join("|", "v1", StoredFile.Encode(storage), StoredFile.Encode(fieldId),
            maxBytes.ToString(CultureInfo.InvariantCulture), StoredFile.Encode(accept), multiple ? "1" : "0",
            callerHash, expires.ToString(CultureInfo.InvariantCulture));
        var encoded = Base64Url(Encoding.UTF8.GetBytes(payload));
        return encoded + "." + Base64Url(Sign(encoded));
    }

    /// <summary>What <paramref name="ticket"/> grants <paramref name="callerHash"/>, or null when it is
    /// missing, malformed, not signed by this backend, expired or another caller's.</summary>
    public Ticket? Verify(string? ticket, string callerHash, DateTimeOffset? now = null)
    {
        if (string.IsNullOrEmpty(ticket)) return null;
        var dot = ticket.IndexOf('.');
        if (dot <= 0 || dot != ticket.LastIndexOf('.')) return null;
        var encoded = ticket[..dot];
        var signature = FromBase64Url(ticket[(dot + 1)..]);
        if (signature is null || !CryptographicOperations.FixedTimeEquals(signature, Sign(encoded))) return null;
        var raw = FromBase64Url(encoded);
        if (raw is null) return null;
        string[] parts;
        try { parts = Encoding.UTF8.GetString(raw).Split('|'); }
        catch (ArgumentException) { return null; }
        if (parts.Length != 8 || parts[0] != "v1") return null;
        if (!long.TryParse(parts[3], NumberStyles.None, CultureInfo.InvariantCulture, out var maxBytes)) return null;
        if (!long.TryParse(parts[7], NumberStyles.None, CultureInfo.InvariantCulture, out var expires)) return null;
        if (expires < (now ?? DateTimeOffset.UtcNow).ToUnixTimeSeconds()) return null;
        if (!CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(parts[6]), Encoding.UTF8.GetBytes(callerHash)))
            return null;
        return new Ticket(StoredFile.Decode(parts[1]), StoredFile.Decode(parts[2]), maxBytes,
            StoredFile.Decode(parts[4]), parts[5] == "1", parts[6], expires);
    }

    private byte[] Sign(string encodedPayload) => HMACSHA256.HashData(_secret, Encoding.ASCII.GetBytes(encodedPayload));

    /// <summary>Hex SHA-256 of <c>name \u0001 roles \u0001 groups \u0001 scopes \u0001 permissions</c>
    /// (each list sorted, comma-joined; anonymous = name <c>null</c>, empty lists).</summary>
    public static string CallerHash(string? name, Identity? identity)
    {
        static string Joined(IReadOnlyList<string>? items) =>
            string.Join(",", (items ?? []).OrderBy(i => i, StringComparer.Ordinal));
        var text = string.Join("\u0001", name ?? "null", Joined(identity?.Roles), Joined(identity?.Groups),
            Joined(identity?.Scopes), Joined(identity?.Permissions));
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(text))).ToLowerInvariant();
    }

    /// <summary><c>N bytes</c>, <c>N KB</c>, <c>N MB</c>, <c>N GB</c> (1024 base; an integer when exact,
    /// else one decimal).</summary>
    public static string SizeText(long bytes)
    {
        string[] units = ["KB", "MB", "GB"];
        if (bytes < 1024) return bytes.ToString(CultureInfo.InvariantCulture) + " bytes";
        double value = bytes;
        var unit = -1;
        while (unit < units.Length - 1 && value >= 1024)
        {
            value /= 1024;
            unit++;
        }
        var text = value == Math.Floor(value)
            ? ((long)value).ToString(CultureInfo.InvariantCulture)
            : value.ToString("0.0", CultureInfo.InvariantCulture);
        return text + " " + units[unit];
    }

    /// <summary>Whether a file of <paramref name="name"/> / <paramref name="contentType"/> passes
    /// <paramref name="accept"/>: <c>.ext</c> matches the extension (case-insensitive), <c>type/*</c> the
    /// content type's prefix, anything else the exact content type (parameters dropped); empty = anything.</summary>
    public static bool Accepts(string? accept, string? name, string? contentType)
    {
        var entries = (accept ?? "").Split(',').Select(e => e.Trim()).Where(e => e.Length > 0).ToList();
        if (entries.Count == 0) return true;
        var type = MediaType(contentType);
        foreach (var entry in entries)
        {
            if (entry.StartsWith('.'))
            {
                if ((name ?? "").EndsWith(entry, StringComparison.OrdinalIgnoreCase)) return true;
            }
            else if (entry.EndsWith("/*", StringComparison.Ordinal))
            {
                if (type.StartsWith(entry[..^1], StringComparison.OrdinalIgnoreCase)) return true;
            }
            else if (string.Equals(MediaType(entry), type, StringComparison.OrdinalIgnoreCase)) return true;
        }
        return false;
    }

    private static string MediaType(string? contentType)
    {
        var text = contentType ?? "";
        var semi = text.IndexOf(';');
        return (semi >= 0 ? text[..semi] : text).Trim();
    }

    private static string Base64Url(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static byte[]? FromBase64Url(string text)
    {
        var s = text.Replace('-', '+').Replace('_', '/');
        switch (s.Length % 4)
        {
            case 2: s += "=="; break;
            case 3: s += "="; break;
            case 1: return null;
        }
        try { return Convert.FromBase64String(s); }
        catch (FormatException) { return null; }
    }
}

/// <summary>A body that refuses to be read past <see cref="Limit"/> bytes: the stream a store reads
/// an upload from, so an oversized file is aborted while it streams (413), never stored whole.</summary>
internal sealed class LimitedStream(Stream inner, long limit) : Stream
{
    /// <summary>The bytes allowed.</summary>
    public long Limit { get; } = limit;

    /// <summary>The bytes read so far.</summary>
    public long BytesRead { get; private set; }

    public override bool CanRead => true;
    public override bool CanSeek => false;
    public override bool CanWrite => false;
    public override long Length => throw new NotSupportedException();
    public override long Position { get => BytesRead; set => throw new NotSupportedException(); }
    public override void Flush() { }
    public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
    public override void SetLength(long value) => throw new NotSupportedException();
    public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

    public override int Read(byte[] buffer, int offset, int count) => Count(inner.Read(buffer, offset, count));

    public override async ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default) =>
        Count(await inner.ReadAsync(buffer, cancellationToken));

    public override Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken) =>
        ReadAsync(buffer.AsMemory(offset, count), cancellationToken).AsTask();

    private int Count(int n)
    {
        BytesRead += n;
        if (BytesRead > Limit) throw new FileTooLargeException(Limit);
        return n;
    }
}

/// <summary>An upload went past its field's limit.</summary>
internal sealed class FileTooLargeException(long limit)
    : IOException("The file is larger than " + limit + " bytes")
{
    public long Limit { get; } = limit;
}
