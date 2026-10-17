# drawer

Pins an action that opens an overlay (`request.json`: `actionId: openDetails`): the answer is a
single `Add` fragment (an overlay stacks on the page instead of replacing it) carrying a `Drawer`
with its header title, subtitle, position and content (a `Text`). No commands, no messages.
