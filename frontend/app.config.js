// Dynamic Expo config extension.
// When running in the Base44 preview sandbox, allow the preview proxy origin
// through Expo's dev-server CORS middleware by setting extra.router.origin.
// Outside the sandbox (BASE44_PREVIEW_MODE not "1"), preserves original behavior.
export default ({ config }) => {
  const isBase44Preview = process.env.BASE44_PREVIEW_MODE === "1";
  const suffix = process.env.BASE44_PUBLIC_HOST_SUFFIX;

  if (isBase44Preview && suffix) {
    return {
      ...config,
      extra: {
        ...(config.extra || {}),
        router: {
          ...((config.extra || {}).router || {}),
          origin: `https://3000-${suffix}`,
        },
      },
    };
  }

  return config;
};
