# yaml-environment

**Pins:** `type: Environment` (`environments/pre.yaml`, chosen by request.json's `environment` —
each runner sets it for the case as a deployment would: Java `-Dmateu.environment`, the ports their
environment setting): one catalogue source rebased by `baseUrl` (path and query kept, a merge key
over an anchor), one re-pointed by `url` and proxied — seen in the answer's `restSources`.
