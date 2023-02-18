const mongoose = require('mongoose');

module.exports = async () => {
  try {
    // await mongoose.connect(process.env.DB_URL, {useNewUrlParser: true});
    await mongoose.connect(
      'mongodb+srv://mongo:mongo@cluster0.6wjh6us.mongodb.net/?retryWrites=true&w=majority',
      {useNewUrlParser: true},
    );

    console.log('Database connected.');
  } catch (error) {
    console.log('Database connection error...', error);
    throw new Error(error);
  }
};
