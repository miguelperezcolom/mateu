#!/bin/sh

mvn clean
mvn archetype:create-from-project
cd target/generated-sources/archetype
mvn install
cd ../../..
####mvn clean


####mvn archetype:generate -DarchetypeCatalog=local