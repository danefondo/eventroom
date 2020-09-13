const Express = require('express');
const EventController = require('../../event/EventController');
const { AuthController } = require('../../auth/AuthController');

const router = Express.Router();


router.get('/getAllEvents', EventController.getAllEvents);

router.get('/getEvent/:eventId', EventController.getEvent);

router.post('/getYouTubeQuery', EventController.getYouTubeQuery);

router.get('/:eventId/getRoom/:roomId', EventController.getRoom);

router.post('/createEvent', AuthController.confirmAuthentication, EventController.createEvent);

router.post('/createRoom/:eventId', AuthController.confirmAuthentication, EventController.createRoom);

// router.post('/findAndUpdateEvent/:eventId', EventController.findAndUpdateEvent);

// router.delete('/deleteEvent/:eventId', EventController.deleteEvent);

// To clean up db
router.get('/deleteall', EventController.deleteAll);

module.exports = router;