<p align="center">
  <a href="https://acsys.io">
    <img alt="Acsys" src="https://storage.googleapis.com/acsys-294722.appspot.com/media/acsys-banner_image.png">
  </a>
</p>

<p align="center">
  <a href=LICENSE.md>
    <img src="https://img.shields.io/github/license/aeon-software/acsys" />
  </a>
  <a href="https://github.com/aeon-software/acsys/commits">
    <img src="https://img.shields.io/github/last-commit/aeon-software/acsys" />
  </a>
  <a href="https://github.com/aeon-software/acsys">
    <img src="https://img.shields.io/github/repo-size/aeon-software/acsys" />
  </a>
  <a href="https://hub.docker.com/r/acsysio/acsys">
    <img src="https://img.shields.io/docker/cloud/automated/acsysio/acsys" />
  </a>
  <a href="https://hub.docker.com/r/acsysio/acsys/builds">
    <img src="https://img.shields.io/docker/cloud/build/acsysio/acsys" />
  </a>
</p>

## Acsys [Live Demo](https://demo.acsys.io/)

<a href="https://demo.acsys.io">
  <img align="center" alt="Acsys Demo" src="https://storage.googleapis.com/acsys-294722.appspot.com/media/acsys_gif.gif">
</a>

Acsys is a CMS built on NodeJS. This tool was created to fulfill the need for a frontend interface for Cloud Firestore. Acsys allows developers to configure a database through the Acsys web app. Once this is done users can use Acsys as a headless content management system that also configures RESTful APIs (no coding involved). Acsys serves as a simple interface for Firestore, MySQL and SQLite databases. Since this project is maintained and used by Aeon it will receive continuous updates.

## Getting Started

These instructions will get Acsys up and running on your local machine for development and testing purposes.

## Prerequisites

- NodeJS >= 10.10
- NPM >= 6.x

## Currently Supported Databases

- Cloud Firestore
- MySQL
- SQLite

## Currently Supported Storage Services

- Google Cloud Storage
- Internal

## Installing

Start Acsys locally using these commands:

Run `npm install`

Start development by running `npm run dev`

Build project by running `npm run build` (`npm run build-linux` for Linux)

Run project in production mode by running `npm run start` (executing this after building will run the project at http://localhost:8080)

**or**

Pull the Docker image by using this command:

```bash
docker pull acsysio/acsys
```

Then run using:

```bash
docker run -p 8080:8080 acsysio/acsys
```

## Configuration

Acsys can be configured in either a stateful or stateless manner. Stateful configurations are ideal for server deployments whereas stateless configurations are ideal for serverless archetectures. An Acsys configuration is considered serverless once the `DATABASE_TYPE` environment variable has been set.

### Stateful

To configure a stateful version of Acsys for Firestore or MySQL you must first upload your service account JSON file. Instructions on how to get this file can be found [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys). Note that the database must be created with appropriate security rules before Acsys can be used (Default production rules are recommended).

Stateful configurations also allow you to setup a local database using SQLite. These installations only require a project name.

Connections can be changed within the web appplication. If at any point the configuration needs to be manually reset you can do so by stopping the server and deleting the dbase.db and acsys.service.config.json files.

### Stateless

To configure a stateless version of Acsys you must set your database and storage credentials in environment variables. Please note that when running stateless a Firebase project must be created to configure Storage regardless of configuration.

#### Environment Variables

- `DATABASE_TYPE` specifies database to connect to: (firestore or mysql)
- `API_SECRET` overrides default key for stateless configurations (optional)
- `DATABASE_HOST` database host
- `DATABASE_PORT` database port (optional)
- `DATABASE` database name
- `DATABASE_USERNAME` database username
- `PASSWORD` database password
- `SOCKET_PATH` this may be required for MySQL configurations in a serverless environment (Is most often the connection name in Cloud SQL [more info](https://cloud.google.com/sql/docs/mysql/samples/cloud-sql-mysql-mysql-create-socket))
- `BUCKET` specifies Cloud Storage bucket to be used
- `TYPE` TYPE value found in service account key
- `PROJECT_ID` PROJECT_ID value found in service account key
- `PRIVATE_KEY_ID` PRIVATE_KEY_ID value found in service account key
- `PRIVATE_KEY` PRIVATE_KEY value found in service account key
- `CLIENT_EMAIL` CLIENT_EMAIL value found in service account key
- `CLIENT_ID` CLIENT_ID value found in service account key
- `AUTH_URI` AUTH_URI value found in service account key
- `TOKEN_URI` TOKEN_URI value found in service account key
- `AUTH_PROVIDER_X509_CERT_URL` AUTH_PROVIDER_X509_CERT_URL value found in service account key
- `CLIENT_X509_CERT_URL` CLIENT_X509_CERT_URL value found in service account key

We highly recommend placing enviroment variables in a .env file as this project is setup to read the file by default.

#### Firestore Example

```bash
DATABASE_TYPE=firestore
BUCKET=project-id.appspot.com
TYPE=service_account
PROJECT_ID=project-id
PRIVATE_KEY_ID=key-id
PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nprivate-key\n-----END PRIVATE KEY-----\n
CLIENT_EMAIL=service-account-email
CLIENT_ID=client-id
AUTH_URI=https://accounts.google.com/o/oauth2/auth
TOKEN_URI=https://accounts.google.com/o/oauth2/token
AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/service-account-email
```

#### MySQL Example

```bash
DATABASE_TYPE=mysql
DATABASE_HOST=0.0.0.0
DATABASE=demo_database
DATABASE_USERNAME=app-account
PASSWORD=password
BUCKET=project-id.appspot.com
TYPE=service_account
PROJECT_ID=project-id
PRIVATE_KEY_ID=key-id
PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nprivate-key\n-----END PRIVATE KEY-----\n
CLIENT_EMAIL=service-account-email
CLIENT_ID=client-id
AUTH_URI=https://accounts.google.com/o/oauth2/auth
TOKEN_URI=https://accounts.google.com/o/oauth2/token
AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/service-account-email
```

## Built With

- NodeJS (https://nodejs.org/en/)
- ReactJS (https://reactjs.org/)
- ExpressJS (https://expressjs.com/)

## Contributing

There are many ways in which you can participate in the project, for example:

- Submit pull requests
- Submit bugs and feature requests
- Review source code changes
- Review the documentation

We encourage you to tell us what you want out of this project! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
