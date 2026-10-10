"""The Mateu engine: route registry, reflection mapper, and the sync use-case."""

from ._version import __version__
from .action_guard import MateuForbiddenException
from .importwizard import ColumnMapping, ImportWizard, RowIssue, detect_separator, parse_csv
from .mapper import ReflectionMapper
from .registry import MateuRegistry, normalize, type_name
from .sync_handler import RunActionRq, SyncHandler

__all__ = [
    "ColumnMapping",
    "ImportWizard",
    "MateuForbiddenException",
    "MateuRegistry",
    "ReflectionMapper",
    "RowIssue",
    "RunActionRq",
    "SyncHandler",
    "detect_separator",
    "normalize",
    "parse_csv",
    "type_name",
    "__version__",
]
