const fs = require("fs");

class ProductManager {
  constructor() {
    this.path = "./products.json";
    this.clearJsonFile(); //Escribe un array vacío [] en el archivo JSON, borrando cualquier dato existente
  }

  clearJsonFile() {
    try {
      fs.writeFileSync(this.path, "[]");
      console.log("Vaciado inicial de archivo products.json");
    } catch (error) {
      console.error("Error al vaciar", error);
    }
  }

  async addProduct(product) {
    if (!this.isValidProduct(product)) return false;
    const products = await this.getProducts();

    //Se genera un id único basado en el id del utlimo producto de la lista, o 1 si está vacía.
    const newProductId =
      products.length > 0 ? products[products.length - 1].id + 1 : 1;

    // Validación de código único
    const existingProduct = products.find((p) => p.code === product.code);
    if (existingProduct) {
      console.error(`Ya existe un producto con el código "${product.code}".`);
      return false;
    }
    product.id = newProductId;
    products.push(product);
    console.log(`Producto "${product.title}" agregado correctamente.`);
    await this.saveProducts(products);
  }

  isValidProduct(product) {
    const requiredFields = [
      "title",
      "description",
      "price",
      "thumbnail",
      "code",
      "stock",
    ];
    for (const field of requiredFields) {
      if (!product.hasOwnProperty(field)) {
        console.error(
          `El campo "${field}" es obligatorio. "${product.title}" no puede ser agregado`
        );
        return false;
      }
    }
    return true;
  }

  async getProducts() {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error getProducts:", error);
      return [];
    }
  }

  async getProductById(id) {
    try {
      const products = await this.getProducts();
      const product = products.find((product) => product.id === id);
      if (!product) {
        console.log(`No se encontró ningún producto con el ID ${id}.`);
        return;
      }
      return product;
    } catch (error) {
      console.error("Error getProductById:", error);
      return null;
    }
  }

  async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    const index = products.findIndex((product) => product.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      await this.saveProducts(products);
    } else {
      console.error("Producto no encontrado.");
    }
  }

  async deleteProduct(id) {
    const products = await this.getProducts();
    const product = products.filter((product) => product.id !== id);
    await this.saveProducts(product);
  }

  async saveProducts(products) {
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    } catch (error) {
      console.error("Error saveProducts:", error);
    }
  }
}

const productManager = new ProductManager();

console.log(
  "\n----------------------------------Iniciando carga de productos---------------------------------\n"
);

async function loadProducts() {
  //Se carga un array con los productos para luego a traves de un ciclo for, agregarlos
  const productsToAdd = [
    {
      title: "Jeans",
      description: "Pantalón tiro intermedio, calce chupín.",
      price: 15500,
      thumbnail: "https://i.ibb.co/5FFKrDM/jeans.webp",
      code: "AAA123",
      stock: 10,
    },
    {
      title: "Canguro",
      description: "Canguro con Capucha, Casual",
      price: 16500,
      thumbnail: "https://i.ibb.co/xMT8Lp4/canguro.webp",
      code: "BBB123",
      stock: 20,
    },
    {
      title: "Buzo",
      price: 20000,
      thumbnail: "https://i.ibb.co/M2f1FtF/buzo.webp",
      code: "CCC123",
      stock: 5,
    },
    {
      title: "Camisa",
      description: "Camisa a cuadros con capucha",
      price: 15000,
      thumbnail: "https://i.ibb.co/MsgNGXz/camisa.webp",
      code: "DDD123",
      stock: 15,
    },
    {
      title: "Campera",
      description: "Campera de cuero",
      price: 35000,
      thumbnail: "https://i.ibb.co/MsgNGXz/camisa.webp",
      code: "EEE123",
      stock: 3,
    },
  ];

  for (const product of productsToAdd) {
    await productManager.addProduct(product);
  }

  const allProducts = await productManager.getProducts();

  console.log(
    "\n---------------------Listado de todos los productos cargados correctamente-------------------\n",
    allProducts
  );

  const productById = await productManager.getProductById(1);
  console.log(
    "\n--------------------------Método getProduct por ID (Ejemplo ID=1)--------------------------\n",
    productById
  );

  console.log(
    "\n-----------------Método getProduct por ID (Ejemplo de no encontrado ID=10)-----------------\n"
  );
  const productByIdNotFound = await productManager.getProductById(10);
  console.log("Valor: ", productByIdNotFound);

  await productManager.updateProduct(2, { price: 1000.5 });
  const updatedProduct = await productManager.getProductById(2);
  console.log(
    "\n--------------------Método updateProduct (precio) por ID (Ejemplo ID=2)--------------------\n",
    updatedProduct
  );

  const productDeleteById = await productManager.getProductById(4);
  await productManager.deleteProduct(4);
  console.log(
    "\n-------------------------Método deleteProduct por ID (Ejemplo ID=4)------------------------\n",
    productDeleteById
  );
  const remainingProducts = await productManager.getProducts();
  console.log(
    "\n-------------------------------Productos restantes en el JSON:------------------------------\n",
    remainingProducts
  );
}
loadProducts();
