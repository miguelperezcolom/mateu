#!/bin/sh

mvn archetype:generate \
    -DarchetypeGroupId=io.mateu.ui.mdd.archetypes \
    -DarchetypeArtifactId=mdd-base-archetype \
    -DarchetypeVersion=0.1.1 -DgroupId=new.project.id \
    -DartifactId=sample \
    -DarchetypeRepository=path_to_maven_repo_with_archetype_jar \