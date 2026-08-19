pluginManagement {
    val properties = java.util.Properties()
    file("local.properties").takeIf { it.isFile }?.inputStream()?.use {
        properties.load(java.io.InputStreamReader(it, Charsets.UTF_8))
    }

    extra["muditaUsername"] = properties.getProperty("mudita_repo_username")
        ?: System.getenv("ARTIFACTORY_USERNAME")
    extra["muditaPassword"] = properties.getProperty("mudita_repo_password")
        ?: System.getenv("ARTIFACTORY_PASSWORD")
    extra["muditaRepoUrl"] = properties.getProperty("mudita_nexus_repo_url")
        ?: System.getenv("MUDITA_PRIVATE_REPOSITORY_URL")

    repositories {
        mavenCentral()
        google()
        gradlePluginPortal()
        maven {
            url = uri(extra["muditaRepoUrl"].toString())
            credentials {
                username = extra["muditaUsername"].toString()
                password = extra["muditaPassword"].toString()
            }
        }
    }
}

// The com.mudita.sentry.plugins.release plugin (uploads ProGuard/R8 mapping files to Sentry on
// release builds) previously declared here required Mudita's private Artifactory repo, which
// isn't reachable outside Mudita's own CI. Declaring it at all makes Gradle try to resolve its
// classpath during settings evaluation, before any build type or credential check can skip it -
// so it broke every sync on a machine without those credentials, not just release builds.
// Removed along with the matching `apply from` in app/build.gradle (see gradle/sentry-config.gradle).

include(":app")
include(":MapJava")
include(":MapApi")

include(":pagination")
project(":pagination").projectDir = File(rootProject.projectDir, "compose/pagination")

include(":data")
project(":data").projectDir = File(rootProject.projectDir, "compose/data")

include(":common")
project(":common").projectDir = File(rootProject.projectDir, "compose/common")

File(rootProject.projectDir, "compose/screens")
    .listFiles()
    ?.forEach { moduleFile ->
        val moduleName = ":${moduleFile.name}"
        include(moduleName)
        project(moduleName).projectDir = moduleFile
    }

include(":frontitude")
