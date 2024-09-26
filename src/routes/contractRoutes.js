const express = require('express');
const { getContractById, getAllNonTerminatedContracts } = require('../controllers/contractController');
const router = express.Router();

router.get('/:id', getContractById);
router.get('/', getAllNonTerminatedContracts);

module.exports = router;
