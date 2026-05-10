const mongoose = require('mongoose');
const uri = 'mongodb+srv://dhirajk22410_db_user:YycsgoBgQ0nJaOps@cluster0.sueqqno.mongodb.net/?appName=Cluster0';

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.useDb('test');
  const club = await db.collection('clubs').findOne({});
  
  const newMembers = [
    { firstName: 'Alice', lastName: 'Smith', email: 'alice.smith@example.com', designation: 'Chairman', branch: 'Computer Science', graduationYear: 2025, mobileNo: '9876543210', photo: '' },
    { firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', designation: 'Coordinator', branch: 'Information Technology', graduationYear: 2026, mobileNo: '9876543211', photo: '' },
    { firstName: 'Charlie', lastName: 'Brown', email: 'charlie.b@example.com', designation: 'Co-coordinator', branch: 'Electronics', graduationYear: 2026, mobileNo: '9876543212', photo: '' },
    { firstName: 'David', lastName: 'Wilson', email: 'david.w@example.com', designation: 'Member', branch: 'Mechanical', graduationYear: 2027, mobileNo: '9876543213', photo: '' }
  ];
  
  await db.collection('clubs').updateOne(
    { _id: club._id },
    { $push: { members: { $each: newMembers } } }
  );
  
  console.log('Successfully added members to DB.');
  mongoose.disconnect();
}).catch(e => {
  console.error(e);
  process.exit(1);
});
