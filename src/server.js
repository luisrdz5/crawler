const express = require('express');

const app = express();
const mercadoLibreAPI = require('./components/mercadolibre/routes');
const criteriaAPI = require('./components/criteria/routes');

const { config } = require('./config/index');

app.use(express.json());

mercadoLibreAPI(app);
criteriaAPI(app);

app.listen(config.port, function (){
    console.log(`La aplicación está escuchando en http://localhost:${config.port}`);
})
