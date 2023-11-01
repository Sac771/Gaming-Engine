const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const port = 8000;
const cors = require('cors');
const fs = require('fs');

app.use(cors());


mongoose.connect('mongodb://127.0.0.1/sac-engine', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const File = mongoose.model('File', {
  name: String,
  data: Buffer,
});


// api for uploading a file
app.post('/upload', upload.single('file'), async (req, res) => {
  try{
    // Read the session data from the JSON file
  const serializedData = fs.readFileSync('session-data.json', 'utf8');
  const sessionData = JSON.parse(serializedData);
  req.session = sessionData;

  const login_flag = req.session.loggin_as_owner

      if(login_flag){
        try {
          if (!req.file) {
            return res.status(400).send('No file uploaded.');
          }

          const file = new File({
            name: req.file.originalname,
            data: req.file.buffer,
          });
          await file.save();

          return res.status(200).send('File uploaded successfully.');
        } 
        catch (error) {
          console.error(error);
          return res.status(500).send('Internal Server Error');
        }
      }
      else{
        return res.status(500).send('Only owner can access')
      }
}
catch (error) {
  console.error(error);
  return res.status(500).send('Login required');
}

});



app.get('/files', async (req, res) => {
  try{
    // Read the session data from the JSON file

  const serializedData = fs.readFileSync('session-data.json', 'utf8');
  const sessionData = JSON.parse(serializedData);
  req.session = sessionData;
  const login_flag = req.session.loggin_as_user

  if(login_flag){
    try {
        // Fetch data from your collection (e.g., mycollection)
        const data = await File.find();
    
        // Send the fetched data as a JSON response
        res.json(data);
      } 
      catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    }
    else{
      res.send([{_id:0,name:'u have to login'}]);
    }
  }

  catch (error) {
    console.error(error);
    return res.status(500).send('Login required');
  }
})
// api for downloading a file
app.get('/download/:id', async (req, res) => {
  try{
    
    // Read the session data from the JSON file
const serializedData = fs.readFile('session-data.json', 'utf8');
const sessionData = JSON.parse(serializedData);
req.session = sessionData;

  const login_flag = req.session.loggin_as_user
  if(login_flag){
    try {
      const fileId = req.params.id;
      // Find the file by its MongoDB ObjectId
      const file = await File.findById(fileId);
      if (!file) {
        return res.status(404).send('File not found.');
      }
  
      // Send the file data as a response with appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename=${file.name}`);
      res.setHeader('Content-Type', 'application/octet-stream');

      res.send(file.data);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
    }
  }
  catch (error) {
    console.error(error);
    return res.status(500).send('Login required');
  }
  });




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
