const activationEmail = ({ username, activationUrl }) => {
  const text = `Olá, ${username}!

Clique no link abaixo para ativar seu cadastro no Rytm:

${activationUrl}

Caso você não tenha feito esta requisição, ignore esse email.

atenciosamente, equipe do Rytm`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #ffffff; color: #111827; padding: 24px;">
      <h1>Olá, ${username}!</h1>

      <p>Clique no link abaixo para ativar seu cadastro no Rytm:</p>

      <p>
        <a href="${activationUrl}" target="_blank" rel="noopener noreferrer"
          style="display: inline-block; padding: 12px 16px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 4px;">
          Ativar minha conta
        </a>
      </p>

      <p>Ou copie e cole este link no navegador:</p>
      <p><a href="${activationUrl}" target="_blank" rel="noopener noreferrer">${activationUrl}</a></p>

      <p>Caso você não tenha feito esta requisição, ignore esse email.</p>

      <p>Atenciosamente,<br/>Equipe Rytm</p>
    </div>
  `;

  return { text, html };
};

export default activationEmail;
