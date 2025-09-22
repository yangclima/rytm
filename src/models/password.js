import bcryptjs from 'bcryptjs';

function getWorkFactor() {
  return process.env.NODE_ENV === 'production' ? 10 : 1;
}

async function hash(rawPassword) {
  const workFactor = getWorkFactor();
  return await bcryptjs.hash(rawPassword, workFactor);
}

async function compare(providedPassword, storedPassword) {
  return await bcryptjs.compare(providedPassword, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
