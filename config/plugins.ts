export default ({
  env,
}: {
  env: (key: string, defaultValue?: string) => string;
}) => ({
  email: {
    config: {
      provider: "strapi-provider-email-resend",
      providerOptions: {
        apiKey: env("RESEND_API_KEY"),
      },
      settings: {
        defaultFrom: env("RESEND_DEFAULT_FROM"),
        defaultReplyTo: env("RESEND_DEFAULT_REPLY_TO"),
      },
    },
  },
});
