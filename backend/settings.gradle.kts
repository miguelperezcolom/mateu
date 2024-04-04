pluginManagement {
    repositories {
        mavenLocal()
        gradlePluginPortal()
    }
}

rootProject.name = "backend"
include(":springboot-security")
include(":journeyrepo-jpa")
include(":dtos")
include(":embedded-front")
include(":annotation-processing")
include(":jpa")
include(":core")
project(":springboot-security").projectDir = file("optionals/springboot-security")
project(":embedded-front").projectDir = file("optionals/embedded-front")
project(":jpa").projectDir = file("optionals/jpa")
