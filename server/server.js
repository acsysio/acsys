const path = require('path');
const express = require('express');
const routes = require('./routes/index');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const jwt = require('./jwt');

const { PORT = 8080 } = process.env;

const app = express();

// Middleware that parses json and looks at requests where the Content-Type header matches the type option.
app.use(express.json());

// Serve API requests from the router
// app.use('/api', router);
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use('/favicon.ico', express.static('public/acsys-icon.svg'));

// configure jwt
app.use('/api', jwt());

app.use(fileUpload());

// configure cors
app.use(cors());

// const index = require('./routes/index');
app.use('/api', routes);

// Serve app production bundle
app.use(express.static('dist'));

// Handle client routing, return all requests to the app
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});