const axios = require("axios");


class ProductsService {
    constructor() {
        this.collection = 'countries';
        this.MongoDB = new MongoLib();
    }

      async getAPIProducts() {
        // We get countries 
        let countries = [] ;
        try {
            const api = `${config.apiMercadolibre}/sites`;
            const { data } = await axios.get(api);
            data.map((item) => {
                countries.push(item.id);
            })
            console.log(countries);
          } catch (error) {
            console.error(error);
          }
      }


}
module.exports = ProductsService;