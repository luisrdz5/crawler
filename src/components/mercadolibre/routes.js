const express = require('express');
const CountriesService = require('./countriesService');
const CategoriesService = require('./categoriesService');
const ProductsService = require('./productsService');

function mercadoLibreAPI(app) {
    const router = express.Router();
    app.use('/api/ML', router);

    router.get('/', (req, res) => {
      res.send(`API auth v 0.01`);
    });
    router.get('/getproducts', async (req, res) => {
      const productsService = new ProductsService();
      try{
          const data = await productsService.getAPIProducts();
          const dateGet = new Date();
          res.status(200).json({
              "source": "ML",
              "fecha": dateGet,
              "catalogue": "products",
              data,
              message: 'products listed'
            });
      } catch(err){
          res.status(500).json({
              data,
              error: 'error getting countries'
            });
      }
    });

    router.get('/getcountries', async (req, res) => {
        const countriesService = new CountriesService();
        try{
            const data = await countriesService.getAPICountries();
            const dateGet = new Date();
            res.status(200).json({
                "source": "ML",
                "fecha": dateGet,
                "catalogue": "countries",
                data,
                message: 'countries listed'
              });
        } catch(err){
            res.status(500).json({
                data,
                error: 'error getting countries'
              });
        }
      });
      router.get('/getcategories', async (req, res) => {
        const categoriesService = new CategoriesService();
        const dateGet = new Date();
        try{
            const data = await categoriesService.getAPICategories();
            res.status(200).json({
                "source": "ML",
                "fecha": dateGet,
                "catalogue": "categories",
                data,
                message: 'categories listed'
              });
        }catch(err){
            res.status(500).json({
                data,
                error: 'error getting categories'
              });
        }
      });
      router.get('/getcategories/:countryid', async (req, res) => {
        const countryid = req.params.countryid;
        const dateGet = new Date();
        const categoriesService = new CategoriesService();
        try{
            const data = await categoriesService.getAPICategoriesbyCountry(countryid);
            res.status(200).json({
                "source": "ML",
                "fecha": dateGet,
                "catalogue": "categories",
                data,
                message: 'categories listed'
              });
        }catch(err){
            res.status(500).json({
                data,
                error: 'error getting categories'
              });
        }
      });
      router.get('/insertcategories', async (req, res) => {
        const categoriesService = new CategoriesService();
        try{
            const data = await categoriesService.insertDBCategories();
            if(data){
              res.status(200).json({
                message: 'categories saved'
              });
            }
            else {
              res.status(500).json({
                data,
                error: 'error saving categories'
              });
            }
        }catch(err){
          console.log(err);
        }
      });
      router.get('/insertcountries', async (req, res) => {
        const countriesService = new CountriesService();
        try{
            const data = await countriesService.insertDBCountries();
            if(data){
              res.status(200).json({
                message: 'countries saved'
              });
            }
            else {
              res.status(500).json({
                data,
                error: 'error saving categories'
              });
            }
        }catch(err){
          console.log(err);
        }
      });
      
}

module.exports = mercadoLibreAPI;