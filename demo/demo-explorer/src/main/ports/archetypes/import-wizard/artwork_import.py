# The Python twin (mateu-ui): the same archetype — upload or paste a CSV, check the mapping, read
# the validation report, import the valid rows. You write the row class and import_rows.
from typing import Annotated

from mateu_ui.core import ImportWizard
from mateu_ui.uidl import Required, title, ui


class Artwork:
    title: Annotated[str | None, Required()] = None
    artist: str | None = None
    year: int = 0


IMPORTED: list[Artwork] = []


@ui("import-wizard")
@title("Import artworks")
class ArtworkImport(ImportWizard[Artwork]):
    def import_rows(self, rows):
        IMPORTED.extend(rows)
