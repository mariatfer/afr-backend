export default ({
  env,
}: {
  env: (key: string, defaultValue?: string) => string;
}) => ({
  email: {
    config: {
      provider: env("NODE_ENV") === "production" ? "strapi-cloud" : "resend",
      providerOptions:
        env("NODE_ENV") === "production"
          ? {}
          : {
              apiKey: env("RESEND_API_KEY"),
            },
      settings:
        env("NODE_ENV") === "production"
          ? {
              defaultFrom: "noreply@strapiapp.com",
            }
          : {
              defaultFrom: env("RESEND_DEFAULT_FROM"),
              defaultReplyTo: env("RESEND_DEFAULT_REPLY_TO"),
            },
    },
  },
});
