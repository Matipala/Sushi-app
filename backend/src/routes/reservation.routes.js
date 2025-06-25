const router = require('express').Router();
const ReservationController = require('../controller/ReservationController');
const auth = require('../middleware/authMiddleware');

router.get('/', ReservationController.getAll);
router.get('/:id', ReservationController.getById);

router.post('/', auth, ReservationController.create);
router.put('/:id', auth, ReservationController.update);
router.delete('/:id', auth, ReservationController.remove);

module.exports = router;
