tasks.register<Exec>("assembleDebug") {
    description = "Compiles the rewritten React web application using Vite"
    commandLine("npm", "run", "build")
}

tasks.register<Exec>("lint") {
    description = "Lints the rewritten React TypeScript application"
    commandLine("npm", "run", "lint")
}
