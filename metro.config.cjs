const { getDefaultConfig } = require('expo/metro-config');
const { createHash } = require('node:crypto');
const { existsSync, readFileSync } = require('node:fs');

const getCacheVersion = (values) =>
  values
    .filter(Boolean)
    .reduce(
      (hash, value) => hash.update('\0', 'utf8').update(value || '', 'utf8'),
      createHash('md5'),
    )
    .digest('hex');

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  cacheVersion: getCacheVersion([
    config.cacheVersion,
    readFileSync('./pnpm-lock.yaml', 'utf8'),
    readFileSync('./package.json', 'utf8'),
    existsSync('./.env') && readFileSync('./.env', 'utf8'),
    existsSync('./.env.local') && readFileSync('./.env.local', 'utf8'),
  ]),
  resolver: {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...config.resolver.sourceExts, 'svg'],
    unstable_enableSymlinks: true,
  },
  transformer: {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
  },
};
