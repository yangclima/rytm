import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
});

/**
 * Envia um email usando o transporter configurado.
 *
 * @param {Object} mailOptions - Opções do email.
 * @param {string} mailOptions.from - Endereço do remetente. Pode ser simples (`"user@server.com"`) ou formatado (`"User Name" <user@server.com>`).
 * @param {string|string[]} mailOptions.to - Lista de destinatários no campo **To**. Pode ser string separada por vírgulas ou array.
 * @param {string|string[]} [mailOptions.cc] - Lista de destinatários no campo **Cc**.
 * @param {string|string[]} [mailOptions.bcc] - Lista de destinatários no campo **Bcc**.
 * @param {string} mailOptions.subject - Assunto do email.
 * @param {string|Buffer|Stream|Object} [mailOptions.text] - Versão em texto puro da mensagem. Pode ser string, Buffer, Stream ou objeto tipo `{ path }`.
 * @param {string|Buffer|Stream|Object} [mailOptions.html] - Versão em HTML da mensagem. Pode ser string, Buffer, Stream ou objeto tipo `{ path }`.
 * @param {Array<Object>} [mailOptions.attachments] - Lista de anexos. Pode incluir arquivos ou imagens embutidas.
 * @returns {Promise<import("nodemailer").SentMessageInfo>} Informações sobre o envio (ID da mensagem, resposta do servidor SMTP, etc.)
 */
async function send(mailOptions) {
  return await transporter.sendMail(mailOptions);
}

const email = {
  send,
};

export default email;
