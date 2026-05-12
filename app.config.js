// Estende o app.json em tempo de build para injetar a API key do Google Maps
// a partir da variável de ambiente GOOGLE_MAPS_API_KEY.
// O app.json continua sendo a fonte de verdade para todo o resto da config.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
      },
    },
  },
});
