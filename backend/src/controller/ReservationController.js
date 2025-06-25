const ReservationService = require('../service/ReservationService');

exports.getAll = async (req, res, next) => {
    try {
        const reservations = await ReservationService.getAll();
        res.json(reservations);
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const reservation = await ReservationService.getById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const newReservation = await ReservationService.create(req.body);
        res.status(201).json(newReservation);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const updated = await ReservationService.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const deleted = await ReservationService.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};
