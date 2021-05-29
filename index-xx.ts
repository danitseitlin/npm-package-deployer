#!/usr/bin/env node

const utils = require('./src/utils');
const deployment = require('./src/deployment')
import { PackageCli, printHelp } from './cli';

(async () => {
    try {
        const cliArguments = process.argv.slice(3)//.join(' ');
        const isTriggered = (process.argv[1].includes('deploy-pkg') || process.argv[1].includes('\\npm-package-deployer\\lib\\index.js'));
        //Verifying the deploy CLI command was executed
        if(process.argv[0].includes('node') && isTriggered && process.argv.length >= 3) {
            const packageName = process.argv[2];
            if(packageName === '--help')
                utils.printHelp();
            else {
                // const cli = new PackageCli(packageName)
                // if(!await cli.isAuthenticated())
                //     throw Error('Auth is required!')
                // await cli.upgradePackage(cliArguments);
                const data: any = {
                    pkgName: packageName,
                    debug: cliArguments.includes('--debug'),
                    prettyPrint: cliArguments.includes('--pretty-print'),
                    dryRun: cliArguments.includes('--dry-run')
                }
                data.npm = cliArguments.includes('--npm-access-token') ? {
                    token: cliArguments.find(arg => arg.includes('--npm-access-token'))?.split('=')[1],
                    registry: cliArguments.find(arg => arg.includes('--npm-registry'))?.split('=')[1],
                    scope: cliArguments.find(arg => arg.includes('--npm-scope'))?.split('=')[1]
                }: undefined;
                data.github = cliArguments.includes('--github-access-token') ? {
                    token: cliArguments.find(arg => arg.includes('--github-access-token'))?.split('=')[1]
                }: undefined;
                //Verifying inputs
                verifyInputs(data);
                await deployment.deploy(data);
            }
        }
        else utils.printHelp()
    } catch (error) {
        console.log(error);
        throw Error(error);
    }
})();

/**
 * Verifying GitHub action inputs
 */
 async function verifyInputs(data: any) {
    if(!data.pkgName || data.pkgName === '')
        throw new Error('Missing input "pkg_name"')
    if(data.npm){
        if(!data.npm.token || data.npm.token === '')
            throw new Error('Mising input "npm_access_token"')
    }
    if(data.github){
        if(!data.github.token || data.github.token === '')
            throw new Error('Mising input "github_access_token"')
    }
}

/**
 * (async () => {
    try {
        const data = {
            pkgName: pkgName,
            debug: debug,
            prettyPrint: prettyPrint,
            dryRun: dryRun
        }
        data.npm = isNPM ? {
            token: npmAccessToken,
            registry: npmRegistry,
            scope: npmScope
        }: undefined;
        data.github = isGitHub ? {
            token: githubAccessToken
        }: undefined;
        //Verifying inputs
        verifyInputs(data);
        await deployment.deploy(data);
    }
    catch(e) {
        core.setFailed(e.toString());
    }
    })();
 */