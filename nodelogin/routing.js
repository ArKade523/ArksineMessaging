const express = require("express")
const router = express.Router();

router.get('/routing', (req, res) => {
    res.send('routing works');
})

module.exports = router;