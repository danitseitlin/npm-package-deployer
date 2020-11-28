#!/usr/bin/env node
import * as child_process  from 'child_process';
import * as chalk from 'chalk'

(async () => {
    try {
        const cliArguments = process.argv.slice(3).join(' ');
        const isNPMDeploy = (process.argv[1].includes('npm-deploy') || process.argv[1].includes('\\npm-package-deployer\\lib\\index.js'));
        //Verifying the deploy CLI command was executed
        if(process.argv[0].includes('node') && isNPMDeploy === true && process.argv.length >= 3) {
            const packageName = process.argv[2];
            const version = await getVersion(packageName, cliArguments)
            console.log(`Upgrading ${packageName} to version ${version}`)
            await execute(`npm version ${version} --allow-same-version ${cliArguments}`);
            console.log(await execute(`npm publish ${cliArguments}`));
        }
        else console.log(chalk.yellow('Example: npm-deploy <package name>'))
    } catch (e) {
        console.log(e)
    }
})();

/**
 * Retrieving the version of the current package
 * @param packageName The name of the package
 * @param cliArguments The additional CLI arguments
 */
async function getVersion(packageName: string, cliArguments: string): Promise<string> {
    if(await doesPackageExist(packageName, cliArguments)) {
        const stdout = (await execute(`npm info ${packageName} version ${cliArguments}`)).stdout.replace('\n', '');
        const split = stdout.split('.');
	    const version = {
	    	major: parseInt(split[0]),
	    	minor: parseInt(split[split.length-2]),
	    	patch: parseInt(split[split.length-1])
	    }
	    if(version.patch < 9) version.patch++;
	    else if(version.patch === 9 && version.minor < 9) {version.patch = 0; version.minor++}
	    else if(version.patch === 9 && version.minor === 9 ) {version.patch = 0; version.minor = 0; version.major++;}
        return `${version.major}.${version.minor}.${version.patch}`
    }
    return '0.0.1';
}

/**
 * Checking if the pacakge exists in the relevant NPM registry
 * @param packageName The name of the package
 * @param cliArguments The additional CLI arguments
 */
async function doesPackageExist(packageName: string, cliArguments: string): Promise<boolean> {
    const arrayArguments = cliArguments.split(' ')
    const isScopedRegistry = arrayArguments.findIndex((item: string) => item.includes('--registry') && !item.includes('registry.npmjs.org')) !== -1;
    const isScope = arrayArguments.findIndex((item: string) => item.includes('--scope')) !== -1;
    if(!isScopedRegistry && !isScope) {
        const response = await execute(`npm search ${packageName} ${cliArguments}`);
        return response.stdout.indexOf(`No matches found for "${packageName}"\n`) === -1;
    }
    else {
        console.log('Because of known NPM issues, we do not search for the package existence before deployment of Scoped packages.')
        return true;
    }
}

/**
 * Executes a shell command
 * @param command The command
 */
function execute(command: string): Promise<{ stdout: string, stderr: string }> {
    return new Promise((done, failed) => {
        child_process.exec(command, (error, stdout, stderr) => {
          if (error !== null) failed(error)
          done({ stdout, stderr })
        })
    })
}