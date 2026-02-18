const Item = require('./Item');
const MaintenanceRecord = require('./MaintenanceRecord');
const LoanRecord = require('./LoanRecord');
const User = require('./User');
const GlobalSetting = require('./GlobalSetting');
const Notification = require('./Notification');

// Associations
Item.hasMany(MaintenanceRecord, { foreignKey: 'itemId', as: 'maintenanceRecords' });
MaintenanceRecord.belongsTo(Item, { foreignKey: 'itemId' });

Item.hasMany(LoanRecord, { foreignKey: 'itemId', as: 'loanRecords' });
LoanRecord.belongsTo(Item, { foreignKey: 'itemId' });

module.exports = {
    Item,
    MaintenanceRecord,
    LoanRecord,
    User,
    GlobalSetting,
    Notification
};

// Notification Associations
Notification.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Notification.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });
