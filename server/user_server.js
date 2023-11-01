const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const session = require('express-session');
const PORT = process.env.PORT || 8001;
const fs = require('fs');

app.use(express.json());
app.use(cors());

app.use(session({
    secret: 'sac', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  }));



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

// Routes and other middleware 

// User Registration route
app.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if the username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
  
      // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user document and save it to the database
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();
      
      res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // User Login
app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Find the user by username
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      
  
      // Export session data to a JSON file
      
      const sessionData = req.session;
      if(username==='sac'){
        req.session.loggin_as_user = true;
        req.session.loggin_as_owner = true;
      }
      else{
      req.session.loggin_as_user = true;
      req.session.loggin_as_owner = false;
      }
      if (sessionData) {
        const serializedData = JSON.stringify(sessionData);
        const filePath = 'c:/projects/sem 4/python+fsd/FSD/FSD personal/server/session-data.json';
        fs.writeFile(filePath, serializedData, (err) => {
          if (err) {
            console.error('Error writing to file:', err);
          } else {
            console.log('Data has been written to server.json');
          }
        });
      } else {
        console.error('Session data is undefined');
      }
      res.status(200).json({ message: 'Login successful' });
      

    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.post('/logout',((req,res)=>{

    try{
    

        req.session.loggin_as_user = false;
        req.session.loggin_as_owner = false;
        const sessionData = req.session;
        if (sessionData) {
          const serializedData = JSON.stringify(sessionData);
          const filePath = 'c:/projects/sem 4/python+fsd/FSD/FSD personal/server/session-data.json';
          fs.writeFile(filePath, serializedData, (err) => {
            if (err) {
              console.error('Error writing to file:', err);
            } else {
              console.log('Data has been written to example.txt');
            }
          });
          req.session.destroy((err) => {
            if (err) {
              console.error('Error:', err);
              res.status(500).json({ message: 'Internal Server Error' });
            }
             });
        } else {
          console.error('Session data is undefined');
        }

      res.status(200).json({ message: 'Logout successful' });
      

    
}
catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
  }))



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});