const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const adminsPath = path.join(__dirname, "..", "data", "admins.json");

router.get("/", (req, res) => {
    const admins = JSON.parse(fs.readFileSync(adminsPath));
    res.status(200).json(admins);
});

router.get("/:id", (req, res) => {
    const admins = JSON.parse(fs.readFileSync(adminsPath));
    const id = req.params.id;
    const admin = admins.find(a => a.id === id)
    if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
    }
    res.status(200).json(admin);
});

router.post("/", async (req, res) => {
    const admins = JSON.parse(fs.readFileSync(adminsPath));
    const newAdmin = req.body;
    if (!newAdmin.id || !newAdmin.name || !newAdmin.username || !newAdmin.password) {
        return res.status(400).json({ error: "Missing required admin fields" });
    }
    if (admins.find(a => a.id === newAdmin.id) ||
        admins.find(a => a.username === newAdmin.username)) {
        return res.status(409).json({ error: "Admin already exists" });
    }
    const hashedPassword = await bcrypt.hash(newAdmin.password, 10);
    newAdmin.password = hashedPassword;
    admins.push(newAdmin);
    fs.writeFileSync(adminsPath, JSON.stringify(admins));
    res.status(201).json(newAdmin)
});

router.put("/:id", async (req, res) => {
    const admins = JSON.parse(fs.readFileSync(adminsPath));
    const id = req.params.id;
    const index = admins.findIndex(a => a.id === id)
    if (index === -1) {
        return res.status(404).json({ error: "Admin not found" });
    }
    const admin = admins[index];
    const body = req.body;
    if (body.name !== undefined) admin.name = body.name;
    if (body.username !== undefined) admin.username = body.username;
    if (body.password !== undefined) {
        admin.password = await bcrypt.hash(body.password, 10);
    }
    admins[index] = admin;
    fs.writeFileSync(adminsPath, JSON.stringify(admins));
    res.status(200).json(admin);
});

router.delete("/:id", (req, res) => {
    const admins = JSON.parse(fs.readFileSync(adminsPath));
    const id = req.params.id;
    const index = admins.findIndex(a => a.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Admin not found" });
    }
    const deleted = admins.splice(index, 1)[0];
    fs.writeFileSync(adminsPath, JSON.stringify(admins))
    res.status(200).json({ message: "Admin deleted"});
});

module.exports = router;
