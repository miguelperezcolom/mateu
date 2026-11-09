// The C# twin (Mateu.NET): the knobs are their own attribute, [ActionOptions], composed with
// [Button] (the port has no @Action equivalent carrying them).
using Mateu.Uidl;

[UI("availability"), Title("Availability")]
public class AvailabilityCheck
{
    static int calls;

    [Button("Slow check"), ActionOptions(TimeoutMillis = 1500)]
    public async Task<Message> SlowCheck()
    {
        await Task.Delay(4000);
        return new Message("You will not see this");
    }

    [Button("Flaky check"), ActionOptions(TimeoutMillis = 1500, Idempotent = true)]
    public async Task<Message> FlakyCheck()
    {
        if (Interlocked.Increment(ref calls) % 2 == 1) await Task.Delay(3000);
        return new Message($"Room 214 is available (call #{calls})");
    }
}
