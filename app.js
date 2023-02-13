const express = require('express'); //server
const bodyParser = require('body-parser') //parsowanie formularza
const app = express(); 
const { getProducts, verifyPassword, createProduct } = require("./db"); //metody bazy
const md5 = require('md5'); //hashowanie hasla

app.use(bodyParser.urlencoded()); //przechwytywanie danych z formularza //z dokumentacji
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set the view engine to ejs //z dokumentacji

// home page
app.get('/', function(req, res) { // get (sciezka, funkcja (request, response)) 
  res.render('home');
});

// about page
app.get('/products', async function(req, res) {
  // /products?new=true
    const products = await getProducts();
    const newProduct = req.query.new
      ? req.query.new
      : false;
    res.render('products', {
        products : products,
        newProduct : newProduct
    });
  });

// admin page
app.get('/admin', async function(req, res) {
  // /admin?error=true
  const error = req.query.error 
    ? req.query.error
    : false;
  res.render('admin', {
    error: error
  });
});

//adding product endpoint
app.post('/addproduct', async function(req,res) {
  const {
    productName,
    productQuantity,
    productPrice,
    accessPassword
  } = req.body;
  // Bardzo prosta walidacja formularza
  if(
    productName && productName != "" &&
    productQuantity && productQuantity != "" &&
    productPrice && productPrice != "" &&
    accessPassword && accessPassword != "" &&
    !isNaN(parseFloat(productPrice)) &&
    !isNaN(parseInt(productQuantity))
  ) {
    // Jest ok, sprawdź hasło
    const encodedPass = md5(accessPassword);
    const passwordOk = await verifyPassword(encodedPass);
    if(passwordOk) {
      await createProduct(productName, productPrice, productQuantity);
      res.redirect('/products?new=true');
    } else {
      res.redirect(`/admin?error=true`);
    }
  } else {
    // Coś źle wpisane
    res.redirect(`/admin?error=true`);
  }
});

app.listen(4000);
console.log('Server is listening on port 4000');
