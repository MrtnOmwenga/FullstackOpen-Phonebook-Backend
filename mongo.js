const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Provide password for database');
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://MrtnOmwenga:${password}@cluster0.nqruxzo.mongodb.net/Phonebook?retryWrites=true&w=majority`;
mongoose.set('strictQuery',false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});
const Person = mongoose.model('Phonebook', personSchema);

if (process.argv.length > 3) {
  if (process.argv.length === 5){
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4]
    });

    person.save().then(() => {
      console.log('Added person');
      mongoose.connection.close();
    });
  }else {
    console.log('Please provide password, name and number');
  }
}

if (process.argv.length === 3) {
  Person.find({}).then(people => {
    console.log('phonebook:');
    people.forEach(person => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}