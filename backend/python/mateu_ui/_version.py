"""The single source of the package version.

Development builds carry ``3.0.0.dev0``. The release workflow rewrites this line from the release
tag (``v3.0-alpha.406`` → ``3.0.0a406``, see ``scripts/set_version.py``) before building, so the
PyPI package moves in lockstep with the Maven artifacts.
"""

__version__ = "3.0.0.dev0"
