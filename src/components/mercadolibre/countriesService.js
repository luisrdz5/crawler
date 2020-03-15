const axios = require("axios");
const { config } = require("../../config");
const MongoLib = require('../../lib/mongo');


class CountriesService {
    constructor() {
        this.collection = 'countries';
        this.MongoDB = new MongoLib();
    }
    createCountries(data) {
        try {
          const countries = data.map((item) => {
            const obj = {
              _id: item.id,
              ...item
            };
            delete obj.id;
            return obj;
          });
          return this.MongoDB.createMany(this.collection, countries);
        } catch (error) {
          throw new Error(error);
        }
      }
      async getAPICountries() {
        try {
            const api = `${config.apiMercadolibre}/sites`;
            const { data } = await axios.get(api);
            //console.log(data);
            return data;
          } catch (error) {
            console.error(error);
          }
      }
      async getDBCountries() {
        try {
          const data = await this.mongodb.getAll(this.collection, {});
          return data;
        } catch (error) {
          throw new Error(error);
          return null
        }
      }
}
module.exports = CountriesService;

