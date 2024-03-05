const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const Schema = mongoose.Schema;
const app = express();

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 
  }

app.use(cors())

const hostileSchema = new Schema({
    image_URL: String,
    id: Number,
    immunity: Array,
    name: String,
    research_count: Number,
    scannable_powers: Array,
    scientific_name: String,
    weaknesses: Array
  }, {versionKey: false});

const Hostile = mongoose.model("Hostile", hostileSchema);

const abilitySchema = new Schema({
    name: String,
    id: Number,
    type: String,
    includes: Array
  }, {versionKey: false});

const Ability = mongoose.model("Ability", abilitySchema);

const chipsetSchema = new Schema({
    name: String,
    id: Number,
    type: String,
    description: String
  }, {versionKey: false});

const Chipset = mongoose.model("Chipset", chipsetSchema);

const locationSchema = new Schema({
    name: String,
    id: Number,
    rooms: Array,
    quests: Array,
    connects: Array,
    airlock: Boolean,
    med_bay: Boolean,
    crew_assigned: Number,
    hostiles: Array
  }, {versionKey: false});

const Location = mongoose.model("Location", locationSchema);

const weaponSchema = new Schema({
    name: String,
    id: Number,
    primary_fire: String,
    firing_range: String,
    rate_of_fire: String,
    material_cost: Map,
    material_yield: Map,
    secondary_fire: String
  }, {versionKey: false});

const Weapon = mongoose.model("Weapon", weaponSchema);

(async () => {
    
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/Prey");
        app.listen(3001);
        console.log('Connection');

    } catch(err) {
        return console.log(err);
    }
})();

app.get("/api/hostiles", async(req, res) => {

    const hostiles = await Hostile.find({});
    res.send(hostiles);
});

app.get("/api/hostiles/:id", async(req, res) => {

    const id = req.params.id;
    const hostile = await Hostile.find({id: id});
    if(hostile) res.send(hostile);
    else res.sendStatus(404);
});

app.get("/api/abilities", async(req, res) => {

    const abilities = await Ability.find({});
    res.send(abilities);
});

app.get("/api/abilities/:id", async(req, res) => {

    const id = req.params.id;
    const ability = await Ability.find({id: id});
    if(ability) res.send(ability);
    else res.sendStatus(404);
});

app.get("/api/chipsets", async(req, res) => {

    const chipsets = await Chipset.find({});
    res.send(chipsets);
});

app.get("/api/chipsets/:id", async(req, res) => {

    const id = req.params.id;
    const chipset = await Chipset.find({id: id});
    if(chipset) res.send(chipset);
    else res.sendStatus(404);
});

app.get("/api/locations", async(req, res) => {

    const locations = await Location.find({});

    const response = await Promise.all(
            locations.map(location => getHostiles(location))
        );

    res.send(response);
});

app.get("/api/locations/:id", async(req, res) => {

    const id = req.params.id;
    const location = await Location.find({id: id});

    const response = await getHostiles(location[0]);

    if(location) res.send(response);
    else res.sendStatus(404);
});

app.get("/api/weapons", async(req, res) => {

    const weapons = await Weapon.find({});
    res.send(weapons);
});

app.get("/api/weapons/:id", async(req, res) => {

    const id = req.params.id;
    const weapon = await Weapon.find({id: id});
    if(weapon) res.send(weapon);
    else res.sendStatus(404);
});

async function getHostiles(location) {
    const hostilesArray = await Promise.all(location.hostiles.map(
        async (hostileObjectId) => {
            return await Hostile.findById(hostileObjectId.toHexString());
        }
    ));
    location.hostiles = hostilesArray;
    return location;
};

process.on("SIGINT", async() => {
    await mongoose.disconnect();
    console.log('No connection');
    process.exit();    
});


