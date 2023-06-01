const express = require("express");
const { MongoClient } = require("mongodb");

require("dotenv").config();
const cors = require("cors"); 

const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;
const uri = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/my-nft-database`;

const client = new MongoClient(uri);

try {
  
  client.connect();
} catch (e) {
  console.error(e);
}

app.use(cors()); 

app.get("/nfts", async (req, res) => {
  try {
    
    const nfts = await client.db().collection("nfts").find().toArray();
    res.json(nfts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/nfts", async (req, res) => {
  try {
    const newNFT = req.body;
    const result = await client.db().collection("nfts").insertOne(newNFT);
    res.json({ message: "NFT created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/nfts/:name", async (req, res) => {
  try {
    const nftName = req.params.name;
    const nft = await client.db().collection("nfts").findOne({ name: nftName });
    if (!nft) {
      res.status(404).json({ error: "NFT not found" });
    } else {
      res.json(nft);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/nfts/:name", async (req, res) => {
  try {
    const nftName = req.params.name;
    const updatedNFT = req.body; 
    const result = await client
      .db()
      .collection("nfts")
      .updateOne({ name: nftName }, { $set: updatedNFT });
    if (result.modifiedCount === 0) {
      res.status(404).json({ error: "NFT not found" });
    } else {
      res.json({ message: "NFT updated successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/nfts/:name", async (req, res) => {
  try {
    const nftName = req.params.name;
    const result = await client
      .db()
      .collection("nfts")
      .deleteOne({ name: nftName });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "NFT not found" });
    } else {
      res.json({ message: "NFT deleted successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});