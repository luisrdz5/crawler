const axios = require("axios");
const { config } = require("../../config");
const MongoLib = require('../../lib/mongo');

class ProductsService {
  constructor() {
    this.collection = 'products';
    this.criteria = 'criteria';
    this.MongoDB = new MongoLib();
    this._urlCollection = 'urls'
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
              "source": "PCML",
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



      /*

      async insertLinksFromCriteria(){
          this.deleteLinks();
          // We get countries 
          let countries = [] ;
          let categories = {};
          let category = {};
          let indexCategory=[];
          let criteria = [];
          let allData = {};
          const dateGet = new Date();
          
          allData = {
            "source": "PCML",
            "fecha": dateGet,
            "Catalogue": "products"
          }
          try {
            const api = `${config.apiMercadolibre}/sites`;
            const { data } = await axios.get(api);
            Promise.all(data).then(async (item) => { 
              data.map( async (item) => {
                countries.push(item.id);
              })
              countries = countries.filter((country) => country !== "MPT");
              //countries = countries.filter((country) => country === "MLA");
              criteria = await this.getCriteria();
              Promise.all(criteria).then(values => { 
                //console.log(countries);
                const resultValues = values.map(async (item) => {
                  try {
                    const resultProducts = countries.map(async (country) => {
                      //console.log(country);
                      //console.log(item);
                      try {
                        const url = `${config.apiMercadolibre}/sites/${country}/search?q=${item}`;
                        //const { products } = await axios.get(url);
                        const allURL = {
                          url,
                          processed: false
                        }
                        return this.createLinks(allURL);
                      }catch(err){
                        console.error(err);
                      }
                    });
                    return resultProducts;
                  } catch (error) {
                    console.error(error);
                  }
                });
              })
            })
        } catch (error) {
          console.error(error);
          return {};
        } 
      }

      */

     async getCountries(){
      let countries = [] ;
      try {
        const api = `${config.apiMercadolibre}/sites`;
        const { data } = await axios.get(api);
        data.map( async (item) => {
          countries.push(item.id);
        })
        return countries;
      }
      catch(error) {
        console.log(error);
      }
     }
     async getLinks(countries, criteria){
      let result = [];
      countries = countries.filter((country) => country !== "MPT");
      //countries = countries.filter((country) => country === "MLA");
      countries.map(country => {
          return criteria.map(item => {
            const url = `${config.apiMercadolibre}/sites/${country}/search?q=${item}`;
            const allURL = {
              url,
              processed: false
            }
            result.push(allURL);
            this.createLinks(allURL);
          });
      });
      //result = await this.createLinks(result);
      return result;
     }
     async insertLinksFromCriteria(){
       try{
        this.deleteLinks()
        this.deleteProducts();
        const countries = await this.getCountries();
        const criteria = await this.getCriteria();
        return await this.getLinks(countries, criteria);
       }
       catch(error){
         return error;
       }
     }
     async executeURLsCreated(){
       //get Links
       try{
        let result;
        const URLs = await this.getURLs();
        URLs.map(async (item) => {
          console.log(`procesando ... ${item.url}`)
          result = await this.executeURL(item.url);
        })
        return URLs;
       }catch(error){
         console.log(error);
         return error;
       }


       //deleteProducts DB only development 

       //create map  
    }
    async getURLs(){
      const query = {};
      const URLs = await this.MongoDB.getAll(this._urlCollection, query);
      return URLs || [];

    }
    async deleteProducts() {
      const all = {}
      try {
        return await this.MongoDB.deleteMany(this.collection, all);
      } catch (error) {
        throw new Error(error);
      }
    }
    async executeURL(url){
      const dateGet = new Date();
      let allData = {
        "source": "PCML",
        "fecha": dateGet,
        "Catalogue": "products"
      }
      try{
        const products =  await axios.get(url);
        //console.log(products);
        allData = {
          ...allData,
          data: products.data,
        }
        //console.log(allData);
        this.createProducts(allData);
        /*
        Promise.all(products).then(async (value) => { 
          
          allData = {
            ...allData,
            data: value,
          }
          console.log(allData);
          return await this.createProducts(allData);
        })

        */
      }catch(error){
        console.log(error);
        return error;
      }

        //execute axios 1 by 1
       //save in bd in the future send to normalization 
    }
      async getCriteria(){
        const query = {};
        let criteria = await this.MongoDB.getAll(this.criteria, query);
        criteria = criteria.map((item) => {
          return item.keyWord;
        })
        return criteria || [];
    }
    createLinks(allURL) {
      try {
        return this.MongoDB.create(this._urlCollection, allURL);
      } catch (error) {
        throw new Error(error);
      }
    }
    deleteLinks() {
      const all = {}
      try {
        return this.MongoDB.deleteMany(this._urlCollection, all);
      } catch (error) {
        throw new Error(error);
      }
    }
}
module.exports = ProductsService;