START /B curl --connect-timeout 3000000 http://localhost:8080
START /B mvn jetty:run -f ../mdd-showcase/pom.xml
#cypress run



