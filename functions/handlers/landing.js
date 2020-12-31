const { admin, db } = require("../util/admin");
const firebase = require("firebase");
const config = require("../util/config");
firebase.initializeApp(config);
//Uploading data
exports.uploadData = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let fileName;
  let fileToBeUploaded = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "data/csv" && mimetype !== "data/xl") {
      return res
        .status(400)
        .json({ error: "Plase upload a csv or xl file type" });
    }
    console.log(fieldname);
    console.log(filename);
    const extension = filename.split(".")[filename.split(".").length - 1];
    fileName = `${Math.round(Math.random() * 10000000000)}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), fileName);
    fileToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(fileToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: fileToBeUploaded.mimeType,
          },
        },
      })
      .then(() => {
        const url = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${fileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({ url });
      })
      .then(() => {
        return res.json({ message: "File uploaded successfully" });
      });
  });
  busboy.end(req.rawBody);
};
exports.memo = (req, res) => {
    
    const dataMemo = {
      memo: req.body.memo
    }
    db.collection('memo').add(dataMemo).then(doc => {
      const resMemo = dataMemo;
      resMemo.memoId = doc.id;
      res.json(resMemo)
    })
    .catch(err => {
      res.status(500).json({error: 'something went wrong'});
      console.log(err);
    })
}; 