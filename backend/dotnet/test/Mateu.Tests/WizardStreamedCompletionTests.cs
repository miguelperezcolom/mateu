using System.Text.Json;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// A wizard whose completion is a streamed task (Java: a @WizardCompletionAction returning a Flux,
// typically a LongTask): the progress streams, then the wizard lands on its result step — built
// once the work is over, so it shows what the work set. A task that reports an error stays on the
// step. The completion is advertised over SSE.

[UI("wsc-end-of-day")]
public class StreamedEndOfDay : Wizard
{
    [Step(1)] public bool CashiersClosed { get; set; }
    [Step(2)] public bool Confirm { get; set; } = true;
    [Step(3), PlainText] public string Status { get; set; } = "";

    public override string? CompletionActionLabel => "Run end of day";
    public override string CompletionActionId => "run";
    public override Message Complete() => new("done");

    public override LongTaskRun? StreamedCompletion() =>
        LongTask.Create("Running end of day").WithProgressBar().Run(progress => Work(progress));

    private async IAsyncEnumerable<object> Work(ProgressReporter progress)
    {
        await Task.Yield();
        if (!CashiersClosed)
        {
            yield return new Message("Close the open cashiers first.", MessageVariant.Error);
            yield break;
        }
        for (var i = 1; i <= 3; i++)
        {
            Status = $"{i} of 3 procedures run";
            yield return progress.Step($"Procedure {i}", i, 3);
        }
    }
}

public class WizardStreamedCompletionTests
{
    private static SyncHandler Handler() => new(new MateuRegistry(typeof(StreamedEndOfDay).Assembly));

    private static RunActionRqDto Rq(string actionId, int step, bool cashiersClosed) => new()
    {
        ServerSideType = typeof(StreamedEndOfDay).FullName, Route = "/wsc-end-of-day", ActionId = actionId,
        ComponentState = new Dictionary<string, object?>
        {
            ["__step"] = JsonSerializer.SerializeToElement(step),
            ["cashiersClosed"] = JsonSerializer.SerializeToElement(cashiersClosed),
            ["confirm"] = JsonSerializer.SerializeToElement(true),
        },
    };

    private static JsonElement StateOf(UIIncrementDto increment) =>
        JsonSerializer.SerializeToElement(increment.Fragments[^1], MateuExtensions.Json).GetProperty("state");

    [Fact]
    public void The_streamed_completion_is_advertised_over_sse()
    {
        var increment = Handler().Handle(Rq("next", 1, true));
        var component = (ServerSideComponentDto)increment.Fragments[0].Component!;
        var run = Assert.Single(component.Actions, a => a.Id == "run");
        Assert.True(run.Sse);
        Assert.False(Assert.Single(component.Actions, a => a.Id == "next").Sse);
    }

    [Fact]
    public void The_progress_streams_then_the_result_step_shows_what_the_work_set()
    {
        var increment = Handler().Handle(Rq("run", 2, true));
        var progress = increment.Commands.Where(c => c.Type == "Progress").Select(c => (ProgressDto)c.Data!).ToList();
        Assert.NotEmpty(progress);
        Assert.Equal("done", progress[^1].State);
        var state = StateOf(increment);
        Assert.Equal(3, state.GetProperty("__step").GetInt32());
        Assert.Equal("3 of 3 procedures run", state.GetProperty("status").GetString());
    }

    [Fact]
    public async Task Over_sse_the_result_step_follows_the_progress()
    {
        var handler = Handler();
        var slot = SyncHandler.BeginStream();
        var first = await handler.HandleAsync(Rq("run", 2, true), "", CancellationToken.None);
        Assert.True(slot.HasStream);
        Assert.Empty(first.Fragments);
        var rest = new List<UIIncrementDto>();
        await foreach (var step in handler.ContinueStream(slot,
                           e => UIIncrementDto.Of(messages: [new MessageDto("error", "middle", "", e.Message, 0)]),
                           CancellationToken.None))
            rest.Add(step);
        Assert.Equal(3, StateOf(rest[^1]).GetProperty("__step").GetInt32());
        Assert.All(rest.SkipLast(1), i => Assert.Empty(i.Fragments));
    }

    [Fact]
    public void A_stream_reporting_an_error_stays_on_the_step()
    {
        var increment = Handler().Handle(Rq("run", 2, false));
        Assert.Contains(increment.Messages, m => m.Variant == "error" && m.Text == "Close the open cashiers first.");
        Assert.Empty(increment.Fragments);
    }
}
