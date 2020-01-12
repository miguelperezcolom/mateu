#!/bin/sh

mvn archetype:generate \
    -DarchetypeGroupId=io.mateu.archetypes \
    -DarchetypeArtifactId=mdd-archetype \
    -DarchetypeVersion=0.0.1 -DgroupId=new.project.id \
    -DartifactId=sample \
    -DarchetypeRepository=path_to_maven_repo_with_archetype_jar \