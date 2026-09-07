function notificationsPlaceholderController(req, res) {
  res.status(501).json({ message: 'Notifications module placeholder.' });
}

module.exports = {
  notificationsPlaceholderController,
};
