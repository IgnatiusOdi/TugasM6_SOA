const express = require("express");
const Joi = require("joi");
const app = express();

const Sequelize = require("sequelize");
const sequelize = new Sequelize("t6_soa_220116919", "root", "", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: console.log,
  timezone: "+07:00",
});
const { QueryTypes } = require("sequelize");

const jwt = require("jsonwebtoken");
const JWT_KEY = "semangatSOA";

app.use(express.urlencoded({ extended: true }));

async function getUser(username) {
  const result = await sequelize.query(
    `SELECT * FROM users WHERE username = ?`,
    {
      type: QueryTypes.SELECT,
      replacements: [username],
    }
  );
  return result[0];
}

async function generateIdOrder() {
  const result = await sequelize.query(
    `SELECT COUNT(*) as jumlah FROM orders`,
    {
      type: QueryTypes.SELECT,
    }
  );
  return `OX${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${(
    result[0].jumlah + 1
  )
    .toString()
    .padStart(3, "0")}`;
}

async function getOrder(id) {
  const result = await sequelize.query(`SELECT * FROM orders WHERE id = ?`, {
    type: QueryTypes.SELECT,
    replacements: [id],
  });
  return result[0];
}

async function getKendaraan(id) {
  const result = await sequelize.query(`SELECT * FROM kendaraan WHERE id = ?`, {
    type: QueryTypes.SELECT,
    replacements: [id],
  });
  return result[0];
}

async function generateIdKendaraan() {
  const result = await sequelize.query(
    `SELECT COUNT(*) as jumlah FROM kendaraan`,
    {
      type: QueryTypes.SELECT,
    }
  );
  return `KD${(result[0].jumlah + 1).toString().padStart(3, "0")}`;
}

function numberFormat(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  })
    .format(number)
    .slice(0, -3);
}

// NOMOR 1
app.post("/api/users", async (req, res) => {
  const { username, nama, no_telp, jenis, password, cpassword } = req.body;

  // VALIDATION
  const schema = Joi.object({
    username: Joi.string().required(),
    nama: Joi.string().required(),
    no_telp: Joi.string()
      .pattern(/^[0-9]+$/)
      .required(),
    jenis: Joi.string().valid("C", "K").required(),
    password: Joi.string().required(),
    cpassword: Joi.string().equal(Joi.ref("password")).required(),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  // USERNAME CHECK
  const result = await sequelize.query(
    `SELECT * FROM users WHERE username = ?`,
    {
      type: QueryTypes.SELECT,
      replacements: [username],
    }
  );
  if (result.length > 0) {
    return res.status(400).send({ message: "Username sudah diambil" });
  }

  // INSERT USER
  await sequelize.query(
    `INSERT INTO users (username, nama, no_telp, jenis, password) VALUES (?, ?, ?, ?, ?)`,
    {
      replacements: [username, nama, no_telp, jenis, password],
    }
  );

  return res.status(201).send({
    message: "Sukses mendaftarkan user",
    user: {
      username,
      nama,
      no_telp,
      jenis: jenis == "C" ? "Customer" : "Kurir",
    },
  });
});

// NOMOR 2
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  // VALIDATION
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  // USERNAME CHECK
  const result = await sequelize.query(
    `SELECT * FROM users WHERE username = ?`,
    {
      type: QueryTypes.SELECT,
      replacements: [username],
    }
  );
  if (result.length === 0) {
    return res.status(404).send({ message: "User tidak terdaftar!" });
  }
  if (password !== result[0].password) {
    return res.status(400).send({ message: "Password salah!" });
  }

  // SIGN TOKEN
  const token = jwt.sign({ username }, JWT_KEY, {
    // expiresIn: "1h"
  });

  return res.status(200).send({ username, token });
});

