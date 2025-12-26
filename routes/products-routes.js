const router = require("express").Router();
const fs = require("fs")
const path = require("path")
const bcrypt = require("bcrypt")

const productsPath = path.join(__dirname, "..", "data", "products.json");
const adminsPath = path.join(__dirname, "..", "data", "admins.json");

function adminAuth(req, res, next) {
    const { username, password } = req.query;
    if (!username || !password) {
        return res.status(401).json({ error: "No username/password entered." })
    }
    const admins = JSON.parse(fs.readFileSync(adminsPath));
    const admin = admins.find(a => a.username === username);
    if (!admin) {
        return res.status(403).json({ error: "Invalid username or password" })
    }
    // פונקצית compare ממירה את הסיסמה המוצפנת ששמורה בקובץ הjson וismatch מחזירה true אם הסיסמה נכונה
    bcrypt.compare(password, admin.password, (err, isMatch) => {
        if (err || !isMatch) {
            return res.status(403).json({ error: "Invalid username or password" })
        }
        next();
    });
}

router.get("/", (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsPath));
    res.status(200).json(products);
});

router.get("/:id", (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsPath));
    const id = req.params.id;
    const product = products.find(p => p.id === id);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
});

router.post("/", adminAuth, (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsPath));
    const newProduct = req.body;
    if (!newProduct.id || !newProduct.name || !newProduct.price ||
        !newProduct.quantity || !newProduct.category) {
        return res.status(400).json({ error: "Not all required values were entered." });
    }
    if (products.find(p => p.id === newProduct.id)) {
        return res.status(409).json({ error: "Product ID already exists" });
    }
    products.push(newProduct);
    fs.writeFileSync(productsPath, JSON.stringify(products));
    res.status(201).json(newProduct);
})

router.put("/:id", adminAuth, (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsPath));
    const id = req.params.id;
    const index = products.findIndex(p => p.id === id)
    if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
    }
    const product = products[index];
    const body = req.body;
    if (body.name !== undefined) product.name = body.name;
    if (body.price !== undefined) product.price = body.price;
    if (body.quantity !== undefined) product.quantity = body.quantity;
    if (body.category !== undefined) product.category = body.category;
    products[index] = product;
    fs.writeFileSync(productsPath, JSON.stringify(products));
    res.status(200).json(product);
});

router.delete("/:id", adminAuth, (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsPath));
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
    }
    const deleted = products.splice(index, 1)[0];
    fs.writeFileSync(productsPath, JSON.stringify(products))
    res.status(200).json({ message: "Product deleted"})
});

module.exports = router;
