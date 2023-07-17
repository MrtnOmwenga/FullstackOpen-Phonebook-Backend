const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(logger('tiny'));
app.use(express.static('build'));
app.use(cors());

let data = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(data);
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = data.find(person => person.id === id);

    person ? response.json(person) : response.status(404).end();
})

app.get('/info', (request, response) => {
    response.send(`<p> Phonebook has info for ${data.length} people <br> ${new Date()}</p>`);
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    data = data.filter(person => person.id !== id);

    response.status(204).end();
})

logger.token('body', req => {
    return JSON.stringify(req.body)
  })
app.use(logger(':method :url :status :req[content-length] - :response-time ms :body'));

app.post('/api/persons', (request, response) => {
    if (!request.body.name){
        return response.status(422).send(`missing name`);
    };
    if (data.map(person => person.name).includes(request.body.name)){
        return response.status(409).send(`name must be unique`);
    };
    const newPerson = {
        ...request.body,
        id: Math.floor(Math.random() * 100)
    };
    data.push(newPerson)
    response.json(newPerson)
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`)
})