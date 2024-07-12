import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { Router } from "express";

import pool from "../database.js";

const multer = require("multer");

const bcrypt = require("bcrypt");

const session = require("express-session");

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.use(
  session({
    secret: "1235",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

router.get("/pelicula/list", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM peliculas");

    res.render("index", { peliculas: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/pelicula/create", async (req, res) => {
  const es_admin = req.session.es_admin ? req.session.es_admin : 0;
  if (es_admin == 1) {
    const [result] = await pool.query("SELECT * FROM categorias");
    res.render("peliculas/create", { categorias: result });
  } else {
    res.redirect("/");
  }
});

router.get("/pelicula/edit/:id", async (req, res) => {
  const es_admin = req.session.es_admin ? req.session.es_admin : 0;
  if (es_admin == 1) {
    try {
      const { id } = req.params;
      const [pelicula] = await pool.query(
        "SELECT * FROM peliculas WHERE id = ?",
        [id]
      );
      const [categorias] = await pool.query("SELECT * FROM categorias");
      const peliculaEdit = pelicula[0];
      res.render("peliculas/edit", {
        pelicula: peliculaEdit,
        categorias: categorias,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.redirect("/");
  }
});

router.put("/pelicula/update/:id", upload.single("imagen"), async (req, res) => {
    const es_admin = req.session.es_admin ? req.session.es_admin : 0;
    if (es_admin == 1) {
      try {
        const { titulo, descripcion, puntaje, id_categoria } = req.body;
        const { id } = req.params;

        const [pelicula] = await pool.query(
          "SELECT * FROM peliculas WHERE id = ?",
          [id]
        );

        const imagen = req.file
          ? req.file.buffer.toString("base64")
          : pelicula[0].imagen;

        const nombre_imagen = req.file
          ? req.file.originalname
          : pelicula[0].nombre_imagen;

        const peliculaEdit = {
          titulo,
          descripcion,
          puntaje,
          imagen,
          nombre_imagen,
          id_categoria,
        };

        await pool.query("UPDATE peliculas SET ? WHERE id = ? ", [
          peliculaEdit,
          id,
        ]);
        res.redirect("/");
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    } else {
      res.redirect("/");
    }
  }
);

router.get("/pelicula/delete/:id", async (req, res) => {
  try {
    const es_admin = req.session.es_admin ? req.session.es_admin : 0;

    if (es_admin == 1) {
      const { id } = req.params;
      await pool.query("DELETE FROM peliculas WHERE id = ?", [id]);
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/pelicula/add", upload.single("imagen"), async (req, res) => {
  const es_admin = req.session.es_admin ? req.session.es_admin : 0;
  if (es_admin == 1) {
    try {
      const { titulo, descripcion, puntaje, id_categoria } = req.body;

      const imagen = req.file ? req.file.buffer.toString("base64") : "";

      const nombre_imagen = req.file ? req.file.originalname : "";

      const newPelicula = {
        titulo,
        descripcion,
        puntaje,
        imagen,
        nombre_imagen,
        id_categoria,
      };

      await pool.query("INSERT INTO peliculas SET ?", [newPelicula]);
      res.redirect("/");
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.redirect("/");
  }
});

router.get("/contacto", (req, res) => {
  try {
    res.render("contacto");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/nosotros", (req, res) => {
  try {
    res.render("nosotros");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/login", (req, res) => {
  try {
    res.render("login");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error al cerrar sesión:", err);
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.clearCookie("connect.sid");

      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

router.post("/usuario/login", async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT nombre, apellido, es_admin, contraseña as pass FROM usuarios WHERE email = ?",
      req.body.email
    );

    if (user[0].length == 0) {
      return res.status(404).send("User not found");
    }
    const passwordMatch = await bcrypt.compare(
      req.body.contraseña,
      user[0][0].pass
    );
    if (passwordMatch) {
      req.session.usuario = user[0][0].nombre + " " + user[0][0].apellido;
      req.session.es_admin = user[0][0].es_admin;
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ message: "Error al iniciar sesión" });
        }
        res.redirect("/");
      });
    } else {
      res.status(401).send("Contraseña incorrecta");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/registro", (req, res) => {
  try {
    res.render("register");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/usuario/add", async (req, res) => {
  try {
    const { nombre, apellido, email } = req.body;

    const contraseña = await bcrypt.hash(req.body.contraseña, 10);

    const newUsuario = { nombre, apellido, email, contraseña };

    await pool.query("INSERT INTO usuarios SET ?", [newUsuario]);

    req.session.usuario = nombre + " " + apellido;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ message: "Error inesperado" });
      }
      res.redirect("/");
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
