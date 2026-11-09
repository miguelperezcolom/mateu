using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>What each ProgressReporter.Step does to the task's state, with and without a progress
/// bar (Java's ProgressReporter).</summary>
public class ProgressReporterTests
{
    private static async Task<List<ProgressDto>> StatesOf(LongTask task, Action<ProgressReporter> steps)
    {
        var states = new List<ProgressDto>();
        await foreach (var _ in task.Run(progress => Work(progress, steps, states))) { }
        return states;
    }

    private static async IAsyncEnumerable<object> Work(ProgressReporter progress, Action<ProgressReporter> steps,
        List<ProgressDto> states)
    {
        await Task.Yield();
        steps(progress);
        states.Add(progress.Current);
        yield return progress.Step("done");
    }

    [Fact]
    public async Task Without_a_progress_bar_a_fraction_is_ignored_and_the_texts_still_move()
    {
        var states = await StatesOf(LongTask.Create("Import"), p =>
        {
            p.Step("half", 0.5);
            p.Step("renamed", "Import 2", 0.7);
        });
        Assert.Null(states[0].Fraction);
        Assert.Equal("renamed", states[0].Text);
        Assert.Equal("Import 2", states[0].Title);
    }

    [Fact]
    public async Task With_a_progress_bar_the_fraction_is_clamped_and_a_count_needs_a_total()
    {
        var bar = await StatesOf(LongTask.Create("Import").WithProgressBar(), p =>
        {
            p.Step("renamed", "Import 2", 1.5);
        });
        Assert.Equal(1.0, bar[0].Fraction);
        Assert.Equal("Import 2", bar[0].Title);

        var nan = await StatesOf(LongTask.Create("Import").WithProgressBar(), p => p.Step("x", double.NaN));
        Assert.Equal(0.0, nan[0].Fraction);

        var noTotal = await StatesOf(LongTask.Create("Import").WithProgressBar(), p => p.Step("rows", 3, 0));
        Assert.Equal("rows", noTotal[0].Text);
        Assert.Null(noTotal[0].Total);
    }
}
