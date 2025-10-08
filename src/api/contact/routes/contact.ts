export default {
  routes: [
    {
      method: "POST",
      path: "/send-contact",
      handler: "contact.sendContact",
      config: {
        auth: false,
      },
    },
  ],
};
