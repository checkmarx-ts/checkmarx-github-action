function getDefaultFolderExclusions(){
    return [
        "cxcli", //Folder created when downloading CLI
        "test", // Tests
        "tests", // Tests
        "mock", // Tests
        "mocks", // Tests
        "spec", // Tests
        "unit", // Tests
        "debug", // Tests
        "e2e", //Tests
        "androidTest", // Tests (Android)
        "build", // Build Folders
        "dist", // Build Folders
        "deploy", // Build Folders
        "venv", // Build Folders (Python)
        "maven", // Build Folders
        "gradle", // Build Folders (Android)
        "target", // Build Folders
        "example", // Dead Code
        "examples", // Dead Code
        "samples", // Dead Code
        "bin", // Non-relevant folders
        "gen", // Non-relevant folders
        "out", // Non-relevant folders
        "docs", // Non-relevant folders
        "proguard", // Non-relevant folders (Android)
        "lint", // Non-relevant folders
        "images", // Non-relevant folders
        "swagger", // Non-relevant folders (Swagger)
        "coverage", // Non-relevant folders
        "generated", // Non-relevant folders
        ".vs", // Non-relevant folders (Visual Studio)
        ".idea", // Non-relevant folders (IntelliJ IDEA)
        ".temp", // Non-relevant folders (Temporary)
        ".tmp", // Non-relevant folders (Temporary)
        ".grunt", // Non-relevant folders (Grunt)
        ".cache", // Non-relevant folders (Cache)
        ".dynamodb", // Non-relevant folders (Dinamo DB)
        ".fusebox", // Non-relevant folders (Fusebox)
        ".serverless", // Non-relevant folders (Serverless)
        ".nyc_output", // Non-relevant folders (NYC)
        ".git", // Non-relevant folders (Git)
        ".github", // Non-relevant folders (Github)
        ".dependabot", // Non-relevant folders (Dependabot)
        ".semaphore", // Non-relevant folders (Semaphore CI)
        ".circleci", // Non-relevant folders (Circle CI)
        ".vscode", // Non-relevant folders (VS Code)
        ".nuget", // Non-relevant folders (CSharp)
        ".mvn", // Non-relevant folders (Maven)
        ".m2", // Non-relevant folders (Maven)
        ".DS_Store", // Non-relevant folders
        ".sass-cache", // Non-relevant folders
        ".gradle", // Non-relevant folders (Android)
        "__pycache__", // Non-relevant folders (Python)
        ".pytest_cache", // Non-relevant folders (Python)
        ".settings", // Non-relevant folders (CSharp)
        "res/color*", // Non-relevant folders (Android)
        "res/drawable*", // Non-relevant folders (Android)
        "res/mipmap*", // Non-relevant folders (Android)
        "res/anim*", // Non-relevant folders (Android)
        "*imageset", // Non-relevant folders (IOS)
        "xcuserdata", // Non-relevant folders (IOS)
        "xcshareddata", // Non-relevant folders (IOS)
        "*xcassets", // Non-relevant folders (IOS)
        "*appiconset", // Non-relevant folders (IOS)
        "*xcodeproj", // Non-relevant folders (IOS)
        "*framework", // Non-relevant folders (IOS)
        "*lproj", // Non-relevant folders (IOS)
        "__MACOSX", // Non-relevant folders (IOS)
        "css", // CSS not supported
        "react", //3rd Party Libraries (React)
        "yui", //3rd Party Libraries
        "node_modules", //3rd Party Libraries (Node JS)
        "jquery*", //3rd Party Libraries (JS)
        "angular*", //3rd Party Libraries (JS)
        "bootstrap*", //3rd Party Libraries (JS)
        "modernizr*", //3rd Party Libraries (JS)
        "bower_components", //3rd Party Libraries (Bower)
        "jspm_packages", //3rd Party Libraries (JS)
        "typings",  //3rd Party Libraries (Typescript)
        "dojo", //3rd Party Libraries
        "package", //3rd Party Libraries (CSharp)
        "packages", //3rd Party Libraries (CSharp)
        "vendor", //3rd Party Libraries (Golang)
        "xjs", //3rd Party Libraries (JS)
    ].join()
}

function getOsaFolderExclusions(){
    return [
        "cxcli", //Folder created when downloading CLI
        "test", // Tests
        "tests", // Tests
        "mock", // Tests
        "mocks", // Tests
        "spec", // Tests
        "unit", // Tests
        "debug", // Tests
        "e2e", //Tests
        "androidTest", // Tests (Android)
        "example", // Dead Code
        "examples", // Dead Code
        "samples", // Dead Code
        ".vs", // Non-relevant folders (Visual Studio)
        ".vscode", // Non-relevant folders (VS Code)
        ".idea", // Non-relevant folders (IntelliJ IDEA)
        ".temp", // Non-relevant folders (Temporary)
        ".tmp", // Non-relevant folders (Temporary)
        ".grunt", // Non-relevant folders (Grunt)
        ".cache", // Non-relevant folders (Cache)
        ".dynamodb", // Non-relevant folders (Dinamo DB)
        ".fusebox", // Non-relevant folders (Fusebox)
        ".serverless", // Non-relevant folders (Serverless)
        ".nyc_output", // Non-relevant folders (NYC)
        ".git", // Non-relevant folders (Git)
        ".github", // Non-relevant folders (Github)
        ".dependabot", // Non-relevant folders (Dependabot)
        ".semaphore", // Non-relevant folders (Semaphore CI)
        ".circleci", // Non-relevant folders (Circle CI)
        ".nuget", // Non-relevant folders (CSharp)
        ".mvn", // Non-relevant folders (Maven)
        ".m2", // Non-relevant folders (Maven)
        ".DS_Store", // Non-relevant folders
        ".sass-cache", // Non-relevant folders
        ".gradle", // Non-relevant folders (Android)
        "__pycache__", // Non-relevant folders (Python)
        ".pytest_cache", // Non-relevant folders (Python)
        ".settings", // Non-relevant folders (CSharp)
    ].join()
}

function getScaFolderExclusions(){
    return getOsaFolderExclusions()
}

module.exports = {
    getDefaultFolderExclusions: getDefaultFolderExclusions,
    getOsaFolderExclusions: getOsaFolderExclusions,
    getScaFolderExclusions: getScaFolderExclusions,
}
