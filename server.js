const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');

// Controllers
const authController = require('./controllers/auth.js');
const applicationsController = require('./controllers/applications.js');

// ---- sanity checks
['MONGODB_URI','SESSION_SECRET'].forEach((k)=>{
  if(!process.env[k]) console.warn(`⚠️ Missing ${k} in .env`);
});

// Port
const port = process.env.PORT || '3000';

// Mongo
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});
mongoose.connection.on('error', (err) => {
  console.error('Mongo connection error:', err?.message || err);
});

// MIDDLEWARE
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

// Session (defensive: fallback to MemoryStore if no URI)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-only-secret',
    resave: false,
    saveUninitialized: false,
    store: process.env.MONGODB_URI
      ? MongoStore.create({
          mongoUrl: process.env.MONGODB_URI,
          mongoOptions: { dbName: process.env.DB_NAME || undefined },
          ttl: 14 * 24 * 60 * 60,
        })
      : undefined,
  })
);

app.use(passUserToView);

// ROUTES
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect(`/users/${req.session.user._id}/applications`);
  }
  res.render('index.ejs');
});

app.use('/auth', authController);
app.use(isSignedIn);
app.use('/users/:userId/applications', applicationsController);

// START
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
