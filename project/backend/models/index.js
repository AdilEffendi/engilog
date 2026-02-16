const Item = require('./Item');
const MaintenanceRecord = require('./MaintenanceRecord');
const LoanRecord = require('./LoanRecord');
const User = require('./User');

// Associations
Item.hasMany(MaintenanceRecord, { foreignKey: 'itemId', as: 'maintenanceRecords' });
MaintenanceRecord.belongsTo(Item, { foreignKey: 'itemId' });

Item.hasMany(LoanRecord, { foreignKey: 'itemId', as: 'loanRecords' });
LoanRecord.belongsTo(Item, { foreignKey: 'itemId' });

module.exports = {
    Item,
    MaintenanceRecord,
    LoanRecord,
    User
};
