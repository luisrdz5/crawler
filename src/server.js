const express = require('express');

const app = express();
const mercadoLibreAPI = require('./components/mercadolibre/routes');

const { config } = require('./config/index');

mercadoLibreAPI(app);

app.listen(config.port, function (){
    console.log(`La aplicación está escuchando en http://localhost:${config.port}`);
})
