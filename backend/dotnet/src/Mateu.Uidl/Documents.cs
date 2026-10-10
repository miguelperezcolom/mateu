namespace Mateu.Uidl;

/// <summary>What the client does with a <see cref="Document"/>: show it (<c>Inline</c> — a PDF
/// opens in a new tab) or save it (<c>Attachment</c>). (Mirrors Java's DocumentDisposition.)</summary>
public enum DocumentDisposition { Inline, Attachment }

/// <summary>A document produced by an action — an invoice, a registration card, a report. Return it
/// from an action method (alone or in a list with messages and commands) and the client shows it or
/// downloads it. Small documents travel inside the response; large ones and every lazy one are
/// parked on the server and fetched once from <c>{baseUrl}/mateu/v3/documents/{token}</c>.
/// EXPERIMENTAL (documents API, 2026-10). (Mirrors Java's io.mateu.uidl.data.Document.)</summary>
public sealed record Document
{
    public const string PdfMediaType = "application/pdf";

    public Document(string filename, string? mediaType, byte[]? content, Func<byte[]>? lazyContent = null,
        DocumentDisposition disposition = DocumentDisposition.Attachment, bool print = false)
    {
        ArgumentNullException.ThrowIfNull(filename);
        if (content is null && lazyContent is null)
            throw new ArgumentException("A document needs content or lazyContent");
        Filename = filename;
        MediaType = string.IsNullOrWhiteSpace(mediaType) ? "application/octet-stream" : mediaType;
        Content = content;
        LazyContent = lazyContent;
        Disposition = disposition;
        // an attachment is never printed: printing needs it shown
        Print = disposition == DocumentDisposition.Inline && print;
    }

    public string Filename { get; }
    public string MediaType { get; }
    public byte[]? Content { get; }
    public Func<byte[]>? LazyContent { get; }
    public DocumentDisposition Disposition { get; }
    public bool Print { get; }

    /// <summary>Whether the bytes are only produced when the browser fetches them.</summary>
    public bool ProducedOnDemand => Content is null;

    /// <summary>The bytes: the content when given, else what the lazy producer returns.</summary>
    public byte[] Bytes() => Content ?? LazyContent!();

    public static Document Inline(string filename, string mediaType, byte[] content) =>
        new(filename, mediaType, content, null, DocumentDisposition.Inline);

    public static Document Attachment(string filename, string mediaType, byte[] content) =>
        new(filename, mediaType, content, null, DocumentDisposition.Attachment);

    /// <summary>A PDF shown inline — preview it, then print or save it from the viewer.</summary>
    public static Document Pdf(string filename, byte[] content) => Inline(filename, PdfMediaType, content);

    /// <summary>Bytes produced only when the browser fetches the document (always by URL).</summary>
    public static Document Lazy(string filename, string mediaType, Func<byte[]> content) =>
        new(filename, mediaType, null, content ?? throw new ArgumentNullException(nameof(content)));

    public Document ShowInline() => new(Filename, MediaType, Content, LazyContent, DocumentDisposition.Inline, Print);

    public Document Downloaded() => new(Filename, MediaType, Content, LazyContent, DocumentDisposition.Attachment);

    /// <summary>Shown and handed to the browser's print dialog at once.</summary>
    public Document Printed() => new(Filename, MediaType, Content, LazyContent, DocumentDisposition.Inline, true);
}
