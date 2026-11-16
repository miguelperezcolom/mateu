// The project's version is the one asked for (-Dversion), never the starters' 1.0.0-SNAPSHOT.
// Names no JDK class (see archetype-post-generate.groovy's header): `basedir` (this IT's folder) is
// handed in, and the generated project is its project/hello-operations.
def child = { dir, String name -> dir?.listFiles()?.find { it.name == name } }
def pom = child(child(child(basedir, 'project'), 'hello-operations'), 'pom.xml').text
assert pom.contains('<artifactId>hello-operations</artifactId>\n    <version>2.1-SNAPSHOT</version>') : 'the generated pom does not carry -Dversion'
assert !pom.contains('1.0.0-SNAPSHOT')
return true
