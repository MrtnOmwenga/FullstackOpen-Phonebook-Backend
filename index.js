require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const Phonebook = require('./models/phonebook');
const { ObjectId } = require('mongodb');
const data = require('./data');

const app = express();
app.use(express.static('build'));
app.use(express.json());
app.use(logger('tiny'));
app.use(cors());


app.get('/api/persons', (request, response, next) => {
    if (process.env.STORAGE_TYPE === 'FILE') {
        response.json(data);
    }else {
        Phonebook.find({}).then(people => {
            response.json(people);
        }).catch(error => next(error));
    }
})

app.get('/api/persons/:id', (request, response, next) => {
    if (process.env.STORAGE_TYPE === 'FILE') {
        const id = Number(request.params.id);
        const person = data.find(person => person.id === id);

        person ? response.json(person) : response.status(404).end();
    }else {
        Phonebook.findById(request.params.id).then(person => {
            if (person){
                response.send(person);
            }else {
                response.status(404).end();
            }
        }).catch(error => next(error));
    }
})

app.get('/info', (request, response, next) => {
    if (process.env.STORAGE_TYPE === 'FILE') {
        response.send(`<p> Phonebook has info for ${data.length} people <br> ${new Date()}</p>`);
    }else {
        Phonebook.count().then(number => {
            response.send(`<p> Phonebook has info for ${number} people <br> ${new Date()}</p>`);
        }).catch(error => next(error));
    }
})

app.delete('/api/persons/:id', (request, response, next) => {
    if (process.env.STORAGE_TYPE === 'FILE') {
        const id = Number(request.params.id);
        data = data.filter(person => person.id !== id);

        response.status(204).end();
    }else {
        Phonebook.deleteOne({_id: new ObjectId(request.params.id)})
        .then(response.status(204).end())
        .catch(error => next(error));
    }
})

logger.token('body', req => {
    return JSON.stringify(req.body)
  })
app.use(logger(':method :url :status :req[content-length] - :response-time ms :body'));

app.post('/api/persons', (request, response) => {
    if (!request.body.name){
        return response.status(422).send(`missing name`);
    };

    if (process.env.STORAGE_TYPE === 'FILE') {
        if (data.map(person => person.name).includes(request.body.name)){
            return response.status(409).send(`name must be unique`);
        };

        const newPerson = {
            ...request.body,
            id: Math.floor(Math.random() * 100)
        };

        data.push(newPerson);
        response.json(newPerson);
    }else {
        const person = new Phonebook(request.body);
        person.save().then(savedPerson => response.json(savedPerson));
    }
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
  }
  
app.use(errorHandler)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`)
})