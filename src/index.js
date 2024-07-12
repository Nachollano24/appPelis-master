import { createRequire } from "module";
const require = createRequire(import.meta.url);
import express from "express";
import { engine } from "express-handlebars";
import morgan from "morgan";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import routes from "./routes/routes.routes.js";
import pool from "./database.js";
const session = require("express-session");
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.set("port", process.env.PORT || 3000);
app.set("views", join(__dirname, "views"));

app.engine(
  ".hbs",
  engine({
    defaultLayout: "main",
    layoutsDir: join(app.get("views"), "layouts"),
    partialsDir: join(app.get("views"), "partials"),
    extname: ".hbs",
    helpers: {
      ifCond: function (v1, v2, options) {
        if (v1 === v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      ifAdmin: function (usuario, es_admin, options) {
        if (usuario && es_admin == 1) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
    },
  })
);

app.set("view engine", ".hbs");


app.use(
  session({
    secret: "1235",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
  res.locals.usuario = req.session ? req.session.usuario || null : null;
  res.locals.es_admin = req.session ? req.session.es_admin || null : null;
  next();
});

app.use(bodyParser.urlencoded())
app.use(methodOverride('_method'))

// Usa las rutas importadas antes de definir la ruta principal
app.use(routes);

app.get("/", async (req, res) => {
  try {
    const [peliculas] = await pool.query("SELECT p.id as id, p.titulo as titulo, p.descripcion as descripcion, p.puntaje as puntaje, p.imagen as imagen, c.id as id_cat, c.nombre as nombre FROM peliculas as p INNER JOIN categorias as c ON p.id_categoria = c.id");
    res.render("index", {
      peliculas: peliculas,
      usuario: req.session ? req.session.usuario || null : null,
      es_admin: req.session ? req.session.es_admin || null : null,
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).render("error", { message: "Error fetching movies" });
  }
});

app.use(express.static(join(__dirname, "public")));

app.listen(app.get("port"), () =>
  console.log("Server listening on port ", app.get("port"))
);
