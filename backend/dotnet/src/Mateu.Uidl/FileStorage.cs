using System.Text;

namespace Mateu.Uidl;

// Large file uploads through a storage port the APPLICATION implements (design/uploads/
// file-uploads-contract.md). Mateu ships UI only: no S3 / Azure / disk adapter, exactly like the
// IListingExporter port. EXPERIMENTAL (3.0). C# analogue of Java's io.mateu.uidl.interfaces.FileStorage.

/// <summary>A file arriving through <c>POST /mateu/v3/upload</c>: its name, content type, size in
/// bytes (-1 when the client did not say) and the body, streamed — never buffered by Mateu. Reading
/// past the field's <c>maxBytes</c> fails (the upload answers 413). EXPERIMENTAL.</summary>
public sealed record IncomingFile(string Name, string ContentType, long Size, Stream Content);

/// <summary>What a client asks a pre-signed target for (<c>POST /mateu/v3/upload/target</c>): the
/// file's name, content type and size in bytes. EXPERIMENTAL.</summary>
public sealed record UploadRequest(string Name, string ContentType, long Size);

/// <summary>Where the client sends the bytes itself (a pre-signed url of the store): the url, the
/// method (null = PUT), the headers to send with it, and the file the value will reference once the
/// upload succeeded. Mateu's credentials never travel to that url. EXPERIMENTAL.</summary>
public sealed record UploadTarget(
    string Url,
    string? Method,
    IReadOnlyDictionary<string, string>? Headers,
    StoredFile File);

/// <summary>A stored file, as the field's value references it: the store's id, the name, content
/// type, size in bytes (-1 unknown) and an url to read it (null when none). The value is never the
/// bytes: <see cref="ToValue"/> writes <c>mateu-file:&lt;id&gt;?name=…&amp;type=…&amp;size=…&amp;url=…</c>.
/// A reference arriving in the component state is CLIENT DATA: resolve it through your store and
/// check the caller may read that file. EXPERIMENTAL.</summary>
public sealed record StoredFile(string Id, string? Name = null, string? ContentType = null, long Size = -1,
    string? Url = null)
{
    /// <summary>The prefix of every reference value.</summary>
    public const string Scheme = "mateu-file:";

    /// <summary>The reference value of this file: <c>mateu-file:&lt;id&gt;?name=&lt;name&gt;&amp;type=&lt;type&gt;&amp;size=&lt;bytes&gt;&amp;url=&lt;url&gt;</c>,
    /// every item percent-encoded (UTF-8, everything outside <c>A-Za-z0-9-._~</c>), absent or empty ones
    /// omitted (size when &lt; 0).</summary>
    public string ToValue()
    {
        var parameters = new List<string>();
        if (!string.IsNullOrEmpty(Name)) parameters.Add("name=" + Encode(Name));
        if (!string.IsNullOrEmpty(ContentType)) parameters.Add("type=" + Encode(ContentType));
        if (Size >= 0) parameters.Add("size=" + Size.ToString(System.Globalization.CultureInfo.InvariantCulture));
        if (!string.IsNullOrEmpty(Url)) parameters.Add("url=" + Encode(Url));
        var value = Scheme + Encode(Id);
        return parameters.Count == 0 ? value : value + "?" + string.Join("&", parameters);
    }

    /// <summary>The file a reference value names, or null when <paramref name="value"/> is not a
    /// <c>mateu-file:</c> reference. Decoding only understands <c>%XX</c> (<c>+</c> is a plus).</summary>
    public static StoredFile? Parse(string? value)
    {
        if (value is null || !value.StartsWith(Scheme, StringComparison.Ordinal)) return null;
        var rest = value[Scheme.Length..];
        var question = rest.IndexOf('?');
        var id = Decode(question < 0 ? rest : rest[..question]);
        string? name = null, type = null, url = null;
        long size = -1;
        if (question >= 0)
            foreach (var pair in rest[(question + 1)..].Split('&'))
            {
                var eq = pair.IndexOf('=');
                if (eq < 0) continue;
                var item = Decode(pair[(eq + 1)..]);
                switch (pair[..eq])
                {
                    case "name": name = item; break;
                    case "type": type = item; break;
                    case "url": url = item; break;
                    case "size":
                        if (!long.TryParse(item, System.Globalization.NumberStyles.None,
                                System.Globalization.CultureInfo.InvariantCulture, out size)) size = -1;
                        break;
                }
            }
        return new StoredFile(id, name, type, size, url);
    }

    /// <summary>Percent-encodes <paramref name="text"/>: its UTF-8 bytes, everything outside
    /// <c>A-Za-z0-9-._~</c> as <c>%XX</c> (upper-case hex).</summary>
    public static string Encode(string text)
    {
        var sb = new StringBuilder(text.Length);
        foreach (var b in Encoding.UTF8.GetBytes(text))
        {
            if (b is >= (byte)'A' and <= (byte)'Z' or >= (byte)'a' and <= (byte)'z' or >= (byte)'0' and <= (byte)'9'
                or (byte)'-' or (byte)'.' or (byte)'_' or (byte)'~')
                sb.Append((char)b);
            else
                sb.Append('%').Append(b.ToString("X2", System.Globalization.CultureInfo.InvariantCulture));
        }
        return sb.ToString();
    }

    /// <summary>Decodes <c>%XX</c> sequences (UTF-8); anything else — <c>+</c> included — is literal.</summary>
    public static string Decode(string text)
    {
        if (text.IndexOf('%') < 0) return text;
        var sb = new StringBuilder(text.Length);
        var pending = new List<byte>();
        void Flush()
        {
            if (pending.Count == 0) return;
            sb.Append(Encoding.UTF8.GetString(pending.ToArray()));
            pending.Clear();
        }
        for (var i = 0; i < text.Length; i++)
        {
            if (text[i] == '%' && i + 2 < text.Length && IsHex(text[i + 1]) && IsHex(text[i + 2]))
            {
                pending.Add(Convert.ToByte(text.Substring(i + 1, 2), 16));
                i += 2;
                continue;
            }
            Flush();
            sb.Append(text[i]);
        }
        Flush();
        return sb.ToString();
    }

    private static bool IsHex(char c) => c is >= '0' and <= '9' or >= 'a' and <= 'f' or >= 'A' and <= 'F';
}

