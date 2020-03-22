const axios = require("axios");
const { config } = require("../../config");
const MongoLib = require('../../lib/mongo');

class ProductsService {
  constructor() {
    this.collection = 'products';
    this.MongoDB = new MongoLib();
  }

      async getAPIProducts() {
        // We get countries 
        let countries = [] ;
        let categories = {};
        let category = {};
        let indexCategory=[];
        try {
            const api = `${config.apiMercadolibre}/sites`;
            const { data } = await axios.get(api);
            data.map( async (item) => {
                countries.push(item.id);
            })
          } catch (error) {
            console.error(error);
          }
          //We get categories 

          countries = countries.filter((country) => country !== "MPT");
          // hago esta linea para solo hacer el de un pais
          countries = countries.filter((country) => country === "MLA");
          const countriesIndex = countries.map(async (item) => {
              indexCategory=[];
              //console.log(`item es: ${item}`)
            try {
                const url = `${config.apiMercadolibre}/sites/${item}/categories`;
                const { data } = await axios.get(url);
                data.map((index) => {
                    indexCategory.push(index.id);
                })
                //console.log(`indexCategory es: ${indexCategory}`);
                category = { "country" : item, data : indexCategory } ;
                //console.log(`category es: ${JSON.stringify(category)}`);
                return category;
                //console.log(`category es: ${category}`);
              } catch (error) {
                console.error(error);
                return {};
              }
          })
          
          Promise.all(countriesIndex).then(values => { 
            let allData = {};
            const dateGet = new Date();
            
            allData = {
              "source": "ML",
              "fecha": dateGet,
              "Catalogue": "products"
            }
            const valuesPromise = values.map( async (countryKey) => {
              //console.log(countryKey.country);
              const countryPromise = countryKey.data.map(async (categorykey) => {
                const api = `${config.apiMercadolibre}/sites/${countryKey.country}/search?category=${categorykey}`;
                const { data } = await axios.get(api);
                allData = {
                      "data": data.results,
                      ...allData 
                }
                // aqui se guarda en base de datos
                // pero aca debera ser enviado al servicio de normalizacion
                this.createProducts(allData);
              })
            })
          });
          //console.log(categories);    
/*
          try {
            const url = `${config.apiMercadolibre}/sites/${country_id}/categories`;
            const { data } = await axios.get(url);
            return data;
          } catch (error) {
            console.error(error);
            return {};
          }
*/

      }



      createProducts(data) {
        try {
          return this.MongoDB.create(this.collection, data);
        } catch (error) {
          throw new Error(error);
        }
      }


}
module.exports = ProductsService;