// The C# twin (Mateu.NET): [Signature], [PhotoCapture] and [FileUpload] store data URIs too.
using Mateu.Uidl;

[UI("delivery-proof"), Title("Proof of delivery")]
public class DeliveryProof
{
    public string? ReceivedBy { get; set; }

    [Signature] public string? Signature { get; set; }

    [PhotoCapture] public string? Photo { get; set; }

    [FileUpload] public string? Datasheet { get; set; }

    [Button] public Message Confirm() =>
        new($"Signature: {(Signature?.Length ?? 0) / 1024} KB · photo: {(Photo?.Length ?? 0) / 1024} KB");
}
