const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const port = process.env.PORT || 7000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const uri = 'mongodb+srv://santhosh9515:santhosh9515@cluster0.itdx0o5.mongodb.net/KeeperNote?retryWrites=true&w=majority';
const dbName = 'KeeperNote'; // Replace 'KeeperNote' with your actual database name

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, dbName })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    // Define your routes here

    // Note Schema
    const noteSchema = new mongoose.Schema({
      title: String,
      description: String,
    });

    // Note Model
    const NoteModel = mongoose.model('Note', noteSchema);

    // Get all notes
    app.get('/data', async (req, res) => {
      try {
        const notes = await NoteModel.find({});
        console.log('Notes:', notes);
        res.json({ notes });
      } catch (error) {
        console.error('Error retrieving notes:', error);
        res.status(500).json({ error: 'Failed to retrieve notes' });
      }
    });

    // Add a new note
    app.post('/data', async (req, res) => {
      const { title, description,id } = req.body;
      const newNote = new NoteModel({ title, description,id });

      try {
        const savedNote = await newNote.save();
        console.log('Note saved successfully:', savedNote);
        res.status(201).json({ message: 'Note saved successfully' });
      } catch (error) {
        console.error('Error saving note:', error);
        res.status(500).json({ error: 'Failed to save note' });
      }
    });

    // Delete a note
app.delete('/data/:id', async (req, res) => {
  const noteId = req.params.id;

  try {
    const deletedNote = await NoteModel.deleteOne({ _id: noteId });
    if (deletedNote.deletedCount > 0) {
      console.log('Note deleted successfully:', deletedNote);
      res.json({ message: 'Note deleted successfully' });
    } else {
      console.error('Note not found');
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});


    // Start the server
    app.listen(port, () => {
      console.log('Server is running on port 7000.');
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });
