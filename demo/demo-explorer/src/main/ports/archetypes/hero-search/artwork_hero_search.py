# The Python twin (mateu-ui): HeroSearch[T] is a Crud[T] under a hero — the facets come from the
# row's own fields (no separate Filters type) and fetch only applies the search text.
from dataclasses import dataclass

from mateu_ui.uidl import HeroSearch, ui


@dataclass
class Artwork:
    title: str = ""
    artist: str = ""
    classification: str = ""
    year: int = 0


ARTWORKS = [
    Artwork("The Harvesters", "Pieter Bruegel", "Painting", 1565),
    Artwork("Water Lilies", "Claude Monet", "Painting", 1906),
    Artwork("The Great Wave", "Katsushika Hokusai", "Print", 1831),
    Artwork("Bust of a Woman", "Pablo Picasso", "Sculpture", 1931),
    Artwork("Self-Portrait", "Vincent van Gogh", "Painting", 1887),
    Artwork("Melencolia I", "Albrecht Dürer", "Print", 1514),
]


@ui("hero-search")
class ArtworkHeroSearch(HeroSearch[Artwork]):
    def hero_title(self):
        return "Find an artwork"

    def hero_subtitle(self):
        return "Try “monet”, “print” or a year — then narrow it with the classification facet"

    # Java's HeroSearch is read-only; here it is a Crud, so the write affordances are switched off.
    # (No can_view hook in Python yet: rows stay clickable.)
    def can_create(self):
        return False

    def can_edit(self):
        return False

    def can_delete(self):
        return False

    def fetch(self, search):
        text = (search or "").lower()
        return [a for a in ARTWORKS
                if text in f"{a.title} {a.artist} {a.classification} {a.year}".lower()]
