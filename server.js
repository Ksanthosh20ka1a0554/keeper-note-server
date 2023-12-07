const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const port = process.env.PORT || 7000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const uri = 'mongodb+srv://santhosh9515:santhosh9515@cluster0.itdx0o5.mongodb.net/KeeperNote?retryWrites=true&w=majority';
const dbName = 'KeeperNote';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, dbName })
  .then(() => {
    console.log('Connected to MongoDB Atlas');

    // User Schema
    const userSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
    });

    // User Model
    const User = mongoose.model('User', userSchema);

    // Note Schema
    const noteSchema = new mongoose.Schema({
      title: String,
      description: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    });

    // Note Model
    const Note = mongoose.model('Note', noteSchema);

    // Registration Endpoint
    app.post('/register', async (req, res) => {
      const email = req.body.email;
      email.toLowerCase();
      const password = req.body.password;

      try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          return res.status(409).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.json({ message: 'User registered successfully' });
      } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({ error: 'Failed to register user' });
      }
    });

    // Login Endpoint
    app.post('/login', async (req, res) => {
      const email = req.body.email;
      email.toLowerCase();
      const password = req.body.password;

      try {
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Login successful');
        // Generate and send authentication token
        res.json({ user });
        // Replace 'generateToken' with your token generation logic

      } catch (error) {
        console.log('Error in authentication:', error);
        res.status(500).json({ error: 'Failed to authenticate' });
      }
    });

    // Get all notes for a user
    app.get('/notes/:email', async (req, res) => {
      const { email } = req.params;

      try {
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        const notes = await Note.find({ userId: user._id });
        console.log('User Notes:', notes);
        res.json({ notes });
      } catch (error) {
        console.error('Error retrieving user notes:', error);
        res.status(500).json({ error: 'Failed to retrieve user notes' });
      }
    });

    // Add a new note for a user
    app.post('/notes/:email', async (req, res) => {
      const { email } = req.params;
      const { title, description } = req.body;

      try {
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        const newNote = new Note({ title, description, userId: user._id });
        await newNote.save();
        console.log('Note saved successfully:', newNote);
        res.status(201).json({ message: 'Note saved successfully' });
      } catch (error) {
        console.error('Error saving note:', error);
        res.status(500).json({ error: 'Failed to save note' });
      }
    });

    // Delete a note
    app.delete('/notes/:id', async (req, res) => {
      const { id } = req.params;

      try {
        const deletedNote = await Note.findByIdAndDelete(id);
        if (!deletedNote) {
          console.error('Note not found');
          return res.status(404).json({ error: 'Note not found' });
        }
        console.log('Note deleted successfully:', deletedNote);
        res.json({ message: 'Note deleted successfully' });
      } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });
