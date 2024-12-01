const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, maxLength: 100 },
  email: { type: String, required: true, unique: true },
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  role: { type: String, enum: ['admin', 'user', 'organizer'], default: 'user' },
  date_of_birth: { type: Date },
  createdAt: { type: Date, default: Date.now },
  passwordHash: { type: String, required: true },
});

userSchema.methods.setPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

userSchema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.register = async function () {
  await this.save();
};

userSchema.methods.changePassword = async function () {
  await this.save();
}

userSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

userSchema.virtual('name').get(function () {
  let fullname = '';
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  return fullname;
});

userSchema.virtual('url').get(function () {
  return `/users/${this._id}`;
});

userSchema.virtual('date_of_birth_formatted').get(function () {
  return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
});

userSchema.virtual('createdAt_formatted').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('User', userSchema);
