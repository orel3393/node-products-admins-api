const express = require("express")
const fs = require("fs")
const path = require("path")

const app = express()
app.use(express.json())

function ensureJsonFiles(req, res, next) {
const productsPath = path.join(__dirname, "data", "products.json");
const adminsPath = path.join(__dirname, "data", "admins.json");

    if (!fs.existsSync(productsPath)) {
        fs.writeFileSync(productsPath, "[]")
    }
    if (!fs.existsSync(adminsPath)) {
        fs.writeFileSync(adminsPath, "[]")
    }
    next()
}

app.use(ensureJsonFiles);

const productsRouter = require("./routes/products-routes")
const adminsRouter = require("./routes/admins-routes")

app.use("/products", productsRouter)
app.use("/admins", adminsRouter)

app.listen(3000, () => {
    console.log("Server is running on port 3000")
});
