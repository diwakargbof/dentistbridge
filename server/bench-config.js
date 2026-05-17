// Server-side phone list — mirrors src/config.jsx.
// Update both files together when adding/removing users.

const ALLOWED_USERS = {
  '+919876543201': { role: 'receptionist', id: 'u-priya',  name: 'Priya Naik' },
  '+919876543210': { role: 'worker', id: 'u-rakesh', name: 'Rakesh Pawar',  stageId: 'st-design' },
  '+919876543211': { role: 'worker', id: 'u-sumit',  name: 'Sumit Yadav',   stageId: 'st-mill'   },
  '+919876543212': { role: 'worker', id: 'u-anjali', name: 'Anjali Desai',  stageId: 'st-finish' },
  '+919876543213': { role: 'worker', id: 'u-naveen', name: 'Naveen Kumar',  stageId: 'st-glaze'  },
  '+919876543214': { role: 'worker', id: 'u-deepa',  name: 'Deepa Iyer',   stageId: 'st-qc'     },
  '+919876543220': { role: 'owner',  id: 'u-vikram', name: 'Vikram Iyer' },
  '+919876543230': { role: 'admin',  id: 'u-admin',  name: 'System Admin' },
};

module.exports = { ALLOWED_USERS };
