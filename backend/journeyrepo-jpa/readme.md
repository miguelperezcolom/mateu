## JPA journey repo

This module contains a JPA implementation of the journey repo.

The default implementation of the journey repo is an in memory one. That means
that you should use sticky sessions if you want to deploy your UI in several
servers.

This JPA based implementation of the journey repo stores the journeys in any 
Spring data supported relational database and allows you to have as many servers
as you like without configuring sticky sessions.

This dependency must explicitly be added to your project, as JPA related stuff is not included
by default in the Mateu base dependency.