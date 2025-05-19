const mongoose = require('mongoose');

// Lecture schema
const lectureSchema = new mongoose.Schema({
  lectureOrder: {
    type: Number,
    required: [true, 'Lecture order is required'],
    min: 1,
  },
  lectureTitle: {
    type: String,
    required: [true, 'Lecture title is required'],
    trim: true,
  },
  lectureUrl: {
    type: String,
    required: [true, 'Lecture URL is required'],
    trim: true,
  },
});

// Chapter schema
const chapterSchema = new mongoose.Schema({
  chapterOrder: {
    type: Number,
    required: [true, 'Chapter order is required'],
    min: 1,
  },
  chapterTitle: {
    type: String,
    required: [true, 'Chapter title is required'],
    trim: true,
  },
  lectures: {
    type: [lectureSchema],
    default: [],
  },
});

// Course schema
const courseSchema = new mongoose.Schema({
  course_id: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  courseTitle: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
  },
  courseDescription: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
  },
  coursePrice: {
    type: Number,
    required: [true, 'Course price is required'],
    min: 0,
  },
  courseDiscount: {
    type: Number,
    default: 0,
    min: 0,
  },
  courseThumbnail: {
    type: String,
    default: '',
    trim: true,
  },
  thumbnail_pub_id: {
    type: String,
    default: '',
  },
  educator: {
    type: String,
    required: [true, 'Educator ID is required'],
  },
  chapters: {
    type: [chapterSchema],
    default: [],
    validate: {
      validator: function(chapters) {
        return chapters.length > 0;
      },
      message: 'At least one chapter is required'
    }
  },
}, {
  timestamps: true,
  versionKey: false,
});

module.exports = mongoose.model('Course', courseSchema);