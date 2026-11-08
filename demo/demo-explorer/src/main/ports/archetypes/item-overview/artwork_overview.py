# The Python twin (mateu-ui): the same archetype — the first component field without Panel(...) is
# the pinned key information, every Panel(...) field a tab.
from typing import Annotated

from mateu_ui.uidl import ItemOverview, Panel, title, ui
from mateu_ui.uidl.components import Chart, ChartData, ChartDataset, Markdown


@ui("item-overview")
@title("Water Lilies")
class ArtworkOverview(ItemOverview):
    key_info: Markdown = Markdown(markdown="""\
### Water Lilies
- **Artist:** Claude Monet
- **Date:** 1906
- **Medium:** Oil on canvas
- **Size:** 89.9 × 94.1 cm
- **Location:** On loan to SMK
""")

    description: Annotated[Markdown, Panel("Description")] = Markdown(
        markdown="One of some 250 paintings of the lily pond at Giverny. The horizon has gone: only"
                 " water, reflected sky and the flowers remain.")

    visitors: Annotated[Chart, Panel("Visitors")] = Chart(
        chart_type="line",
        chart_data=ChartData(
            labels=("Jun", "Jul", "Aug", "Sep", "Oct"),
            datasets=(ChartDataset(label="Visitors (k)", data=(31, 42, 47, 29, 24)),),
        ),
    )

    provenance: Annotated[Markdown, Panel("Provenance")] = Markdown(markdown="""\
| Year | Owner |
|---|---|
| 1906 | The artist |
| 1926 | Durand-Ruel, Paris |
| 1955 | Acquired by the museum |
""")

    def panel_width(self):
        return "18rem"
