function isTestFile(arg)
{
    return arg.match(/\.[jm]s?$/);
}
const allTestFiles = ['__tests__/__main__/*.mjs', '__tests__/__renderer__/*.mjs', '__tests__/__renderer__/classes/*.mjs'];

module.exports = {
    color: true,
    // This allows overriding the test on the cmd line when using this .cjs config file
    ...(process.argv.some(isTestFile) ? {} : {spec: allTestFiles}),
};
