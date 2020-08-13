const Express = require('express');
const EventController = require('../../controller/EventController');

const router = Express.Router();

router.use(function(req, res, next) {
    console.log("testing");
    next();
})

router.get('/getAllEvents', EventController.getAllEvents);

router.get('/getEvent/:eventId', EventController.getEvent);

router.post('/createEvent', EventController.createEvent);

router.post('/findAndUpdateEvent/:eventId', EventController.findAndUpdateEvent);

router.delete('/deleteEvent/:eventId', EventController.deleteEvent);


module.exports = router;