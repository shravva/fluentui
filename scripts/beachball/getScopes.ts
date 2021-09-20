import { AllPackageInfo, getAllPackageInfo } from '../monorepo/index';

// Northstar is never published with beachbal
const ignoreNorthstarScope = '!packages/fluentui/*';

/**
 * Reads package info from the monorepo and generates the scopes for beachball bump and release
 * @returns Appropriate scoped packages for beachball
 */
export function getScopes() {
  const allPackageInfo = getAllPackageInfo();

  if (process.env.RELEASE_VNEXT) {
    return [...getVNextPackagePaths(allPackageInfo), ...getSharedPackagePaths(allPackageInfo)];
  }

  const ignoreVNextScope = getVNextPackagePaths(allPackageInfo).map(path => `!${path}`);
  return [ignoreNorthstarScope, ignoreVNextScope];
}

function getVNextPackagePaths(allPackageInfo: AllPackageInfo) {
  return Object.values(allPackageInfo)
    .map(packageInfo => {
      if (packageInfo.packageJson.version.startsWith('9.')) {
        return packageInfo.packagePath;
      }

      return false;
    })
    .filter(Boolean) as string[];
}

function getSharedPackagePaths(allPackageInfo: AllPackageInfo) {
  return Object.values(allPackageInfo)
    .map(packageInfo => {
      // These packages depend on converged packages, but are private
      // Can be included in the publish scope so that dependencies are bumped correctly.
      const privateNonConverged = ['perf-test', 'vr-tests'];

      if (privateNonConverged.includes(packageInfo.packageJson.name)) {
        return packageInfo.packagePath;
      }

      return false;
    })
    .filter(Boolean) as string[];
}