// NOMOR 3
app.post("/api/order", async (req, res) => {
  const token = req.header("x-auth-token");
  const {
    nama_penerima,
    no_telp_penerima,
    alamat_penerima,
    nama_barang,
    berat_barang,
  } = req.body;

  // TOKEN VALIDATION
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  // VALIDATION
  const schema = Joi.object({
    nama_penerima: Joi.string().required().messages({
      "string.empty": "Ada field yang kosong!",
      "any.required": "Ada field yang kosong!",
    }),
    no_telp_penerima: Joi.string().required().messages({
      "string.empty": "Ada field yang kosong!",
      "any.required": "Ada field yang kosong!",
    }),
    alamat_penerima: Joi.string().required().messages({
      "string.empty": "Ada field yang kosong!",
      "any.required": "Ada field yang kosong!",
    }),
    nama_barang: Joi.string().required().messages({
      "string.empty": "Ada field yang kosong!",
      "any.required": "Ada field yang kosong!",
    }),
    berat_barang: Joi.number().required().messages({
      "any.required": "Ada field yang kosong!",
    }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  // AUTHORIZATION
  let user = null;
  try {
    const data = jwt.verify(token, JWT_KEY);
    user = await getUser(data.username);
  } catch (error) {
    return res.status(498).send("Invalid JWT Key");
  }

  if (user.jenis !== "C") {
    return res.status(403).send("Bukan Customer");
  }

  // BERAT BARANG FLOAT + KG
  berat = `${parseFloat(berat_barang).toPrecision(2)}kg`;

  // GENERATE ID OXYYMMDDXXX
  const id = await generateIdOrder();

  // RANDOM BIAYA 10000 - 50000, KELIPATAN 1000
  const biaya = (Math.floor(Math.random() * 41) + 10) * 1000;

  await sequelize.query(
    `INSERT INTO orders (id, nama_pengirim, nama_penerima, no_telp_penerima, alamat_penerima, nama_barang, berat_barang, biaya) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    {
      replacements: [
        id,
        user.nama,
        nama_penerima,
        no_telp_penerima,
        alamat_penerima,
        nama_barang,
        berat,
        biaya,
      ],
    }
  );

  return res.status(201).send({
    message: "Berhasil memesan order barang",
    order: {
      id,
      nama_pengirim: user.nama,
      nama_penerima,
      no_telp_penerima,
      alamat_penerima,
      nama_barang,
      berat_barang: berat,
      biaya: numberFormat(biaya),
      status: "Menunggu Pembayaran",
    },
  });
});

// NOMOR 4
app.post("/api/order/pay", async (req, res) => {
  const token = req.header("x-auth-token");
  const { nominal, id_order } = req.body;

  // TOKEN VALIDATION
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  // VALIDATION
  const schema = Joi.object({
    nominal: Joi.number().required(),
    id_order: Joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  // AUTHORIZATION
  let user = null;
  try {
    const data = jwt.verify(token, JWT_KEY);
    user = await getUser(data.username);
  } catch (error) {
    return res.status(498).send("Invalid JWT Key");
  }

  // CHECK ORDER
  const order = await getOrder(id_order);
  if (!order) {
    return res.status(404).send({ message: "Order tidak ditemukan!" });
  }
  if (order.nama_pengirim !== user.nama) {
    return res.status(400).send({ message: "Order bukan milik anda!" });
  }
  if (order.biaya != nominal) {
    return res.status(400).send({ message: "Nominal tidak sesuai!" });
  }
  if (order.status !== "Menunggu Pembayaran") {
    return res.status(400).send({ message: `Status saat ini ${order.status}` });
  }

  // UPDATE STATUS ORDER
  await sequelize.query(
    `UPDATE orders SET status = "Menunggu Kurir" WHERE id = ?`,
    {
      replacements: [id_order],
    }
  );

  return res
    .status(200)
    .send({ message: "Berhasil membayar order pengiriman" });
});

// NOMOR 5
app.post("/api/kendaraan", async (req, res) => {
  const token = req.header("x-auth-token");
  const { nomor_plat, jenis } = req.body;

  // TOKEN VALIDATION
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  // VALIDATION
  const schema = Joi.object({
    nomor_plat: Joi.string().required(),
    jenis: Joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  // AUTHORIZATION
  try {
    const data = jwt.verify(token, JWT_KEY);
    user = await getUser(data.username);
  } catch (error) {
    return res.status(498).send("Invalid JWT Key");
  }
  if (user.jenis !== "K") {
    return res.status(403).send("Bukan Kurir!");
  }

  // GENERATE ID KDXXX
  const id = await generateIdKendaraan();

  // INSERT KENDARAAN
  await sequelize.query(
    `INSERT INTO kendaraan (id, nomor_plat, jenis, kurir) VALUES (?, ?, ?, ?)`,
    {
      replacements: [id, nomor_plat, jenis, user.nama],
    }
  );

  return res.status(201).send({
    message: "Berhasil menambahkan kendaraan",
    kendaraan: { id, nomor_plat, jenis, kurir: user.nama },
  });
});

// NOMOR 6
app.post("/api/order/kirim", async (req, res) => {
  const token = req.header("x-auth-token");
  const { id_order, id_kendaraan } = req.body;

  // TOKEN VALIDATION
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  // VALIDATION
  const schema = Joi.object({
    id_order: Joi.string().required(),
    id_kendaraan: Joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  // AUTHORIZATION
  let user = null;
  try {
    const data = jwt.verify(token, JWT_KEY);
    user = await getUser(data.username);
  } catch (error) {
    return res.status(498).send("Invalid JWT Key");
  }
  if (user.jenis !== "K") {
    return res.status(403).send("Bukan Kurir!");
  }

  // CHECK ORDER
  let order = await getOrder(id_order);
  if (!order) {
    return res.status(404).send({ message: "Order tidak ditemukan!" });
  }

  // CHECK KENDARAAN
  const kendaraan = await getKendaraan(id_kendaraan);
  if (!kendaraan) {
    return res.status(404).send({ message: "Kendaraan tidak ditemukan!" });
  }

  // UPDATE ORDER BASED ON STATUS
  if (order.status === "Menunggu Kurir") {
    order.status = "Sedang Mengirim";
    await sequelize.query(
      `UPDATE orders SET status = "Sedang Mengirim" WHERE id = ?`,
      {
        replacements: [id_order],
      }
    );
  } else if (order.status === "Sedang Mengirim") {
    order.status = "Paket Terkirimkan";
    await sequelize.query(
      `UPDATE orders SET status = "Paket Terkirimkan" WHERE id = ?`,
      {
        replacements: [id_order],
      }
    );
  } else {
    return res.status(400).send({ message: `Status saat ini ${order.status}` });
  }

  return res.status(200).send({
    message: "Order diambil oleh kurir",
    order: {
      id: order.id,
      nama_pengirim: order.nama_pengirim,
      nama_penerima: order.nama_penerima,
      no_telp_penerima: order.no_telp_penerima,
      alamat_penerima: order.alamat_penerima,
      nama_barang: order.nama_barang,
      berat_barang: order.berat_barang,
      biaya: numberFormat(order.biaya),
      status: order.status,
    },
  });
});

// NOMOR 7
app.get("/api/order/:id_order", async (req, res) => {
  const { id_order } = req.params;

  const order = await getOrder(id_order);
  if (!order) {
    return res.status(404).send({ message: "Order tidak ditemukan!" });
  }

  return res.status(200).send({
    id: order.id,
    nama_pengirim: order.nama_pengirim,
    nama_penerima: order.nama_penerima,
    no_telp_penerima: order.no_telp_penerima,
    alamat_penerima: order.alamat_penerima,
    nama_barang: order.nama_barang,
    berat_barang: order.berat_barang,
    biaya: numberFormat(order.biaya),
    status: order.status,
  });
});

app.listen(3000, () => console.log("Listening at port 3000"));
