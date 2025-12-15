/**
 * quote controller
 */

import fs from "fs";

export default {
  async sendQuote(ctx) {
    const {
      name,
      email,
      message,
      subject,
      productName,
      privacyPolicy,
      newsletter,
    } = ctx.request.body;
    const rawFiles = ctx.request.files?.["files[]"];
    const files = Array.isArray(rawFiles)
      ? rawFiles
      : rawFiles
        ? [rawFiles]
        : [];

    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #035074; padding-bottom: 10px;">
          Nuevo presupuesto desde AFR Diseño
        </h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Asunto:</strong> ${subject}</p>
          <p><strong>Producto:</strong> ${productName || "No especificado"}</p>
        </div>
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #555;">Mensaje:</h3>
          <div style="line-height: 1.6; color: #333;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #035074;">
          <p style="margin: 0; font-size: 14px; color: #04435F;">
            <strong>Responder a:</strong> ${email}
          </p>
        </div>
        ${files.length > 0 ? `<p><strong>Archivos adjuntos:</strong> ${files.map((f) => f.originalFilename).join(", ")}</p>` : ""}
      </div>
    `;

    const userConfirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #035074; margin-bottom: 10px;">¡Gracias por contactarnos!</h1>
          <div style="width: 60px; height: 4px; background: #035074; margin: 0 auto;"></div>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
            Hola <strong>${name}</strong>,
          </p>
          <p style="margin: 0; line-height: 1.6; color: #555;">
            Hemos recibido tu solicitud de presupuesto correctamente. Nuestro equipo la revisará y te responderemos lo antes posible.
          </p>
        </div>

        <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #035074;">Resumen de tu solicitud:</h3>
          <div style="line-height: 1.6; color: #333; background: #f8f9fa; padding: 15px; border-radius: 6px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
          ${
            files.length > 0
              ? `
            <div style="margin-top: 15px;">
              <strong style="color: #035074;">Archivos enviados:</strong>
              <ul style="margin: 5px 0 0 20px; color: #555;">
                ${files.map((f) => `<li>${f.originalFilename}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }
        </div>

        <div style="border: 1px solid #035074;background: #EFFAFF; color: #035074; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">AFR Diseño</p>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">
            Te responderemos desde esta dirección: <strong>mt.fgucciardi@gmail.com</strong>
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; padding: 15px; font-size: 12px; color: #666;">
          <p style="margin: 0;">Si tienes alguna pregunta adicional, no dudes en contactarnos.</p>
        </div>
      </div>
    `;

    const attachments = files
      .filter((file) => file.filepath)
      .map((file) => ({
        filename: file.originalFilename,
        content: fs.readFileSync(file.filepath, { encoding: "base64" }),
        encoding: "base64",
        contentType: file.mimetype,
      }));

    try {
      const defaultFrom = process.env.RESEND_DEFAULT_FROM;
      const defaultReplyTo = process.env.RESEND_DEFAULT_REPLY_TO;

      await strapi
        .plugin("email")
        .service("email")
        .send({
          from: defaultFrom,
          to: defaultReplyTo,
          replyTo: email || defaultReplyTo,
          subject: `Nuevo presupuesto desde AFR Diseño - ${subject}`,
          html: adminHtml,
          ...(attachments.length > 0 && { attachments }),
        });

      await strapi.plugin("email").service("email").send({
        from: defaultFrom,
        to: email,
        subject: "Confirmación de solicitud de presupuesto - AFR Diseño",
        html: userConfirmationHtml,
      });

      await strapi.service("api::quote.quote").create({
        data: {
          name,
          email,
          subject,
          productName,
          message,
          sentToEmail: true,
          emailSentAt: new Date(),
          ipAddress: ctx.request.ip,
          userAgent: ctx.request.header["user-agent"],
          acceptsPrivacyPolicy: privacyPolicy || false,
          privacyPolicyConsentDate: privacyPolicy ? new Date() : null,
          acceptsMarketing: newsletter || false,
          marketingConsentDate: newsletter ? new Date() : null,
          files: files.map((f) => f.originalFilename),
        },
      });

      ctx.send({
        ok: true,
        message: "Emails enviados y quote guardado correctamente",
      });
    } catch (error) {
      strapi.log.error("Error sendQuote:", error);

      ctx.status = 500;
      ctx.body = {
        message: "Error al procesar la solicitud",
        error: error.message,
        stack: error.stack,
        details: error,
      };
    }
  },
};
