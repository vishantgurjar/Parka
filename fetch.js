fetch('https://parka-backend.vercel.app/api/status')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
