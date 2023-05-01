const stickieModel = require("../models/stickie-model");

exports.addStickie = async (req, res) => {
    try {
        let newStickie = await stickieModel.addStickie(req.body.board)
        res.json(newStickie)
    }
    catch (err) {
        res.status(500).send({ err: err.message });
    }
}

exports.deleteStickie = async (req, res) => {
    try {
        await stickieModel.deleteStickie(req.params.id)
        res.status(200).send()
    }
    catch (err) {
        res.status(500).send({ err: err.message });
    }
}