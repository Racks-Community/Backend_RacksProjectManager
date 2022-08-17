const multer = require('multer')

const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './public/uploads/')
    },
    filename(req, file, cb) {
      const dateTime = Date.now();
      const timestamp = Math.floor(dateTime / 1000);  
      let nameImg = file.originalname;
      nameImg = nameImg.replace(/ /g, "");
      cb(null, `${timestamp}_original_mrcrypto`)
    }
})
exports.upload = multer({ storage });

exports.PostImg = async (req, res) => {
    try {
        const file = req;
        res.status(200).json(await file.file);
    } catch (error) {
        utils.handleError(res, error)
    }
}