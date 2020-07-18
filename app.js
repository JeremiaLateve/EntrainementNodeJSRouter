const express = require('express');
const fs = require('fs')
const app = express();
const morgan = require('morgan');

// 1) middleware
app.use(morgan('dev'))
app.use(express.json());
app.use((req, res, next) => {
    console.log('Hello from the middleware');
    next();
})


app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// route handlers 
const getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
};

const getTour = (req, res) => {
    console.log(req.params)
    const id = req.params.id * 1;//Astuce :en multipliant un string qui ressemble a un integer par un integer ce dernier devient un nombre  
    const tour = tours.find(el => el.id === id)//attribue a el l'id du param de la requete http, si true alors find assigne a un array la bonne valeur, tour prend donc la valeur du bonne id
    // if(id >tours.length) {
    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID'
        })
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
};

const createTour = (req, res) => {
    // console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);

    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    })

}
const updateTour = (req, res) => {
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID'
        })
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour: ' Updated tour'
        }
    })
}
const deleteTour = (req, res) => {
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID'
        })
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
}



const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    })
}

const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    })
}
const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    })
}
const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    })
}
const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    })
}
// app.get('/api/v1/tours', getAllTours)
// app.get('/api/v1/tours/:id', getTour)
// app.post('/api/v1/tours', createTour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)


// routes 

const tourRouter = express.Router();
const userRouter = express();

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter)

tourRouter
    .route('/')
    .get(getAllTours)
    .post(createTour)

tourRouter
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour)

userRouter
    .route('/')
    .get(getAllUsers)
    .post(createUser)

userRouter
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)

// start server
const port = 3000;
app.listen(port, () => {
    console.log(`app running on port ${port}...`);
})
