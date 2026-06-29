namespace Mateu.Uidl;

public enum MessageVariant { Success, Info, Warning, Error }

/// <summary>A user-facing toast/alert an action can return. (C# analogue of io.mateu.uidl.data.Message.)</summary>
public sealed class Message(string text, MessageVariant variant = MessageVariant.Success, string title = "")
{
    public string Text { get; } = text;
    public MessageVariant Variant { get; } = variant;
    public string Title { get; } = title;
    public int Duration { get; init; } = 5000;
}
