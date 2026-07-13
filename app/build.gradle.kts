plugins {
    id("com.android.application")
}

val generatedWebAssets = layout.buildDirectory.dir("generated/webAssets")

android {
    namespace = "pl.fishki.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "pl.fishki.app"
        minSdk = 24
        targetSdk = 36
        versionCode = 2
        versionName = "1.0.1"
    }

    sourceSets {
        getByName("main").assets.directories.apply {
            add(generatedWebAssets.get().asFile.absolutePath)
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

val syncWebAssets by tasks.registering(Sync::class) {
    from(
        rootProject.file("index.html"),
        rootProject.file("app.js"),
        rootProject.file("styles.css")
    )
    into(generatedWebAssets)
}

tasks.named("preBuild") {
    dependsOn(syncWebAssets)
}
