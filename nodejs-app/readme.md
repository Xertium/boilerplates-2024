# 📝 Node.js Application Boilerplate

This boilerplate is a simple Node.js application with TypeScript support.

## 📚 Usage

### 📥 Install dependencies

```bash
npm install
# or
yarn install
```
---

### 🛠️ Run in development mode

```bash
npm run start:app-name
# or
yarn start:app-name
```
---

### 🏗️ Build

```bash
npm run build
# or
yarn build
```
_This will build the applications to the `dist` folder._

---

### 🚀 Run in production mode with pm2

`pm2` _is not included in the dependencies, I prefer to install it globally._

```bash
npm run pm2:app-name
# or
yarn pm2:app-name
```
---

### 💻 Add new applications

If you add new apps, you have to add them to the `package.json` file in the `scripts` section like this:

```json
"scripts": {
	// Development mode
	"start:app-name": "nodemon --config ./nodemon/main.json",
	// Production mode
	"pm2:app-name": "pm2 start ./pm2/main.config.js"
}
```

_Don't forget to add the `nodemon` and `pm2` config files if you add new applications._

## 📂 Folder structure

```bash
# ...
├─ .boilerplate			# Boilerplate files, some scripts and configs
├─ nodemon				# Nodemon config files
│   └─ main.json			# Main (as a template) config file
├─ pm2					# PM2 config files
│   └─ main.config.js		# Main (as a template) config file
├─ src					# Source files
│   ├─ apps					# Applications
│   │   └─ main 				# Main application (as a template)
│   ├─ handlers 			# Handlers of requests
│   ├─ middlewares			# Middlewares
│   ├─ services 			# Business logic
│   ├─ utils 				# Utilities
# ...
```

## 💡 Ideas and planned features

- [ ] i18n support - or other way to support multiple languages.
- [ ] jwt authentication middleware.
- [ ] Provide a CLI tool:
  - [ ] to create new applications.
  - [ ] to implement database connection - or something like that.
  - [ ] to create new handlers, middlewares, services, etc.
- [ ] Proper implementation of microservices.
- [ ] Add docker support.
- [ ] Add automated tests.

## 📄 License

This repository is licensed under the [MIT License](./LICENSE).

You have to implement the license file in your project if you use this boilerplate!

## 🤝 Contributing

Feel free to open an issue or a pull request if you have any suggestions or improvements.

## ✍️ Authors

![Noé Tamás](https://github.com/Xertium.png?size=20) [Noé Tamás](https://github.com/Xertium)
