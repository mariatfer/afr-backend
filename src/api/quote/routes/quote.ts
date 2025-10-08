/**
 * quote router
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/send-quote",
      handler: "quote.sendQuote",
      config: {
        auth: false,
      },
    },
  ],
};
