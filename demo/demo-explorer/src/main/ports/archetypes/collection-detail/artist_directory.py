# The Python twin (mateu-ui): the same archetype — rows(search) feeds the card list, detail(row)
# the right pane; selecting and searching re-render in place.
from dataclasses import dataclass

from mateu_ui.uidl import CollectionDetail, ui
from mateu_ui.uidl.components import Card, ChipItem, EntityHeader, Fact, Text, VerticalLayout


@dataclass(frozen=True)
class Artist:
    id: str
    name: str
    nationality: str
    lived: str
    works: int
    bio: str


ARTISTS = [
    Artist("monet", "Claude Monet", "French", "1840–1926", 14,
           "Founder of Impressionism; painted the water lilies of Giverny for thirty years."),
    Artist("hokusai", "Katsushika Hokusai", "Japanese", "1760–1849", 9,
           "Ukiyo-e master, best known for the Thirty-six Views of Mount Fuji."),
    Artist("kahlo", "Frida Kahlo", "Mexican", "1907–1954", 3,
           "Self-portraits that mix Mexican folk art with surrealism."),
    Artist("durer", "Albrecht Dürer", "German", "1471–1528", 22,
           "Painter and printmaker of the Northern Renaissance."),
]


@ui("collection-detail")
class ArtistDirectory(CollectionDetail):
    def rows(self, search):
        needle = (search or "").lower()
        return [a for a in ARTISTS if needle in f"{a.name} {a.nationality}".lower()]

    def id_of(self, artist):
        return artist.id

    def title_of(self, artist):
        return artist.name

    def caption_of(self, artist):
        return f"{artist.nationality} · {artist.lived}"

    def badges_of(self, artist):
        return (ChipItem(label=f"{artist.works} works"),)

    def list_label(self, count):
        return f"{count} artists"

    def detail(self, artist):
        return Card(
            style="flex: 1;",
            content=VerticalLayout(spacing=True, content=(
                EntityHeader(
                    title=artist.name,
                    subtitle=f"{artist.nationality} artist",
                    facts=(Fact(label="Lived", value=artist.lived),
                           Fact(label="Works in the collection", value=str(artist.works))),
                ),
                Text(text=artist.bio),
            )),
        )
