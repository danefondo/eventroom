const Express = require('express');
const EventController = require('../../server/event/controllers/EventController');
const { AuthController } = require('../../server/auth/controllers/AuthController');

const router = Express.Router();


router.get('/getAllEvents', EventController.getAllEvents);

router.get('/getEvent/:eventId', EventController.getEvent);

router.post('/getYouTubeQuery', EventController.getYouTubeQuery);

router.get('/:eventId/getRoom/:roomId', EventController.getRoom);

router.post('/createEvent', AuthController.confirmAuthentication, EventController.createEvent);

router.post('/createRoom/:eventId', AuthController.confirmAuthentication, EventController.createRoom);

router.post('/disconnectFromEvent', EventController.disconnectFromEvent)

// router.post('/findAndUpdateEvent/:eventId', EventController.findAndUpdateEvent);

// router.delete('/deleteEvent/:eventId', EventController.deleteEvent);

// To clean up db
router.get('/deleteall', EventController.deleteAll);

module.exports = router;