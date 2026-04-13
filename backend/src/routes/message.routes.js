'use strict';

const { Router } = require('express');
const { getMessages, createMessage } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');

const router = Router();

router.use(protect); // all message routes require auth

router.get('/', getMessages);
router.post('/', createMessage);

module.exports = router;