/// <summary>The port that STORES uploaded files (Java's <c>io.mateu.uidl.interfaces.FileStorage</c>).
/// Register implementations as services; a <c>[FileUpload]</c> field then uploads its file through
/// Mateu (<c>POST /mateu/v3/upload</c>, streamed into <see cref="StoreAsync"/>) and its value becomes
/// a <see cref="StoredFile"/> reference instead of a data URI. A field picks a store by
/// <see cref="Name"/> (<c>[FileUpload(Storage = "…")]</c>); none named → the store called <c>""</c>,
/// or the only one registered. EXPERIMENTAL.</summary>
public interface IFileStorage
{
    /// <summary>The name a field's <c>Storage</c> refers to (default <c>""</c>, the default store).</summary>
    string Name => "";

    /// <summary>Stores <paramref name="file"/> (read its <see cref="IncomingFile.Content"/> to the end)
    /// and answers the stored file. <paramref name="request"/> carries the caller the host
    /// authenticated. A throw answers 500 through the error boundary.</summary>
    Task<StoredFile> StoreAsync(IncomingFile file, IncomingRequest request);

    /// <summary>Whether this store issues pre-signed targets (<see cref="UploadTargetAsync"/>): the
    /// client then asks <c>/mateu/v3/upload/target</c> first and sends the bytes there itself.</summary>
    bool DirectUploads => false;

    /// <summary>A pre-signed target for <paramref name="upload"/>, or null to have the client stream
    /// through Mateu instead.</summary>
    Task<UploadTarget?> UploadTargetAsync(UploadRequest upload, IncomingRequest request) =>
        Task.FromResult<UploadTarget?>(null);
}
