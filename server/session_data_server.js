const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8002;
const fs = require('fs');



mongoose.connect('mongodb://127.0.0.1/users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the user schema
const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true, // Ensuring usernames are unique
    },
    password: {
      type: String,
      required: true,
    },
  });
  
  // Create the User model using the schema
  const User = mongoose.model('User', userSchema);


app.use(express.json());
app.use(cors());

app.get('/authentication_data',((req,res)=>{
    try{
        const serializedData = fs.readFileSync('session-data.json', 'utf8');
        const sessionData = JSON.parse(serializedData);
        req.session = sessionData;
        res.status(200).json({ user : req.session.loggin_as_user, owner : req.session.loggin_as_owner });
}
catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
  }))

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
