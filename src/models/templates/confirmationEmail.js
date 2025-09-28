const confirmationEmail = ({ username, confirmationUrl }) => {
  const text = `Olá, ${username}!

Clique no link abaixo para confirmar seu endereço de email no Rytm:

${confirmationUrl}

Caso você não tenha feito esta requisição, ignore este email.

Atenciosamente,
Equipe do Rytm`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #ffffff; color: #111827; padding: 24px;">
      <h1>Olá, ${username}!</h1>

      <p>Clique no link abaixo para confirmar seu endereço de email no Rytm:</p>

      <p>
        <a href="${confirmationUrl}" target="_blank" rel="noopener noreferrer"
          style="display: inline-block; padding: 12px 16px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 4px;">
          Confirmar meu email
        </a>
      </p>

      <p>Ou copie e cole este link no navegador:</p>
      <p><a href="${confirmationUrl}" target="_blank" rel="noopener noreferrer">${confirmationUrl}</a></p>

      <p>Caso você não tenha feito esta requisição, ignore este email.</p>

      <p>Atenciosamente,<br/>Equipe Rytm</p>
    </div>
  `;

  return { text, html };
};

export default confirmationEmail;
