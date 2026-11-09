# The Python twin (mateu-ui): Crud[T] is the AutoCrud — fetch/save/delete are the store;
# @edit_in_drawer and display() (on/off/disabled toggles) are the same two options.
import uuid
from dataclasses import dataclass
from enum import Enum
from typing import Annotated

from mateu_ui.uidl import Crud, CrudDisplay, Required, Toggle, edit_in_drawer, title, ui


class Classification(Enum):
    PAINTING = "PAINTING"
    SCULPTURE = "SCULPTURE"
    PRINT = "PRINT"


@dataclass
class Artwork:
    id: str = ""
    title: Annotated[str, Required()] = ""
    artist: str = ""
    classification: Classification | None = None
    year: int = 0

    def __str__(self):
        return self.title


ARTWORKS = [
    Artwork("a1", "Water Lilies", "Claude Monet", Classification.PAINTING, 1906),
    Artwork("a2", "The Great Wave", "Katsushika Hokusai", Classification.PRINT, 1831),
    Artwork("a3", "The Thinker", "Auguste Rodin", Classification.SCULPTURE, 1904),
    Artwork("a4", "Melencolia I", "Albrecht Dürer", Classification.PRINT, 1514),
]


@ui("auto-crud")
@title("Artworks")
@edit_in_drawer
class ArtworkCrud(Crud[Artwork]):
    def display(self):
        return CrudDisplay(save_and_next=Toggle.on, delete=Toggle.off)

    # Java's default store search matches str(); here fetch applies the search text itself
    def fetch(self, search):
        return [a for a in ARTWORKS if (search or "").lower() in a.title.lower()]

    def save(self, artwork):
        if not artwork.id:
            artwork.id = uuid.uuid4().hex[:8]
            ARTWORKS.append(artwork)
        else:
            ARTWORKS[:] = [artwork if a.id == artwork.id else a for a in ARTWORKS]

    def delete(self, id):
        ARTWORKS[:] = [a for a in ARTWORKS if a.id != id]
