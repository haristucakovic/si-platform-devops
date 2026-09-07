require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./presentation/routes/auth.routes');
const usersRoutes = require('./presentation/routes/users.routes');
const listingsRoutes = require('./presentation/routes/listings.routes');
const applicationsRoutes = require('./presentation/routes/applications.routes');
const notificationsRoutes = require('./presentation/routes/notifications.routes');
const adminRoutes = require('./presentation/routes/admin.routes');
const approvalRoutes = require('./presentation/routes/approval.routes');
const koordinatorRoutes = require('./presentation/routes/koordinator.routes');
const companiesRoutes = require('./presentation/routes/companies.routes');
const dokumentRoutes = require('./presentation/routes/dokument.routes');
const favouritesRoutes = require('./presentation/routes/favourites.routes');
const notificationPreferencesRoutes = require('./presentation/routes/notificationPreferences.routes');
const evaluationRoutes = require('./presentation/routes/evaluation.routes');
const prakseRoutes = require('./presentation/routes/prakse.routes');

const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/approval-requests', approvalRoutes);
app.use('/api/koordinator', koordinatorRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/dokumenti', dokumentRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/favourites', favouritesRoutes);
app.use('/api/notification-preferences', notificationPreferencesRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/prakse', prakseRoutes);

module.exports = app;
