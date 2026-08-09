/**
 * HTTP Server Entrypoint
 * Boots Express listener.
 */
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`GTM Smart Gate Enterprise Backend listening on port ${PORT}`);
});
