const axios = require("axios");
const { config } = require("../../config");
const MongoLib = require('../../lib/mongo');
const CountriesService = require('./countriesService');
const ArrayUtils = require('../../utils/arrayUtils');

class CategoriesService {
    constructor() {
        this.collection = 'categories';
        this.MongoDB = new MongoLib();
    }
    async getAPICategories() {
      try {
        return await this.importCategories();
      } catch (error) {
        console.error(error.message);
      }
    }
    async importCategories(){
      try {
        let data = await this.categories();
        data = ArrayUtils.flat(data);
        data = await this.categoriesDetail(data);
        data = ArrayUtils.flat(data);
        return data;
      } catch (error) {
        console.error(error);
      }
    };


    async insertDBCategories() {
      try {
        return await this.saveCategories();
      } catch (error) {
        console.error(error.message);
      }
    }
    async saveCategories(){
      try {
        let data = await this.categories();
        
        data = ArrayUtils.flat(data);
        
        data = await this.categoriesDetail(data);
        //console.log(data);
        data = ArrayUtils.flat(data);
        
        return this.insertCategories(data);
      } catch (error) {
        console.error(error);
      }
    };
    async categories(){
      try {
        const countriesService = new CountriesService();
        let countries = await countriesService.getAPICountries();
        countries = countries.filter((country) => country.id !== "MPT");
        return Promise.all(
          countries.map((country) => this.categoriesByCountry(country.id))
        );
      } catch (error) {
        console.log(error);
      }
    };
    async categoriesByCountry(country_id){
      try {
        const url = `${config.apiMercadolibre}/sites/${country_id}/categories`;
        const { data } = await axios.get(url);
        return data;
      } catch (error) {
        console.error(error);
        return {};
      }
    };
    async categoriesDetail(categories){
      return Promise.all(categories.map((category) => this.categoryDetail(category.id)));
    };
      async categoryDetail(category_id){
        try {
          const url = `${config.apiMercadolibre}/categories/${category_id}`;
          
          const { data } = await axios.get(url);
          const categoryDetail = {
              id: data.id,
              name: data.name,
              picture: data.picture,
              children_categories: data.children_categories,
          }
          return categoryDetail;
        }catch{
          return {}
        }          
        
      }
      async insertCategories(data) {
        try {
          const categories = data.map((item) => {
            const obj = {
              _id: item.id,
              ...item
            };
            delete obj.id;
            return obj;
          });
          return await this.MongoDB.createMany(this.collection, categories);
        } catch (error) {
          throw new Error(error);
        }
      }



      async getAPICategoriesbyCountry(countryId) {
        try {
          const countries = [{ id: countryId }];
          return Promise.all(
            countries.map((country) => this.categoriesByCountry(countryId))
          );
          //return await this.categoriesDetail([{id: countryId }]);

        } catch (error) {
          console.error(error.message);
        }
      }



}

module.exports = CategoriesService;