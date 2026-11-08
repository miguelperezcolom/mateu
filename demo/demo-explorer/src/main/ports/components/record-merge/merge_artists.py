# The Python twin (mateu-ui): the merge action gets _merged and _choices next to parameters.
from mateu_ui.core import RunActionRq
from mateu_ui.uidl import ComponentTreeSupplier, Message, action, ui
from mateu_ui.uidl import components as fluent


@ui("merge-artists")
class MergeArtists(ComponentTreeSupplier):
    def component(self):
        return fluent.RecordMerge(
            title="Artist records A-104 and A-871 look like the same person",
            records=(
                fluent.MergeRecord(id="A-104", label="Record A-104", caption="Created 2014 · 37 works"),
                fluent.MergeRecord(id="A-871", label="Record A-871", caption="Created last week · 1 work"),
            ),
            fields=(
                fluent.MergeField.of("name", "Name", "Vincent van Gogh", "Vincent Van Gogh"),
                fluent.MergeField(field_id="birthplace", label="Birthplace",
                                  values=("Zundert", "Zundert, Netherlands"), chosen="A-871"),
                fluent.MergeField.of("movement", "Movement", "Post-Impressionism", None),
                fluent.MergeField(field_id="wiki", label="Wikidata id", values=(None, "Q5582"), editable=True),
            ),
            merge_action_id="mergeArtists",
            merge_label="Merge into A-104",
            parameters={"survivor": "A-104", "duplicate": "A-871"},
        )

    @action
    def merge_artists(self, request: RunActionRq) -> Message:
        return Message(f"Merged: {(request.parameters or {}).get('_merged')}")
