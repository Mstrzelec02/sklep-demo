const md5 = require('md5');
const { Pool } = require('pg'); 

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  database: 'my-base',
  password: 'marta',
  port: 5432,
});

const createProduct = async (name, price, quantity) => {
  const queryString = 'INSERT INTO products(name, price, quantity) VALUES($1, $2, $3) RETURNING *';
  const values = [name, price, quantity];
  pool.query(queryString, values)
    .then((res) => console.log(`Product ${name} with price ${price} and q ${quantity} created! :)`))
    .catch((err) =>
      setImmediate(() => {
        throw err
      })
    )
}

const getProducts = async () => {
  const queryString = 'SELECT * FROM PRODUCTS';
  try {
    const res = await pool.query(queryString);
    return res.rows;
  } catch (err) {
    return err.stack;
  }
}

const verifyPassword = async (hash) => {
  const queryString =  `SELECT * FROM passwords WHERE hash=$1`;
  const values = [hash]
  try {
    const res = await pool.query(queryString,values);
    const pass = res.rows.pop();
    if(pass) {
      return true;
    } else return false;
  } catch (err) {
    return false;
  }
}

const dbInit = async () => { //uruchamia sie tylko raz
  //1. Create the product table if doesn't exist
  const queryString = `
    CREATE TABLE IF NOT EXISTS "products" (
	    "id" SERIAL,
	    "name" VARCHAR(100) NOT NULL,
	    "price" FLOAT(2) NOT NULL,
	    "quantity" INTEGER NOT NULL,
	    PRIMARY KEY ("id")
    );`;

  try {
      const res = await pool.query(queryString);
      console.log("Table created if didnt exist! Response: " + res);
      return res;
    } catch (err) {
      return err.stack;
    }
}

const passInit = async () => { ///tworzenie tablicy passwords
  const queryString = `
  CREATE TABLE IF NOT EXISTS "passwords" (
    "id" SERIAL,
    "hash" VARCHAR(100) NOT NULL,
    PRIMARY KEY ("id")
  );`;

try {
    const res = await pool.query(queryString);
    console.log("Table passwords created if didnt exist! Response: " + res);
    return res;
  } catch (err) {
    return err.stack;
  }
}

const addPass = async (pass) => {
  const hash = md5(pass);
  const queryString = 'INSERT INTO passwords(hash) VALUES($1) RETURNING *';
  const values = [hash];
  pool.query(queryString, values)
    .then((res) => console.log(`Pass with hash ${hash} added :)`))
    .catch((err) =>
      setImmediate(() => {
        throw err
      })
    )
}

module.exports = {
  getProducts,
  verifyPassword,
  createProduct
};

(async () => {
  dbInit();
  passInit();
  const TEST_PASS = "admin";
  const TEST_HASH = md5(TEST_PASS);
  const TEST_PASS_EXISTS = await verifyPassword(TEST_HASH);
  console.log(TEST_PASS_EXISTS);
  if(!TEST_PASS_EXISTS) {
    addPass(TEST_PASS);
  }
})();
