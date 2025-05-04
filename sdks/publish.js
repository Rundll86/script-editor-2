const { spawn } = require("child_process");
const { program } = require("commander");
program.option("-p, --platform <platform>", "platform to publish to", "npm");
program.action((options) => {
    console.log(`Publishing to ${options.platform}`);
    if (options.platform === "npm") {
        spawn("npm publish", { shell: true, stdio: "inherit" });
    } else if (options.platform === "pypi") {
        spawn("python setup.py bdist_wheel", { shell: true, stdio: "inherit" });
        spawn("twine upload dist/python/*", { shell: true, stdio: "inherit" });
    } else if (options.platform === "nuget") {
        spawn("dotnet pack", { shell: true, stdio: "inherit" });
        spawn("dotnet nuget push dist/csharp/*", { shell: true, stdio: "inherit" });
    } else {
        console.log("Invalid platform");
    }
});
program.parse(process.argv);